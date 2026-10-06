// OpenAI provider (server-only).
//   Phase 4B — voice transcription
//   Phase 4C — report synthesis (Responses API, strict structured output)
//   Phase 4D — photo observation (Responses API, one image per call)
//   Phase 4E — video-frame observation: the same call, one sampled still per
//              call, with the frame instructions (observe-frame-v1). Videos,
//              frames and audio never reach the report call; video audio is
//              transcribed like a voice note (extracted by the media worker).
//
// Transcription API: POST https://api.openai.com/v1/audio/transcriptions (multipart), model
// configurable (default "gpt-transcribe": OpenAI's recommended model for
// transcribing recorded speech in its original language). Plain fetch: one
// endpoint, explicit timeout, no hidden retries — the run queue retries.
//
// Sent: the audio bytes under a neutral file name, the model and the response
// format. Nothing else — no customer details, reference, original file name,
// prompt or language hints (auto-detection keeps mixed-language speech intact
// and avoids steering what the model "hears").
//
// Report synthesis: POST https://api.openai.com/v1/responses with
// text.format json_schema strict (scr-1.1), store:false, low reasoning effort
// and an output-token cap. Sent: the versioned instructions and ONE user
// message holding buildServiceAiInput() output (scrubbed text, categories,
// transcripts, neutral evidence labels) — never contact details, references,
// tokens, URLs or media bytes. On a corrective attempt the message also
// carries our own validation rule codes, nothing else. The report call never
// receives a photograph — only the validated, structured photo observations.
//
// Photo observation: POST /v1/responses with ONE in-memory JPEG derivative
// (data URL, detail "high", ≤ 1536 px — no metadata, never the original, no
// URL), a neutral label and the selected product categories. Strict
// json_schema "photo_observation_po_1", store:false, low reasoning, ≤ 3k
// output tokens.
import "server-only";
import { createHash } from "node:crypto";
import { buildObserveUserText, OBSERVE_INSTRUCTIONS, OBSERVE_PROMPT_VERSION } from "../ai/prompts/observe-v1";
import { buildObserveFrameUserText, OBSERVE_FRAME_INSTRUCTIONS, OBSERVE_FRAME_PROMPT_VERSION } from "../ai/prompts/observe-frame-v1";
import { buildReportUserMessage, REPORT_INSTRUCTIONS, REPORT_PROMPT_VERSION } from "../ai/prompts/report-v4";
import { PHOTO_OBSERVATION_JSON_SCHEMA, PHOTO_OBSERVATION_JSON_SCHEMA_NAME } from "../ai/photo-observation-schema";
import { ServiceAiProviderError, type ObservePhotoRequest, type ServiceAiProvider, type SynthesisRequest, type TranscribeRequest } from "../ai/provider";
import { NORMALISER_VERSION } from "./image-normaliser";
import { REPORT_JSON_SCHEMA, REPORT_JSON_SCHEMA_NAME } from "../ai/report-json-schema";

export const OPENAI_PROVIDER_ID = "openai";
export const DEFAULT_TRANSCRIBE_MODEL = "gpt-transcribe";
export const DEFAULT_REPORT_MODEL = "gpt-6.1-sol";
export const DEFAULT_VISION_MODEL = "gpt-6.1-sol";
/** Output cap per photo-observation attempt (JSON + reasoning). */
export const OBSERVE_MAX_OUTPUT_TOKENS = 3_000;
const OBSERVE_TIMEOUT_MS = 120_000;
/** Identifies the exact photo instructions + schema sent. */
export const OBSERVE_PROMPT_HASH = createHash("sha256").update(OBSERVE_INSTRUCTIONS).update(JSON.stringify(PHOTO_OBSERVATION_JSON_SCHEMA)).digest("hex");
/** Identifies the exact video-frame instructions + schema sent. */
export const OBSERVE_FRAME_PROMPT_HASH = createHash("sha256").update(OBSERVE_FRAME_INSTRUCTIONS).update(JSON.stringify(PHOTO_OBSERVATION_JSON_SCHEMA)).digest("hex");
export const DEFAULT_REPORT_REASONING = "low";
export const REPORT_REASONING_EFFORTS = ["none", "low", "medium", "high"] as const;
const ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 90_000;
const REPORT_TIMEOUT_MS = 150_000;
/** Ceiling on generated tokens (report JSON + reasoning) per synthesis attempt — the cost cap. */
export const REPORT_MAX_OUTPUT_TOKENS = 12_000;
/** Identifies the exact instructions + schema sent (recorded on every report). */
export const REPORT_PROMPT_HASH = createHash("sha256").update(REPORT_INSTRUCTIONS).update(JSON.stringify(REPORT_JSON_SCHEMA)).digest("hex");
/** OpenAI's documented upload limit for transcription. */
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_TRANSCRIPT_CHARS = 50_000;

/**
 * Formats OpenAI documents for transcription (mp3, mp4, mpeg, mpga, m4a, wav,
 * webm), keyed by our normalised MIME types. The in-app recorder produces
 * WebM (Chrome/Firefox/Edge) or MP4 (Safari), both here. Ogg/Opus, raw AAC
 * and 3GPP uploads are accepted by Phase 3 but not documented by OpenAI, so
 * they are SKIPPED rather than guessed at (no transcoding in 4B; AI.md).
 */
export const TRANSCRIBABLE: Readonly<Record<string, string>> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

export interface OpenAiProviderConfig {
  apiKey: string;
  transcribeModel: string;
  /** Report model (Phase 4C). Default gpt-6.1-sol; configurable for evaluation (e.g. gpt-6-luna). */
  reportModel?: string;
  /** Reasoning effort for synthesis and photo observation; default "low". */
  reportReasoning?: (typeof REPORT_REASONING_EFFORTS)[number];
  /** Photo-observation model (Phase 4D). Default gpt-6.1-sol. */
  visionModel?: string;
  /** Injected in tests. */
  fetch?: typeof fetch;
}

export function createOpenAiProvider(config: OpenAiProviderConfig): ServiceAiProvider {
  const doFetch = config.fetch ?? fetch;

  const reportModel = config.reportModel ?? DEFAULT_REPORT_MODEL;
  const reasoning = config.reportReasoning ?? DEFAULT_REPORT_REASONING;
  const visionModel = config.visionModel ?? DEFAULT_VISION_MODEL;

  async function respond(body: Record<string, unknown>, call: "report" | "observe", timeoutMs: number) {
    let res: Response;
    try {
      res = await doFetch(RESPONSES_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      throw new ServiceAiProviderError(timedOut ? "provider_timeout" : "provider_network_error", true);
    }
    if (!res.ok) throw await providerError(res, call);
    try {
      return (await res.json()) as unknown;
    } catch {
      throw new ServiceAiProviderError("provider_malformed_response", true);
    }
  }

  return {
    id: OPENAI_PROVIDER_ID,
    capabilities: { transcribe: true, observe: true, synthesise: true },
    models: { transcribe: config.transcribeModel, vision: visionModel, report: reportModel },
    // Transcription sends no prompt; its version covers the request
    // parameters and stays fixed so cached transcripts remain valid.
    // The observe version includes the image normaliser's version: a change to
    // either gives a new per-photo cache key.
    promptVersions: {
      transcribe: "openai-transcribe-1",
      observe: `${OBSERVE_PROMPT_VERSION}/${NORMALISER_VERSION}`,
      observeFrame: `${OBSERVE_FRAME_PROMPT_VERSION}/${NORMALISER_VERSION}`,
      report: REPORT_PROMPT_VERSION,
    },
    reportPromptHash: REPORT_PROMPT_HASH,
    observePromptHash: OBSERVE_PROMPT_HASH,
    observeFramePromptHash: OBSERVE_FRAME_PROMPT_HASH,
    instructionTexts: [REPORT_INSTRUCTIONS, OBSERVE_INSTRUCTIONS, OBSERVE_FRAME_INSTRUCTIONS],

    async transcribe(request: TranscribeRequest) {
      const ext = TRANSCRIBABLE[request.mimeType];
      if (!ext) throw new ServiceAiProviderError("audio_format_not_supported", false, { skipped: true });
      const bytes = await request.read();
      if (bytes.byteLength === 0) throw new ServiceAiProviderError("audio_empty", false);
      if (bytes.byteLength > MAX_AUDIO_BYTES) throw new ServiceAiProviderError("audio_exceeds_provider_limit", false);

      const form = new FormData();
      // Neutral name: the customer's own file name is never sent.
      form.append("file", new Blob([bytes as Uint8Array<ArrayBuffer>], { type: request.mimeType }), `voice-note.${ext}`);
      form.append("model", config.transcribeModel);
      form.append("response_format", "json");

      let res: Response;
      try {
        res = await doFetch(ENDPOINT, {
          method: "POST",
          headers: { Authorization: `Bearer ${config.apiKey}` },
          body: form,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch (err) {
        const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
        throw new ServiceAiProviderError(timedOut ? "provider_timeout" : "provider_network_error", true);
      }

      if (!res.ok) throw await providerError(res);

      let body: unknown;
      try {
        body = await res.json();
      } catch {
        throw new ServiceAiProviderError("provider_malformed_response", true);
      }
      return parseTranscription(body);
    },

    async observePhoto(request: ObservePhotoRequest) {
      const dataUrl = `data:${request.image.mimeType};base64,${Buffer.from(request.image.bytes).toString("base64")}`;
      const json = await respond(
        {
          model: visionModel,
          instructions: request.frame ? OBSERVE_FRAME_INSTRUCTIONS : OBSERVE_INSTRUCTIONS,
          input: [{
            role: "user",
            content: [
              { type: "input_text", text: (request.frame ? buildObserveFrameUserText : buildObserveUserText)(request.label, request.productCategories, request.correction) },
              { type: "input_image", image_url: dataUrl, detail: "high" },
            ],
          }],
          text: { format: { type: "json_schema", name: PHOTO_OBSERVATION_JSON_SCHEMA_NAME, schema: PHOTO_OBSERVATION_JSON_SCHEMA, strict: true } },
          reasoning: { effort: reasoning },
          max_output_tokens: OBSERVE_MAX_OUTPUT_TOKENS,
          store: false,
          prompt_cache_key: request.frame ? `service-observe-${OBSERVE_FRAME_PROMPT_VERSION}` : `service-observe-${OBSERVE_PROMPT_VERSION}`,
        },
        "observe",
        OBSERVE_TIMEOUT_MS,
      );
      // A refusal or content filter concerns this photo only: the file fails, the run continues.
      return parseStructuredResponse(json, "openaiObserve", { refusal: "image_refused", filtered: "image_content_filtered", scope: "media" });
    },

    async synthesiseReport(request: SynthesisRequest) {
      const json = await respond(
        {
          model: reportModel,
          instructions: REPORT_INSTRUCTIONS,
          input: [{ role: "user", content: [{ type: "input_text", text: buildReportUserMessage(request.input, request.observations, request.correction) }] }],
          text: { format: { type: "json_schema", name: REPORT_JSON_SCHEMA_NAME, schema: REPORT_JSON_SCHEMA, strict: true } },
          reasoning: { effort: reasoning },
          max_output_tokens: REPORT_MAX_OUTPUT_TOKENS,
          // Not kept by OpenAI for later retrieval (abuse-monitoring retention still applies; AI.md).
          store: false,
          // Static, non-customer value: lets identical instructions + schema hit the prompt cache.
          prompt_cache_key: `service-report-${REPORT_PROMPT_VERSION}`,
        },
        "report",
        REPORT_TIMEOUT_MS,
      );
      return parseReportResponse(json);
    },
  };
}

/**
 * Reads a Responses API result. Returns the parsed JSON content (still
 * untrusted) or an output issue; refusals and content filtering raise the
 * given codes.
 */
export function parseStructuredResponse(
  body: unknown,
  usagePrefix: "openaiReport" | "openaiObserve",
  codes: { refusal: string; filtered: string; scope: "run" | "media" },
) {
  if (typeof body !== "object" || body === null) throw new ServiceAiProviderError("provider_malformed_response", true);
  const b = body as { status?: unknown; incomplete_details?: { reason?: unknown } | null; output?: unknown; usage?: Record<string, unknown> };
  const usage = responseUsage(b.usage, usagePrefix);

  if (b.status === "incomplete") {
    if (b.incomplete_details?.reason === "content_filter") throw new ServiceAiProviderError(codes.filtered, false, { scope: codes.scope });
    return { content: null, usage, outputIssue: "incomplete_output" as const };
  }
  if (b.status === "failed" || b.status === "cancelled") throw new ServiceAiProviderError("provider_unavailable", true);
  if (b.status !== "completed") throw new ServiceAiProviderError("provider_malformed_response", true);

  const parts = (Array.isArray(b.output) ? b.output : [])
    .filter((item): item is { type: string; content?: unknown } => typeof item === "object" && item !== null && (item as { type?: unknown }).type === "message")
    .flatMap((item) => (Array.isArray(item.content) ? item.content : [])) as { type?: unknown; text?: unknown }[];
  if (parts.some((p) => p.type === "refusal" || p.type === "output_refusal")) throw new ServiceAiProviderError(codes.refusal, false, { scope: codes.scope });
  const text = parts.filter((p) => p.type === "output_text" && typeof p.text === "string").map((p) => p.text as string).join("");
  if (!text.trim()) return { content: null, usage, outputIssue: "malformed_json" as const };
  try {
    return { content: JSON.parse(text) as unknown, usage };
  } catch {
    return { content: null, usage, outputIssue: "malformed_json" as const };
  }
}

/** Report synthesis result: refusals and content filtering end the run. */
export function parseReportResponse(body: unknown) {
  return parseStructuredResponse(body, "openaiReport", { refusal: "model_refusal", filtered: "content_filtered", scope: "run" });
}

function responseUsage(u: Record<string, unknown> | undefined, prefix: string): Record<string, number> {
  const usage: Record<string, number> = { [`${prefix}Calls`]: 1 };
  const put = (k: string, v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) usage[`${prefix}${k}`] = v;
  };
  if (u) {
    put("InputTokens", u.input_tokens);
    put("CachedInputTokens", (u.input_tokens_details as Record<string, unknown> | undefined)?.cached_tokens);
    put("OutputTokens", u.output_tokens);
    put("ReasoningTokens", (u.output_tokens_details as Record<string, unknown> | undefined)?.reasoning_tokens);
  }
  return usage;
}

/** Maps an OpenAI error response to an internal code. Provider messages are never kept. */
async function providerError(res: Response, call: "transcribe" | "report" | "observe" = "transcribe"): Promise<ServiceAiProviderError> {
  const body = (await res.json().catch(() => null)) as { error?: { code?: unknown; type?: unknown } } | null;
  const code = typeof body?.error?.code === "string" ? body.error.code : "";
  const type = typeof body?.error?.type === "string" ? body.error.type : "";
  switch (true) {
    case res.status === 401 || res.status === 403:
      // Credentials/permissions: nothing to do with this file — stop the run, retry later.
      return new ServiceAiProviderError("provider_auth_failed", true, { scope: "run" });
    case res.status === 429 && (code === "insufficient_quota" || type === "insufficient_quota"):
      return new ServiceAiProviderError("provider_quota_exceeded", true, { scope: "run" });
    case res.status === 429:
      return new ServiceAiProviderError("provider_rate_limited", true);
    case call === "observe" && (res.status === 400 || res.status === 413 || res.status === 422):
      // The provider rejected this image (e.g. it could not be processed): this photo fails, the run continues.
      return new ServiceAiProviderError("image_rejected_by_provider", false);
    case call === "report" && (res.status === 400 || res.status === 413 || res.status === 422):
      // Our request was rejected (e.g. schema): a configuration/code problem, not transient.
      return new ServiceAiProviderError("provider_request_rejected", false, { scope: "run" });
    case res.status === 413:
      return new ServiceAiProviderError("audio_exceeds_provider_limit", false);
    case res.status === 400 || res.status === 415 || res.status === 422:
      // Unsupported, corrupt or unreadable audio: retrying the same bytes won't help.
      return new ServiceAiProviderError("audio_unreadable", false);
    case res.status === 404:
      // Unknown model id: a configuration problem.
      return new ServiceAiProviderError("provider_model_not_found", true, { scope: "run" });
    case res.status >= 500:
      return new ServiceAiProviderError("provider_unavailable", true);
    default:
      return new ServiceAiProviderError(`provider_http_${res.status}`, false);
  }
}

/** Validates the JSON transcription response; anything unexpected is a (retryable) malformed response. */
export function parseTranscription(body: unknown) {
  if (typeof body !== "object" || body === null || typeof (body as { text?: unknown }).text !== "string") {
    throw new ServiceAiProviderError("provider_malformed_response", true);
  }
  const b = body as { text: string; languages?: unknown; language?: unknown; usage?: unknown };
  // Keep line breaks; drop other control characters. Never rewrite the words.
  const text = b.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (text.length > MAX_TRANSCRIPT_CHARS) throw new ServiceAiProviderError("provider_malformed_response", true);

  const languages = Array.isArray(b.languages)
    ? b.languages
        .map((l) => (typeof l === "string" ? l : typeof l === "object" && l !== null ? (l as { code?: unknown }).code : null))
        .filter((c): c is string => typeof c === "string" && /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/i.test(c))
        .map((c) => c.toLowerCase())
    : typeof b.language === "string" && /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/i.test(b.language)
      ? [b.language.toLowerCase()]
      : [];

  const usage: Record<string, number> = { openaiTranscriptions: 1 };
  if (typeof b.usage === "object" && b.usage !== null) {
    const u = b.usage as Record<string, unknown>;
    for (const [key, name] of [["input_tokens", "openaiTranscribeInputTokens"], ["output_tokens", "openaiTranscribeOutputTokens"], ["total_tokens", "openaiTranscribeTotalTokens"], ["seconds", "openaiTranscribeSeconds"]] as const) {
      if (typeof u[key] === "number" && Number.isFinite(u[key])) usage[name] = u[key] as number;
    }
  }
  return { text, language: languages[0] ?? null, languages: [...new Set(languages)], usage };
}
