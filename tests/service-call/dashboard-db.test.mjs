// Phase 5 migration 0004 over real SQL (PGlite): staff allow-list, the
// approved transition matrix (every pair, both roles), mandatory notes,
// atomic + audited status changes, concurrency, append-only history, AI
// review persistence and supersession, the inbox query, and lockdown.
import { test } from "node:test";
import assert from "node:assert/strict";
import { addMedia, createRequest, FP, freshDatabase } from "../support/db.mjs";

const STATUSES = ["SUBMITTED", "AI_PROCESSED", "AWAITING_REVIEW", "MORE_INFORMATION_REQUIRED", "INSPECTION_REQUIRED", "SCHEDULED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
// The approved matrix (from → to: role, note required). Anything absent is forbidden.
export const MATRIX = {
  "SUBMITTED>AWAITING_REVIEW": ["STAFF", false], "SUBMITTED>MORE_INFORMATION_REQUIRED": ["STAFF", true], "SUBMITTED>INSPECTION_REQUIRED": ["STAFF", false], "SUBMITTED>CLOSED": ["ADMIN", true],
  "AWAITING_REVIEW>MORE_INFORMATION_REQUIRED": ["STAFF", true], "AWAITING_REVIEW>INSPECTION_REQUIRED": ["STAFF", false], "AWAITING_REVIEW>SCHEDULED": ["STAFF", true], "AWAITING_REVIEW>RESOLVED": ["STAFF", true], "AWAITING_REVIEW>CLOSED": ["ADMIN", true],
  "MORE_INFORMATION_REQUIRED>AWAITING_REVIEW": ["STAFF", false], "MORE_INFORMATION_REQUIRED>INSPECTION_REQUIRED": ["STAFF", false], "MORE_INFORMATION_REQUIRED>CLOSED": ["ADMIN", true],
  "INSPECTION_REQUIRED>SCHEDULED": ["STAFF", false], "INSPECTION_REQUIRED>MORE_INFORMATION_REQUIRED": ["STAFF", true], "INSPECTION_REQUIRED>AWAITING_REVIEW": ["STAFF", true], "INSPECTION_REQUIRED>CLOSED": ["ADMIN", true],
  "SCHEDULED>IN_PROGRESS": ["STAFF", false], "SCHEDULED>INSPECTION_REQUIRED": ["STAFF", true], "SCHEDULED>MORE_INFORMATION_REQUIRED": ["STAFF", true], "SCHEDULED>CLOSED": ["ADMIN", true],
  "IN_PROGRESS>RESOLVED": ["STAFF", true], "IN_PROGRESS>SCHEDULED": ["STAFF", true], "IN_PROGRESS>MORE_INFORMATION_REQUIRED": ["STAFF", true], "IN_PROGRESS>INSPECTION_REQUIRED": ["STAFF", true],
  "RESOLVED>CLOSED": ["STAFF", false], "RESOLVED>IN_PROGRESS": ["STAFF", true], "RESOLVED>AWAITING_REVIEW": ["STAFF", true],
  "CLOSED>AWAITING_REVIEW": ["ADMIN", true],
};

const one = async (db, sql, p) => (await db.query(sql, p)).rows[0];
const rejects = (p, pattern) => assert.rejects(p, (e) => pattern.test(e.message), `expected ${pattern}`);
const USER = { staff: "aaaaaaaa-0000-4000-8000-000000000001", admin: "aaaaaaaa-0000-4000-8000-000000000002", inactive: "aaaaaaaa-0000-4000-8000-000000000003", stranger: "aaaaaaaa-0000-4000-8000-000000000009" };

async function setup() {
  const db = await freshDatabase();
  const ids = {};
  ids.staff = (await one(db, "insert into staff_members (auth_user_id, display_name, role) values ($1, 'Synthetic Staff', 'STAFF') returning id", [USER.staff])).id;
  ids.admin = (await one(db, "insert into staff_members (auth_user_id, display_name, role) values ($1, 'Synthetic Admin', 'ADMIN') returning id", [USER.admin])).id;
  ids.inactive = (await one(db, "insert into staff_members (auth_user_id, display_name, role, active, deactivated_at) values ($1, 'Former Staff', 'ADMIN', false, now()) returning id", [USER.inactive])).id;
  return { db, ids };
}
/** Puts a request into `status` directly (test setup only), bypassing the matrix. */
async function forceStatus(db, requestId, status) {
  await db.exec("begin");
  await db.query("select set_config('swiftrooms.status_change', 'on', true)");
  await db.query("update service_requests set status = $1 where id = $2", [status, requestId]);
  await db.exec("commit");
}
const change = (db, requestId, from, to, user, note = null) =>
  db.query("select * from change_service_request_status($1, $2, $3, $4, $5)", [requestId, from, to, user, note]).then((r) => r.rows[0]);

test("schema: tables, the seeded matrix, RLS, no browser-role access, service_role-only functions", async () => {
  const { db } = await setup();
  const rows = (await db.query("select from_status::text f, to_status::text t, min_role::text r, note_required n from service_status_transitions")).rows;
  assert.deepEqual(Object.fromEntries(rows.map((x) => [`${x.f}>${x.t}`, [x.r, x.n]])), MATRIX, "the seeded matrix is exactly the approved one");
  assert.equal(rows.length, 28);
  for (const t of ["staff_members", "service_status_transitions", "service_ai_report_reviews"]) {
    assert.equal((await one(db, "select relrowsecurity from pg_class where relname = $1", [t])).relrowsecurity, true, t);
    assert.equal((await one(db, "select count(*)::int n from pg_policies where tablename = $1", [t])).n, 0, `${t} has no policies`);
    for (const role of ["anon", "authenticated"]) assert.equal((await one(db, "select has_table_privilege($1, $2, 'select') ok", [role, `public.${t}`])).ok, false, `${role} ${t}`);
  }
  for (const fn of ["change_service_request_status", "review_service_ai_report", "list_service_requests", "require_active_staff"]) {
    const oid = (await one(db, "select oid from pg_proc where proname = $1", [fn])).oid;
    for (const role of ["anon", "authenticated"]) assert.equal((await one(db, "select has_function_privilege($1, $2::oid, 'execute') ok", [role, oid])).ok, false, `${role} ${fn}`);
    assert.equal((await one(db, "select has_function_privilege('service_role', $1::oid, 'execute') ok", [oid])).ok, true, fn);
  }
  await db.exec("set role anon");
  await rejects(db.query("select * from staff_members"), /permission denied/);
  await rejects(db.query("select * from change_service_request_status(gen_random_uuid(), 'SUBMITTED', 'AWAITING_REVIEW', gen_random_uuid(), null)"), /permission denied/);
  await db.exec("reset role");
  await rejects(db.query("insert into service_status_transitions values ('SUBMITTED', 'RESOLVED', 'ADMIN', false)"), /fixed by migration/);
  await rejects(db.query("delete from service_status_transitions"), /fixed by migration/);
});

test("0004 is additive: earlier tables unchanged except the new status_history audit columns", async () => {
  const before = await freshDatabase({ upTo: "0003" });
  const after = await freshDatabase();
  const cols = async (d) => (await d.query("select table_name, column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' and table_name in ('customers','service_requests','status_history','service_media','service_ai_runs','service_ai_reports','service_media_analyses') order by 1, 2")).rows;
  const a = await cols(before), b = await cols(after);
  const added = b.filter((x) => !a.some((y) => JSON.stringify(y) === JSON.stringify(x)));
  assert.deepEqual(added.map((x) => `${x.table_name}.${x.column_name}`), ["status_history.actor_role", "status_history.actor_staff_id"]);
  assert.equal(a.filter((x) => !b.some((y) => JSON.stringify(y) === JSON.stringify(x))).length, 0, "nothing removed or altered");
});

test("transition matrix: every one of 81 pairs × both roles behaves exactly as approved", async () => {
  const { db } = await setup();
  const outcomes = [];
  for (const from of STATUSES) {
    for (const to of STATUSES) {
      for (const role of ["staff", "admin"]) {
        const req = await createRequest(db);
        await forceStatus(db, req.id, from);
        const rule = MATRIX[`${from}>${to}`];
        const allowed = !!rule && (rule[0] === "STAFF" || role === "admin");
        const note = "Synthetic test note.";
        let got;
        try {
          await change(db, req.id, from, to, USER[role], note);
          got = "allowed";
        } catch (e) {
          got = e.message;
        }
        outcomes.push(`${from}>${to}/${role}: ${got}`);
        assert.equal(got === "allowed", allowed, `${from} → ${to} as ${role}: ${got}`);
        if (!allowed) assert.match(got, /transition_not_allowed/, `${from} → ${to} as ${role}`);
        const now = (await one(db, "select status from service_requests where id = $1", [req.id])).status;
        assert.equal(now, allowed ? to : from, "status only changes when allowed");
      }
    }
  }
  assert.equal(outcomes.length, 162);
  assert.equal(outcomes.filter((o) => o.endsWith(": allowed")).length, 22 * 2 + 6, "22 staff rows allowed for both roles, 6 admin rows (5 closures + reopen) for admin only");
});

test("mandatory notes, note bounds, and optional notes", async () => {
  const { db } = await setup();
  for (const [key, [, required]] of Object.entries(MATRIX)) {
    const [from, to] = key.split(">");
    const req = await createRequest(db);
    await forceStatus(db, req.id, from);
    if (required) {
      await rejects(change(db, req.id, from, to, USER.admin, null), /note_required/);
      await rejects(change(db, req.id, from, to, USER.admin, "   "), /note_required/);
    } else {
      await change(db, req.id, from, to, USER.admin, null);
    }
  }
  const req = await createRequest(db);
  await rejects(change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff, "ab"), /note_invalid/);
  await rejects(change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff, "x".repeat(2001)), /note_invalid/);
  const ok = await change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff, "  Taken into review.  ");
  assert.equal(ok.note, "Taken into review.", "trimmed");
});

test("audit: every staff transition records from, to, time, changed_by, actor id and actor role", async () => {
  const { db, ids } = await setup();
  const req = await createRequest(db);
  const h1 = await change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff);
  assert.deepEqual([h1.from_status, h1.to_status, h1.changed_by, h1.actor_staff_id, h1.actor_role], ["SUBMITTED", "AWAITING_REVIEW", `staff:${ids.staff}`, ids.staff, "STAFF"]);
  assert.ok(h1.changed_at);
  const h2 = await change(db, req.id, "AWAITING_REVIEW", "CLOSED", USER.admin, "Duplicate of an earlier request.");
  assert.deepEqual([h2.actor_staff_id, h2.actor_role, h2.note], [ids.admin, "ADMIN", "Duplicate of an earlier request."]);
  const r = await one(db, "select status, updated_at from service_requests where id = $1", [req.id]);
  assert.equal(r.status, "CLOSED");
  // Role at the time is kept even if the role later changes.
  await db.query("update staff_members set role = 'STAFF' where id = $1", [ids.admin]);
  assert.equal((await one(db, "select actor_role from status_history where id = $1", [h2.id])).actor_role, "ADMIN");
  const initial = await one(db, "select * from status_history where service_request_id = $1 and from_status is null", [req.id]);
  assert.deepEqual([initial.changed_by, initial.actor_staff_id, initial.actor_role], ["customer", null, null], "customer rows unchanged");
});

test("actor: unknown, never-allow-listed and inactive users are refused; nothing changes", async () => {
  const { db } = await setup();
  const req = await createRequest(db);
  for (const u of [USER.stranger, USER.inactive, null]) {
    await rejects(change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", u), /not_authorised/);
  }
  assert.equal((await one(db, "select status from service_requests where id = $1", [req.id])).status, "SUBMITTED");
  assert.equal((await one(db, "select count(*)::int n from status_history where service_request_id = $1", [req.id])).n, 1);
});

test("concurrency: a stale expected status never overwrites another member of staff's change", async () => {
  const { db } = await setup();
  const req = await createRequest(db);
  const results = await Promise.allSettled([
    change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff),
    change(db, req.id, "SUBMITTED", "INSPECTION_REQUIRED", USER.admin),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.match(results.find((r) => r.status === "rejected").reason.message, /status_changed/);
  assert.equal((await one(db, "select count(*)::int n from status_history where service_request_id = $1", [req.id])).n, 2);
  await rejects(change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff), /status_changed/);
  await rejects(change(db, "00000000-0000-4000-8000-000000000000", "SUBMITTED", "AWAITING_REVIEW", USER.staff), /not_found/);
});

test("guards: status only via the function; history append-only; deleting a request still cascades", async () => {
  const { db } = await setup();
  const req = await createRequest(db);
  await rejects(db.query("update service_requests set status = 'RESOLVED' where id = $1", [req.id]), /status_change_requires_function/);
  await db.query("update service_requests set location = 'unchanged status update allowed' where id = $1", [req.id]);
  const h = await change(db, req.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff);
  await rejects(db.query("update status_history set note = 'rewritten' where id = $1", [h.id]), /append-only/);
  await rejects(db.query("delete from status_history where id = $1", [h.id]), /append-only/);
  await rejects(db.query("delete from staff_members where auth_user_id = $1", [USER.staff]), /foreign key|violates/i, "staff with history can only be deactivated");
  await db.query("delete from service_requests where id = $1", [req.id]);
  assert.equal((await one(db, "select count(*)::int n from status_history where service_request_id = $1", [req.id])).n, 0);
});

// ─── AI report reviews ──────────────────────────────────────────────────────
async function withReport(db, versions = 1) {
  const req = await createRequest(db);
  const reports = [];
  for (let v = 0; v < versions; v++) {
    const run = (await db.query("select * from enqueue_service_ai_run($1, $2, $3, '4f.1', 'openai-report-4', 'scr-1.4', 'test', 3)", [req.id, v ? "MANUAL" : "FINALIZE", FP(String(v))])).rows[0].run;
    await db.query("select * from claim_service_ai_runs('w', 300, 5)");
    reports.push((await db.query("select * from complete_service_ai_run($1, 'w', 'COMPLETED', $2, 'openai', '{}', '{}', null, $3)", [run.id, FP(String(v)), JSON.stringify({ content: { issueSummary: `v${v + 1}`, urgency: { level: "NORMAL" } } })])).rows[0]);
  }
  return { req, reports: (await db.query("select * from service_ai_reports where service_request_id = $1 order by version", [req.id])).rows };
}
const review = (db, reportId, expected, status, user, notes = null, edited = null) =>
  db.query("select * from review_service_ai_report($1, $2, $3, $4, $5, $6)", [reportId, expected, status, user, notes, edited ? JSON.stringify(edited) : null]).then((r) => r.rows[0]);

test("AI review: staff approve/edit/reject with the real actor; original AI report untouched", async () => {
  const { db, ids } = await setup();
  for (const status of ["APPROVED", "EDITED", "REJECTED"]) {
    const { reports } = await withReport(db);
    const r = reports[0];
    if (status === "REJECTED") await rejects(review(db, r.id, "AWAITING_REVIEW", status, USER.staff), /note_required/);
    if (status === "EDITED") await rejects(review(db, r.id, "AWAITING_REVIEW", status, USER.staff, "x"), /edited_report_invalid/);
    const row = await review(db, r.id, "AWAITING_REVIEW", status, USER.staff, status === "APPROVED" ? null : "Staff reviewed.", status === "EDITED" ? { schema: "staff-edit-1", edits: { issueSummary: "Edited by staff." } } : null);
    assert.deepEqual([row.review_status, row.reviewer_staff_id, row.reviewer_role], [status, ids.staff, "STAFF"]);
    const after = await one(db, "select * from service_ai_reports where id = $1", [r.id]);
    assert.equal(after.review_status, status);
    assert.equal(after.reviewed_by, `staff:${ids.staff}`);
    assert.deepEqual(after.ai_report, r.ai_report, "original AI output unchanged");
    assert.equal(after.reviewed_report === null, status !== "EDITED");
  }
});

test("AI review: re-review is admin-only, needs a note, and keeps the full review history", async () => {
  const { db, ids } = await setup();
  const { reports } = await withReport(db);
  const r = reports[0];
  const first = await review(db, r.id, "AWAITING_REVIEW", "APPROVED", USER.staff);
  await rejects(review(db, r.id, "APPROVED", "REJECTED", USER.staff, "Changing my mind."), /not_authorised/);
  await rejects(review(db, r.id, "APPROVED", "REJECTED", USER.admin), /note_required/);
  await rejects(review(db, r.id, "AWAITING_REVIEW", "REJECTED", USER.admin, "Stale."), /review_changed/);
  const second = await review(db, r.id, "APPROVED", "REJECTED", USER.admin, "Observation not supported on re-check.");
  const hist = (await db.query("select * from service_ai_report_reviews where report_id = $1 order by created_at", [r.id])).rows;
  assert.equal(hist.length, 2);
  assert.equal(hist[0].id, first.id);
  assert.equal(hist[0].superseded_by, second.id);
  assert.ok(hist[0].superseded_at);
  assert.equal(hist[1].superseded_at, null);
  assert.equal(hist[1].reviewer_staff_id, ids.admin);
  await rejects(db.query("update service_ai_report_reviews set notes = 'rewritten' where id = $1", [first.id]), /append-only/);
  await rejects(db.query("delete from service_ai_report_reviews where id = $1", [first.id]), /append-only/);
  await rejects(db.query("update service_ai_reports set review_status = 'APPROVED', reviewed_by = 'x', reviewed_at = now() where id = $1", [r.id]), /review_change_requires_function/);
  await rejects(db.query("update service_ai_reports set ai_report = '{}'::jsonb where id = $1", [r.id]), /immutable/);
});

test("AI review: superseded report versions are history; inactive/unknown reviewers refused; cascade on delete", async () => {
  const { db } = await setup();
  const { req, reports } = await withReport(db, 2);
  assert.ok(reports[0].superseded_at);
  await rejects(review(db, reports[0].id, "AWAITING_REVIEW", "APPROVED", USER.staff), /report_superseded/);
  await rejects(review(db, reports[1].id, "AWAITING_REVIEW", "APPROVED", USER.inactive), /not_authorised/);
  await rejects(review(db, reports[1].id, "AWAITING_REVIEW", "APPROVED", USER.stranger), /not_authorised/);
  await review(db, reports[1].id, "AWAITING_REVIEW", "APPROVED", USER.staff);
  await db.query("delete from service_requests where id = $1", [req.id]);
  assert.equal((await one(db, "select count(*)::int n from service_ai_report_reviews")).n, 0);
});

// ─── Inbox query ────────────────────────────────────────────────────────────
// PGlite does not serialise JS arrays into enum[] parameters; PostgREST sends JSON in production.
const arr = (a) => (a ? `{${a.map((x) => `"${x}"`).join(",")}}` : null);
const list = (db, o = {}) =>
  db.query("select * from list_service_requests($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [o.search ?? null, arr(o.statuses), arr(o.urgencies), arr(o.products), o.from ?? null, o.to ?? null, arr(o.ai), o.sort ?? null, o.limit ?? 25, o.offset ?? 0]).then((r) => r.rows);

test("inbox: search (reference, name, email, phone), filters, AI state, urgency, pagination, sorting", async () => {
  const { db } = await setup();
  const a = await createRequest(db, { customerName: "Zara Quillfeather", email: "zara@example.test", mobileE164: "+971550001111", productCategories: ["window"], problemDescription: "Small crack." });
  const b = await createRequest(db, { customerName: "Omar Testfield", email: "omar@example.test", mobileE164: "+971550002222", productCategories: ["sliding-door"], problemDescription: "Door sticks." });
  const c = await createRequest(db, { customerName: "Lina Example", email: "lina@example.test", mobileE164: "+971550003333", productCategories: ["glass", "window"], problemDescription: "Glass shattered." });
  await addMedia(db, a.id, { type: "PHOTO" });
  await addMedia(db, a.id, { type: "VOICE" });
  // c: report URGENT; b: run queued (PROCESSING); a: none (NOT_STARTED).
  const run = (await db.query("select * from enqueue_service_ai_run($1, 'FINALIZE', $2, '4f.1', 'p', 's', 'test', 3)", [c.id, FP("c")])).rows[0].run;
  await db.query("select * from claim_service_ai_runs('w', 300, 5)");
  await db.query("select * from complete_service_ai_run($1, 'w', 'PARTIAL', $2, 'openai', '{}', '{}', null, $3)", [run.id, FP("c"), JSON.stringify({ content: { issueSummary: "Shattered pane reported.", urgency: { level: "URGENT" } } })]);
  await db.query("select * from enqueue_service_ai_run($1, 'FINALIZE', $2, '4f.1', 'p', 's', 'test', 3)", [b.id, FP("b")]);
  await change(db, b.id, "SUBMITTED", "AWAITING_REVIEW", USER.staff);

  const all = await list(db);
  assert.equal(all.length, 3);
  assert.equal(Number(all[0].total_count), 3);
  const byRef = Object.fromEntries(all.map((r) => [r.reference, r]));
  assert.deepEqual([byRef[a.reference].ai_state, byRef[b.reference].ai_state, byRef[c.reference].ai_state], ["NOT_STARTED", "PROCESSING", "PARTIAL"]);
  assert.deepEqual([byRef[a.reference].urgency, byRef[c.reference].urgency], ["NONE", "URGENT"]);
  assert.equal(byRef[c.reference].issue, "Shattered pane reported.", "issue = report summary when present");
  assert.equal(byRef[a.reference].issue, "Small crack.", "else the description excerpt");
  assert.deepEqual([byRef[a.reference].photos, byRef[a.reference].voice_notes, byRef[a.reference].videos], [1, 1, 0]);

  assert.deepEqual((await list(db, { search: a.reference })).map((r) => r.id), [a.id]);
  assert.deepEqual((await list(db, { search: "quillfeather" })).map((r) => r.id), [a.id]);
  assert.deepEqual((await list(db, { search: "omar@example" })).map((r) => r.id), [b.id]);
  assert.deepEqual((await list(db, { search: "055 000 3333" })).map((r) => r.id), [c.id]);
  assert.deepEqual((await list(db, { statuses: ["AWAITING_REVIEW"] })).map((r) => r.id), [b.id]);
  assert.deepEqual((await list(db, { urgencies: ["URGENT"] })).map((r) => r.id), [c.id]);
  assert.deepEqual((await list(db, { urgencies: ["NONE"] })).map((r) => r.id).sort(), [a.id, b.id].sort());
  assert.deepEqual((await list(db, { products: ["window"] })).map((r) => r.id).sort(), [a.id, c.id].sort());
  assert.deepEqual((await list(db, { ai: ["NOT_STARTED", "PROCESSING"] })).map((r) => r.id).sort(), [a.id, b.id].sort());
  assert.equal((await list(db, { from: new Date(Date.now() + 86400000).toISOString() })).length, 0);
  assert.equal((await list(db, { urgencies: ["URGENT"], sort: "urgency" }))[0].id, c.id);
  assert.equal((await list(db, { sort: "urgency" }))[0].id, c.id, "urgent first");

  const p1 = await list(db, { limit: 2, offset: 0 });
  const p2 = await list(db, { limit: 2, offset: 2 });
  assert.equal(p1.length, 2);
  assert.equal(p2.length, 1);
  assert.equal(Number(p2[0].total_count), 3);
  assert.equal(new Set([...p1, ...p2].map((r) => r.id)).size, 3, "pages don't overlap");
  assert.equal((await list(db, { limit: 10000 })).length, 3, "limit is capped server-side (≤ 100)");
  assert.equal((await list(db, { search: "%" })).length, 0, "LIKE wildcards are matched literally");
  assert.equal((await list(db, { search: "_" })).length, 0);
  assert.deepEqual((await list(db, { search: "+971 55 000 1111" })).map((r) => r.id), [a.id], "international form");
  assert.equal((await list(db, { search: "0000 0000 00" })).length, 0, "all-zero digits never match every phone");
});
