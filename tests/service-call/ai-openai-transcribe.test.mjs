// OpenAI transcription provider with the HTTP layer mocked: request shape,
// privacy, response parsing and error mapping. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createOpenAiProvider, parseTranscription } from "../../src/lib/service-call/server/openai-provider.ts";
import { ServiceAiProviderError } from "../../src/lib/service-call/ai/provider.ts";
import { resolveServiceAiProvider } from "../../src/lib/service-call/server/ai-config.ts";

const AUDIO = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3, 4]);
const ok = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const err = (status, error = {}) => new Response(JSON.stringify({ error: { message: "secret provider text with details", ...error } }), { status });

function provider(respond) {
  const calls = [];
  const p = createOpenAiProvider({
    apiKey: "sk-test-key",
    transcribeModel: "gpt-transcribe",
    fetch: async (url, init) => {
      calls.push({ url, init, form: init.body });
      return typeof respond === "function" ? respond(calls.length) : respond;
    },
  });
  return { p, calls };
}
const req = (over = {}) => ({ mediaId: "m-1", label: "Voice note 1", mimeType: "audio/webm", read: async () => AUDIO, ...over });
const rejectsWith = async (promise, expect) => {
  await assert.rejects(promise, (e) => {
    assert.ok(e instanceof ServiceAiProviderError, `got ${e}`);
    for (const [k, v] of Object.entries(expect)) assert.equal(e[k], v, `${k}`);
    assert.ok(!e.message.includes("secret provider text"), "provider message never surfaces");
    return true;
  });
};

test("sends only the audio, model and response format — multipart to /v1/audio/transcriptions", async () => {
  const { p, calls } = provider(ok({ text: "The sliding door is stuck.", languages: [{ code: "en" }], usage: { type: "tokens", input_tokens: 120, output_tokens: 9, total_tokens: 129 } }));
  const res = await p.transcribe(req());
  assert.equal(calls.length, 1);
  const { url, init, form } = calls[0];
  assert.equal(url, "https://api.openai.com/v1/audio/transcriptions");
  assert.equal(init.method, "POST");
  assert.equal(init.headers.Authorization, "Bearer sk-test-key");
  assert.ok(init.signal, "has a timeout signal");
  assert.deepEqual([...form.keys()].sort(), ["file", "model", "response_format"], "no prompt, language hints or metadata");
  assert.equal(form.get("model"), "gpt-transcribe");
  assert.equal(form.get("response_format"), "json");
  const file = form.get("file");
  assert.equal(file.name, "voice-note.webm", "neutral file name, never the customer's");
  assert.equal(file.type, "audio/webm");
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), AUDIO);
  assert.deepEqual(res, {
    text: "The sliding door is stuck.", language: "en", languages: ["en"],
    usage: { openaiTranscriptions: 1, openaiTranscribeInputTokens: 120, openaiTranscribeOutputTokens: 9, openaiTranscribeTotalTokens: 129 },
  });
});

test("documented formats are sent as-is with the right extension; others are SKIPPED without a call", async () => {
  for (const [mime, ext] of [["audio/webm", "webm"], ["audio/mp4", "m4a"], ["audio/x-m4a", "m4a"], ["audio/mpeg", "mp3"], ["audio/wav", "wav"], ["audio/x-wav", "wav"]]) {
    const { p, calls } = provider(ok({ text: "x" }));
    await p.transcribe(req({ mimeType: mime }));
    assert.equal(calls[0].form.get("file").name, `voice-note.${ext}`, mime);
  }
  for (const mime of ["audio/ogg", "audio/aac", "audio/3gpp"]) {
    const { p, calls } = provider(ok({ text: "x" }));
    await rejectsWith(p.transcribe(req({ mimeType: mime })), { code: "audio_format_not_supported", retryable: false, skipped: true, scope: "media" });
    assert.equal(calls.length, 0, `${mime}: no provider call`);
  }
});

test("empty and oversized audio fail permanently without a call", async () => {
  const empty = provider(ok({ text: "x" }));
  await rejectsWith(empty.p.transcribe(req({ read: async () => new Uint8Array(0) })), { code: "audio_empty", retryable: false });
  const big = provider(ok({ text: "x" }));
  await rejectsWith(big.p.transcribe(req({ read: async () => new Uint8Array(25 * 1024 * 1024 + 1) })), { code: "audio_exceeds_provider_limit", retryable: false });
  assert.equal(empty.calls.length + big.calls.length, 0);
});

test("error mapping: retryable vs permanent vs run-wide; provider messages discarded", async () => {
  const cases = [
    [err(429, { code: "rate_limit_exceeded" }), { code: "provider_rate_limited", retryable: true, scope: "media" }],
    [err(429, { code: "insufficient_quota", type: "insufficient_quota" }), { code: "provider_quota_exceeded", retryable: true, scope: "run" }],
    [err(500), { code: "provider_unavailable", retryable: true, scope: "media" }],
    [err(503), { code: "provider_unavailable", retryable: true }],
    [err(400, { code: "invalid_value" }), { code: "audio_unreadable", retryable: false, scope: "media", skipped: false }],
    [err(413), { code: "audio_exceeds_provider_limit", retryable: false }],
    [err(401, { code: "invalid_api_key" }), { code: "provider_auth_failed", retryable: true, scope: "run" }],
    [err(403), { code: "provider_auth_failed", scope: "run" }],
    [err(404, { code: "model_not_found" }), { code: "provider_model_not_found", scope: "run" }],
    [err(418), { code: "provider_http_418", retryable: false }],
  ];
  for (const [response, expect] of cases) await rejectsWith(provider(response).p.transcribe(req()), expect);
});

test("timeouts and network failures are retryable", async () => {
  const timeout = createOpenAiProvider({ apiKey: "k", transcribeModel: "m", fetch: async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); } });
  await rejectsWith(timeout.transcribe(req()), { code: "provider_timeout", retryable: true });
  const net = createOpenAiProvider({ apiKey: "k", transcribeModel: "m", fetch: async () => { throw new TypeError("fetch failed"); } });
  await rejectsWith(net.transcribe(req()), { code: "provider_network_error", retryable: true });
});

test("malformed responses are rejected (retryable), never stored as transcripts", async () => {
  for (const bad of [new Response("not json", { status: 200 }), ok({}), ok({ text: 42 }), ok(null), ok({ text: "x".repeat(50_001) })]) {
    await rejectsWith(provider(bad).p.transcribe(req()), { code: "provider_malformed_response", retryable: true });
  }
});

test("transcript is preserved verbatim: no rewriting, only control characters removed; languages kept", () => {
  const mixed = parseTranscription({ text: "  الباب لا يغلق, the sliding door is stuck. दरवाज़ा अटका है\u0007  ", languages: [{ code: "AR" }, { code: "en" }, { code: "hi" }, { code: "bad code!" }] });
  assert.equal(mixed.text, "الباب لا يغلق, the sliding door is stuck. दरवाज़ा अटका है");
  assert.deepEqual(mixed.languages, ["ar", "en", "hi"]);
  assert.equal(mixed.language, "ar");
  const multiline = parseTranscription({ text: "Line one.\nLine two." });
  assert.equal(multiline.text, "Line one.\nLine two.");
  assert.equal(multiline.language, null);
  const silent = parseTranscription({ text: "   " });
  assert.equal(silent.text, "", "no speech → empty, not invented");
  assert.deepEqual(parseTranscription({ text: "x", language: "ur" }).languages, ["ur"], "legacy single language field");
});

test("observe/synthesise are not offered in 4B", async () => {
  const { p, calls } = provider(ok({ text: "x" }));
  assert.deepEqual(p.capabilities, { transcribe: true, observe: false, synthesise: false });
  await rejectsWith(p.observe({ items: [], productCategories: [] }), { code: "image_analysis_not_available", skipped: true });
  assert.equal(calls.length, 0);
});

test("provider selection fails closed and never defaults to the stub", () => {
  const r = (env) => resolveServiceAiProvider(env);
  assert.deepEqual(r({}), { ok: false, reason: "provider_not_selected" });
  assert.deepEqual(r({ SERVICE_AI_PROVIDER: "openai" }), { ok: false, reason: "openai_key_missing" });
  assert.deepEqual(r({ SERVICE_AI_PROVIDER: "openai", OPENAI_API_KEY: "  " }), { ok: false, reason: "openai_key_missing" });
  assert.deepEqual(r({ SERVICE_AI_PROVIDER: "stub", VERCEL_ENV: "production" }), { ok: false, reason: "stub_not_allowed_in_production" });
  assert.deepEqual(r({ SERVICE_AI_PROVIDER: "gemini", OPENAI_API_KEY: "k" }), { ok: false, reason: "unknown_provider" });
  const openai = r({ SERVICE_AI_PROVIDER: "OpenAI", OPENAI_API_KEY: "k" });
  assert.equal(openai.ok && openai.provider.id, "openai");
  assert.equal(openai.provider.models.transcribe, "gpt-transcribe", "default model");
  assert.equal(r({ SERVICE_AI_PROVIDER: "openai", OPENAI_API_KEY: "k", SERVICE_AI_MODEL_TRANSCRIBE: "gpt-4o-mini-transcribe" }).provider.models.transcribe, "gpt-4o-mini-transcribe");
  assert.equal(r({ SERVICE_AI_PROVIDER: "stub", VERCEL_ENV: "preview" }).provider.id, "stub");
  assert.ok(!JSON.stringify(openai).includes("\"k\""), "key not exposed on the provider object");
});
