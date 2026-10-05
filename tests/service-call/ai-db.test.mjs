// Migration 0003 against real Postgres (PGlite, in-process): schema, RLS and
// grants, enqueue idempotency, leases, versioning, immutability, discovery.
// Each test gets a fresh database with migrations 0001–0003 applied.
import { test } from "node:test";
import assert from "node:assert/strict";
import { addMedia, createRequest, FP, freshDatabase } from "../support/db.mjs";

const V = ["4a.1", "stub-1", "scr-1"];
const enqueue = async (db, requestId, trigger = "FINALIZE", fp = FP("a"), max = 3) =>
  (await db.query("select * from enqueue_service_ai_run($1, $2, $3, $4, $5, $6, 'test', $7)", [requestId, trigger, fp, ...V, max])).rows[0];
const claim = async (db, worker, limit = 5, lease = 300) => (await db.query("select * from claim_service_ai_runs($1, $2, $3)", [worker, lease, limit])).rows;
const complete = (db, runId, worker, status = "COMPLETED", report = { content: { n: 1 } }) =>
  db.query("select * from complete_service_ai_run($1, $2, $3, $4, 'stub', '{}', '{}', null, $5)", [runId, worker, status, FP("a"), JSON.stringify(report)]).then((r) => r.rows[0]);
const fail = (db, runId, worker, retryable) =>
  db.query("select * from fail_service_ai_run($1, $2, 'boom', null, $3, '{}')", [runId, worker, retryable]).then((r) => r.rows[0] ?? null);
const one = async (db, sql, params) => (await db.query(sql, params)).rows[0];
const rejects = (p, pattern) => assert.rejects(p, (e) => pattern.test(e.message), `expected ${pattern}`);

test("schema: tables, enums, functions, triggers and indexes exist", async () => {
  const db = await freshDatabase();
  const tables = (await db.query("select tablename from pg_tables where schemaname = 'public' and tablename like '%ai%' or tablename = 'service_media_analyses' order by 1")).rows.map((r) => r.tablename);
  for (const t of ["service_ai_reports", "service_ai_runs", "service_media_analyses"]) assert.ok(tables.includes(t), t);
  const enumValues = async (name) => (await db.query("select unnest(enum_range(null::" + name + "))::text as v")).rows.map((r) => r.v);
  assert.deepEqual(await enumValues("service_ai_run_status"), ["QUEUED", "PROCESSING", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"]);
  assert.deepEqual(await enumValues("service_ai_run_trigger"), ["FINALIZE", "SWEEP", "MANUAL"]);
  assert.deepEqual(await enumValues("service_ai_review_status"), ["AWAITING_REVIEW", "APPROVED", "EDITED", "REJECTED"]);
  const fns = (await db.query("select proname from pg_proc where pronamespace = 'public'::regnamespace")).rows.map((r) => r.proname);
  for (const f of ["enqueue_service_ai_run", "claim_service_ai_runs", "extend_service_ai_run_lease", "complete_service_ai_run", "fail_service_ai_run", "find_service_requests_for_ai", "record_service_media_analysis", "service_ai_reports_guard"]) assert.ok(fns.includes(f), f);
  const idx = (await db.query("select indexname from pg_indexes where schemaname = 'public'")).rows.map((r) => r.indexname);
  for (const i of ["service_ai_runs_one_active_idx", "service_ai_runs_queue_idx", "service_ai_runs_lease_idx", "service_ai_reports_review_idx"]) assert.ok(idx.includes(i), i);
  const trg = (await db.query("select tgname from pg_trigger where not tgisinternal")).rows.map((r) => r.tgname);
  for (const t of ["service_ai_reports_guard_update", "service_ai_reports_guard_delete", "service_ai_runs_touch"]) assert.ok(trg.includes(t), t);
});

test("RLS on, no policies, no browser-role privileges; service_role only", async () => {
  const db = await freshDatabase();
  for (const t of ["service_ai_runs", "service_ai_reports", "service_media_analyses"]) {
    assert.equal((await one(db, "select relrowsecurity as on from pg_class where relname = $1", [t])).on, true, `${t} RLS`);
    assert.equal((await one(db, "select count(*)::int as n from pg_policies where tablename = $1", [t])).n, 0, `${t} policies`);
    for (const role of ["anon", "authenticated"]) {
      for (const priv of ["select", "insert", "update", "delete"]) {
        assert.equal((await one(db, "select has_table_privilege($1, $2, $3) as ok", [role, `public.${t}`, priv])).ok, false, `${role} ${priv} ${t}`);
      }
    }
  }
  for (const fn of ["enqueue_service_ai_run", "claim_service_ai_runs", "complete_service_ai_run", "fail_service_ai_run", "find_service_requests_for_ai", "record_service_media_analysis", "extend_service_ai_run_lease"]) {
    const oid = (await one(db, "select oid from pg_proc where proname = $1", [fn])).oid;
    for (const role of ["anon", "authenticated"]) assert.equal((await one(db, "select has_function_privilege($1, $2::oid, 'execute') as ok", [role, oid])).ok, false, `${role} ${fn}`);
    assert.equal((await one(db, "select has_function_privilege('service_role', $1::oid, 'execute') as ok", [oid])).ok, true, `service_role ${fn}`);
  }
  await db.exec("set role anon");
  await rejects(db.query("select * from service_ai_reports"), /permission denied/);
  await rejects(db.query("select * from claim_service_ai_runs('x', 60, 1)"), /permission denied/);
  await db.exec("reset role");
});

test("0003 is additive: Phase 1–3 tables, columns, constraints, triggers and functions are identical", async () => {
  const before = await freshDatabase({ upTo: "0002" });
  const after = await freshDatabase();
  const shape = async (db) => ({
    columns: (await db.query("select table_name, column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' and table_name in ('customers','service_requests','status_history','service_reference_counters','service_media') order by 1, 2")).rows,
    constraints: (await db.query("select conrelid::regclass::text as t, conname, pg_get_constraintdef(oid) as def from pg_constraint where conrelid::regclass::text in ('customers','service_requests','status_history','service_reference_counters','service_media') order by 1, 2")).rows,
    triggers: (await db.query("select tgrelid::regclass::text as t, tgname from pg_trigger where not tgisinternal and tgrelid::regclass::text in ('customers','service_requests','status_history','service_media') order by 1, 2")).rows,
    functions: (await db.query("select proname, md5(prosrc) as src from pg_proc where pronamespace = 'public'::regnamespace and proname in ('create_service_request','reserve_service_media','mark_service_media_uploaded','mark_service_media_failed','touch_updated_at') order by 1")).rows,
    enums: (await db.query("select t.typname, array_agg(e.enumlabel order by e.enumsortorder)::text as labels from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typname in ('service_request_status','service_media_type','service_media_upload_status','service_media_processing_status') group by 1 order by 1")).rows,
  });
  assert.deepEqual(await shape(after), await shape(before));
});

test("enqueue: idempotent for automatic triggers; one active run per request", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  const a = await enqueue(db, r.id);
  assert.equal(a.outcome, "created");
  const b = await enqueue(db, r.id, "SWEEP");
  assert.equal(b.outcome, "active_run_exists");
  assert.equal(b.run.id, a.run.id);
  const c = await enqueue(db, r.id, "MANUAL");
  assert.equal(c.outcome, "active_run_exists", "even manual can't run in parallel");
  await rejects(db.query("insert into service_ai_runs (service_request_id, run_number, trigger, input_fingerprint, pipeline_version, prompt_version, schema_version) values ($1, 9, 'SWEEP', $2, 'a', 'b', 'c')", [r.id, FP("b")]), /duplicate key|unique/);
  await rejects(enqueue(db, "00000000-0000-4000-8000-000000000000"), /service_request_not_found/);
});

test("enqueue: same inputs already processed/failed → no new run; changed inputs or MANUAL → new run", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  const first = await enqueue(db, r.id);
  const [claimed] = await claim(db, "w1");
  await complete(db, claimed.id, "w1");
  assert.equal((await enqueue(db, r.id, "FINALIZE")).outcome, "already_processed");
  assert.equal((await enqueue(db, r.id, "SWEEP")).outcome, "already_processed");
  const changed = await enqueue(db, r.id, "SWEEP", FP("b"));
  assert.equal(changed.outcome, "created");
  assert.equal(changed.run.run_number, 2);
  const [c2] = await claim(db, "w1");
  await fail(db, c2.id, "w1", false);
  assert.equal((await enqueue(db, r.id, "FINALIZE", FP("b"))).outcome, "already_failed");
  const manual = await enqueue(db, r.id, "MANUAL", FP("a"));
  assert.equal(manual.outcome, "created", "intentional reprocessing always creates a run");
  assert.equal(manual.run.trigger, "MANUAL");
  assert.notEqual(manual.run.id, first.run.id);
});

test("enqueue: automatic runs are capped per request; manual runs are not", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  for (const c of "abc") {
    assert.equal((await enqueue(db, r.id, "SWEEP", FP(c))).outcome, "created");
    const [run] = await claim(db, "w");
    await complete(db, run.id, "w");
  }
  assert.equal((await enqueue(db, r.id, "SWEEP", FP("d"))).outcome, "auto_run_limit_reached");
  assert.equal((await enqueue(db, r.id, "MANUAL", FP("d"))).outcome, "created");
});

test("claim: sets lease and attempt; a claimed run can't be claimed again while leased", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  const [run] = await claim(db, "w1", 1);
  assert.equal(run.status, "PROCESSING");
  assert.equal(run.lease_owner, "w1");
  assert.equal(run.attempts, 1);
  assert.ok(new Date(run.lease_expires_at) > new Date());
  assert.equal((await claim(db, "w2", 5)).length, 0);
  assert.equal((await one(db, "select extend_service_ai_run_lease($1, 'w2', 300) as ok", [run.id])).ok, false);
  assert.equal((await one(db, "select extend_service_ai_run_lease($1, 'w1', 300) as ok", [run.id])).ok, true);
  await rejects(db.query("select * from claim_service_ai_runs('', 60, 1)"), /invalid_worker/);
});

test("lease expiry: another worker recovers the run; the old worker can't finish it", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  const [run] = await claim(db, "w1");
  await db.query("update service_ai_runs set lease_expires_at = now() - interval '1 second' where id = $1", [run.id]);
  const [recovered] = await claim(db, "w2");
  assert.equal(recovered.id, run.id);
  assert.equal(recovered.lease_owner, "w2");
  assert.equal(recovered.attempts, 2);
  await rejects(complete(db, run.id, "w1"), /run_not_owned/);
  assert.equal(await fail(db, run.id, "w1", true), null);
  assert.equal((await complete(db, run.id, "w2")).version, 1);
});

test("lease expiry with no attempts left fails the run instead of looping", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  const [run] = await claim(db, "w1");
  await db.query("update service_ai_runs set attempts = max_attempts, lease_expires_at = now() - interval '1 second' where id = $1", [run.id]);
  assert.equal((await claim(db, "w2")).length, 0);
  const after = await one(db, "select status, error_code, lease_owner from service_ai_runs where id = $1", [run.id]);
  assert.deepEqual(after, { status: "FAILED", error_code: "lease_expired", lease_owner: null });
});

test("fail: retryable → back to QUEUED with backoff (not claimable yet); permanent → FAILED", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  const [run] = await claim(db, "w1");
  const retried = await fail(db, run.id, "w1", true);
  assert.equal(retried.status, "QUEUED");
  assert.ok(new Date(retried.next_attempt_at) > new Date());
  assert.equal((await claim(db, "w1")).length, 0, "backoff respected");
  await db.query("update service_ai_runs set next_attempt_at = now() where id = $1", [run.id]);
  const [again] = await claim(db, "w1");
  const failed = await fail(db, again.id, "w1", false);
  assert.equal(failed.status, "FAILED");
  assert.ok(failed.finished_at);
  assert.equal((await one(db, "select count(*)::int as n from service_ai_reports")).n, 0, "no report for a failed run");
});

test("reports: versions increment; previous version superseded, never overwritten", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  let [run] = await claim(db, "w");
  const v1 = await complete(db, run.id, "w", "COMPLETED", { content: { v: 1 } });
  await enqueue(db, r.id, "MANUAL");
  [run] = await claim(db, "w");
  const v2 = await complete(db, run.id, "w", "PARTIAL", { content: { v: 2 } });
  assert.equal(v1.version, 1);
  assert.equal(v2.version, 2);
  assert.equal(v2.processing_status, "PARTIAL");
  const old = await one(db, "select * from service_ai_reports where id = $1", [v1.id]);
  assert.equal(old.superseded_by, v2.id);
  assert.deepEqual(old.ai_report, { content: { v: 1 } });
  assert.equal(old.review_status, "AWAITING_REVIEW");
  await rejects(db.query("select * from complete_service_ai_run($1, 'w', 'FAILED', $2, 'stub', '{}', '{}', null, '{}')", [run.id, FP("a")]), /invalid_completion_status/);
});

test("reports: AI content and provenance immutable; review fields settable; no direct delete", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  await enqueue(db, r.id);
  const [run] = await claim(db, "w");
  const rep = await complete(db, run.id, "w");
  for (const set of ["ai_report = '{\"x\":1}'", "version = 5", "provider = 'other'", "models = '{\"a\":\"b\"}'", "prompt_version = 'p2'", "input_fingerprint = 'x'", "generated_at = now() - interval '1 day'"]) {
    await rejects(db.query(`update service_ai_reports set ${set} where id = $1`, [rep.id]), /immutable/);
  }
  await rejects(db.query("update service_ai_reports set review_status = 'APPROVED' where id = $1", [rep.id]), /check constraint/);
  await rejects(db.query("update service_ai_reports set review_status = 'EDITED', reviewed_by = 's', reviewed_at = now() where id = $1", [rep.id]), /check constraint/);
  await db.query("update service_ai_reports set review_status = 'EDITED', reviewed_by = 'staff-1', reviewed_at = now(), reviewed_report = '{\"content\":{\"edited\":true}}' where id = $1", [rep.id]);
  const after = await one(db, "select ai_report, reviewed_report, review_status from service_ai_reports where id = $1", [rep.id]);
  assert.deepEqual(after.ai_report, { content: { n: 1 } }, "original AI output preserved");
  assert.deepEqual(after.reviewed_report, { content: { edited: true } });
  await rejects(db.query("delete from service_ai_reports where id = $1", [rep.id]), /append-only/);
});

test("deleting a service request cascades to runs, reports and analyses", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  const m = await addMedia(db, r.id, { type: "VOICE" });
  await enqueue(db, r.id);
  const [run] = await claim(db, "w");
  await db.query("select * from record_service_media_analysis($1, 'TRANSCRIPT', $2, 'COMPLETED', 'stub', 'm', 'p', null, 'text', 'en', null, '{}', $3)", [m.id, FP("c"), run.id]);
  await complete(db, run.id, "w");
  await db.query("delete from status_history where service_request_id = $1", [r.id]);
  await db.query("delete from service_requests where id = $1", [r.id]);
  for (const t of ["service_ai_runs", "service_ai_reports", "service_media_analyses", "service_media"]) {
    assert.equal((await one(db, `select count(*)::int as n from ${t}`)).n, 0, t);
  }
});

test("AI processing never changes the service request or its status history", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  const before = await one(db, "select status, updated_at from service_requests where id = $1", [r.id]);
  await enqueue(db, r.id);
  let [run] = await claim(db, "w");
  await fail(db, run.id, "w", true);
  await db.query("update service_ai_runs set next_attempt_at = now()");
  [run] = await claim(db, "w");
  await complete(db, run.id, "w");
  await enqueue(db, r.id, "MANUAL");
  [run] = await claim(db, "w");
  await fail(db, run.id, "w", false);
  const after = await one(db, "select status, updated_at from service_requests where id = $1", [r.id]);
  assert.deepEqual(after, before);
  assert.equal((await one(db, "select count(*)::int as n from status_history where service_request_id = $1", [r.id])).n, 1);
});

test("media analyses: a COMPLETED result is never overwritten; a FAILED one can be replaced", async () => {
  const db = await freshDatabase();
  const r = await createRequest(db);
  const m = await addMedia(db, r.id, { type: "VOICE" });
  const rec = (status, text) => db.query("select * from record_service_media_analysis($1, 'TRANSCRIPT', $2, $3, 'stub', 'm', 'p', null, $4, null, null, '{}', null)", [m.id, FP("d"), status, text]).then((x) => x.rows[0]);
  assert.equal((await rec("FAILED", null)).status, "FAILED");
  assert.equal((await rec("COMPLETED", "first")).transcript_text, "first");
  const again = await rec("COMPLETED", "second");
  assert.equal(again.transcript_text, "first");
  assert.equal((await rec("FAILED", null)).status, "COMPLETED");
});

test("sweep discovery: settled, unprocessed, recent requests only", async () => {
  const db = await freshDatabase();
  // PGlite's clock has millisecond resolution: let it move past the last change
  // before checking "idle for 0 minutes".
  const find = async (idle = 30, age = 72) => {
    await new Promise((resolve) => setTimeout(resolve, 3));
    return (await db.query("select * from find_service_requests_for_ai(50, $1, $2)", [idle, age])).rows.map((x) => x.service_request_id);
  };
  const open = await createRequest(db);
  await db.query("update service_requests set upload_token_expires_at = now() + interval '6 hours' where id = $1", [open.id]);
  const pending = await addMedia(db, open.id, { status: "PENDING" });
  assert.ok(!(await find(0)).includes(open.id), "media still uploading");
  await db.query("update service_media set upload_status = 'UPLOADED', file_size = declared_size where id = $1", [pending.id]);
  assert.ok(!(await find(30)).includes(open.id), "recently changed: not settled yet");
  assert.ok((await find(0)).includes(open.id), "settled once idle");

  await enqueue(db, open.id);
  assert.ok(!(await find(0)).includes(open.id), "active run");
  const [run] = await claim(db, "w");
  await complete(db, run.id, "w");
  assert.ok(!(await find(0)).includes(open.id), "processed since last change");
  await db.query("update service_media set updated_at = now() + interval '1 second' where id = $1", [pending.id]);
  assert.ok((await find(0)).includes(open.id), "evidence changed after processing");

  const closed = await createRequest(db);
  await db.query("update service_requests set upload_token_expires_at = now() - interval '1 minute' where id = $1", [closed.id]);
  await addMedia(db, closed.id, { status: "PENDING" });
  assert.ok((await find(30)).includes(closed.id), "upload window closed: abandoned PENDING rows don't block");

  const old = await createRequest(db);
  await db.query("update service_requests set created_at = now() - interval '80 hours', upload_token_expires_at = now() - interval '74 hours' where id = $1", [old.id]);
  assert.ok(!(await find(0)).includes(old.id), "older than max age: no backfill");
});
