// End-to-end AI processing foundation: worker → pipeline → stub provider →
// validation → versioned report, over the real SQL functions (PGlite).
// No network, no real AI provider.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunNotOwnedError } from "../../src/lib/service-call/ai/run-store.ts";
import { processRun } from "../../src/lib/service-call/ai/pipeline.ts";
import { createStubServiceAiProvider } from "../../src/lib/service-call/ai/stub-provider.ts";
import { enqueueAiProcessing, runAiWorker, sweepAi } from "../../src/lib/service-call/server/ai-worker.ts";
import { isServiceAiEnabled } from "../../src/lib/service-call/server/ai-config.ts";
import { addMedia, createRequest, freshDatabase } from "../support/db.mjs";
import { pgliteAiStore } from "../support/ai-fixtures.mjs";

async function setup({ provider = createStubServiceAiProvider(), enabled = true, description, media = ["PHOTO", "VOICE"] } = {}) {
  const db = await freshDatabase();
  const request = await createRequest(db, description ? { problemDescription: description } : {});
  const items = [];
  for (const type of media) items.push(await addMedia(db, request.id, { type }));
  const store = pgliteAiStore(db, { RunNotOwnedError });
  const reads = [];
  const deps = { store, provider, enabled: () => enabled, readMedia: async (id) => (reads.push(id), new Uint8Array()) };
  return { db, request, items, store, deps, reads };
}
const rows = async (db, sql, params) => (await db.query(sql, params)).rows;
const reports = (db, id) => rows(db, "select * from service_ai_reports where service_request_id = $1 order by version", [id]);
const runs = (db, id) => rows(db, "select * from service_ai_runs where service_request_id = $1 order by run_number", [id]);

test("finalize → worker → stub report v1 (photo + voice: COMPLETED)", async () => {
  const { db, request, deps, reads, items } = await setup();
  const queued = await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  assert.equal(queued.outcome, "created");
  const { results } = await runAiWorker(1, deps);
  assert.deepEqual(results.map((r) => r.outcome), ["COMPLETED"]);
  const [rep] = await reports(db, request.id);
  assert.equal(rep.version, 1);
  assert.equal(rep.provider, "stub");
  assert.equal(rep.review_status, "AWAITING_REVIEW");
  const r = rep.ai_report;
  assert.equal(r.schemaVersion, "scr-1.1");
  assert.equal(r.processing.status, "COMPLETED");
  assert.deepEqual(r.processing.mediaCoverage.map((c) => [c.label, c.outcome]), [["Photo 1", "ANALYSED"], ["Voice note 1", "ANALYSED"]]);
  assert.deepEqual(r.mediaSummary, { photos: 1, videos: 0, voiceNotes: 1 });
  assert.equal(r.transcripts.length, 1);
  assert.equal(r.transcripts[0].machineGenerated, true);
  assert.match(r.content.issueSummary, /^\[STUB\]/);
  assert.deepEqual(r.content.unknownsRequiringInspection.map((u) => u.topic).sort(), ["COMPONENT_FAILURE", "COST", "REPAIR_METHOD", "WARRANTY"]);
  assert.equal(r.content.mediaObservations[0].evidence.mediaId, items[0].id);
  assert.equal(reads.length, 0, "the stub never reads media bytes");
  const [run] = await runs(db, request.id);
  assert.equal(run.status, "COMPLETED");
  assert.equal(run.usage.synthesisCalls, 1);
  assert.equal((await rows(db, "select count(*)::int n from service_media_analyses"))[0].n, 2);
});

test("repeated finalize creates one run and one report", async () => {
  const { db, request, deps } = await setup();
  const outcomes = [];
  for (let i = 0; i < 3; i++) outcomes.push((await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps)).outcome);
  assert.deepEqual(outcomes, ["created", "active_run_exists", "active_run_exists"]);
  await runAiWorker(5, deps);
  assert.equal((await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps)).outcome, "already_processed");
  await runAiWorker(5, deps);
  assert.equal((await runs(db, request.id)).length, 1);
  assert.equal((await reports(db, request.id)).length, 1);
});

test("intentional reprocessing → v2 reusing cached media results; v1 kept unchanged", async () => {
  const provider = createStubServiceAiProvider();
  const { db, request, deps } = await setup({ provider });
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  await runAiWorker(1, deps);
  const v1Before = (await reports(db, request.id))[0];
  const callsAfterV1 = { ...provider.calls };
  assert.equal((await enqueueAiProcessing(request.id, "MANUAL", "admin", deps)).outcome, "created");
  await runAiWorker(1, deps);
  const [v1, v2] = await reports(db, request.id);
  assert.equal(v2.version, 2);
  assert.deepEqual(v1.ai_report, v1Before.ai_report, "v1 content unchanged");
  assert.equal(v1.superseded_by, v2.id);
  assert.equal(provider.calls.transcribe, callsAfterV1.transcribe, "transcript reused from cache");
  assert.equal(provider.calls.observe, callsAfterV1.observe, "observations reused from cache");
  assert.equal(provider.calls.synthesise, callsAfterV1.synthesise + 1);
  assert.equal((await runs(db, request.id))[1].usage.cacheHits, 2);
});

test("changed evidence → new automatic run and report version", async () => {
  const { db, request, deps } = await setup();
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  await runAiWorker(1, deps);
  await addMedia(db, request.id, { type: "PHOTO" });
  assert.equal((await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps)).outcome, "created");
  await runAiWorker(1, deps);
  const all = await reports(db, request.id);
  assert.equal(all.length, 2);
  assert.equal(all[1].ai_report.mediaSummary.photos, 2);
  assert.notEqual(all[0].input_fingerprint, all[1].input_fingerprint);
});

test("video is reported as not processed yet → PARTIAL (not failed)", async () => {
  const { db, request, deps } = await setup({ media: ["PHOTO", "VIDEO"] });
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  const { results } = await runAiWorker(1, deps);
  assert.equal(results[0].outcome, "PARTIAL");
  const [rep] = await reports(db, request.id);
  assert.equal(rep.processing_status, "PARTIAL");
  assert.deepEqual(rep.ai_report.processing.mediaCoverage.map((c) => [c.type, c.outcome, c.reasonCode]), [["PHOTO", "ANALYSED", null], ["VIDEO", "SKIPPED", "video_processing_not_available"]]);
});

test("one unreadable file → PARTIAL report; the failure is recorded, nothing lost", async () => {
  const db0 = await setup();
  const voiceId = db0.items[1].id;
  const provider = createStubServiceAiProvider({ failMedia: { [voiceId]: { code: "unreadable_audio", retryable: false } } });
  const deps = { ...db0.deps, provider };
  await enqueueAiProcessing(db0.request.id, "FINALIZE", "customer", deps);
  const { results } = await runAiWorker(1, deps);
  assert.equal(results[0].outcome, "PARTIAL");
  const [rep] = await reports(db0.db, db0.request.id);
  assert.deepEqual(rep.ai_report.processing.mediaCoverage.map((c) => c.outcome), ["ANALYSED", "FAILED"]);
  assert.equal(rep.ai_report.transcripts.length, 0);
  const [analysis] = await rows(db0.db, "select status, error_code from service_media_analyses where media_id = $1", [voiceId]);
  assert.deepEqual(analysis, { status: "FAILED", error_code: "unreadable_audio" });
});

test("provider outage → run requeued with backoff; on the last attempt the file is reported missing instead", async () => {
  const s = await setup();
  const voiceId = s.items[1].id;
  const provider = createStubServiceAiProvider({ failMedia: { [voiceId]: { code: "provider_unavailable", retryable: true } } });
  const deps = { ...s.deps, provider };
  await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", deps);
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { results } = await runAiWorker(1, deps);
    assert.equal(results[0].outcome, "REQUEUED", `attempt ${attempt}`);
    await s.db.query("update service_ai_runs set next_attempt_at = now()");
  }
  const { results } = await runAiWorker(1, deps);
  assert.equal(results[0].outcome, "PARTIAL");
  const [run] = await runs(s.db, s.request.id);
  assert.equal(run.attempts, 3);
  assert.equal((await reports(s.db, s.request.id)).length, 1);
});

test("synthesis outage → REQUEUED; no report", async () => {
  const provider = createStubServiceAiProvider({ synthesis: ["unavailable"] });
  const { db, request, deps } = await setup({ provider });
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  const { results } = await runAiWorker(1, deps);
  assert.deepEqual(results[0], { runId: results[0].runId, outcome: "REQUEUED", errorCode: "provider_unavailable" });
  assert.equal((await reports(db, request.id)).length, 0);
});

test("malformed output once → retried and accepted; twice → FAILED with no report stored", async () => {
  const once = await setup({ provider: createStubServiceAiProvider({ synthesis: ["malformed"] }) });
  await enqueueAiProcessing(once.request.id, "FINALIZE", "customer", once.deps);
  assert.equal((await runAiWorker(1, once.deps)).results[0].outcome, "COMPLETED");

  const twice = await setup({ provider: createStubServiceAiProvider({ synthesis: ["malformed", "malformed"] }) });
  await enqueueAiProcessing(twice.request.id, "FINALIZE", "customer", twice.deps);
  const { results } = await runAiWorker(1, twice.deps);
  assert.equal(results[0].outcome, "FAILED");
  assert.equal(results[0].errorCode, "invalid_output");
  assert.equal((await reports(twice.db, twice.request.id)).length, 0);
  const [run] = await runs(twice.db, twice.request.id);
  assert.ok(run.error_detail.validationErrors.some((e) => e.includes("urgency")), "internal validation codes kept for debugging");
  assert.ok(!JSON.stringify(run.error_detail).includes("Test description"), "no customer text in error detail");
});

test("forbidden claims in output are never stored as a report", async () => {
  const { db, request, deps } = await setup({ provider: createStubServiceAiProvider({ synthesis: ["forbidden", "forbidden"] }) });
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  const { results } = await runAiWorker(1, deps);
  assert.equal(results[0].errorCode, "invalid_output");
  assert.equal((await reports(db, request.id)).length, 0);
  const [run] = await runs(db, request.id);
  assert.ok(run.error_detail.validationErrors.some((e) => e.includes("forbidden_claim")));
});

test("a worker that lost its lease writes nothing", async () => {
  const { db, request, deps, store } = await setup();
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  const [run] = await store.claim("w-old", 300, 1);
  await db.query("update service_ai_runs set lease_expires_at = now() - interval '1 second'");
  await store.claim("w-new", 300, 1);
  const outcome = await processRun(run, { store, provider: deps.provider, worker: "w-old", leaseSeconds: 300, readMedia: deps.readMedia });
  assert.equal(outcome.outcome, "LOST_LEASE");
  assert.equal((await reports(db, request.id)).length, 0);
  assert.equal((await rows(db, "select count(*)::int n from service_media_analyses"))[0].n, 0, "no cache writes either");
  const [r] = await runs(db, request.id);
  assert.equal(r.lease_owner, "w-new");
  assert.equal(r.status, "PROCESSING");
});

test("the provider never receives contact details, references or tokens", async () => {
  const seen = [];
  const inner = createStubServiceAiProvider();
  const spy = {
    ...inner,
    transcribe: (req) => (seen.push(req), inner.transcribe(req)),
    observe: (req) => (seen.push(req), inner.observe(req)),
    synthesiseReport: (req) => (seen.push(req), inner.synthesiseReport(req)),
  };
  const { request, deps } = await setup({
    provider: spy,
    description: "Door stuck. Call me on 050 999 8888 or e2e+phase4a@visualrif.com, PHASE 4A TEST at TEST ADDRESS, ref PHASE4A-TEST.",
  });
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  await runAiWorker(1, deps);
  const json = JSON.stringify(seen, (k, v) => (typeof v === "function" ? undefined : v));
  for (const pii of ["e2e+phase4a", "visualrif", "050 999 8888", "999 8888", "+971500000000", "500000000", "PHASE 4A TEST", "TEST ADDRESS", "PHASE4A-TEST", request.reference]) {
    assert.ok(!json.includes(pii), `provider saw: ${pii}`);
  }
  assert.match(json, /Door stuck/);
});

test("AI processing leaves the service request and status history untouched", async () => {
  const { db, request, deps } = await setup({ provider: createStubServiceAiProvider({ synthesis: ["malformed", "malformed"] }) });
  const before = (await rows(db, "select * from service_requests where id = $1", [request.id]))[0];
  await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  await runAiWorker(1, deps);
  await enqueueAiProcessing(request.id, "MANUAL", "admin", deps);
  await runAiWorker(1, { ...deps, provider: createStubServiceAiProvider() });
  const after = (await rows(db, "select * from service_requests where id = $1", [request.id]))[0];
  assert.deepEqual(after, before);
  assert.equal((await rows(db, "select count(*)::int n from status_history where service_request_id = $1", [request.id]))[0].n, 1);
});

test("kill switch: disabled → nothing is queued, claimed or processed", async () => {
  const { db, request, deps, store } = await setup({ enabled: false });
  const spyCalls = () => store.calls.length;
  assert.deepEqual(await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps), { outcome: "disabled" });
  assert.deepEqual(await runAiWorker(5, deps), { enabled: false, results: [] });
  const swept = await sweepAi(deps);
  assert.equal(swept.enabled, false);
  assert.equal(spyCalls(), 0, "store not touched");
  assert.equal((await runs(db, request.id)).length, 0);
});

test("SERVICE_AI_ENABLED: only explicit true values enable", () => {
  const prev = process.env.SERVICE_AI_ENABLED;
  try {
    for (const [value, expected] of [[undefined, false], ["", false], ["false", false], ["0", false], ["no", false], ["TRUE ", true], ["true", true], ["1", true], ["on", true], ["yes", true], ["enabled", false]]) {
      if (value === undefined) delete process.env.SERVICE_AI_ENABLED;
      else process.env.SERVICE_AI_ENABLED = value;
      assert.equal(isServiceAiEnabled(), expected, `SERVICE_AI_ENABLED=${value}`);
    }
  } finally {
    if (prev === undefined) delete process.env.SERVICE_AI_ENABLED;
    else process.env.SERVICE_AI_ENABLED = prev;
  }
});

test("sweep: queues settled requests nobody finalized and processes them", async () => {
  const { db, request, deps } = await setup();
  await db.query("update service_requests set upload_token_expires_at = now() - interval '1 minute' where id = $1", [request.id]);
  const swept = await sweepAi(deps);
  assert.deepEqual(swept.enqueued, [{ requestId: request.id, outcome: "created" }]);
  assert.equal(swept.results[0].outcome, "COMPLETED");
  assert.equal((await runs(db, request.id))[0].trigger, "SWEEP");
  const again = await sweepAi(deps);
  assert.deepEqual(again.enqueued, [], "not rediscovered after processing");
});
