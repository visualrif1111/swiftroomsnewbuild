// Entry points for AI processing (server-only): enqueue, run claimed work,
// and sweep for requests nobody finalized. Every entry point respects the
// SERVICE_AI_ENABLED kill switch, and none of them touches the service
// request's own status or data.
import "server-only";
import { randomUUID } from "node:crypto";
import { computeInputFingerprint } from "../ai/fingerprint";
import { PIPELINE_VERSION, processRun, type RunOutcome } from "../ai/pipeline";
import { REPORT_SCHEMA_VERSION } from "../ai/report-schema";
import type { AiRun, AiRunStore, AiRunTrigger, EnqueueOutcome } from "../ai/run-store";
import type { ServiceAiProvider } from "../ai/provider";
import { AI_LIMITS, isServiceAiEnabled, resolveServiceAiProvider, resolveVideoWorker, type ProviderResolution } from "./ai-config";
import { supabaseAiStore } from "./ai-store";
import { NORMALISER_VERSION, normaliseImage, perceptualHash } from "./image-normaliser";
import type { ImageNormaliser, VideoProcessor } from "../ai/provider";

export interface WorkerDeps {
  store: AiRunStore;
  /** The configured provider, or why there isn't one (fail closed). */
  provider: ServiceAiProvider | ProviderResolution;
  readMedia: (mediaId: string) => Promise<Uint8Array>;
  /** Photo derivative builder; defaults to the sharp-based normaliser. */
  normaliseImage?: ImageNormaliser;
  /**
   * Phase 4E media worker. Resolved lazily (only when a run is processed);
   * null = not configured → videos SKIPPED, no sandbox created.
   */
  videoProcessor?: () => VideoProcessor | null;
  enabled: () => boolean;
}

const defaultDeps = (): WorkerDeps => ({
  store: supabaseAiStore,
  provider: resolveServiceAiProvider(),
  readMedia: (id) => supabaseAiStore.readMedia(id),
  videoProcessor: () => {
    const w = resolveVideoWorker();
    if (!w.ok && w.reason === "video_worker_config_invalid") console.error("[service-ai] video worker configuration invalid; videos will be skipped.");
    return w.ok ? w.processor : null;
  },
  enabled: isServiceAiEnabled,
});

/** The usable provider, or why there is none. Logs the reason (never secrets). */
function providerOf(deps: WorkerDeps): { provider: ServiceAiProvider } | { reason: string } {
  const p = deps.provider;
  if ("ok" in p) {
    if (p.ok) return { provider: p.provider };
    console.error(`[service-ai] AI enabled but not configured (${p.reason}); nothing will be processed.`);
    return { reason: p.reason };
  }
  return { provider: p };
}

export type EnqueueResult =
  | { outcome: "disabled" | "request_not_found" }
  | { outcome: "not_configured"; reason: string }
  | { outcome: EnqueueOutcome; run: AiRun | null };

/** Queues processing for one request. Idempotent for automatic triggers. */
export async function enqueueAiProcessing(
  requestId: string,
  trigger: AiRunTrigger,
  requestedBy: string,
  deps: WorkerDeps = defaultDeps(),
): Promise<EnqueueResult> {
  if (!deps.enabled()) return { outcome: "disabled" };
  const resolved = providerOf(deps);
  if ("reason" in resolved) return { outcome: "not_configured", reason: resolved.reason };
  const ctx = await deps.store.loadRequestContext(requestId);
  if (!ctx) return { outcome: "request_not_found" };
  return deps.store.enqueue({
    requestId,
    trigger,
    inputFingerprint: computeInputFingerprint(ctx.request, ctx.media),
    pipelineVersion: PIPELINE_VERSION,
    // The run's prompt version is the report prompt's (AI.md § Versions).
    promptVersion: resolved.provider.promptVersions.report,
    schemaVersion: REPORT_SCHEMA_VERSION,
    requestedBy,
    maxAutoRuns: AI_LIMITS.maxAutoRunsPerRequest,
  });
}

/** Claims and processes up to `limit` runs (queued or with expired leases). */
export async function runAiWorker(limit: number, deps: WorkerDeps = defaultDeps()): Promise<{ enabled: boolean; configured?: false; results: RunOutcome[] }> {
  if (!deps.enabled()) return { enabled: false, results: [] };
  const resolved = providerOf(deps);
  // Fail closed: nothing is claimed, so queued runs simply wait for a valid configuration.
  if ("reason" in resolved) return { enabled: true, configured: false, results: [] };
  const worker = `worker-${randomUUID()}`;
  const runs = await deps.store.claim(worker, AI_LIMITS.leaseSeconds, Math.max(0, Math.min(limit, 10)));
  const results: RunOutcome[] = [];
  const processor = runs.length ? (deps.videoProcessor?.() ?? null) : null;
  for (const run of runs) {
    results.push(
      await processRun(run, {
        store: deps.store, provider: resolved.provider, worker, leaseSeconds: AI_LIMITS.leaseSeconds,
        readMedia: deps.readMedia, normaliseImage: deps.normaliseImage ?? normaliseImage,
        ...(processor ? { video: { processor, perceptualHash, normaliserVersion: NORMALISER_VERSION } } : {}),
      }),
    );
  }
  return { enabled: true, results };
}

/** Finds settled, unprocessed requests, queues them, then processes a bounded batch. */
export async function sweepAi(deps: WorkerDeps = defaultDeps()) {
  if (!deps.enabled()) return { enabled: false, enqueued: [] as { requestId: string; outcome: string }[], results: [] as RunOutcome[] };
  if ("reason" in providerOf(deps)) return { enabled: true, configured: false, enqueued: [], results: [] };
  const ids = await deps.store.findEligibleRequests(AI_LIMITS.sweepEnqueueLimit, AI_LIMITS.idleMinutes, AI_LIMITS.maxAgeHours);
  const enqueued: { requestId: string; outcome: string }[] = [];
  for (const id of ids) enqueued.push({ requestId: id, outcome: (await enqueueAiProcessing(id, "SWEEP", "system", deps)).outcome });
  const { results } = await runAiWorker(AI_LIMITS.runsPerInvocation, deps);
  return { enabled: true, enqueued, results };
}
