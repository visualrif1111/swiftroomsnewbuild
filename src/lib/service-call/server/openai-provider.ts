// OpenAI provider (server-only). Phase 4B: voice transcription only.
//
// API: POST https://api.openai.com/v1/audio/transcriptions (multipart), model
// configurable (default "gpt-transcribe": OpenAI's recommended model for
// transcribing recorded speech in its original language). Plain fetch: one
// endpoint, explicit timeout, no hidden retries — the run queue retries.
//
// Sent: the audio bytes under a neutral file name, the model and the response
// format. Nothing else — no customer details, reference, original file name,
// prompt or language hints (auto-detection keeps mixed-language speech intact
// and avoids steering what the model "hears").
//
// Image observation and report synthesis are not offered yet (4C/4D).
import "server-only";
import { ServiceAiProviderError, type ServiceAiProvider, type TranscribeRequest } from "../ai/provider";

export const OPENAI_PROVIDER_ID = "openai";
export const DEFAULT_TRANSCRIBE_MODEL = "gpt-transcribe";
const ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const TIMEOUT_MS = 90_000;
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
  /** Injected in tests. */
  fetch?: typeof fetch;
}

export function createOpenAiProvider(config: OpenAiProviderConfig): ServiceAiProvider {
  const doFetch = config.fetch ?? fetch;
  const notOffered = (code: string) => {
    throw new ServiceAiProviderError(code, false, { skipped: true });
  };

  return {
    id: OPENAI_PROVIDER_ID,
    capabilities: { transcribe: true, observe: false, synthesise: false },
    models: { transcribe: config.transcribeModel, vision: "none", report: "none" },
    // Transcription sends no prompt; this versions the request parameters.
    promptVersion: "openai-transcribe-1",

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

    async observe() {
      return notOffered("image_analysis_not_available");
    },

    async synthesiseReport() {
      // Never called: the pipeline checks capabilities first.
      throw new ServiceAiProviderError("report_synthesis_not_available", false, { scope: "run" });
    },
  };
}

/** Maps an OpenAI error response to an internal code. Provider messages are never kept. */
async function providerError(res: Response): Promise<ServiceAiProviderError> {
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
