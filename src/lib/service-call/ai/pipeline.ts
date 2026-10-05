// Processes one claimed run: evidence → per-media steps (cached) → report
// synthesis → validation → versioned report. Vendor-free: storage and the AI
// provider are injected (run-store.ts, provider.ts).
//
// Guarantees:
//   - never writes to the service request (the store has no such method);
//   - the provider sees only buildServiceAiInput() output and media bytes —
//     never contact details, references, tokens or URLs;
//   - nothing is stored as a report unless validateReportContent() accepts it;
//   - one file failing makes the report PARTIAL, not the run FAILED;
//   - a lost lease abandons the run without writing anything.
import { computeInputFingerprint, mediaInputHash } from "./fingerprint";
import { buildServiceAiInput, labelEvidence, type TranscriptForAi } from "./input-builder";
import { ServiceAiProviderError, type MediaReader, type ProviderUsage, type RawObservation, type ServiceAiProvider } from "./provider";
import { MAX_CONFIDENCE_PHASE_4C, REPORT_SCHEMA_VERSION, type ServiceCallReport, type UrgencyIndicator } from "./report-schema";
import { validateReportContent, withMandatoryUnknowns, type ValidationContext } from "./report-validation";
import { RunNotOwnedError, type AiRun, type AiRunStore, type RequestContext } from "./run-store";
import { detectSafetyFlags } from "./safety";
import { assessTranscriptCompleteness } from "./transcript-quality";

export const PIPELINE_VERSION = "4c.1";
/** Run error code when the provider has no report synthesis (see AI.md). */
export const REPORT_STAGE_UNAVAILABLE = "report_stage_not_available";
/** Run error code when there is no customer text or usable transcript to report on (no model call). */
export const INSUFFICIENT_TEXT = "insufficient_text_for_report";

/** Fixed wording for server-written evidence notices (scr-1.1). */
const NOTICE_TEXT = {
  TRANSCRIPT_MAY_BE_INCOMPLETE: "The transcript may be incomplete (advisory signal, not proof). Listen to the original recording, which is the authoritative evidence.",
  NO_SPEECH_DETECTED: "No speech was recognised in this recording. Listen to the original recording.",
  NOT_ANALYSED: "This file was not analysed in this phase; nothing in the report describes its contents.",
} as const;
/** Synthesis attempts per run when output fails validation. */
const SYNTHESIS_ATTEMPTS = 2;

export interface PipelineDeps {
  store: AiRunStore;
  provider: ServiceAiProvider;
  worker: string;
  leaseSeconds: number;
  readMedia: MediaReader;
}

export type RunOutcome =
  | { runId: string; outcome: "COMPLETED" | "PARTIAL"; reportVersion: number }
  /** The provider can't synthesise reports yet (Phase 4B): evidence was prepared and cached, no report. */
  | { runId: string; outcome: "EVIDENCE_PREPARED"; errorCode: string }
  | { runId: string; outcome: "FAILED" | "REQUEUED"; errorCode: string }
  | { runId: string; outcome: "LOST_LEASE" };

class LostLease extends Error {}
class RunFailure extends Error {
  constructor(public readonly code: string, public readonly retryable: boolean, public readonly detail: Record<string, unknown> | null = null) {
    super(code);
  }
}

export async function processRun(run: AiRun, deps: PipelineDeps): Promise<RunOutcome> {
  const { store, provider, worker } = deps;
  const usage: Record<string, number> = {};
  const addUsage = (u: ProviderUsage) => Object.entries(u).forEach(([k, v]) => (usage[k] = (usage[k] ?? 0) + (Number.isFinite(v) ? v : 0)));
  const count = (k: string) => (usage[k] = (usage[k] ?? 0) + 1);
  const keepLease = async () => {
    if (!(await store.extendLease(run.id, worker, deps.leaseSeconds))) throw new LostLease();
  };
  // On the last allowed attempt a provider outage on one file no longer
  // blocks the whole report: that file is reported as not processed instead.
  const lastAttempt = run.attempts >= run.maxAttempts;

  try {
    const ctx = await store.loadRequestContext(run.serviceRequestId);
    if (!ctx) throw new RunFailure("request_not_found", false);
    const inputFingerprint = computeInputFingerprint(ctx.request, ctx.media);
    const labels = labelEvidence(ctx.media.map((m) => ({ mediaId: m.id, type: m.type, durationSeconds: m.durationSeconds })));

    const coverage: ServiceCallReport["processing"]["mediaCoverage"] = [];
    const transcripts: TranscriptForAi[] = [];
    const observations: (RawObservation & { label: string })[] = [];

    for (const media of ctx.media) {
      await keepLease();
      const label = labels.get(media.id)!;
      const step = await processMedia(media, label, ctx, deps, run, { addUsage, count, lastAttempt });
      coverage.push({ mediaId: media.id, label, type: media.type, outcome: step.outcome, reasonCode: step.reasonCode });
      if (step.transcript) transcripts.push(step.transcript);
      if (step.observations) observations.push(...step.observations.map((o) => ({ ...o, label })));
    }
    await keepLease();

    if (!provider.capabilities.synthesise) {
      // Phase 4B: transcripts are prepared and cached for when report
      // synthesis exists (4C). No report is produced; the run ends with an
      // explicit, non-retryable reason so automatic triggers don't repeat it.
      const detail = { stage: "report", media: coverage.map((c) => ({ mediaId: c.mediaId, type: c.type, outcome: c.outcome, reasonCode: c.reasonCode })) };
      const updated = await store.fail({ runId: run.id, worker, errorCode: REPORT_STAGE_UNAVAILABLE, errorDetail: detail, retryable: false, usage });
      if (!updated) return { runId: run.id, outcome: "LOST_LEASE" };
      return { runId: run.id, outcome: "EVIDENCE_PREPARED", errorCode: REPORT_STAGE_UNAVAILABLE };
    }

    const analysed = new Set(coverage.filter((c) => c.outcome === "ANALYSED").map((c) => c.mediaId));
    const input = buildServiceAiInput(
      ctx.request,
      ctx.media.map((m) => ({ mediaId: m.id, type: m.type, durationSeconds: m.durationSeconds, analysed: analysed.has(m.id) })),
      transcripts,
      ctx.known,
    );

    // D3: nothing the customer said in words → no model call, no report.
    const usableText = input.request.description.trim().length > 0 || input.transcripts.some((t) => t.text.trim().length > 0);
    if (!usableText) {
      const detail = { stage: "report", media: coverage.map((c) => ({ mediaId: c.mediaId, type: c.type, outcome: c.outcome, reasonCode: c.reasonCode })) };
      const updated = await store.fail({ runId: run.id, worker, errorCode: INSUFFICIENT_TEXT, errorDetail: detail, retryable: false, usage });
      if (!updated) return { runId: run.id, outcome: "LOST_LEASE" };
      return { runId: run.id, outcome: "EVIDENCE_PREPARED", errorCode: INSUFFICIENT_TEXT };
    }

    const safetyFlags: ServiceCallReport["safetyFlags"] = [];
    const flag = (indicators: UrgencyIndicator[], matchedIn: "DESCRIPTION" | "TRANSCRIPT") =>
      indicators.forEach((indicator) => safetyFlags.some((f) => f.indicator === indicator) || safetyFlags.push({ indicator, matchedIn }));
    flag(detectSafetyFlags(ctx.request.problemDescription ?? ""), "DESCRIPTION");
    transcripts.forEach((t) => flag(detectSafetyFlags(t.text), "TRANSCRIPT"));

    const validationContext: ValidationContext = {
      evidence: ctx.media.map((m) => ({ mediaId: m.id, type: m.type, analysed: analysed.has(m.id), durationSeconds: m.durationSeconds })),
      safetyFlags: safetyFlags.map((f) => f.indicator),
      // Quotes are checked against exactly what the model was given.
      sources: {
        description: input.request.description,
        transcripts: input.transcripts.map((t) => ({ mediaId: t.mediaId, text: t.text, possiblyIncomplete: t.possiblyIncomplete })),
      },
      visualAnalysis: provider.capabilities.observe,
      maxConfidence: MAX_CONFIDENCE_PHASE_4C,
    };

    // At most two attempts: the second (D5) carries only our own rule codes.
    let content: ServiceCallReport["content"] | null = null;
    let lastErrors: string[] = [];
    let lastIssue: "invalid_output" | "incomplete_output" = "invalid_output";
    for (let i = 0; i < SYNTHESIS_ATTEMPTS && !content; i++) {
      count("synthesisCalls");
      if (i > 0) count("synthesisCorrectiveAttempts");
      let res;
      try {
        res = await provider.synthesiseReport({ input, observations, correction: i > 0 ? lastErrors.slice(0, 20) : undefined });
      } catch (err) {
        if (err instanceof ServiceAiProviderError) throw new RunFailure(err.code, err.retryable);
        throw err;
      }
      addUsage(res.usage);
      if (res.outputIssue) {
        lastIssue = res.outputIssue === "incomplete_output" ? "incomplete_output" : "invalid_output";
        lastErrors = [`response: ${res.outputIssue}`];
      } else {
        const checked = validateReportContent(withMandatoryUnknowns(res.content), validationContext);
        if (checked.ok) content = checked.value;
        else {
          lastIssue = "invalid_output";
          lastErrors = checked.errors;
        }
      }
      await keepLease();
    }
    if (!content) throw new RunFailure(lastIssue, false, { validationErrors: lastErrors.slice(0, 20) });

    const status = coverage.every((c) => c.outcome === "ANALYSED") ? "COMPLETED" : "PARTIAL";
    const transcriptByMedia = new Map(transcripts.map((t) => [t.mediaId, t]));
    const evidenceNotices: ServiceCallReport["evidenceNotices"] = [];
    for (const c of coverage) {
      const t = transcriptByMedia.get(c.mediaId);
      const notice = (code: keyof typeof NOTICE_TEXT) => evidenceNotices.push({ mediaId: c.mediaId, label: c.label, code, message: NOTICE_TEXT[code] });
      if (c.outcome !== "ANALYSED") notice("NOT_ANALYSED");
      else if (t?.noSpeechDetected) notice("NO_SPEECH_DETECTED");
      else if (t?.possiblyIncomplete) notice("TRANSCRIPT_MAY_BE_INCOMPLETE");
    }
    const report: ServiceCallReport = {
      schemaVersion: REPORT_SCHEMA_VERSION,
      serviceReference: ctx.reference,
      processing: { status, mediaCoverage: coverage },
      mediaSummary: {
        photos: ctx.media.filter((m) => m.type === "PHOTO").length,
        videos: ctx.media.filter((m) => m.type === "VIDEO").length,
        voiceNotes: ctx.media.filter((m) => m.type === "VOICE").length,
      },
      // Staff see the transcript as transcribed (not scrubbed) next to the recording.
      transcripts: [...transcriptByMedia.values()].map((t) => ({
        mediaId: t.mediaId, label: labels.get(t.mediaId)!, kind: t.kind, language: t.language, text: t.text, machineGenerated: true as const,
        noSpeechDetected: t.noSpeechDetected ?? false,
        possiblyIncomplete: t.possiblyIncomplete ?? false,
      })),
      safetyFlags,
      evidenceNotices,
      content,
    };

    const failures = coverage.filter((c) => c.outcome !== "ANALYSED").map((c) => ({ mediaId: c.mediaId, outcome: c.outcome, reasonCode: c.reasonCode }));
    try {
      const saved = await store.complete({
        runId: run.id, worker, status, inputFingerprint,
        provider: provider.id,
        models: { ...provider.models, reportPromptVersion: provider.promptVersions.report, ...(provider.reportPromptHash ? { reportPromptHash: provider.reportPromptHash } : {}) },
        usage,
        errorDetail: failures.length ? { media: failures } : null,
        report,
      });
      return { runId: run.id, outcome: status, reportVersion: saved.version };
    } catch (err) {
      if (err instanceof RunNotOwnedError) throw new LostLease();
      throw err;
    }
  } catch (err) {
    if (err instanceof LostLease) return { runId: run.id, outcome: "LOST_LEASE" };
    const failure = err instanceof RunFailure ? err : new RunFailure("internal_error", true);
    if (!(err instanceof RunFailure)) console.error(`[service-ai] run ${run.id} failed:`, err instanceof Error ? err.message : err);
    const updated = await store.fail({
      runId: run.id, worker, errorCode: failure.code, errorDetail: failure.detail, retryable: failure.retryable, usage,
    });
    if (!updated) return { runId: run.id, outcome: "LOST_LEASE" };
    return { runId: run.id, outcome: updated.status === "QUEUED" ? "REQUEUED" : "FAILED", errorCode: failure.code };
  }
}

interface MediaStep {
  outcome: "ANALYSED" | "SKIPPED" | "FAILED";
  reasonCode: string | null;
  transcript?: TranscriptForAi;
  observations?: RawObservation[];
}

async function processMedia(
  media: RequestContext["media"][number],
  label: string,
  ctx: RequestContext,
  deps: PipelineDeps,
  run: AiRun,
  tally: { addUsage: (u: ProviderUsage) => void; count: (k: string) => void; lastAttempt: boolean },
): Promise<MediaStep> {
  const { store, provider } = deps;
  if (media.type === "VIDEO") {
    // Frame sampling and video audio arrive in Phase 4E.
    return { outcome: "SKIPPED", reasonCode: "video_processing_not_available" };
  }
  if (media.type === "VOICE" && !provider.capabilities.transcribe) return { outcome: "SKIPPED", reasonCode: "transcription_not_available" };
  if (media.type === "PHOTO" && !provider.capabilities.observe) return { outcome: "SKIPPED", reasonCode: "image_analysis_not_available" };
  const kind = media.type === "VOICE" ? "TRANSCRIPT" : "IMAGE_OBSERVATIONS";
  const model = media.type === "VOICE" ? provider.models.transcribe : provider.models.vision;
  const promptVersion = media.type === "VOICE" ? provider.promptVersions.transcribe : provider.promptVersions.observe;
  const inputHash = mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind, provider: provider.id, model, promptVersion });
  const meta = { provider: provider.id, model, promptVersion, runId: run.id };

  const cached = await store.getAnalysis(media.id, kind, inputHash);
  if (cached?.status === "COMPLETED") {
    tally.count("cacheHits");
    return fromAnalysis(media, cached.transcriptText, cached.language, cached.result);
  }

  const read = () => deps.readMedia(media.id);
  try {
    if (media.type === "VOICE") {
      tally.count("transcribeCalls");
      const res = await provider.transcribe({ mediaId: media.id, label, mimeType: media.mimeType, read });
      tally.addUsage(res.usage);
      // Duration: as measured by the provider, else as recorded by the browser.
      const duration = res.usage.openaiTranscribeSeconds ?? media.durationSeconds;
      const result = {
        languages: res.languages ?? (res.language ? [res.language] : []),
        noSpeechDetected: !res.text.trim(),
        completeness: assessTranscriptCompleteness(res.text, duration),
      };
      await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status: "COMPLETED", result, transcriptText: res.text, language: res.language, errorCode: null, usage: res.usage, ...meta });
      return fromAnalysis(media, res.text, res.language, result);
    }
    tally.count("observeCalls");
    const res = await provider.observe({ items: [{ mediaId: media.id, label, type: "PHOTO", mimeType: media.mimeType, read }], productCategories: ctx.request.productCategories });
    tally.addUsage(res.usage);
    const own = res.observations.filter((o) => o.mediaId === media.id);
    await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status: "COMPLETED", result: { observations: own }, transcriptText: null, language: null, errorCode: null, usage: res.usage, ...meta });
    return { outcome: "ANALYSED", reasonCode: null, observations: own };
  } catch (err) {
    if (!(err instanceof ServiceAiProviderError)) throw err;
    // Provider-wide problems (e.g. rejected credentials) stop the run; they say nothing about this file.
    if (err.scope === "run") throw new RunFailure(err.code, err.retryable);
    if (err.retryable && !tally.lastAttempt) throw new RunFailure(err.code, true);
    const status = err.skipped ? "SKIPPED" : "FAILED";
    await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status, result: null, transcriptText: null, language: null, errorCode: err.code, usage: {}, ...meta });
    return { outcome: status, reasonCode: err.code };
  }
}

function fromAnalysis(media: RequestContext["media"][number], text: string | null, language: string | null, result: Record<string, unknown> | null): MediaStep {
  if (media.type === "VOICE") {
    return {
      outcome: "ANALYSED",
      reasonCode: null,
      transcript: {
        mediaId: media.id,
        kind: "VOICE_NOTE",
        text: text ?? "",
        language,
        noSpeechDetected: result?.noSpeechDetected === true || !(text ?? "").trim(),
        possiblyIncomplete: (result?.completeness as { possiblyIncomplete?: unknown } | undefined)?.possiblyIncomplete === true,
      },
    };
  }
  const observations = Array.isArray(result?.observations) ? (result.observations as RawObservation[]) : [];
  return { outcome: "ANALYSED", reasonCode: null, observations };
}
