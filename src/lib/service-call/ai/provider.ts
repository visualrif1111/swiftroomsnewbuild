// The AI provider boundary. The pipeline depends on this interface only, so a
// real provider (OpenAI in Phase 4B+) or another stack can be swapped in
// without touching orchestration, storage or validation.
//
// Phase 4A ships only the deterministic stub (stub-provider.ts).
import type { Certainty, MediaObservation, ObservationType } from "./report-schema";
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

/**
 * One photo, already normalised (in-memory derivative, no metadata). Phase 4D:
 * exactly one image per call, so an observation can only ever describe the
 * photo it is attributed to. Customer text is deliberately NOT included.
 */
export interface ObservePhotoRequest {
  /** Neutral label ("Photo 2") — never the customer's file name. */
  label: string;
  /** Neutral context only (e.g. "window", "sliding-door"). */
  productCategories: string[];
  image: NormalisedImage;
  /** Corrective attempt only: our own rule codes from the previous attempt. */
  correction?: string[];
  /**
   * Phase 4E: the image is one sampled still from a customer video (label
   * "Video 1 @ 00:04.2"). Uses the frame instructions, which add the
   * single-frame rule: nothing about movement or behaviour over time.
   */
  frame?: boolean;
}

export interface ObservePhotoResult {
  /** Untrusted until validatePhotoObservation() accepts it (po-1). */
  content: unknown;
  usage: ProviderUsage;
  outputIssue?: "incomplete_output" | "malformed_json";
}

export interface NormalisedImage {
  bytes: Uint8Array;
  mimeType: "image/jpeg";
  width: number;
  height: number;
}

export type NormalisedImageResult =
  | { ok: true; image: NormalisedImage; derivative: { width: number; height: number; bytes: number; sha256: string; normaliser: string } }
  | { ok: false; outcome: "SKIPPED" | "FAILED"; code: string };

/** Turns original bytes into a privacy-minimised derivative (server/image-normaliser.ts). */
export type ImageNormaliser = (bytes: Uint8Array, mimeType: string) => Promise<NormalisedImageResult>;

/** One frame decoded by the media worker at (or just after) a requested instant. */
export interface VideoFrame {
  requestedAt: number;
  /** Presentation time of the decoded frame, seconds from the start of the video. */
  at: number;
  /** Lossless PNG of the frame, upright, SDR; no metadata. Memory-only. */
  png: Uint8Array;
}

/**
 * One isolated worker session over one video's bytes (Phase 4E). The worker
 * receives the bytes only — under a neutral file name, with no identifiers,
 * credentials or URLs — and has no network access.
 */
export interface VideoWorkerSession {
  /** ffprobe's JSON (streams + format), or null if the file can't be parsed. */
  probe(): Promise<unknown | null>;
  /** Scene-change instants (score ≥ threshold) within the first `maxSeconds`; null if the pass failed. */
  sceneCandidates(maxSeconds: number): Promise<{ at: number; score: number }[] | null>;
  extractFrames(timestamps: number[], options: { hdr: boolean }): Promise<VideoFrame[]>;
  /** Mono 16 kHz AAC (.m4a) of the first audio track, at most `maxSeconds`, no metadata; null if none decodable. */
  extractAudio(maxSeconds: number): Promise<Uint8Array | null>;
}

export interface VideoProcessor {
  /** e.g. "vercel-sandbox", "local-ffmpeg". */
  readonly id: string;
  /** Worker identity (build + configuration); part of every video cache key. */
  readonly version: string;
  /**
   * Starts a worker, runs `fn`, and always destroys the worker afterwards —
   * on success, failure or timeout. Throws ServiceAiProviderError when the
   * worker can't be started or a step times out.
   */
  withSession<T>(source: Uint8Array, fn: (session: VideoWorkerSession) => Promise<T>): Promise<{ value: T; usage: ProviderUsage }>;
}

/** 64-bit perceptual (difference) hash of an image, as 16 hex characters. */
export type PerceptualHasher = (image: Uint8Array) => Promise<string>;

/** A media observation as stored in a report (scr-1.2: written by the server from validated photo analysis). */
export interface RawObservation {
  mediaId: string;
  frameAtSeconds: number | null;
  observation: string;
  type: ObservationType;
  certainty: Certainty;
}

export interface SynthesisRequest {
  input: ServiceAiInput;
  /**
   * Validated observations from the per-photo stage, with server-assigned ids
   * and evidence. The report model may only reference them; it never sees
   * the photographs.
   */
  observations: MediaObservation[];
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
  readonly promptVersions: { transcribe: string; observe: string; observeFrame: string; report: string };
  /** SHA-256 of the exact report instructions + schema, recorded on each report (optional). */
  readonly reportPromptHash?: string;
  /** SHA-256 of the exact photo-observation instructions + schema (optional). */
  readonly observePromptHash?: string;
  /** SHA-256 of the exact video-frame instructions + schema (optional). */
  readonly observeFramePromptHash?: string;
  /** Every instruction text this provider sends (Phase 4F): reports may never reproduce them. */
  readonly instructionTexts?: readonly string[];
  transcribe(request: TranscribeRequest): Promise<TranscribeResult>;
  /** Phase 4D: one normalised photo (or, 4E, one video frame) in, untrusted po-1 JSON out. */
  observePhoto(request: ObservePhotoRequest): Promise<ObservePhotoResult>;
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
