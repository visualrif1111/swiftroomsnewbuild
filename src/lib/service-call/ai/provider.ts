// The AI provider boundary. The pipeline depends on this interface only, so a
// real provider (OpenAI in Phase 4B+) or another stack can be swapped in
// without touching orchestration, storage or validation.
//
// Phase 4A ships only the deterministic stub (stub-provider.ts).
import type { Certainty, EvidenceType, ObservationType } from "./report-schema";
import type { ServiceAiInput } from "./input-builder";

/** Token/second counters reported by a provider call (summed per run). */
export type ProviderUsage = Record<string, number>;

export interface MediaReader {
  /** Original bytes of a stored evidence file. Server-side only; never a URL. */
  (mediaId: string): Promise<Uint8Array>;
}

export interface TranscribeRequest {
  mediaId: string;
  label: string;
  mimeType: string;
  read: () => Promise<Uint8Array>;
}

export interface TranscribeResult {
  /** What was said, in the original language(s). Empty when no speech was recognised. */
  text: string;
  /** Primary detected language (e.g. "en", "ar"), if the provider reports one. */
  language: string | null;
  /** Every detected language, for mixed-language recordings. */
  languages?: string[];
  usage: ProviderUsage;
}

export interface ObserveRequest {
  /** Images/video given to the model. Customer text is deliberately NOT included. */
  items: { mediaId: string; label: string; type: Exclude<EvidenceType, "VOICE">; mimeType: string; read: () => Promise<Uint8Array> }[];
  /** Neutral context only (e.g. "window", "sliding-door"). */
  productCategories: string[];
}

export interface RawObservation {
  mediaId: string;
  frameAtSeconds: number | null;
  observation: string;
  type: ObservationType;
  certainty: Certainty;
}

export interface ObserveResult {
  observations: RawObservation[];
  usage: ProviderUsage;
}

export interface SynthesisRequest {
  input: ServiceAiInput;
  observations: (RawObservation & { label: string })[];
  /**
   * Corrective attempt only: our own validation rule codes from the previous
   * attempt (paths + codes, never customer content).
   */
  correction?: string[];
}

export interface SynthesisResult {
  /** Untrusted until validateReportContent() accepts it. */
  content: unknown;
  usage: ProviderUsage;
  /**
   * The model answered but the output can't be used as-is (cut off at the
   * token limit, or not JSON). Counts as an invalid attempt, like a
   * validation failure — never stored.
   */
  outputIssue?: "incomplete_output" | "malformed_json";
}

export interface ServiceAiProvider {
  /** Stored on runs and reports, e.g. "stub", "openai". */
  readonly id: string;
  /**
   * What this provider can do. The pipeline never calls a step a provider
   * doesn't offer: unsupported media is reported as SKIPPED, and without
   * synthesis the run stops after preparing evidence (no report).
   */
  readonly capabilities: { transcribe: boolean; observe: boolean; synthesise: boolean };
  readonly models: { transcribe: string; vision: string; report: string };
  /**
   * Prompt/request-parameter version per capability. The transcribe and
   * observe versions are part of the per-file cache keys; the report version
   * is the run's prompt_version. Kept separate so changing the report prompt
   * never invalidates cached transcripts.
   */
  readonly promptVersions: { transcribe: string; observe: string; report: string };
  /** SHA-256 of the exact report instructions + schema, recorded on each report (optional). */
  readonly reportPromptHash?: string;
  transcribe(request: TranscribeRequest): Promise<TranscribeResult>;
  observe(request: ObserveRequest): Promise<ObserveResult>;
  synthesiseReport(request: SynthesisRequest): Promise<SynthesisResult>;
}

/**
 * A provider call failed. `code` is an internal identifier — never provider
 * text or customer data.
 *   retryable  outage, rate limit, timeout: the run goes back to the queue
 *   scope      "media": only this file is affected (FAILED/SKIPPED, others continue)
 *              "run":   the whole run stops (e.g. provider credentials rejected)
 *   skipped    the file can't be processed by this provider (e.g. an audio
 *              format it doesn't accept): reported as SKIPPED, not FAILED
 */
export class ServiceAiProviderError extends Error {
  public readonly scope: "media" | "run";
  public readonly skipped: boolean;
  constructor(
    public readonly code: string,
    public readonly retryable: boolean,
    options: { scope?: "media" | "run"; skipped?: boolean } = {},
  ) {
    super(`AI provider error: ${code}`);
    this.name = "ServiceAiProviderError";
    this.scope = options.scope ?? "media";
    this.skipped = options.skipped ?? false;
  }
}
