-- Service & Aftercare — Phase 4A: AI processing foundation.
--
-- ADDITIVE ONLY. Nothing here alters or reads-and-rewrites Phase 1–3 tables:
-- service_requests, customers, status_history and service_media keep their
-- columns, data and behaviour. In particular AI processing never changes
-- service_requests.status — its state lives in service_ai_runs.
--
--   service_ai_runs          one row per processing attempt (queue + lease + audit)
--   service_ai_reports       versioned Service Call Reports; AI content immutable
--   service_media_analyses   per-file derived results (transcripts, observations), cached
--
-- All access is server-side with the service role: RLS is enabled with no
-- policies, table privileges are revoked from anon/authenticated, and every
-- function is executable only by service_role.
-- See docs/service-aftercare/AI.md.

-- ─── Types ──────────────────────────────────────────────────────────────────
-- QUEUED      waiting for a worker (or for its retry time)
-- PROCESSING  claimed by a worker holding an unexpired lease
-- COMPLETED   report produced from all usable evidence
-- PARTIAL     report produced, but some evidence couldn't be processed
-- FAILED      no report (attempts exhausted, invalid output, …)
-- CANCELLED   abandoned without a report (reserved for operator use)
-- A request with no runs is "NOT_STARTED" (derived, not stored).
create type public.service_ai_run_status as enum
  ('QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED');

-- FINALIZE = customer finished adding evidence; SWEEP = scheduled discovery;
-- MANUAL = staff asked for (re)processing — always a new run and report version.
create type public.service_ai_run_trigger as enum ('FINALIZE', 'SWEEP', 'MANUAL');

create type public.service_ai_review_status as enum
  ('AWAITING_REVIEW', 'APPROVED', 'EDITED', 'REJECTED');

create type public.service_media_analysis_kind as enum
  ('TRANSCRIPT', 'IMAGE_OBSERVATIONS', 'VIDEO_OBSERVATIONS');

-- ─── Runs ───────────────────────────────────────────────────────────────────
create table public.service_ai_runs (
  id                  uuid primary key default gen_random_uuid(),
  service_request_id  uuid not null references public.service_requests (id) on delete cascade,
  run_number          integer not null check (run_number > 0),
  trigger             public.service_ai_run_trigger not null,
  status              public.service_ai_run_status not null default 'QUEUED',

  -- SHA-256 (hex) of the processing inputs: request snapshot + uploaded media.
  input_fingerprint   text not null check (input_fingerprint ~ '^[0-9a-f]{64}$'),
  pipeline_version    text not null check (length(pipeline_version) between 1 and 40),
  prompt_version      text not null check (length(prompt_version) between 1 and 40),
  schema_version      text not null check (length(schema_version) between 1 and 40),
  provider            text check (length(provider) <= 40),
  models              jsonb not null default '{}'::jsonb check (jsonb_typeof(models) = 'object'),

  -- Lease: only the worker named here may finish the run, and only while it
  -- still holds it. An expired lease can be claimed by another worker.
  lease_owner         text check (length(lease_owner) <= 100),
  lease_expires_at    timestamptz,
  attempts            integer not null default 0 check (attempts >= 0),
  max_attempts        integer not null default 3 check (max_attempts between 1 and 10),
  next_attempt_at     timestamptz not null default now(),

  started_at          timestamptz,
  finished_at         timestamptz,
  -- Internal codes and provider request ids only — never prompts, customer
  -- text, media or URLs.
  error_code          text check (length(error_code) <= 100),
  error_detail        jsonb check (error_detail is null or jsonb_typeof(error_detail) = 'object'),
  usage               jsonb not null default '{}'::jsonb check (jsonb_typeof(usage) = 'object'),
  requested_by        text not null default 'system' check (length(requested_by) <= 100),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (service_request_id, run_number),
  check ((status = 'PROCESSING') = (lease_owner is not null and lease_expires_at is not null))
);
-- At most one QUEUED/PROCESSING run per request: repeated triggers can't
-- start duplicate processing.
create unique index service_ai_runs_one_active_idx
  on public.service_ai_runs (service_request_id) where status in ('QUEUED', 'PROCESSING');
create index service_ai_runs_queue_idx
  on public.service_ai_runs (next_attempt_at) where status = 'QUEUED';
create index service_ai_runs_lease_idx
  on public.service_ai_runs (lease_expires_at) where status = 'PROCESSING';
create index service_ai_runs_dedupe_idx
  on public.service_ai_runs (service_request_id, input_fingerprint);

create trigger service_ai_runs_touch before update on public.service_ai_runs
  for each row execute function public.touch_updated_at();

-- ─── Reports ────────────────────────────────────────────────────────────────
-- One row per report version. ai_report (the validated AI output) and its
-- provenance can never change after insert; a newer version supersedes it.
-- Human review writes reviewed_report alongside, never over, the AI output.
create table public.service_ai_reports (
  id                  uuid primary key default gen_random_uuid(),
  service_request_id  uuid not null references public.service_requests (id) on delete cascade,
  run_id              uuid not null unique references public.service_ai_runs (id) on delete cascade,
  version             integer not null check (version > 0),
  schema_version      text not null,
  processing_status   public.service_ai_run_status not null check (processing_status in ('COMPLETED', 'PARTIAL')),
  provider            text not null,
  models              jsonb not null default '{}'::jsonb,
  prompt_version      text not null,
  pipeline_version    text not null,
  input_fingerprint   text not null,
  ai_report           jsonb not null check (jsonb_typeof(ai_report) = 'object'),
  generated_at        timestamptz not null default now(),

  review_status       public.service_ai_review_status not null default 'AWAITING_REVIEW',
  reviewed_report     jsonb check (reviewed_report is null or jsonb_typeof(reviewed_report) = 'object'),
  reviewed_by         text check (length(reviewed_by) <= 200),
  reviewed_at         timestamptz,
  review_notes        text check (length(review_notes) <= 4000),

  superseded_at       timestamptz,
  superseded_by       uuid references public.service_ai_reports (id),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (service_request_id, version),
  check (
    (review_status = 'AWAITING_REVIEW' and reviewed_by is null and reviewed_at is null and reviewed_report is null)
    or (review_status in ('APPROVED', 'REJECTED') and reviewed_by is not null and reviewed_at is not null)
    or (review_status = 'EDITED' and reviewed_by is not null and reviewed_at is not null and reviewed_report is not null)
  ),
  check ((superseded_at is null) = (superseded_by is null))
);
create index service_ai_reports_review_idx
  on public.service_ai_reports (review_status, generated_at desc) where superseded_at is null;

-- Append-only guard. AI content and provenance are immutable; review and
-- supersession fields may be set; rows may only disappear together with
-- their service request (FK cascade).
create function public.service_ai_reports_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from public.service_requests where id = old.service_request_id) then
      raise exception 'service_ai_reports are append-only' using errcode = 'P0001';
    end if;
    return old;
  end if;

  if new.ai_report is distinct from old.ai_report
     or new.service_request_id is distinct from old.service_request_id
     or new.run_id is distinct from old.run_id
     or new.version is distinct from old.version
     or new.schema_version is distinct from old.schema_version
     or new.processing_status is distinct from old.processing_status
     or new.provider is distinct from old.provider
     or new.models is distinct from old.models
     or new.prompt_version is distinct from old.prompt_version
     or new.pipeline_version is distinct from old.pipeline_version
     or new.input_fingerprint is distinct from old.input_fingerprint
     or new.generated_at is distinct from old.generated_at
     or new.created_at is distinct from old.created_at then
    raise exception 'AI report content and provenance are immutable' using errcode = 'P0001';
  end if;
  if old.superseded_at is not null
     and (new.superseded_at is distinct from old.superseded_at or new.superseded_by is distinct from old.superseded_by) then
    raise exception 'A superseded report stays superseded' using errcode = 'P0001';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger service_ai_reports_guard_update before update on public.service_ai_reports
  for each row execute function public.service_ai_reports_guard();
create trigger service_ai_reports_guard_delete before delete on public.service_ai_reports
  for each row execute function public.service_ai_reports_guard();

-- ─── Per-media analyses (cache) ─────────────────────────────────────────────
-- input_hash identifies the exact input (media id + verified size + model +
-- prompt version), so an unchanged file is transcribed/analysed once and
-- reprocessing reuses the result. A COMPLETED entry is never overwritten.
create table public.service_media_analyses (
  id               uuid primary key default gen_random_uuid(),
  media_id         uuid not null references public.service_media (id) on delete cascade,
  kind             public.service_media_analysis_kind not null,
  input_hash       text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  status           public.service_media_processing_status not null,
  provider         text not null,
  model            text not null,
  prompt_version   text not null,
  result           jsonb check (result is null or jsonb_typeof(result) = 'object'),
  transcript_text  text,
  language         text check (length(language) <= 20),
  error_code       text check (length(error_code) <= 100),
  usage            jsonb not null default '{}'::jsonb,
  run_id           uuid references public.service_ai_runs (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (media_id, kind, input_hash),
  check (status in ('COMPLETED', 'FAILED', 'SKIPPED'))
);
create index service_media_analyses_run_idx on public.service_media_analyses (run_id);

create trigger service_media_analyses_touch before update on public.service_media_analyses
  for each row execute function public.touch_updated_at();

-- ─── Locked down: no client access ──────────────────────────────────────────
alter table public.service_ai_runs         enable row level security;
alter table public.service_ai_reports      enable row level security;
alter table public.service_media_analyses  enable row level security;
revoke all on public.service_ai_runs, public.service_ai_reports, public.service_media_analyses
  from anon, authenticated;

-- ─── enqueue_service_ai_run ─────────────────────────────────────────────────
-- Idempotent entry point for every trigger. Locks the request row so
-- concurrent triggers serialise. Outcomes:
--   created                 a new QUEUED run
--   active_run_exists       a QUEUED/PROCESSING run already exists (returned)
--   already_processed       automatic trigger, same inputs and versions already reported
--   already_failed          automatic trigger, same inputs and versions already failed for good
--   auto_run_limit_reached  automatic trigger, too many automatic runs for this request
-- MANUAL always creates a run (unless one is active): intentional reprocessing.
create function public.enqueue_service_ai_run(
  p_request_id        uuid,
  p_trigger           public.service_ai_run_trigger,
  p_input_fingerprint text,
  p_pipeline_version  text,
  p_prompt_version    text,
  p_schema_version    text,
  p_requested_by      text,
  p_max_auto_runs     integer
) returns table (outcome text, run jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run  public.service_ai_runs%rowtype;
  v_auto integer;
  v_next integer;
begin
  perform 1 from public.service_requests where id = p_request_id for update;
  if not found then
    raise exception 'service_request_not_found' using errcode = 'P0002';
  end if;

  select * into v_run from public.service_ai_runs
   where service_request_id = p_request_id and status in ('QUEUED', 'PROCESSING');
  if found then
    return query select 'active_run_exists'::text, to_jsonb(v_run);
    return;
  end if;

  if p_trigger <> 'MANUAL' then
    select * into v_run from public.service_ai_runs
     where service_request_id = p_request_id
       and input_fingerprint = p_input_fingerprint
       and pipeline_version = p_pipeline_version
       and prompt_version = p_prompt_version
       and schema_version = p_schema_version
       and status in ('COMPLETED', 'PARTIAL', 'FAILED')
     order by run_number desc
     limit 1;
    if found then
      return query select (case when v_run.status = 'FAILED' then 'already_failed' else 'already_processed' end)::text, to_jsonb(v_run);
      return;
    end if;

    select count(*) into v_auto from public.service_ai_runs
     where service_request_id = p_request_id and trigger <> 'MANUAL';
    if v_auto >= p_max_auto_runs then
      return query select 'auto_run_limit_reached'::text, null::jsonb;
      return;
    end if;
  end if;

  select coalesce(max(run_number), 0) + 1 into v_next
    from public.service_ai_runs where service_request_id = p_request_id;

  insert into public.service_ai_runs (
    service_request_id, run_number, trigger, input_fingerprint,
    pipeline_version, prompt_version, schema_version, requested_by
  ) values (
    p_request_id, v_next, p_trigger, p_input_fingerprint,
    p_pipeline_version, p_prompt_version, p_schema_version, left(coalesce(p_requested_by, 'system'), 100)
  ) returning * into v_run;

  return query select 'created'::text, to_jsonb(v_run);
end $$;

-- ─── claim_service_ai_runs ──────────────────────────────────────────────────
-- Claims up to p_limit runnable runs for one worker: QUEUED runs whose retry
-- time has come, and PROCESSING runs whose lease expired (a crashed worker).
-- FOR UPDATE SKIP LOCKED means concurrent workers never claim the same run.
-- Each claim counts as an attempt; expired runs with no attempts left fail.
create function public.claim_service_ai_runs(p_worker text, p_lease_seconds integer, p_limit integer)
returns setof public.service_ai_runs
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_worker is null or length(p_worker) = 0 or length(p_worker) > 100 then
    raise exception 'invalid_worker' using errcode = 'P0001';
  end if;

  update public.service_ai_runs
     set status = 'FAILED', error_code = 'lease_expired', finished_at = now(),
         lease_owner = null, lease_expires_at = null
   where status = 'PROCESSING' and lease_expires_at < now() and attempts >= max_attempts;

  return query
  with picked as (
    select r.id from public.service_ai_runs r
     where (r.status = 'QUEUED' and r.next_attempt_at <= now())
        or (r.status = 'PROCESSING' and r.lease_expires_at < now())
     order by r.created_at
     limit greatest(least(p_limit, 50), 0)
     for update skip locked
  )
  update public.service_ai_runs r
     set status = 'PROCESSING',
         lease_owner = p_worker,
         lease_expires_at = now() + make_interval(secs => greatest(least(p_lease_seconds, 3600), 30)),
         attempts = r.attempts + 1,
         started_at = coalesce(r.started_at, now())
    from picked
   where r.id = picked.id
  returning r.*;
end $$;

-- ─── extend_service_ai_run_lease ────────────────────────────────────────────
create function public.extend_service_ai_run_lease(p_run_id uuid, p_worker text, p_lease_seconds integer)
returns boolean
language sql
security definer
set search_path = public
as $$
  with updated as (
    update public.service_ai_runs
       set lease_expires_at = now() + make_interval(secs => greatest(least(p_lease_seconds, 3600), 30))
     where id = p_run_id and status = 'PROCESSING' and lease_owner = p_worker
    returning 1
  )
  select exists (select 1 from updated);
$$;

-- ─── complete_service_ai_run ────────────────────────────────────────────────
-- Finishes a run the caller still holds and stores its report as the next
-- version, superseding the previous one — all in one transaction. The report
-- JSON has already been validated by the server.
create function public.complete_service_ai_run(
  p_run_id            uuid,
  p_worker            text,
  p_status            public.service_ai_run_status,
  p_input_fingerprint text,
  p_provider          text,
  p_models            jsonb,
  p_usage             jsonb,
  p_error_detail      jsonb,
  p_report            jsonb
) returns setof public.service_ai_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run     public.service_ai_runs%rowtype;
  v_version integer;
  v_id      uuid := gen_random_uuid();
begin
  if p_status not in ('COMPLETED', 'PARTIAL') then
    raise exception 'invalid_completion_status' using errcode = 'P0001';
  end if;

  select * into v_run from public.service_ai_runs
   where id = p_run_id and status = 'PROCESSING' and lease_owner = p_worker
   for update;
  if not found then
    raise exception 'run_not_owned' using errcode = 'P0001';
  end if;

  -- Serialise version allocation per request (a lock only; the row is not changed).
  perform 1 from public.service_requests where id = v_run.service_request_id for update;
  select coalesce(max(version), 0) + 1 into v_version
    from public.service_ai_reports where service_request_id = v_run.service_request_id;

  insert into public.service_ai_reports (
    id, service_request_id, run_id, version, schema_version, processing_status,
    provider, models, prompt_version, pipeline_version, input_fingerprint, ai_report
  ) values (
    v_id, v_run.service_request_id, v_run.id, v_version, v_run.schema_version, p_status,
    p_provider, coalesce(p_models, '{}'::jsonb), v_run.prompt_version, v_run.pipeline_version,
    p_input_fingerprint, p_report
  );

  update public.service_ai_reports
     set superseded_at = now(), superseded_by = v_id
   where service_request_id = v_run.service_request_id and id <> v_id and superseded_at is null;

  update public.service_ai_runs
     set status = p_status, finished_at = now(), lease_owner = null, lease_expires_at = null,
         input_fingerprint = p_input_fingerprint, provider = p_provider,
         models = coalesce(p_models, '{}'::jsonb), usage = coalesce(p_usage, '{}'::jsonb),
         error_code = null, error_detail = p_error_detail
   where id = v_run.id;

  return query select * from public.service_ai_reports where id = v_id;
end $$;

-- ─── fail_service_ai_run ────────────────────────────────────────────────────
-- Records a failure for a run the caller holds. Retryable failures with
-- attempts left go back to QUEUED with a backoff; otherwise FAILED. Returns
-- no row if the caller no longer holds the run.
create function public.fail_service_ai_run(
  p_run_id       uuid,
  p_worker       text,
  p_error_code   text,
  p_error_detail jsonb,
  p_retryable    boolean,
  p_usage        jsonb
) returns setof public.service_ai_runs
language sql
security definer
set search_path = public
as $$
  update public.service_ai_runs r
     set status = case when p_retryable and r.attempts < r.max_attempts then 'QUEUED'::public.service_ai_run_status else 'FAILED'::public.service_ai_run_status end,
         next_attempt_at = now() + make_interval(mins => 2 * r.attempts),
         finished_at = case when p_retryable and r.attempts < r.max_attempts then null else now() end,
         lease_owner = null,
         lease_expires_at = null,
         error_code = left(p_error_code, 100),
         error_detail = p_error_detail,
         usage = r.usage || coalesce(p_usage, '{}'::jsonb)
   where r.id = p_run_id and r.status = 'PROCESSING' and r.lease_owner = p_worker
  returning r.*;
$$;

-- ─── find_service_requests_for_ai ───────────────────────────────────────────
-- Sweep discovery: recent requests whose evidence is settled and that have
-- not been processed since their last change. Evidence is settled when the
-- upload window has closed, or when nothing is mid-upload and nothing has
-- changed for p_idle_minutes. Requests older than p_max_age_hours are never
-- picked up (no backfill when AI is first enabled).
create function public.find_service_requests_for_ai(p_limit integer, p_idle_minutes integer, p_max_age_hours integer)
returns table (service_request_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  with candidates as (
    select r.id, r.created_at, r.upload_token_expires_at,
           greatest(r.created_at, coalesce((select max(m.updated_at) from public.service_media m where m.service_request_id = r.id), r.created_at)) as last_change,
           exists (select 1 from public.service_media m where m.service_request_id = r.id and m.upload_status = 'PENDING') as has_pending
      from public.service_requests r
     where r.created_at > now() - make_interval(hours => p_max_age_hours)
  )
  select c.id
    from candidates c
   where (coalesce(c.upload_token_expires_at, c.created_at) < now()
          or (not c.has_pending and c.last_change < now() - make_interval(mins => p_idle_minutes)))
     and not exists (select 1 from public.service_ai_runs ru
                      where ru.service_request_id = c.id
                        and (ru.status in ('QUEUED', 'PROCESSING') or ru.created_at >= c.last_change))
   order by c.created_at
   limit greatest(least(p_limit, 100), 0);
$$;

-- ─── record_service_media_analysis ──────────────────────────────────────────
-- Stores one per-media result. A COMPLETED result for the same input is never
-- replaced; a FAILED/SKIPPED one may be replaced by a later attempt.
create function public.record_service_media_analysis(
  p_media_id        uuid,
  p_kind            public.service_media_analysis_kind,
  p_input_hash      text,
  p_status          public.service_media_processing_status,
  p_provider        text,
  p_model           text,
  p_prompt_version  text,
  p_result          jsonb,
  p_transcript_text text,
  p_language        text,
  p_error_code      text,
  p_usage           jsonb,
  p_run_id          uuid
) returns setof public.service_media_analyses
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.service_media_analyses (
    media_id, kind, input_hash, status, provider, model, prompt_version,
    result, transcript_text, language, error_code, usage, run_id
  ) values (
    p_media_id, p_kind, p_input_hash, p_status, p_provider, p_model, p_prompt_version,
    p_result, p_transcript_text, p_language, left(p_error_code, 100), coalesce(p_usage, '{}'::jsonb), p_run_id
  )
  on conflict (media_id, kind, input_hash) do update
     set status = excluded.status, provider = excluded.provider, model = excluded.model,
         result = excluded.result, transcript_text = excluded.transcript_text,
         language = excluded.language, error_code = excluded.error_code,
         usage = excluded.usage, run_id = excluded.run_id
   where public.service_media_analyses.status <> 'COMPLETED';

  return query select * from public.service_media_analyses
    where media_id = p_media_id and kind = p_kind and input_hash = p_input_hash;
end $$;

revoke all on function public.enqueue_service_ai_run(uuid, public.service_ai_run_trigger, text, text, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.claim_service_ai_runs(text, integer, integer) from public, anon, authenticated;
revoke all on function public.extend_service_ai_run_lease(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.complete_service_ai_run(uuid, text, public.service_ai_run_status, text, text, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.fail_service_ai_run(uuid, text, text, jsonb, boolean, jsonb) from public, anon, authenticated;
revoke all on function public.find_service_requests_for_ai(integer, integer, integer) from public, anon, authenticated;
revoke all on function public.record_service_media_analysis(uuid, public.service_media_analysis_kind, text, public.service_media_processing_status, text, text, text, jsonb, text, text, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.service_ai_reports_guard() from public, anon, authenticated;

grant execute on function public.enqueue_service_ai_run(uuid, public.service_ai_run_trigger, text, text, text, text, text, integer) to service_role;
grant execute on function public.claim_service_ai_runs(text, integer, integer) to service_role;
grant execute on function public.extend_service_ai_run_lease(uuid, text, integer) to service_role;
grant execute on function public.complete_service_ai_run(uuid, text, public.service_ai_run_status, text, text, jsonb, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.fail_service_ai_run(uuid, text, text, jsonb, boolean, jsonb) to service_role;
grant execute on function public.find_service_requests_for_ai(integer, integer, integer) to service_role;
grant execute on function public.record_service_media_analysis(uuid, public.service_media_analysis_kind, text, public.service_media_processing_status, text, text, text, jsonb, text, text, text, jsonb, uuid) to service_role;
