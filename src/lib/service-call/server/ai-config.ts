// AI processing configuration (server-only). See docs/service-aftercare/AI.md.
import "server-only";
import type { ServiceAiProvider } from "../ai/provider";
import { createStubServiceAiProvider } from "../ai/stub-provider";
import { createOpenAiProvider, DEFAULT_TRANSCRIBE_MODEL, REPORT_REASONING_EFFORTS } from "./openai-provider";

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
  /** Lease per claim; renewed before and after every step. */
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

export type ProviderResolution =
  | { ok: true; provider: ServiceAiProvider }
  | { ok: false; reason: "provider_not_selected" | "openai_key_missing" | "stub_not_allowed_in_production" | "unknown_provider" };

/**
 * Picks the provider. Fails closed: there is no default, so a missing or
 * incomplete configuration means AI processing does not run (customers are
 * unaffected — finalize still answers 202).
 *
 *   SERVICE_AI_PROVIDER=openai  requires OPENAI_API_KEY; models from
 *                               SERVICE_AI_MODEL_TRANSCRIBE (default gpt-transcribe) and
 *                               SERVICE_AI_MODEL_REPORT and SERVICE_AI_MODEL_VISION
 *                               (default gpt-6.1-sol); reasoning
 *                               effort SERVICE_AI_REPORT_REASONING (default low)
 *   SERVICE_AI_PROVIDER=stub    deterministic placeholder; refused in Production
 */
export function resolveServiceAiProvider(env: NodeJS.ProcessEnv = process.env): ProviderResolution {
  const choice = env.SERVICE_AI_PROVIDER?.trim().toLowerCase() ?? "";
  if (!choice) return { ok: false, reason: "provider_not_selected" };
  if (choice === "stub") {
    if (env.VERCEL_ENV === "production") return { ok: false, reason: "stub_not_allowed_in_production" };
    return { ok: true, provider: createStubServiceAiProvider() };
  }
  if (choice === "openai") {
    const apiKey = env.OPENAI_API_KEY?.trim();
    if (!apiKey) return { ok: false, reason: "openai_key_missing" };
    const model = env.SERVICE_AI_MODEL_TRANSCRIBE?.trim() || DEFAULT_TRANSCRIBE_MODEL;
    const reportModel = env.SERVICE_AI_MODEL_REPORT?.trim() || undefined;
    const visionModel = env.SERVICE_AI_MODEL_VISION?.trim() || undefined;
    const effort = env.SERVICE_AI_REPORT_REASONING?.trim().toLowerCase();
    const reportReasoning = (REPORT_REASONING_EFFORTS as readonly string[]).includes(effort ?? "") ? (effort as (typeof REPORT_REASONING_EFFORTS)[number]) : undefined;
    return { ok: true, provider: createOpenAiProvider({ apiKey, transcribeModel: model, reportModel, reportReasoning, visionModel }) };
  }
  return { ok: false, reason: "unknown_provider" };
}
