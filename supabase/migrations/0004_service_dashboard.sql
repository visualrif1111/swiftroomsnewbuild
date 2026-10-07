-- Phase 5: Service Team Dashboard (docs/service-aftercare/DASHBOARD.md).
--
-- Additive only:
--   staff_members                 allow-list of authorised staff (Supabase Auth user → role)
--   service_status_transitions    the approved status transition matrix (data, not code)
--   change_service_request_status the ONLY way a status changes after submission
--   status_history                actor columns; append-only
--   service_ai_report_reviews     append-only staff review history of AI reports
--   review_service_ai_report      the ONLY way a review is recorded
--   list_service_requests         server-side inbox query (search, filters, pagination)
--
-- Same rules as 0001–0003: RLS on with no policies, nothing granted to anon or
-- authenticated, every function executable by service_role only. The actor is
-- always the verified Supabase Auth user id passed by the server; the database
-- re-checks that it belongs to an active staff member.

-- ─── Staff ──────────────────────────────────────────────────────────────────
create type public.staff_role as enum ('STAFF', 'ADMIN');

create table public.staff_members (
  id              uuid primary key default gen_random_uuid(),
  -- auth.users.id of the Supabase Auth account. No email or other auth data is
  -- duplicated here; Supabase Auth remains the identity record.
  auth_user_id    uuid not null unique,
  -- Shown in audit trails ("changed by"). Not a credential.
  display_name    text not null check (length(btrim(display_name)) between 1 and 120),
  role            public.staff_role not null default 'STAFF',
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deactivated_at  timestamptz,
  check (active = (deactivated_at is null))
);

create trigger staff_members_touch before update on public.staff_members
  for each row execute function public.touch_updated_at();

-- ─── Transition matrix ──────────────────────────────────────────────────────
create table public.service_status_transitions (
  from_status    public.service_request_status not null,
  to_status      public.service_request_status not null,
  min_role       public.staff_role not null,
  note_required  boolean not null,
  primary key (from_status, to_status),
  check (from_status <> to_status),
  check (to_status <> 'SUBMITTED'),
  check (from_status <> 'AI_PROCESSED' and to_status <> 'AI_PROCESSED')
);

insert into public.service_status_transitions (from_status, to_status, min_role, note_required) values
  ('SUBMITTED',                 'AWAITING_REVIEW',           'STAFF', false),
  ('SUBMITTED',                 'MORE_INFORMATION_REQUIRED', 'STAFF', true),
  ('SUBMITTED',                 'INSPECTION_REQUIRED',       'STAFF', false),
  ('SUBMITTED',                 'CLOSED',                    'ADMIN', true),
  ('AWAITING_REVIEW',           'MORE_INFORMATION_REQUIRED', 'STAFF', true),
  ('AWAITING_REVIEW',           'INSPECTION_REQUIRED',       'STAFF', false),
  ('AWAITING_REVIEW',           'SCHEDULED',                 'STAFF', true),
  ('AWAITING_REVIEW',           'RESOLVED',                  'STAFF', true),
  ('AWAITING_REVIEW',           'CLOSED',                    'ADMIN', true),
  ('MORE_INFORMATION_REQUIRED', 'AWAITING_REVIEW',           'STAFF', false),
  ('MORE_INFORMATION_REQUIRED', 'INSPECTION_REQUIRED',       'STAFF', false),
  ('MORE_INFORMATION_REQUIRED', 'CLOSED',                    'ADMIN', true),
  ('INSPECTION_REQUIRED',       'SCHEDULED',                 'STAFF', false),
  ('INSPECTION_REQUIRED',       'MORE_INFORMATION_REQUIRED', 'STAFF', true),
  ('INSPECTION_REQUIRED',       'AWAITING_REVIEW',           'STAFF', true),
  ('INSPECTION_REQUIRED',       'CLOSED',                    'ADMIN', true),
  ('SCHEDULED',                 'IN_PROGRESS',               'STAFF', false),
  ('SCHEDULED',                 'INSPECTION_REQUIRED',       'STAFF', true),
  ('SCHEDULED',                 'MORE_INFORMATION_REQUIRED', 'STAFF', true),
  ('SCHEDULED',                 'CLOSED',                    'ADMIN', true),
  ('IN_PROGRESS',               'RESOLVED',                  'STAFF', true),
  ('IN_PROGRESS',               'SCHEDULED',                 'STAFF', true),
  ('IN_PROGRESS',               'MORE_INFORMATION_REQUIRED', 'STAFF', true),
  ('IN_PROGRESS',               'INSPECTION_REQUIRED',       'STAFF', true),
  ('RESOLVED',                  'CLOSED',                    'STAFF', false),
  ('RESOLVED',                  'IN_PROGRESS',               'STAFF', true),
  ('RESOLVED',                  'AWAITING_REVIEW',           'STAFF', true),
  ('CLOSED',                    'AWAITING_REVIEW',           'ADMIN', true);

-- The matrix is part of the schema: no client may change it.
create function public.service_status_transitions_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  raise exception 'service_status_transitions is fixed by migration' using errcode = 'P0001';
end $$;
create trigger service_status_transitions_guard before insert or update or delete on public.service_status_transitions
  for each statement execute function public.service_status_transitions_guard();

-- ─── Status history: actor columns, append-only ─────────────────────────────
alter table public.status_history
  add column actor_staff_id uuid references public.staff_members (id),
  add column actor_role     public.staff_role,
  add constraint status_history_actor_complete check ((actor_staff_id is null) = (actor_role is null));

create function public.status_history_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  -- Deleting the whole service request cascades here; nothing else may remove or change history.
  if tg_op = 'DELETE' and not exists (select 1 from public.service_requests where id = old.service_request_id) then
    return old;
  end if;
  raise exception 'status_history is append-only' using errcode = 'P0001';
end $$;
create trigger status_history_guard before update or delete on public.status_history
  for each row execute function public.status_history_guard();

-- A request's status changes only through change_service_request_status().
create function public.service_requests_status_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('swiftrooms.status_change', true), '') <> 'on' then
    raise exception 'status_change_requires_function' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger service_requests_status_guard before update on public.service_requests
  for each row execute function public.service_requests_status_guard();

-- ─── Helpers ────────────────────────────────────────────────────────────────
/** The active staff member for a verified Supabase Auth user, or an error. */
create function public.require_active_staff(p_auth_user_id uuid) returns public.staff_members
language plpgsql stable security definer set search_path = public as $$
declare
  v public.staff_members;
begin
  select * into v from public.staff_members where auth_user_id = p_auth_user_id;
  if p_auth_user_id is null or v.id is null or not v.active then
    raise exception 'not_authorised' using errcode = 'P0001';
  end if;
  return v;
end $$;

/** 3–2,000 characters after trimming, or null. */
create function public.normalise_staff_note(p_note text) returns text
language plpgsql immutable set search_path = public as $$
declare
  v text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if v is not null and (length(v) < 3 or length(v) > 2000) then
    raise exception 'note_invalid' using errcode = 'P0001';
  end if;
  return v;
end $$;

-- ─── change_service_request_status ──────────────────────────────────────────
create function public.change_service_request_status(
  p_request_id     uuid,
  p_expected_from  public.service_request_status,
  p_to             public.service_request_status,
  p_auth_user_id   uuid,
  p_note           text
) returns setof public.status_history
language plpgsql security definer set search_path = public as $$
declare
  v_staff   public.staff_members;
  v_current public.service_request_status;
  v_rule    public.service_status_transitions;
  v_note    text;
  v_row     public.status_history;
begin
  v_staff := public.require_active_staff(p_auth_user_id);

  select status into v_current from public.service_requests where id = p_request_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  -- Another member of staff changed it first: never overwrite their change.
  if v_current is distinct from p_expected_from then
    raise exception 'status_changed' using errcode = 'P0001';
  end if;

  select * into v_rule from public.service_status_transitions where from_status = v_current and to_status = p_to;
  if v_rule.from_status is null then
    raise exception 'transition_not_allowed' using errcode = 'P0001';
  end if;
  if v_rule.min_role = 'ADMIN' and v_staff.role <> 'ADMIN' then
    raise exception 'transition_not_allowed' using errcode = 'P0001';
  end if;

  v_note := public.normalise_staff_note(p_note);
  if v_rule.note_required and v_note is null then
    raise exception 'note_required' using errcode = 'P0001';
  end if;

  perform set_config('swiftrooms.status_change', 'on', true);
  update public.service_requests set status = p_to, updated_at = now() where id = p_request_id;
  perform set_config('swiftrooms.status_change', '', true);

  insert into public.status_history (service_request_id, from_status, to_status, changed_by, note, actor_staff_id, actor_role)
  values (p_request_id, v_current, p_to, 'staff:' || v_staff.id, v_note, v_staff.id, v_staff.role)
  returning * into v_row;
  return next v_row;
end $$;

-- ─── AI report reviews ──────────────────────────────────────────────────────
create table public.service_ai_report_reviews (
  id                 uuid primary key default gen_random_uuid(),
  report_id          uuid not null references public.service_ai_reports (id) on delete cascade,
  review_status      public.service_ai_review_status not null check (review_status <> 'AWAITING_REVIEW'),
  reviewer_staff_id  uuid not null references public.staff_members (id),
  reviewer_role      public.staff_role not null,
  notes              text check (length(notes) <= 4000),
  -- Staff-edited copy (EDITED only). The original AI report is never changed.
  edited_report      jsonb check (edited_report is null or jsonb_typeof(edited_report) = 'object'),
  created_at         timestamptz not null default now(),
  superseded_at      timestamptz,
  -- Deferred: the previous review is marked superseded by the new one inside one transaction.
  superseded_by      uuid references public.service_ai_report_reviews (id) deferrable initially deferred,
  check ((review_status = 'EDITED') = (edited_report is not null)),
  check ((superseded_at is null) = (superseded_by is null))
);
create index service_ai_report_reviews_report_idx on public.service_ai_report_reviews (report_id, created_at);
create unique index service_ai_report_reviews_current on public.service_ai_report_reviews (report_id) where superseded_at is null;

create function public.service_ai_report_reviews_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if not exists (select 1 from public.service_ai_reports where id = old.report_id) then
      return old;
    end if;
    raise exception 'service_ai_report_reviews are append-only' using errcode = 'P0001';
  end if;
  -- The only change ever allowed: marking the current review superseded (once).
  if old.superseded_at is null and new.superseded_at is not null
     and (to_jsonb(new) - 'superseded_at' - 'superseded_by') = (to_jsonb(old) - 'superseded_at' - 'superseded_by') then
    return new;
  end if;
  raise exception 'service_ai_report_reviews are append-only' using errcode = 'P0001';
end $$;
create trigger service_ai_report_reviews_guard before update or delete on public.service_ai_report_reviews
  for each row execute function public.service_ai_report_reviews_guard();

-- The review columns on service_ai_reports change only through review_service_ai_report().
create function public.service_ai_reports_review_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if (new.review_status is distinct from old.review_status
      or new.reviewed_report is distinct from old.reviewed_report
      or new.reviewed_by is distinct from old.reviewed_by
      or new.reviewed_at is distinct from old.reviewed_at
      or new.review_notes is distinct from old.review_notes)
     and coalesce(current_setting('swiftrooms.review_change', true), '') <> 'on' then
    raise exception 'review_change_requires_function' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger service_ai_reports_review_guard before update on public.service_ai_reports
  for each row execute function public.service_ai_reports_review_guard();

create function public.review_service_ai_report(
  p_report_id        uuid,
  p_expected_status  public.service_ai_review_status,
  p_status           public.service_ai_review_status,
  p_auth_user_id     uuid,
  p_notes            text,
  p_edited_report    jsonb
) returns setof public.service_ai_report_reviews
language plpgsql security definer set search_path = public as $$
declare
  v_staff   public.staff_members;
  v_report  public.service_ai_reports;
  v_prev    public.service_ai_report_reviews;
  v_notes   text := nullif(btrim(coalesce(p_notes, '')), '');
  v_row     public.service_ai_report_reviews;
  v_new_id  uuid := gen_random_uuid();
begin
  v_staff := public.require_active_staff(p_auth_user_id);
  if p_status not in ('APPROVED', 'EDITED', 'REJECTED') then
    raise exception 'review_status_invalid' using errcode = 'P0001';
  end if;

  select * into v_report from public.service_ai_reports where id = p_report_id for update;
  if v_report.id is null then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  -- Only the current report version is reviewed; older versions are history.
  if v_report.superseded_at is not null then
    raise exception 'report_superseded' using errcode = 'P0001';
  end if;
  if v_report.review_status is distinct from p_expected_status then
    raise exception 'review_changed' using errcode = 'P0001';
  end if;
  -- Re-reviewing (superseding a review) is an admin action.
  if v_report.review_status <> 'AWAITING_REVIEW' and v_staff.role <> 'ADMIN' then
    raise exception 'not_authorised' using errcode = 'P0001';
  end if;

  if v_notes is not null and length(v_notes) > 4000 then
    raise exception 'note_invalid' using errcode = 'P0001';
  end if;
  if (p_status = 'REJECTED' or v_report.review_status <> 'AWAITING_REVIEW') and (v_notes is null or length(v_notes) < 3) then
    raise exception 'note_required' using errcode = 'P0001';
  end if;
  if (p_status = 'EDITED') <> (p_edited_report is not null) then
    raise exception 'edited_report_invalid' using errcode = 'P0001';
  end if;
  if p_edited_report is not null and (jsonb_typeof(p_edited_report) <> 'object' or length(p_edited_report::text) > 30000) then
    raise exception 'edited_report_invalid' using errcode = 'P0001';
  end if;

  -- Supersede the current review first (one current review per report), then record the new one.
  select * into v_prev from public.service_ai_report_reviews where report_id = p_report_id and superseded_at is null;
  if v_prev.id is not null then
    update public.service_ai_report_reviews set superseded_at = now(), superseded_by = v_new_id where id = v_prev.id;
  end if;

  insert into public.service_ai_report_reviews (id, report_id, review_status, reviewer_staff_id, reviewer_role, notes, edited_report)
  values (v_new_id, p_report_id, p_status, v_staff.id, v_staff.role, v_notes, p_edited_report)
  returning * into v_row;

  perform set_config('swiftrooms.review_change', 'on', true);
  update public.service_ai_reports
     set review_status = p_status,
         reviewed_report = p_edited_report,
         reviewed_by = 'staff:' || v_staff.id,
         reviewed_at = v_row.created_at,
         review_notes = v_notes
   where id = p_report_id;
  perform set_config('swiftrooms.review_change', '', true);

  return next v_row;
end $$;

-- ─── Inbox query ────────────────────────────────────────────────────────────
-- AI state is derived from the latest run, never stored on the request:
--   no run → NOT_STARTED · QUEUED/PROCESSING → PROCESSING · COMPLETED · PARTIAL · FAILED/CANCELLED → FAILED
-- Urgency comes from the current (non-superseded) report; NONE when there is no report.
create function public.list_service_requests(
  p_search      text,
  p_statuses    public.service_request_status[],
  p_urgencies   text[],
  p_products    text[],
  p_from        timestamptz,
  p_to          timestamptz,
  p_ai_states   text[],
  p_sort        text,
  p_limit       integer,
  p_offset      integer
) returns table (
  id                  uuid,
  reference           text,
  customer_name       text,
  product_categories  text[],
  issue               text,
  submitted_at        timestamptz,
  status              public.service_request_status,
  urgency             text,
  ai_state            text,
  review_status       public.service_ai_review_status,
  photos              integer,
  videos              integer,
  voice_notes         integer,
  total_count         bigint
)
language sql stable security definer set search_path = public as $$
  with base as (
    select r.*,
      (select case run.status when 'QUEUED' then 'PROCESSING' when 'PROCESSING' then 'PROCESSING' when 'COMPLETED' then 'COMPLETED'
                              when 'PARTIAL' then 'PARTIAL' else 'FAILED' end
         from public.service_ai_runs run where run.service_request_id = r.id order by run.run_number desc limit 1) as run_state,
      (select rep from public.service_ai_reports rep where rep.service_request_id = r.id and rep.superseded_at is null order by rep.version desc limit 1) as rep
    from public.service_requests r
    cross join lateral (select
      -- Search text with LIKE wildcards escaped, so "%" or "_" match literally.
      '%' || replace(replace(replace(btrim(coalesce(p_search, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern,
      -- Phone digits without leading zeros: staff type UAE numbers as 055…, stored as +97155….
      ltrim(regexp_replace(coalesce(p_search, ''), '[^0-9]', '', 'g'), '0') as digits) q
    where (btrim(coalesce(p_search, '')) = ''
           or r.reference ilike q.pattern
           or r.customer_name ilike q.pattern
           or r.email ilike q.pattern
           or (length(q.digits) >= 4 and r.mobile_e164 like '%' || q.digits || '%'))
      and (p_statuses is null or r.status = any (p_statuses))
      and (p_products is null or r.product_categories && p_products)
      and (p_from is null or r.created_at >= p_from)
      and (p_to is null or r.created_at < p_to)
  ), shaped as (
    select b.id, b.reference, b.customer_name, b.product_categories,
      coalesce((b.rep).ai_report #>> '{content,issueSummary}', left(b.problem_description, 200)) as issue,
      b.created_at as submitted_at, b.status,
      coalesce((b.rep).ai_report #>> '{content,urgency,level}', 'NONE') as urgency,
      coalesce(b.run_state, 'NOT_STARTED') as ai_state,
      (b.rep).review_status as review_status,
      (select count(*)::int from public.service_media m where m.service_request_id = b.id and m.upload_status = 'UPLOADED' and m.media_type = 'PHOTO') as photos,
      (select count(*)::int from public.service_media m where m.service_request_id = b.id and m.upload_status = 'UPLOADED' and m.media_type = 'VIDEO') as videos,
      (select count(*)::int from public.service_media m where m.service_request_id = b.id and m.upload_status = 'UPLOADED' and m.media_type = 'VOICE') as voice_notes
    from base b
  )
  select s.*, count(*) over () as total_count
  from shaped s
  where (p_urgencies is null or s.urgency = any (p_urgencies))
    and (p_ai_states is null or s.ai_state = any (p_ai_states))
  order by
    case when p_sort = 'urgency' then case s.urgency when 'URGENT' then 0 when 'HIGH' then 1 when 'NORMAL' then 2 when 'LOW' then 3 else 4 end end,
    case when p_sort = 'oldest' then s.submitted_at end asc,
    s.submitted_at desc,
    s.reference desc
  limit greatest(1, least(coalesce(p_limit, 25), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

-- ─── Locked down: service role only ─────────────────────────────────────────
alter table public.staff_members              enable row level security;
alter table public.service_status_transitions enable row level security;
alter table public.service_ai_report_reviews  enable row level security;
revoke all on public.staff_members, public.service_status_transitions, public.service_ai_report_reviews from anon, authenticated;

revoke all on function public.require_active_staff(uuid) from public, anon, authenticated;
revoke all on function public.normalise_staff_note(text) from public, anon, authenticated;
revoke all on function public.change_service_request_status(uuid, public.service_request_status, public.service_request_status, uuid, text) from public, anon, authenticated;
revoke all on function public.review_service_ai_report(uuid, public.service_ai_review_status, public.service_ai_review_status, uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.list_service_requests(text, public.service_request_status[], text[], text[], timestamptz, timestamptz, text[], text, integer, integer) from public, anon, authenticated;
revoke all on function public.status_history_guard() from public, anon, authenticated;
revoke all on function public.service_requests_status_guard() from public, anon, authenticated;
revoke all on function public.service_ai_report_reviews_guard() from public, anon, authenticated;
revoke all on function public.service_ai_reports_review_guard() from public, anon, authenticated;
revoke all on function public.service_status_transitions_guard() from public, anon, authenticated;

grant execute on function public.require_active_staff(uuid) to service_role;
grant execute on function public.normalise_staff_note(text) to service_role;
grant execute on function public.change_service_request_status(uuid, public.service_request_status, public.service_request_status, uuid, text) to service_role;
grant execute on function public.review_service_ai_report(uuid, public.service_ai_review_status, public.service_ai_review_status, uuid, text, jsonb) to service_role;
grant execute on function public.list_service_requests(text, public.service_request_status[], text[], text[], timestamptz, timestamptz, text[], text, integer, integer) to service_role;
