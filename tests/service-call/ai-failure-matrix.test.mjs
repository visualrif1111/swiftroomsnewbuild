// Phase 4F failure / retry matrix: every failure type, its classification and
// one invariant for all — the customer's service request is never lost or
// altered because AI failed.
//   RETRYABLE  the run goes back to the queue (backoff); nothing transient is cached
//   PERMANENT  no report for this run (or this file), not retried automatically
//   PARTIAL    a report is produced from the usable evidence; the failed file is named
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunNotOwnedError } from "../../src/lib/service-call/ai/run-store.ts";
import { ServiceAiProviderError } from "../../src/lib/service-call/ai/provider.ts";
import { createOpenAiProvider } from "../../src/lib/service-call/server/openai-provider.ts";
import { enqueueAiProcessing, runAiWorker } from "../../src/lib/service-call/server/ai-worker.ts";
import { addMedia, createRequest, freshDatabase } from "../support/db.mjs";
import { pgliteAiStore } from "../support/ai-fixtures.mjs";
import { goodPhotoObservation, json, openAiMock, responseOf } from "../support/synthesis-mock.mjs";
import { corruptJpeg, heicLike, photoJpeg } from "../support/images.mjs";
import { scriptedWorker } from "./evals/harness.mjs";

const rows = async (db, sql, p) => (await db.query(sql, p)).rows;
const timeout = () => { const e = new Error("timeout"); e.name = "TimeoutError"; throw e; };
const VIDEO_SPEC = { shots: [{ photo: "crack_small", seconds: 6, pan: "none" }], audio: false };

async function attempt({ description = "The window handle is loose.", media = [], mock = openAiMock(), worker, enabled = true, provider: providerOverride }) {
  const db = await freshDatabase();
  const request = await createRequest(db, { problemDescription: description });
  const bytes = new Map();
  for (const m of media) {
    const row = await addMedia(db, request.id, { type: m.type, size: m.bytes.length });
    await db.query("update service_media set mime_type = $1 where id = $2", [m.mime, row.id]);
    bytes.set(row.id, m.bytes);
  }
  const before = await rows(db, "select s.*, (select json_agg(h order by h.id) from status_history h where h.service_request_id = s.id) hist, (select count(*) from service_media where service_request_id = s.id)::int media from service_requests s where id = $1", [request.id]);
  const provider = providerOverride ?? createOpenAiProvider({ apiKey: "sk-test", transcribeModel: "gpt-transcribe", fetch: mock.fetch });
  const deps = { store: pgliteAiStore(db, { RunNotOwnedError }), provider, enabled: () => enabled, readMedia: async (id) => bytes.get(id), videoProcessor: () => worker ?? null };
  const q = await enqueueAiProcessing(request.id, "FINALIZE", "customer", deps);
  const { results } = await runAiWorker(1, deps);
  const after = await rows(db, "select s.*, (select json_agg(h order by h.id) from status_history h where h.service_request_id = s.id) hist, (select count(*) from service_media where service_request_id = s.id)::int media from service_requests s where id = $1", [request.id]);
  const reports = await rows(db, "select * from service_ai_reports where service_request_id = $1", [request.id]);
  const analyses = await rows(db, "select * from service_media_analyses", []);
  return { q, out: results[0], before: before[0], after: after[0], reports, analyses };
}

const photo = async () => ({ type: "PHOTO", mime: "image/jpeg", bytes: await photoJpeg({ width: 400, height: 300 }) });
const video = () => ({ type: "VIDEO", mime: "video/mp4", bytes: new Uint8Array(Buffer.from("eval-video:matrix:0")) });
const worker = (fail) => { const w = scriptedWorker(new Map([[Buffer.from("eval-video:matrix:0").toString("latin1"), VIDEO_SPEC]])); if (fail) w.withSession = async () => { throw fail(); }; return w; };

const MATRIX = [
  ["OpenAI timeout (synthesis)", "RETRYABLE", () => ({ mock: openAiMock({ model: timeout }) })],
  ["429 rate limit", "RETRYABLE", () => ({ mock: openAiMock({ model: () => json({ error: { code: "rate_limit_exceeded" } }, 429) }) })],
  ["5xx", "RETRYABLE", () => ({ mock: openAiMock({ model: () => json({}, 503) }) })],
  ["invalid API key (401) — run-wide", "RETRYABLE", () => ({ mock: openAiMock({ model: () => json({ error: { code: "invalid_api_key" } }, 401) }) })],
  ["quota exhausted — run-wide", "RETRYABLE", () => ({ mock: openAiMock({ model: () => json({ error: { code: "insufficient_quota", type: "insufficient_quota" } }, 429) }) })],
  ["malformed structured output (twice)", "PERMANENT", () => ({ mock: openAiMock({ model: () => responseOf("{not json") }) })],
  ["refusal", "PERMANENT", () => ({ mock: openAiMock({ model: () => json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }] }) }) })],
  ["content filtered", "PERMANENT", () => ({ mock: openAiMock({ model: () => json({ status: "incomplete", incomplete_details: { reason: "content_filter" }, output: [] }) }) })],
  ["truncated output (twice)", "PERMANENT", () => ({ mock: openAiMock({ model: () => json({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] }) }) })],
  ["empty transcription, no typed text", "PERMANENT", async () => ({ description: "", media: [{ type: "VOICE", mime: "audio/webm", bytes: new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1]) }], mock: openAiMock({ transcribe: () => json({ text: "" }) }) })],
  ["corrupt photo among text", "PARTIAL", async () => ({ media: [{ type: "PHOTO", mime: "image/jpeg", bytes: corruptJpeg() }] })],
  ["unsupported photo (HEIC)", "PARTIAL", async () => ({ media: [{ type: "PHOTO", mime: "image/heic", bytes: heicLike() }] })],
  ["one failed photo among valid ones (refusal)", "PARTIAL", async () => ({ media: [await photo(), { ...(await photo()), bytes: await photoJpeg({ width: 400, height: 300, seed: 9 }) }], mock: openAiMock({ observe: ({ n }) => (n === 1 ? json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }] }) : goodPhotoObservation()) }) })],
  ["Sandbox unavailable", "RETRYABLE", () => ({ media: [video()], worker: worker(() => new ServiceAiProviderError("video_worker_unavailable", true)) })],
  ["Sandbox timeout", "RETRYABLE", () => ({ media: [video()], worker: worker(() => new ServiceAiProviderError("video_processing_timeout", true)) })],
  ["Sandbox silent resume (reported as timeout by the processor)", "RETRYABLE", () => ({ media: [video()], worker: worker(() => new ServiceAiProviderError("video_processing_timeout", true)) })],
  ["video worker not configured", "PARTIAL", () => ({ media: [video()] })],
  ["provider unavailable (not configured)", "NOT_RUN", () => ({ provider: { ok: false, reason: "provider_not_selected" } })],
  ["AI disabled", "NOT_RUN", () => ({ enabled: false })],
];

test("failure/retry matrix: classification per failure type; the service request always survives untouched", async () => {
  const table = [];
  for (const [name, expected, make] of MATRIX) {
    const opts = await make();
    const r = await attempt(opts);
    const got = !r.out ? "NOT_RUN" : r.out.outcome === "REQUEUED" ? "RETRYABLE" : r.out.outcome === "PARTIAL" ? "PARTIAL" : ["FAILED", "EVIDENCE_PREPARED"].includes(r.out.outcome) ? "PERMANENT" : r.out.outcome;
    table.push(`${name.padEnd(62)} ${expected.padEnd(9)} ${got.padEnd(9)} ${r.out ? r.out.outcome + (r.out.errorCode ? `:${r.out.errorCode}` : "") : r.q.outcome}`);
    assert.equal(got, expected, `${name}: ${JSON.stringify(r.out ?? r.q)}`);
    // The invariant: the request, its media and its history are exactly as before.
    assert.deepEqual(r.after, r.before, `${name}: request changed`);
    // Transient failures leave nothing cached that would block a retry.
    if (expected === "RETRYABLE") assert.equal(r.analyses.filter((a) => a.status !== "COMPLETED").length, 0, `${name}: transient failure cached`);
    if (expected === "PERMANENT" || expected === "RETRYABLE" || expected === "NOT_RUN") assert.equal(r.reports.length, 0, name);
    if (expected === "PARTIAL") assert.equal(r.reports.length, 1, name);
  }
  console.log(`failure matrix (${table.length}):\n${table.join("\n")}`);
});
