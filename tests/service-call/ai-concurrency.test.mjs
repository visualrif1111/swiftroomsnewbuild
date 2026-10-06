// Phase 4F idempotency / concurrency stress over the real SQL (PGlite).
// No duplicate reports, no duplicate expensive work, immutable history, the
// request never lost or altered. (Multi-connection SKIP LOCKED behaviour is
// verified against the Development Postgres in EVALUATION.md.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunNotOwnedError } from "../../src/lib/service-call/ai/run-store.ts";
import { createOpenAiProvider } from "../../src/lib/service-call/server/openai-provider.ts";
import { enqueueAiProcessing, runAiWorker } from "../../src/lib/service-call/server/ai-worker.ts";
import { addMedia, createRequest, freshDatabase } from "../support/db.mjs";
import { pgliteAiStore } from "../support/ai-fixtures.mjs";
import { goodPhotoObservation, goodReport, json, openAiMock } from "../support/synthesis-mock.mjs";
import { photoJpeg } from "../support/images.mjs";

const rows = async (db, sql, p) => (await db.query(sql, p)).rows;

async function setup({ mock = openAiMock() } = {}) {
  const db = await freshDatabase();
  const request = await createRequest(db, { problemDescription: "The sliding door is hard to open." });
  const bytes = new Map();
  const p = await addMedia(db, request.id, { type: "PHOTO", size: 2000 });
  bytes.set(p.id, await photoJpeg({ width: 400, height: 300 }));
  const v = await addMedia(db, request.id, { type: "VOICE" });
  await db.query("update service_media set mime_type = 'audio/webm' where id = $1", [v.id]);
  bytes.set(v.id, new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 7]));
  const provider = createOpenAiProvider({ apiKey: "sk-test", transcribeModel: "gpt-transcribe", fetch: mock.fetch });
  const deps = { store: pgliteAiStore(db, { RunNotOwnedError }), provider, enabled: () => true, readMedia: async (id) => bytes.get(id) };
  const snapshot = async () => rows(db, "select s.*, (select json_agg(h order by h.id) from status_history h where h.service_request_id = s.id) hist from service_requests s where id = $1", [request.id]);
  return { db, request, deps, mock, before: await snapshot(), snapshot };
}
const counts = (s) => ({ transcribe: s.mock.calls.transcribe.length, observe: s.mock.calls.observe.length, report: s.mock.calls.responses.length });
const reports = (s) => rows(s.db, "select * from service_ai_reports where service_request_id = $1 order by version", [s.request.id]);

test("Finish pressed repeatedly and concurrently → one run, one report, each expensive call once", async () => {
  const s = await setup();
  const outcomes = await Promise.all(Array.from({ length: 12 }, () => enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps)));
  assert.equal(outcomes.filter((o) => o.outcome === "created").length, 1, JSON.stringify(outcomes.map((o) => o.outcome)));
  const workers = await Promise.all(Array.from({ length: 5 }, () => runAiWorker(1, s.deps)));
  assert.equal(workers.flatMap((w) => w.results).length, 1, "exactly one worker claimed the run");
  for (let i = 0; i < 5; i++) assert.equal((await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps)).outcome, "already_processed");
  await Promise.all(Array.from({ length: 3 }, () => runAiWorker(1, s.deps)));
  assert.equal((await reports(s)).length, 1);
  assert.deepEqual(counts(s), { transcribe: 1, observe: 1, report: 1 });
  assert.deepEqual(await s.snapshot(), s.before);
});

test("expired lease: another worker takes over; the original worker's late completion is fenced off", async () => {
  let release;
  const gate = new Promise((r) => (release = r));
  let first = true;
  const mock = openAiMock({ model: async ({ input }) => { if (first) { first = false; await gate; } return goodReport(input); } });
  const s = await setup({ mock });
  await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps);
  const slow = runAiWorker(1, s.deps); // holds the lease, then stalls in synthesis
  while (!mock.calls.responses.length) await new Promise((r) => setTimeout(r, 5));
  await s.db.query("update service_ai_runs set lease_expires_at = now() - interval '1 second' where service_request_id = $1", [s.request.id]);
  const takeover = await runAiWorker(1, s.deps);
  assert.equal(takeover.results[0].outcome, "COMPLETED");
  release();
  const late = await slow;
  assert.equal(late.results[0].outcome, "LOST_LEASE", "the stalled worker can't write");
  assert.equal((await reports(s)).length, 1);
  assert.equal(counts(s).transcribe, 1, "takeover reused the cached transcript");
  assert.deepEqual(await s.snapshot(), s.before);
});

test("retry after a provider failure and manual reprocess: no duplicate expensive work; history immutable", async () => {
  let fail = true;
  const mock = openAiMock({ model: ({ input }) => (fail ? ((fail = false), json({}, 503)) : goodReport(input)) });
  const s = await setup({ mock });
  await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps);
  assert.equal((await runAiWorker(1, s.deps)).results[0].outcome, "REQUEUED");
  await s.db.query("update service_ai_runs set next_attempt_at = now() - interval '1 second'");
  assert.equal((await runAiWorker(1, s.deps)).results[0].outcome, "COMPLETED");
  assert.deepEqual(counts(s), { transcribe: 1, observe: 1, report: 2 }, "the retry re-ran synthesis only");
  const [v1] = await reports(s);
  await Promise.all(Array.from({ length: 4 }, () => enqueueAiProcessing(s.request.id, "MANUAL", "admin", s.deps)));
  await Promise.all(Array.from({ length: 4 }, () => runAiWorker(1, s.deps)));
  const all = await reports(s);
  assert.ok(all.length >= 2);
  assert.deepEqual(all[0].ai_report, v1.ai_report, "v1 immutable");
  assert.equal(counts(s).transcribe, 1);
  assert.equal(counts(s).observe, 1);
  assert.deepEqual(new Set(all.map((r) => r.version)).size, all.length, "no duplicate versions");
  assert.deepEqual(await s.snapshot(), s.before);
});

test("partial media failure, then reprocess: the failed file is retried, the good one is not", async () => {
  let n = 0;
  const mock = openAiMock({ observe: () => (++n === 1 ? json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }] }) : goodPhotoObservation()) });
  const s = await setup({ mock });
  await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps);
  assert.equal((await runAiWorker(1, s.deps)).results[0].outcome, "PARTIAL");
  await enqueueAiProcessing(s.request.id, "MANUAL", "admin", s.deps);
  assert.equal((await runAiWorker(1, s.deps)).results[0].outcome, "COMPLETED");
  assert.equal(counts(s).transcribe, 1, "transcript reused");
  assert.equal(counts(s).observe, 2, "only the failed photo re-analysed");
  assert.deepEqual(await s.snapshot(), s.before);
});
