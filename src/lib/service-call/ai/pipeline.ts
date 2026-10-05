// Processes one claimed run: evidence → per-media steps (cached) → report
// synthesis → validation → versioned report. Vendor-free: storage and the AI
// provider are injected (run-store.ts, provider.ts).
//
// Guarantees:
//   - never writes to the service request (the store has no such method);
//   - the provider sees only buildServiceAiInput() output and, per photo, one
//     privacy-minimised in-memory derivative — never contact details,
//     references, tokens, URLs, original files or file names;
//   - photo observations come only from the per-photo stage, carry the exact
//     photo they came from, and are injected into the report by the server
//     (the report model can reference them, never write or alter them);
//   - nothing is stored as a report unless validateReportContent() accepts it;
//   - one file failing makes the report PARTIAL, not the run FAILED;
//   - a lost lease abandons the run without writing anything.
import { createHash } from "node:crypto";
import { computeInputFingerprint, mediaInputHash } from "./fingerprint";
import { validatePhotoObservation, PHOTO_OBSERVATION_SCHEMA_VERSION, type PhotoObservationResult } from "./photo-observation-schema";
import { buildServiceAiInput, labelEvidence, type TranscriptForAi } from "./input-builder";
import { ServiceAiProviderError, type ImageNormaliser, type MediaReader, type ProviderUsage, type ServiceAiProvider } from "./provider";
import { MAX_CONFIDENCE_PHASE_4C, REPORT_SCHEMA_VERSION, type MediaObservation, type PhotoAssessment, type ServiceCallReport, type UrgencyIndicator } from "./report-schema";
import { validateReportContent, withMandatoryUnknowns, type ValidationContext } from "./report-validation";
import { RunNotOwnedError, type AiRun, type AiRunStore, type RequestContext } from "./run-store";
import { detectSafetyFlags } from "./safety";
import { assessTranscriptCompleteness } from "./transcript-quality";

export const PIPELINE_VERSION = "4d.1";
/** Run error code when the provider has no report synthesis (see AI.md). */
export const REPORT_STAGE_UNAVAILABLE = "report_stage_not_available";
/** Run error code when there is no customer text or usable transcript to report on (no model call). */
export const INSUFFICIENT_TEXT = "insufficient_text_for_report";

/** Fixed wording for server-written evidence notices (scr-1.1). */
const NOTICE_TEXT = {
  TRANSCRIPT_MAY_BE_INCOMPLETE: "The transcript may be incomplete (advisory signal, not proof). Listen to the original recording, which is the authoritative evidence.",
  NO_SPEECH_DETECTED: "No speech was recognised in this recording. Listen to the original recording.",
  NOT_ANALYSED: "This file was not analysed in this phase; nothing in the report describes its contents.",
  PHOTO_LIMITED_QUALITY: "This photo's quality limits what can be seen; observations from it are tentative.",
  PHOTO_NOT_RELEVANT: "This photo does not appear to show the reported product; it was not used as evidence of the issue.",
  PHOTO_DUPLICATE: "This photo is an exact duplicate of another photo in the request and was analysed once.",
  PHOTO_BLANK: "This photo appears blank or nearly blank; nothing could be observed.",
} as const;
/** Synthesis attempts per run when output fails validation. */
const SYNTHESIS_ATTEMPTS = 2;
/** Per-photo observation attempts when output fails validation. */
const OBSERVATION_ATTEMPTS = 2;

export interface PipelineDeps {
  store: AiRunStore;
  provider: ServiceAiProvider;
  worker: string;
  leaseSeconds: number;
  readMedia: MediaReader;
  /** Builds the in-memory derivative a vision model may see (server/image-normaliser.ts). */
  normaliseImage: ImageNormaliser;
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
    const photos: { mediaId: string; label: string; analysis: PhotoObservationResult }[] = [];
    /** SHA-256 of original photo bytes already seen in this request → label (exact-duplicate detection). */
    const seenPhotos = new Map<string, string>();

    for (const media of ctx.media) {
      await keepLease();
      const label = labels.get(media.id)!;
      const step = await processMedia(media, label, ctx, deps, run, { addUsage, count, lastAttempt, seenPhotos });
      coverage.push({ mediaId: media.id, label, type: media.type, outcome: step.outcome, reasonCode: step.reasonCode });
      if (step.transcript) transcripts.push(step.transcript);
      if (step.photo) photos.push({ mediaId: media.id, label, analysis: step.photo });
    }
    await keepLease();

    // scr-1.2: the report's media observations are exactly the validated
    // photo observations, each tied by the server to the photo it came from.
    const observations: MediaObservation[] = [];
    for (const p of photos) {
      for (const o of p.analysis.observations) {
        observations.push({
          id: `ob-${observations.length + 1}`,
          evidence: { mediaId: p.mediaId, label: p.label, frameAtSeconds: null },
          observation: o.location ? `${o.location}: ${o.observation}` : o.observation,
          type: o.type,
          certainty: o.certainty,
          relatesToSymptomRefs: [],
        });
      }
    }

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
        // The model must return no observations of its own; the server inserts
        // the validated ones so references to them can be checked.
        const raw = res.content;
        const own = isRecord(raw) && Array.isArray(raw.mediaObservations) ? raw.mediaObservations.length : 0;
        const candidate = isRecord(raw) ? { ...raw, mediaObservations: observations } : raw;
        const checked = validateReportContent(withMandatoryUnknowns(candidate), validationContext);
        if (checked.ok && own === 0) content = checked.value;
        else {
          lastIssue = "invalid_output";
          lastErrors = [...(own > 0 ? ["mediaObservations: must_be_server_provided"] : []), ...(checked.ok ? [] : checked.errors)];
        }
      }
      await keepLease();
    }
    if (!content) throw new RunFailure(lastIssue, false, { validationErrors: lastErrors.slice(0, 20) });

    const status = coverage.every((c) => c.outcome === "ANALYSED") ? "COMPLETED" : "PARTIAL";
    const transcriptByMedia = new Map(transcripts.map((t) => [t.mediaId, t]));
    const evidenceNotices: ServiceCallReport["evidenceNotices"] = [];
    const photoByMedia = new Map(photos.map((p) => [p.mediaId, p.analysis]));
    for (const c of coverage) {
      const t = transcriptByMedia.get(c.mediaId);
      const photo = photoByMedia.get(c.mediaId);
      const notice = (code: keyof typeof NOTICE_TEXT) => evidenceNotices.push({ mediaId: c.mediaId, label: c.label, code, message: NOTICE_TEXT[code] });
      if (c.outcome !== "ANALYSED") {
        if (c.reasonCode?.startsWith("duplicate_of_")) notice("PHOTO_DUPLICATE");
        else if (c.reasonCode === "image_blank") notice("PHOTO_BLANK");
        else notice("NOT_ANALYSED");
      } else if (t?.noSpeechDetected) notice("NO_SPEECH_DETECTED");
      else if (t?.possiblyIncomplete) notice("TRANSCRIPT_MAY_BE_INCOMPLETE");
      else if (photo) {
        if (photo.photo.quality !== "CLEAR") notice("PHOTO_LIMITED_QUALITY");
        if (photo.photo.relevance === "NOT_RELEVANT") notice("PHOTO_NOT_RELEVANT");
      }
    }
    const photoAssessments: PhotoAssessment[] = photos.map((p) => ({
      mediaId: p.mediaId,
      label: p.label,
      ...p.analysis.photo,
      cannotDetermine: p.analysis.cannotDetermine,
    }));
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
      photoAssessments,
      content,
    };

    const failures = coverage.filter((c) => c.outcome !== "ANALYSED").map((c) => ({ mediaId: c.mediaId, outcome: c.outcome, reasonCode: c.reasonCode }));
    try {
      const saved = await store.complete({
        runId: run.id, worker, status, inputFingerprint,
        provider: provider.id,
        models: {
          ...provider.models,
          reportPromptVersion: provider.promptVersions.report,
          observePromptVersion: provider.promptVersions.observe,
          ...(provider.reportPromptHash ? { reportPromptHash: provider.reportPromptHash } : {}),
          ...(provider.observePromptHash ? { observePromptHash: provider.observePromptHash } : {}),
        },
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
  photo?: PhotoObservationResult;
}

type Tally = { addUsage: (u: ProviderUsage) => void; count: (k: string) => void; lastAttempt: boolean; seenPhotos: Map<string, string> };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const sha256 = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

async function processMedia(
  media: RequestContext["media"][number],
  label: string,
  ctx: RequestContext,
  deps: PipelineDeps,
  run: AiRun,
  tally: Tally,
): Promise<MediaStep> {
  const { store, provider } = deps;
  if (media.type === "VIDEO") {
    // Frame sampling and video audio arrive in Phase 4E.
    return { outcome: "SKIPPED", reasonCode: "video_processing_not_available" };
  }
  if (media.type === "VOICE" && !provider.capabilities.transcribe) return { outcome: "SKIPPED", reasonCode: "transcription_not_available" };
  if (media.type === "PHOTO") {
    if (!provider.capabilities.observe) return { outcome: "SKIPPED", reasonCode: "image_analysis_not_available" };
    return processPhoto(media, label, ctx, deps, run, tally);
  }
  const kind = "TRANSCRIPT";
  const model = provider.models.transcribe;
  const promptVersion = provider.promptVersions.transcribe;
  const inputHash = mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind, provider: provider.id, model, promptVersion });
  const meta = { provider: provider.id, model, promptVersion, runId: run.id };

  const cached = await store.getAnalysis(media.id, kind, inputHash);
  if (cached?.status === "COMPLETED") {
    tally.count("cacheHits");
    return fromTranscript(media, cached.transcriptText, cached.language, cached.result);
  }

  const read = () => deps.readMedia(media.id);
  try {
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
    return fromTranscript(media, res.text, res.language, result);
  } catch (err) {
    return mediaFailure(err, { media, kind, inputHash, meta, store, tally });
  }
}

/**
 * One photo: original bytes (server-side) → exact-duplicate check → in-memory
 * derivative → one vision call → po-1 validation (one corrective attempt) →
 * cached analysis. The derivative is never stored; the original stays the
 * authoritative evidence.
 */
async function processPhoto(media: RequestContext["media"][number], label: string, ctx: RequestContext, deps: PipelineDeps, run: AiRun, tally: Tally): Promise<MediaStep> {
  const { store, provider } = deps;
  const kind = "IMAGE_OBSERVATIONS";
  const model = provider.models.vision;
  const promptVersion = provider.promptVersions.observe;
  const inputHash = mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind, provider: provider.id, model, promptVersion });
  const meta = { provider: provider.id, model, promptVersion, runId: run.id };

  const cached = await store.getAnalysis(media.id, kind, inputHash);
  if (cached?.status === "COMPLETED" && cached.result?.schema === PHOTO_OBSERVATION_SCHEMA_VERSION) {
    const source = String(cached.result.sourceSha256 ?? "");
    if (source && tally.seenPhotos.has(source)) return { outcome: "SKIPPED", reasonCode: `duplicate_of_${slug(tally.seenPhotos.get(source)!)}` };
    if (source) tally.seenPhotos.set(source, label);
    tally.count("cacheHits");
    const r = cached.result as unknown as PhotoObservationResult;
    return { outcome: "ANALYSED", reasonCode: null, photo: { photo: r.photo, observations: r.observations, cannotDetermine: r.cannotDetermine } };
  }

  const original = await deps.readMedia(media.id);
  const sourceSha256 = sha256(original);
  // Exact duplicate of an earlier photo in this request: analysed once (not cached as its own result).
  const firstLabel = tally.seenPhotos.get(sourceSha256);
  if (firstLabel) return { outcome: "SKIPPED", reasonCode: `duplicate_of_${slug(firstLabel)}` };
  tally.seenPhotos.set(sourceSha256, label);

  const normalised = await deps.normaliseImage(original, media.mimeType);
  if (!normalised.ok) {
    await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status: normalised.outcome, result: { sourceSha256 }, transcriptText: null, language: null, errorCode: normalised.code, usage: {}, ...meta });
    return { outcome: normalised.outcome, reasonCode: normalised.code };
  }

  let value: PhotoObservationResult | null = null;
  let lastErrors: string[] = [];
  for (let i = 0; i < OBSERVATION_ATTEMPTS && !value; i++) {
    tally.count("observeCalls");
    if (i > 0) tally.count("observeCorrectiveAttempts");
    let res;
    try {
      res = await provider.observePhoto({ label, productCategories: ctx.request.productCategories, image: normalised.image, correction: i > 0 ? lastErrors.slice(0, 20) : undefined });
    } catch (err) {
      return mediaFailure(err, { media, kind, inputHash, meta, store, tally });
    }
    tally.addUsage(res.usage);
    if (res.outputIssue) {
      lastErrors = [`response: ${res.outputIssue}`];
      continue;
    }
    const checked = validatePhotoObservation(res.content);
    if (checked.ok) value = checked.value;
    else lastErrors = checked.errors;
  }
  if (!value) {
    await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status: "FAILED", result: { sourceSha256, validationErrors: lastErrors.slice(0, 20) }, transcriptText: null, language: null, errorCode: "invalid_observation", usage: {}, ...meta });
    return { outcome: "FAILED", reasonCode: "invalid_observation" };
  }
  const result = { schema: PHOTO_OBSERVATION_SCHEMA_VERSION, ...value, derivative: normalised.derivative, sourceSha256 };
  await store.recordAnalysis({ mediaId: media.id, kind, inputHash, status: "COMPLETED", result, transcriptText: null, language: null, errorCode: null, usage: {}, ...meta });
  return { outcome: "ANALYSED", reasonCode: null, photo: value };
}

/** Provider error on one file: stop/requeue the run, or record the file as FAILED/SKIPPED. */
async function mediaFailure(
  err: unknown,
  a: { media: RequestContext["media"][number]; kind: "TRANSCRIPT" | "IMAGE_OBSERVATIONS"; inputHash: string; meta: { provider: string; model: string; promptVersion: string; runId: string }; store: AiRunStore; tally: Tally },
): Promise<MediaStep> {
  if (!(err instanceof ServiceAiProviderError)) throw err;
  // Provider-wide problems (e.g. rejected credentials) stop the run; they say nothing about this file.
  if (err.scope === "run") throw new RunFailure(err.code, err.retryable);
  if (err.retryable && !a.tally.lastAttempt) throw new RunFailure(err.code, true);
  const status = err.skipped ? "SKIPPED" : "FAILED";
  await a.store.recordAnalysis({ mediaId: a.media.id, kind: a.kind, inputHash: a.inputHash, status, result: null, transcriptText: null, language: null, errorCode: err.code, usage: {}, ...a.meta });
  return { outcome: status, reasonCode: err.code };
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

function fromTranscript(media: RequestContext["media"][number], text: string | null, language: string | null, result: Record<string, unknown> | null): MediaStep {
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
