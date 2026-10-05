// AI processing configuration (server-only). See docs/service-aftercare/AI.md.
import "server-only";
import type { ServiceAiProvider } from "../ai/provider";
import { createStubServiceAiProvider } from "../ai/stub-provider";

/**
 * Kill switch. Only an explicit "true"/"1"/"yes"/"on" enables processing;
 * unset, empty, "false" or anything else means disabled. There is no
 * NEXT_PUBLIC_ equivalent: the browser never knows or controls this.
 */
export function isServiceAiEnabled(): boolean {
  return /^(true|1|yes|on)$/i.test(process.env.SERVICE_AI_ENABLED?.trim() ?? "");
}

export const AI_LIMITS = {
  /** Automatic (finalize/sweep) runs per request; MANUAL runs are separate. */
  maxAutoRunsPerRequest: 3,
  /** Lease per claim; renewed after every step. */
  leaseSeconds: 300,
  /** Runs one worker invocation processes (sweep/manual endpoint). */
  runsPerInvocation: 3,
  /** Requests the sweep may enqueue per invocation. */
  sweepEnqueueLimit: 20,
  /** Evidence counts as settled after this long without changes. */
  idleMinutes: 30,
  /** Requests older than this are never picked up automatically (no backfill). */
  maxAgeHours: 72,
} as const;

/**
 * Phase 4A has no real AI provider: the deterministic stub is the only
 * implementation. It makes no network calls and its output is labelled
 * "[STUB]". A real provider replaces this in Phase 4B+.
 */
export function getServiceAiProvider(): ServiceAiProvider {
  return createStubServiceAiProvider();
}
