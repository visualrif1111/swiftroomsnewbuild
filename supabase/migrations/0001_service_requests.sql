-- Service & Aftercare — Phase 2 schema.
--
-- Operational database for service requests (Sanity stays the website CMS).
-- Phase 2 tables: customers, service_requests, status_history, plus the
-- per-year reference counter. Later phases add service_media, ai_reports,
-- staff_notes and appointments, all keyed on service_requests.id
-- (see docs/service-aftercare/DATABASE.md).
--
-- Access model: every table has row level security enabled with NO policies,
-- and anon/authenticated have no grants, so the browser (anon key) can read or
-- write nothing. Only the server, using the service role, talks to these
-- tables — and new requests are created exclusively through
-- create_service_request(), which runs as one transaction.


-- ─── Status workflow ────────────────────────────────────────────────────────
create type public.service_request_status as enum (
  'SUBMITTED',
  'AI_PROCESSED',
  'AWAITING_REVIEW',
  'MORE_INFORMATION_REQUIRED',
  'INSPECTION_REQUIRED',
  'SCHEDULED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

-- ─── Customers ──────────────────────────────────────────────────────────────
-- One row per person, matched on (email, mobile). Each request also keeps a
-- snapshot of the details as submitted, so later edits here never rewrite
-- what the customer actually sent.
create table public.customers (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  mobile_e164   text not null,           -- e.g. +971501234567
  location      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index customers_email_mobile_key on public.customers (lower(email), mobile_e164);

-- ─── Reference counter ──────────────────────────────────────────────────────
-- One row per year. Incremented with INSERT … ON CONFLICT DO UPDATE, which
-- takes a row lock, so concurrent submissions serialise on it and can never
-- receive the same number.
create table public.service_reference_counters (
  year        integer primary key,
  last_value  integer not null
);

-- ─── Service requests ───────────────────────────────────────────────────────
create table public.service_requests (
  id                    uuid primary key default gen_random_uuid(),
  reference             text not null unique,          -- SR-YYYY-XXXXX
  customer_id           uuid not null references public.customers (id),

  -- Snapshot of the customer's details as submitted.
  customer_name         text not null,
  mobile_country_code   text not null,                 -- +971
  mobile_national       text not null,                 -- digits only
  mobile_e164           text not null,
  email                 text not null,
  location              text not null,
  existing_customer     boolean,                       -- null = not answered
  project_reference     text,

  -- What needs attention. The form allows several categories.
  product_categories    text[] not null check (cardinality(product_categories) > 0),
  other_product         text,
  problem_description   text not null default '',

  -- Media the customer attached in the browser. Phase 2 does not upload media;
  -- these counts tell staff to ask for it. Phase 3 adds service_media rows.
  declared_media        jsonb not null default '{"photos":0,"videos":0,"voiceNote":false}'::jsonb,

  status                public.service_request_status not null default 'SUBMITTED',
  channel               text not null default 'website/service-call',
  idempotency_key       uuid not null unique,          -- one request per submit attempt

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index service_requests_customer_idx on public.service_requests (customer_id);
create index service_requests_status_idx on public.service_requests (status, created_at desc);

-- ─── Status history (audit trail) ───────────────────────────────────────────
create table public.status_history (
  id                  bigint generated always as identity primary key,
  service_request_id  uuid not null references public.service_requests (id) on delete cascade,
  from_status         public.service_request_status,   -- null for the initial entry
  to_status           public.service_request_status not null,
  changed_by          text not null,                   -- 'customer', 'system', later a staff id
  note                text,
  changed_at          timestamptz not null default now()
);
create index status_history_request_idx on public.status_history (service_request_id, changed_at);

-- ─── updated_at maintenance ─────────────────────────────────────────────────
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();
create trigger service_requests_touch before update on public.service_requests
  for each row execute function public.touch_updated_at();

-- ─── Locked down: no client access ──────────────────────────────────────────
alter table public.customers                  enable row level security;
alter table public.service_reference_counters enable row level security;
alter table public.service_requests           enable row level security;
alter table public.status_history             enable row level security;

revoke all on public.customers, public.service_reference_counters,
              public.service_requests, public.status_history
  from anon, authenticated;

-- ─── create_service_request ─────────────────────────────────────────────────
-- Creates (or finds) the customer, allocates the next SR reference, inserts
-- the request and its initial SUBMITTED history entry — all in one
-- transaction. Calling it again with the same idempotency key returns the
-- original request instead of creating a duplicate (double clicks, retries
-- after a timeout, a refresh mid-submit).
--
-- p_payload is validated by the API before it gets here; the CHECKs and NOT
-- NULLs above are the last line of defence.
create function public.create_service_request(p_payload jsonb, p_idempotency_key uuid)
returns table (id uuid, reference text, status public.service_request_status, created_at timestamptz, replayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing    public.service_requests%rowtype;
  v_customer_id uuid;
  v_year        integer := extract(year from (now() at time zone 'Asia/Dubai'))::integer;
  v_seq         integer;
  v_reference   text;
  v_request     public.service_requests%rowtype;
  v_email       text := lower(trim(p_payload ->> 'email'));
  v_mobile_e164 text := p_payload ->> 'mobileE164';
begin
  select * into v_existing from public.service_requests sr where sr.idempotency_key = p_idempotency_key;
  if found then
    return query select v_existing.id, v_existing.reference, v_existing.status, v_existing.created_at, true;
    return;
  end if;

  begin
    insert into public.customers (full_name, email, mobile_e164, location)
    values (p_payload ->> 'customerName', v_email, v_mobile_e164, p_payload ->> 'location')
    on conflict ((lower(email)), mobile_e164) do update
      set full_name = excluded.full_name,
          location  = excluded.location
    returning customers.id into v_customer_id;

    insert into public.service_reference_counters as c (year, last_value)
    values (v_year, 1)
    on conflict (year) do update set last_value = c.last_value + 1
    returning c.last_value into v_seq;

    -- Five digits, growing (not truncating) past 99999.
    v_reference := format('SR-%s-%s', v_year,
      case when v_seq > 99999 then v_seq::text else lpad(v_seq::text, 5, '0') end);

    insert into public.service_requests (
      reference, customer_id, customer_name, mobile_country_code, mobile_national, mobile_e164,
      email, location, existing_customer, project_reference, product_categories, other_product,
      problem_description, declared_media, channel, idempotency_key
    ) values (
      v_reference, v_customer_id,
      p_payload ->> 'customerName',
      p_payload ->> 'mobileCountryCode',
      p_payload ->> 'mobileNational',
      v_mobile_e164,
      v_email,
      p_payload ->> 'location',
      (p_payload ->> 'existingCustomer')::boolean,
      nullif(p_payload ->> 'projectReference', ''),
      array(select jsonb_array_elements_text(p_payload -> 'productCategories')),
      nullif(p_payload ->> 'otherProduct', ''),
      coalesce(p_payload ->> 'problemDescription', ''),
      coalesce(p_payload -> 'declaredMedia', '{"photos":0,"videos":0,"voiceNote":false}'::jsonb),
      coalesce(p_payload ->> 'channel', 'website/service-call'),
      p_idempotency_key
    )
    returning * into v_request;

    insert into public.status_history (service_request_id, from_status, to_status, changed_by, note)
    values (v_request.id, null, 'SUBMITTED', 'customer', 'Submitted via ' || v_request.channel);
  exception when unique_violation then
    -- A concurrent call with the same key won the race. This block (customer,
    -- counter and request writes) has been rolled back; return the winner.
    select * into v_existing from public.service_requests sr where sr.idempotency_key = p_idempotency_key;
    if not found then
      raise;
    end if;
    return query select v_existing.id, v_existing.reference, v_existing.status, v_existing.created_at, true;
    return;
  end;

  return query select v_request.id, v_request.reference, v_request.status, v_request.created_at, false;
end $$;

revoke all on function public.create_service_request(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.create_service_request(jsonb, uuid) to service_role;
