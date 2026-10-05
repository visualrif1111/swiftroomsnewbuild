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
  text: string;
  language: string | null;
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
}

export interface SynthesisResult {
  /** Untrusted until validateReportContent() accepts it. */
  content: unknown;
  usage: ProviderUsage;
}

export interface ServiceAiProvider {
  /** Stored on runs and reports, e.g. "stub". */
  readonly id: string;
  readonly models: { transcribe: string; vision: string; report: string };
  /** Identifies prompts/instructions; part of cache keys and run provenance. */
  readonly promptVersion: string;
  transcribe(request: TranscribeRequest): Promise<TranscribeResult>;
  observe(request: ObserveRequest): Promise<ObserveResult>;
  synthesiseReport(request: SynthesisRequest): Promise<SynthesisResult>;
}

/**
 * A provider call failed. `retryable` (outage, rate limit, timeout) sends the
 * run back to the queue; otherwise the media item or run fails for good.
 * `code` is an internal identifier — never provider text or customer data.
 */
export class ServiceAiProviderError extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(`AI provider error: ${code}`);
    this.name = "ServiceAiProviderError";
  }
}
