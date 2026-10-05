// What the AI pipeline needs from storage. The Supabase implementation is
// server/ai-store.ts; tests use an in-memory fake. Every state change goes
// through database functions (supabase/migrations/0003_service_ai.sql), so
// the rules — one active run, lease ownership, version numbering — hold
// whichever worker calls them.
import type { FingerprintMedia } from "./fingerprint";
import type { KnownPersonalData, RequestForAi } from "./input-builder";
import type { ServiceCallReport } from "./report-schema";

export type AiRunStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED";
export type AiRunTrigger = "FINALIZE" | "SWEEP" | "MANUAL";
/** Request-level view: NOT_STARTED when there are no runs. */
export type AiProcessingStatus = "NOT_STARTED" | AiRunStatus;
export type AnalysisKind = "TRANSCRIPT" | "IMAGE_OBSERVATIONS" | "VIDEO_OBSERVATIONS";

export interface AiRun {
  id: string;
  serviceRequestId: string;
  runNumber: number;
  trigger: AiRunTrigger;
  status: AiRunStatus;
  inputFingerprint: string;
  pipelineVersion: string;
  promptVersion: string;
  schemaVersion: string;
  provider: string | null;
  models: Record<string, string>;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorCode: string | null;
  errorDetail: Record<string, unknown> | null;
  usage: Record<string, number>;
  requestedBy: string;
  createdAt: string;
}

export interface AiReport {
  id: string;
  serviceRequestId: string;
  runId: string;
  version: number;
  schemaVersion: string;
  processingStatus: "COMPLETED" | "PARTIAL";
  provider: string;
  models: Record<string, string>;
  promptVersion: string;
  pipelineVersion: string;
  inputFingerprint: string;
  aiReport: ServiceCallReport;
  generatedAt: string;
  reviewStatus: "AWAITING_REVIEW" | "APPROVED" | "EDITED" | "REJECTED";
  reviewedReport: unknown | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  supersededAt: string | null;
  supersededBy: string | null;
}

export interface MediaAnalysis {
  mediaId: string;
  kind: AnalysisKind;
  inputHash: string;
  status: "COMPLETED" | "FAILED" | "SKIPPED";
  result: Record<string, unknown> | null;
  transcriptText: string | null;
  language: string | null;
  errorCode: string | null;
}

/** Everything processing may read about one request. */
export interface RequestContext {
  requestId: string;
  reference: string;
  request: RequestForAi;
  /** Contact details — used only to scrub free text, never sent to a provider. */
  known: KnownPersonalData;
  /** UPLOADED media only, oldest first. */
  media: (FingerprintMedia & { durationSeconds: number | null })[];
}

export type EnqueueOutcome = "created" | "active_run_exists" | "already_processed" | "already_failed" | "auto_run_limit_reached";

export class RunNotOwnedError extends Error {
  constructor() {
    super("run_not_owned");
    this.name = "RunNotOwnedError";
  }
}

export interface AiRunStore {
  loadRequestContext(requestId: string): Promise<RequestContext | null>;
  enqueue(args: {
    requestId: string;
    trigger: AiRunTrigger;
    inputFingerprint: string;
    pipelineVersion: string;
    promptVersion: string;
    schemaVersion: string;
    requestedBy: string;
    maxAutoRuns: number;
  }): Promise<{ outcome: EnqueueOutcome; run: AiRun | null }>;
  claim(worker: string, leaseSeconds: number, limit: number): Promise<AiRun[]>;
  extendLease(runId: string, worker: string, leaseSeconds: number): Promise<boolean>;
  /** Throws RunNotOwnedError if the worker no longer holds the run. */
  complete(args: {
    runId: string;
    worker: string;
    status: "COMPLETED" | "PARTIAL";
    inputFingerprint: string;
    provider: string;
    models: Record<string, string>;
    usage: Record<string, number>;
    errorDetail: Record<string, unknown> | null;
    report: ServiceCallReport;
  }): Promise<AiReport>;
  /** Returns null if the worker no longer holds the run. */
  fail(args: { runId: string; worker: string; errorCode: string; errorDetail: Record<string, unknown> | null; retryable: boolean; usage: Record<string, number> }): Promise<AiRun | null>;
  findEligibleRequests(limit: number, idleMinutes: number, maxAgeHours: number): Promise<string[]>;
  getAnalysis(mediaId: string, kind: AnalysisKind, inputHash: string): Promise<MediaAnalysis | null>;
  recordAnalysis(args: MediaAnalysis & { provider: string; model: string; promptVersion: string; usage: Record<string, number>; runId: string }): Promise<MediaAnalysis>;
}

export function deriveAiStatus(runs: Pick<AiRun, "runNumber" | "status">[]): AiProcessingStatus {
  if (!runs.length) return "NOT_STARTED";
  return [...runs].sort((a, b) => b.runNumber - a.runNumber)[0].status;
}
