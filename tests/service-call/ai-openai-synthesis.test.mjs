// OpenAI report synthesis (Responses API) with HTTP mocked: exact request,
// privacy, response parsing and error mapping. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createOpenAiProvider, parseReportResponse, REPORT_MAX_OUTPUT_TOKENS, REPORT_PROMPT_HASH } from "../../src/lib/service-call/server/openai-provider.ts";
import { ServiceAiProviderError } from "../../src/lib/service-call/ai/provider.ts";
import { REPORT_JSON_SCHEMA } from "../../src/lib/service-call/ai/report-json-schema.ts";
import { REPORT_INSTRUCTIONS } from "../../src/lib/service-call/ai/prompts/report-v4.ts";
import { resolveServiceAiProvider } from "../../src/lib/service-call/server/ai-config.ts";
import { goodReport, json, openAiMock, responseOf, USAGE } from "../support/synthesis-mock.mjs";

const INPUT = {
  request: { description: "The sliding door catches halfway. [number removed]", productCategories: ["sliding-door"], otherProduct: null, existingCustomer: true },
  evidence: [{ mediaId: "m-v", label: "Voice note 1", type: "VOICE", durationSeconds: 7, analysedInThisPhase: true }, { mediaId: "m-p", label: "Photo 1", type: "PHOTO", durationSeconds: null, analysedInThisPhase: false }],
  transcripts: [{ mediaId: "m-v", label: "Voice note 1", kind: "VOICE_NOTE", text: "It makes a grinding noise.", language: "en", noSpeechDetected: false, possiblyIncomplete: false }],
};
const provider = (mock, cfg = {}) => createOpenAiProvider({ apiKey: "sk-test", transcribeModel: "gpt-transcribe", fetch: mock.fetch, ...cfg });
const rejectsWith = (p, expect) =>
  assert.rejects(p, (e) => {
    assert.ok(e instanceof ServiceAiProviderError, String(e));
    for (const [k, v] of Object.entries(expect)) assert.equal(e[k], v, k);
    return true;
  });

test("request: Responses API, strict scr-1.1 schema, store:false, low reasoning, output cap, static cache key, nothing else", async () => {
  const mock = openAiMock();
  const res = await provider(mock).synthesiseReport({ input: INPUT, observations: [] });
  assert.equal(mock.calls.responses.length, 1);
  const { url, body, headers, input, correction } = mock.calls.responses[0];
  assert.equal(url, "https://api.openai.com/v1/responses");
  assert.equal(headers.Authorization, "Bearer sk-test");
  assert.deepEqual(Object.keys(body).sort(), ["input", "instructions", "max_output_tokens", "model", "prompt_cache_key", "reasoning", "store", "text"]);
  assert.equal(body.model, "gpt-6.1-sol");
  assert.equal(body.store, false);
  assert.deepEqual(body.reasoning, { effort: "low" });
  assert.equal(body.max_output_tokens, REPORT_MAX_OUTPUT_TOKENS);
  assert.equal(body.prompt_cache_key, "service-report-openai-report-4");
  assert.deepEqual(body.text, { format: { type: "json_schema", name: "service_call_report_scr_1_4", schema: REPORT_JSON_SCHEMA, strict: true } });
  assert.equal(body.instructions, REPORT_INSTRUCTIONS);
  assert.equal(body.input.length, 1);
  assert.equal(body.input[0].role, "user");
  assert.deepEqual(input, { ...INPUT, mediaObservations: [] }, "the user message is exactly the minimised input + provided observations");
  assert.equal(correction, null);
  assert.ok(!("user" in body) && !("metadata" in body) && !("safety_identifier" in body));
  assert.deepEqual(res.usage, { openaiReportCalls: 1, openaiReportInputTokens: USAGE.input_tokens, openaiReportCachedInputTokens: 1024, openaiReportOutputTokens: USAGE.output_tokens, openaiReportReasoningTokens: 1300 });
  assert.deepEqual(res.content, goodReport(INPUT));
});

test("corrective attempt carries only our rule codes after the same data", async () => {
  const mock = openAiMock();
  await provider(mock).synthesiseReport({ input: INPUT, observations: [], correction: ["customerReported.statements[0].quote: quote_not_found_in_source", "confidence.overall: confidence_above_phase_maximum"] });
  const { text, input } = mock.calls.responses[0];
  assert.deepEqual(input, { ...INPUT, mediaObservations: [] });
  const feedback = text.slice(JSON.stringify({ ...INPUT, mediaObservations: [] }).length);
  for (const line of feedback.split("\n").filter((l) => l.startsWith("- "))) assert.match(line, /^- [\w[\].]+: [a-z_:A-Z]+$/);
  assert.ok(!feedback.includes("sliding door") && !feedback.includes("grinding"), "no customer content echoed in feedback");
});

test("models and reasoning are configurable (e.g. Luna for 4F evaluation)", async () => {
  const mock = openAiMock();
  await provider(mock, { reportModel: "gpt-6-luna", reportReasoning: "none" }).synthesiseReport({ input: INPUT, observations: [] });
  assert.equal(mock.calls.responses[0].body.model, "gpt-6-luna");
  assert.deepEqual(mock.calls.responses[0].body.reasoning, { effort: "none" });
  const p = resolveServiceAiProvider({ SERVICE_AI_PROVIDER: "openai", OPENAI_API_KEY: "k", SERVICE_AI_MODEL_REPORT: "gpt-6-luna", SERVICE_AI_REPORT_REASONING: "medium" }).provider;
  assert.equal(p.models.report, "gpt-6-luna");
  assert.equal(resolveServiceAiProvider({ SERVICE_AI_PROVIDER: "openai", OPENAI_API_KEY: "k" }).provider.models.report, "gpt-6.1-sol");
  assert.equal(resolveServiceAiProvider({ SERVICE_AI_PROVIDER: "openai", OPENAI_API_KEY: "k", SERVICE_AI_REPORT_REASONING: "bogus" }).provider.models.report, "gpt-6.1-sol", "invalid effort falls back to default");
});

test("provider exposes capabilities, split prompt versions and the prompt hash", () => {
  const p = provider(openAiMock());
  assert.deepEqual(p.capabilities, { transcribe: true, observe: true, synthesise: true });
  assert.deepEqual(p.promptVersions, { transcribe: "openai-transcribe-1", observe: "openai-observe-1/img-1", observeFrame: "openai-observe-frame-1/img-1", report: "openai-report-4" });
  assert.equal(p.reportPromptHash, REPORT_PROMPT_HASH);
  assert.match(REPORT_PROMPT_HASH, /^[0-9a-f]{64}$/);
});

test("response parsing: refusal and content filter end the run; incomplete/non-JSON are invalid attempts", () => {
  const refusal = { status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "I can't help with that." }] }] };
  assert.throws(() => parseReportResponse(refusal), (e) => e.code === "model_refusal" && e.retryable === false && e.scope === "run");
  const refusal2 = { status: "completed", output: [{ type: "message", content: [{ type: "output_refusal", refusal: "No." }] }] };
  assert.throws(() => parseReportResponse(refusal2), (e) => e.code === "model_refusal");
  assert.throws(() => parseReportResponse({ status: "incomplete", incomplete_details: { reason: "content_filter" }, output: [] }), (e) => e.code === "content_filtered" && !e.retryable);
  assert.equal(parseReportResponse({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] }).outputIssue, "incomplete_output");
  assert.equal(parseReportResponse({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "{not json" }] }] }).outputIssue, "malformed_json");
  assert.equal(parseReportResponse({ status: "completed", output: [] }).outputIssue, "malformed_json");
  assert.throws(() => parseReportResponse({ status: "failed", output: [] }), (e) => e.code === "provider_unavailable" && e.retryable);
  assert.throws(() => parseReportResponse(null), (e) => e.code === "provider_malformed_response");
});

test("HTTP errors: 429/5xx/timeout retryable; 401 and quota run-wide; 400 request rejected (not retried)", async () => {
  const cases = [
    [json({ error: { code: "rate_limit_exceeded" } }, 429), { code: "provider_rate_limited", retryable: true, scope: "media" }],
    [json({}, 503), { code: "provider_unavailable", retryable: true }],
    [json({ error: { code: "invalid_api_key" } }, 401), { code: "provider_auth_failed", retryable: true, scope: "run" }],
    [json({ error: { code: "insufficient_quota" } }, 429), { code: "provider_quota_exceeded", scope: "run" }],
    [json({ error: { code: "invalid_json_schema", message: "secret detail" } }, 400), { code: "provider_request_rejected", retryable: false, scope: "run" }],
    [json({ error: { code: "model_not_found" } }, 404), { code: "provider_model_not_found", scope: "run" }],
  ];
  for (const [response, expect] of cases) {
    await rejectsWith(provider(openAiMock({ model: () => response })).synthesiseReport({ input: INPUT, observations: [] }), expect);
  }
  const timeout = createOpenAiProvider({ apiKey: "k", transcribeModel: "m", fetch: async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); } });
  await rejectsWith(timeout.synthesiseReport({ input: INPUT, observations: [] }), { code: "provider_timeout", retryable: true });
});

test("a valid response with extra Responses fields still parses the message only", () => {
  const r = parseReportResponse(JSON.parse(JSON.stringify({ status: "completed", output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: '{"a":1}' }] }], usage: USAGE })));
  assert.deepEqual(r.content, { a: 1 });
  assert.equal(responseOf({}).status, 200);
});
