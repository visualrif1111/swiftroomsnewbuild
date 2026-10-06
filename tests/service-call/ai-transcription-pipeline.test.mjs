// Phase 4B: voice transcription through the real pipeline and SQL (PGlite),
// with the OpenAI HTTP layer mocked. No network, no real AI.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunNotOwnedError } from "../../src/lib/service-call/ai/run-store.ts";
import { createOpenAiProvider } from "../../src/lib/service-call/server/openai-provider.ts";
import { enqueueAiProcessing, runAiWorker, sweepAi } from "../../src/lib/service-call/server/ai-worker.ts";
import { addMedia, createRequest, freshDatabase } from "../support/db.mjs";
import { pgliteAiStore } from "../support/ai-fixtures.mjs";

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/**
 * OpenAI provider whose HTTP calls are answered by `respond(n)` and recorded.
 * These are the Phase 4B transcription tests: report synthesis (4C) and
 * photo analysis (4D) are switched off here so they keep isolating
 * transcription; those paths have their own suites.
 */
function mockedOpenAi(respond = () => json({ text: "The door won't lock since yesterday.", languages: [{ code: "en" }], usage: { type: "tokens", input_tokens: 50, output_tokens: 8, total_tokens: 58 } })) {
  const calls = [];
  const full = createOpenAiProvider({
    apiKey: "sk-test", transcribeModel: "gpt-transcribe",
    fetch: async (url, init) => {
      calls.push({ url, form: init.body, headers: init.headers });
      return respond(calls.length);
    },
  });
  const provider = { ...full, capabilities: { ...full.capabilities, synthesise: false, observe: false } };
  return { provider, calls };
}

async function setup({ media = [["VOICE", "audio/webm"]], respond, enabled = true } = {}) {
  const db = await freshDatabase();
  const request = await createRequest(db, { problemDescription: "Call PHASE 4A TEST on 050 999 8888 about the door." });
  const items = [];
  for (const [type, mime] of media) {
    const m = await addMedia(db, request.id, { type });
    if (mime) await db.query("update service_media set mime_type = $1 where id = $2", [mime, m.id]);
    items.push({ ...m, mime_type: mime ?? m.mime_type });
  }
  const store = pgliteAiStore(db, { RunNotOwnedError });
  const { provider, calls } = mockedOpenAi(respond);
  const reads = [];
  const deps = { store, provider, enabled: () => enabled, readMedia: async (id) => (reads.push(id), new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 9, 9, 9])) };
  return { db, request, items, store, deps, calls, reads };
}
const rows = async (db, sql, params) => (await db.query(sql, params)).rows;
const analyses = (db) => rows(db, "select * from service_media_analyses order by created_at");
const runs = (db, id) => rows(db, "select * from service_ai_runs where service_request_id = $1 order by run_number", [id]);
const finalize = async (s) => {
  const q = await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps);
  const w = await runAiWorker(1, s.deps);
  return { q, w };
};

test("voice note → real-provider path → transcript cached against the right media; no report yet", async () => {
  const s = await setup();
  const { q, w } = await finalize(s);
  assert.equal(q.outcome, "created");
  assert.deepEqual(w.results.map((r) => r.outcome), ["EVIDENCE_PREPARED"]);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.reads, [s.items[0].id], "audio read server-side, once");
  const [a] = await analyses(s.db);
  assert.equal(a.media_id, s.items[0].id);
  assert.equal(a.kind, "TRANSCRIPT");
  assert.equal(a.status, "COMPLETED");
  assert.equal(a.provider, "openai");
  assert.equal(a.model, "gpt-transcribe");
  assert.equal(a.prompt_version, "openai-transcribe-1");
  assert.equal(a.transcript_text, "The door won't lock since yesterday.");
  assert.equal(a.language, "en");
  assert.deepEqual(a.result, {
    languages: ["en"], noSpeechDetected: false,
    completeness: { possiblyIncomplete: false, signals: [], assessed: false, durationSeconds: null, charsPerSecond: null },
  }, "duration unknown here (no seconds in usage, none recorded) → not assessed");
  assert.match(a.input_hash, /^[0-9a-f]{64}$/);
  assert.ok(a.created_at);
  const [run] = await runs(s.db, s.request.id);
  assert.equal(run.status, "FAILED");
  assert.equal(run.error_code, "report_stage_not_available");
  assert.equal(run.pipeline_version, "4f.1");
  assert.equal(run.prompt_version, "openai-report-4", "run prompt version = report prompt (4C split)");
  assert.equal(run.usage.openaiTranscribeInputTokens, 50);
  assert.deepEqual(run.error_detail.media.map((m) => [m.type, m.outcome]), [["VOICE", "ANALYSED"]]);
  assert.equal((await rows(s.db, "select count(*)::int n from service_ai_reports"))[0].n, 0, "no report in 4B");
});

test("repeated finalize → no duplicate transcription", async () => {
  const s = await setup();
  await finalize(s);
  for (let i = 0; i < 3; i++) {
    const { q } = await finalize(s);
    assert.equal(q.outcome, "already_failed", "same inputs and versions: not re-run");
  }
  assert.equal(s.calls.length, 1);
  assert.equal((await runs(s.db, s.request.id)).length, 1);
});

test("manual reprocess reuses the cached transcript (no new provider call)", async () => {
  const s = await setup();
  await finalize(s);
  assert.equal((await enqueueAiProcessing(s.request.id, "MANUAL", "admin", s.deps)).outcome, "created");
  await runAiWorker(1, s.deps);
  assert.equal(s.calls.length, 1, "transcribed once");
  const all = await runs(s.db, s.request.id);
  assert.equal(all.length, 2);
  assert.equal(all[1].usage.cacheHits, 1);
  assert.equal((await analyses(s.db)).length, 1, "one cached transcript");
});

test("changed audio (new file) is transcribed; the unchanged one is not", async () => {
  const s = await setup();
  await finalize(s);
  await addMedia(s.db, s.request.id, { type: "VOICE", size: 2000 });
  await s.db.query("update service_media set mime_type = 'audio/mp4' where mime_type <> 'audio/webm'");
  await finalize(s);
  assert.equal(s.calls.length, 2, "only the new file");
  assert.equal(s.calls[1].form.get("file").name, "voice-note.m4a");
});

test("provider request carries no customer details", async () => {
  const s = await setup();
  await finalize(s);
  const { form } = s.calls[0];
  const fields = [...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : `file:${v.name}`]);
  assert.deepEqual(fields, [["file", "file:voice-note.webm"], ["model", "gpt-transcribe"], ["response_format", "json"]]);
  const text = JSON.stringify(fields);
  for (const pii of ["PHASE 4A TEST", "e2e+phase4a", "500000000", "999 8888", "TEST ADDRESS", "PHASE4A-TEST", s.request.reference]) assert.ok(!text.includes(pii), pii);
});

test("429 / 5xx / timeout → run requeued (retryable); last attempt → media FAILED, run ends without a report", async () => {
  for (const respond of [() => json({ error: { code: "rate_limit_exceeded" } }, 429), () => json({}, 502), () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); }]) {
    const s = await setup({ respond });
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { w } = attempt === 1 ? await finalize(s) : { w: await runAiWorker(1, s.deps) };
      assert.equal(w.results[0].outcome, "REQUEUED");
      await s.db.query("update service_ai_runs set next_attempt_at = now()");
    }
    const w3 = await runAiWorker(1, s.deps);
    assert.equal(w3.results[0].outcome, "EVIDENCE_PREPARED");
    const [a] = await analyses(s.db);
    assert.equal(a.status, "FAILED");
    assert.ok(["provider_rate_limited", "provider_unavailable", "provider_timeout"].includes(a.error_code), a.error_code);
    assert.equal(s.calls.length, 3, "exactly one call per attempt");
  }
});

test("unsupported format → SKIPPED (no call, no retry); corrupt audio → FAILED once, not retried", async () => {
  const ogg = await setup({ media: [["VOICE", "audio/ogg"]] });
  const r1 = await finalize(ogg);
  assert.equal(r1.w.results[0].outcome, "EVIDENCE_PREPARED");
  assert.equal(ogg.calls.length, 0);
  const [skipped] = await analyses(ogg.db);
  assert.deepEqual([skipped.status, skipped.error_code], ["SKIPPED", "audio_format_not_supported"]);
  assert.equal((await runs(ogg.db, ogg.request.id))[0].attempts, 1);

  const corrupt = await setup({ respond: () => json({ error: { code: "invalid_value", message: "Audio file might be corrupted" } }, 400) });
  await finalize(corrupt);
  assert.equal(corrupt.calls.length, 1, "permanent: not retried");
  const [failed] = await analyses(corrupt.db);
  assert.deepEqual([failed.status, failed.error_code], ["FAILED", "audio_unreadable"]);
  const [run] = await runs(corrupt.db, corrupt.request.id);
  assert.equal(run.attempts, 1);
  assert.ok(!JSON.stringify(run).includes("corrupted"), "provider message not persisted");
});

test("malformed provider response → retried; never stored as a transcript", async () => {
  const s = await setup({ respond: (n) => (n === 1 ? new Response("<html>", { status: 200 }) : json({ text: "Recovered transcript." })) });
  const { w } = await finalize(s);
  assert.equal(w.results[0].outcome, "REQUEUED");
  assert.equal((await analyses(s.db)).length, 0, "nothing cached from the malformed response");
  await s.db.query("update service_ai_runs set next_attempt_at = now()");
  await runAiWorker(1, s.deps);
  const [a] = await analyses(s.db);
  assert.equal(a.transcript_text, "Recovered transcript.");
});

test("no speech → COMPLETED with an empty transcript flagged, not invented", async () => {
  const s = await setup({ respond: () => json({ text: "", languages: [] }) });
  await finalize(s);
  const [a] = await analyses(s.db);
  assert.equal(a.status, "COMPLETED");
  assert.equal(a.transcript_text, "");
  assert.equal(a.result.noSpeechDetected, true);
  assert.deepEqual(a.result.completeness.signals, ["no_speech_detected"]);
  assert.equal(a.result.completeness.possiblyIncomplete, true);
});

test("rejected credentials or exhausted quota stop the run (not the file), retried later", async () => {
  for (const [status, code, expected] of [[401, "invalid_api_key", "provider_auth_failed"], [429, "insufficient_quota", "provider_quota_exceeded"]]) {
    const s = await setup({ respond: () => json({ error: { code } }, status) });
    const { w } = await finalize(s);
    assert.deepEqual([w.results[0].outcome, w.results[0].errorCode], ["REQUEUED", expected]);
    assert.equal((await analyses(s.db)).length, 0, "the file is not marked failed");
  }
});

test("photos and videos are SKIPPED by the transcription-only provider; the voice note still processes", async () => {
  const s = await setup({ media: [["PHOTO", null], ["VOICE", "audio/webm"], ["VIDEO", null]] });
  const { w } = await finalize(s);
  assert.equal(w.results[0].outcome, "EVIDENCE_PREPARED");
  const [run] = await runs(s.db, s.request.id);
  assert.deepEqual(run.error_detail.media.map((m) => [m.type, m.outcome, m.reasonCode]), [
    ["PHOTO", "SKIPPED", "image_analysis_not_available"],
    ["VOICE", "ANALYSED", null],
    ["VIDEO", "SKIPPED", "video_processing_not_available"],
  ]);
  assert.equal(s.calls.length, 1);
  assert.equal(s.reads.length, 1, "photo/video bytes never read");
});

test("service request and status history untouched by transcription (success and failure)", async () => {
  for (const respond of [undefined, () => json({}, 500)]) {
    const s = await setup({ respond });
    const before = (await rows(s.db, "select * from service_requests where id = $1", [s.request.id]))[0];
    await finalize(s);
    const after = (await rows(s.db, "select * from service_requests where id = $1", [s.request.id]))[0];
    assert.deepEqual(after, before);
    assert.equal((await rows(s.db, "select count(*)::int n from status_history where service_request_id = $1", [s.request.id]))[0].n, 1);
  }
});

test("AI disabled → no transcription, nothing queued", async () => {
  const s = await setup({ enabled: false });
  const { q, w } = await finalize(s);
  assert.equal(q.outcome, "disabled");
  assert.equal(w.enabled, false);
  assert.equal(s.calls.length, 0);
});

test("enabled but misconfigured → fails closed: nothing queued, claimed or sent", async () => {
  const s = await setup();
  const deps = { ...s.deps, provider: { ok: false, reason: "openai_key_missing" } };
  const errors = [];
  const original = console.error;
  console.error = (...a) => errors.push(a.join(" "));
  try {
    assert.deepEqual(await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", deps), { outcome: "not_configured", reason: "openai_key_missing" });
    assert.deepEqual(await runAiWorker(5, deps), { enabled: true, configured: false, results: [] });
    assert.equal((await sweepAi(deps)).configured, false);
  } finally {
    console.error = original;
  }
  assert.equal((await runs(s.db, s.request.id)).length, 0);
  assert.equal(s.calls.length, 0);
  assert.ok(errors.every((e) => !e.includes("sk-")), "no secrets logged");
});

test("completeness flag: truncated-looking transcript is flagged 'possibly incomplete'; text kept exactly as returned", async () => {
  // Shape of the confirmed Development case: 7 s Arabic→English recording, only the Arabic came back.
  const s = await setup({ respond: () => json({ text: "مرحباً، الباب المنزلق عالق.", languages: [{ code: "ar" }], usage: { type: "duration", seconds: 7 } }) });
  await finalize(s);
  const [a] = await analyses(s.db);
  assert.equal(a.status, "COMPLETED", "still a usable transcript");
  assert.equal(a.transcript_text, "مرحباً، الباب المنزلق عالق.", "nothing added, inferred or reconstructed");
  assert.deepEqual(a.result.completeness, { possiblyIncomplete: true, signals: ["low_text_for_duration"], assessed: true, durationSeconds: 7, charsPerSecond: 3.4 });
});

test("completeness flag: a normal transcript is not flagged; the flag survives the cache on reprocess", async () => {
  const s = await setup({ respond: () => json({ text: "Hello, this is a test. The sliding door in the living room will not lock since yesterday, and it makes a grinding noise when I open it.", languages: [{ code: "en" }], usage: { type: "duration", seconds: 8 } }) });
  await finalize(s);
  const [a] = await analyses(s.db);
  assert.equal(a.result.completeness.possiblyIncomplete, false);
  assert.equal(a.result.completeness.assessed, true);
  await enqueueAiProcessing(s.request.id, "MANUAL", "admin", s.deps);
  await runAiWorker(1, s.deps);
  assert.equal(s.calls.length, 1, "cache reused");
  const again = await analyses(s.db);
  assert.equal(again.length, 1);
  assert.deepEqual(again[0].result, a.result);
});

test("completeness flag falls back to the browser-recorded duration when the provider gives none", async () => {
  const s = await setup({ respond: () => json({ text: "Door stuck.", languages: [{ code: "en" }] }) });
  await s.db.query("update service_media set duration_seconds = 12");
  await finalize(s);
  const [a] = await analyses(s.db);
  assert.deepEqual([a.result.completeness.assessed, a.result.completeness.durationSeconds, a.result.completeness.possiblyIncomplete], [true, 12, true]);
});

