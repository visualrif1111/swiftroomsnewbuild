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
//   - video (Phase 4E) is parsed and decoded only by the isolated media worker
//     (bytes in; frames and audio out; worker destroyed). Each sampled frame is
//     analysed on its own like a photo and its observations carry the exact
//     video and instant; video speech is transcribed as customer-reported
//     VIDEO_AUDIO. The report model never receives a video, frame or audio;
//   - nothing is stored as a report unless validateReportContent() accepts it;
//   - one file failing makes the report PARTIAL, not the run FAILED;
//   - a lost lease abandons the run without writing anything.
import { createHash } from "node:crypto";
import { computeInputFingerprint, mediaInputHash } from "./fingerprint";
import { validatePhotoObservation, PHOTO_OBSERVATION_SCHEMA_VERSION, type PhotoObservationResult } from "./photo-observation-schema";
import { validateFrameObservation } from "./frame-observation";
import { buildServiceAiInput, labelEvidence, type TranscriptForAi, type VideoCoverage } from "./input-builder";
import { ServiceAiProviderError, type ImageNormaliser, type MediaReader, type PerceptualHasher, type ProviderUsage, type ServiceAiProvider, type VideoProcessor } from "./provider";
import { MAX_CONFIDENCE_PHASE_4C, REPORT_SCHEMA_VERSION, type MediaObservation, type PhotoAssessment, type ServiceCallReport, type UrgencyIndicator, type VideoAssessment } from "./report-schema";
import { validateReportContent, withMandatoryUnknowns, withVideoUnknowns, type ValidationContext } from "./report-validation";
import {
  ANALYSIS_WINDOW_SECONDS, assessProbe, chooseTimestamps, formatTimestamp, frameLabel, hammingDistance, NEAR_DUPLICATE_MAX_DISTANCE,
  roundFrameTime, sceneDetectionApplies, SAMPLING_VERSION, type VideoProbe,
} from "./video-sampling";
import { RunNotOwnedError, type AiRun, type AiRunStore, type RequestContext } from "./run-store";
import { detectSafetyFlags } from "./safety";
import { assessTranscriptCompleteness } from "./transcript-quality";

export const PIPELINE_VERSION = "4f.1";
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
  VIDEO_NOT_SUPPORTED: "This video's format or codec can't be processed; nothing in the report describes its contents. Watch the original video.",
  VIDEO_LIMITED_QUALITY: "Some analysed frames of this video are of limited quality or don't appear to show the product; observations from them are tentative.",
  VIDEO_NO_AUDIO: "No usable audio track was found in this video, so nothing was transcribed. Watch the original video.",
  VIDEO_LONG_SAMPLED_SPARSELY: "This video is longer than the analysis threshold and was only PARTIALLY ANALYSED: a bounded number of still frames across it, and speech up to the threshold. Anything else in it is unknown. Watch the original video.",
  VIDEO_FRAMES_DEDUPLICATED: "Some sampled frames of this video were near-duplicates or blank and were not analysed separately.",
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
  /**
   * Phase 4E: the isolated media worker and frame de-duplication. Absent (not
   * configured): videos are SKIPPED as before, with no worker started.
   */
  video?: { processor: VideoProcessor; perceptualHash: PerceptualHasher; normaliserVersion: string };
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
  // Phase 4F: stage latency, summed per run (ms) — transcribeMs, observeMs, observeFrameMs, synthesisMs, runMs.
  const runStarted = Date.now();
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
    const videos: VideoResult[] = [];
    /** SHA-256 of original photo bytes already seen in this request → label (exact-duplicate detection). */
    const seenPhotos = new Map<string, string>();

    for (const media of ctx.media) {
      await keepLease();
      const label = labels.get(media.id)!;
      const step = await processMedia(media, label, ctx, deps, run, { addUsage, count, lastAttempt, seenPhotos, keepLease });
      coverage.push({ mediaId: media.id, label, type: media.type, outcome: step.outcome, reasonCode: step.reasonCode });
      if (step.transcript) transcripts.push(step.transcript);
      if (step.photo) photos.push({ mediaId: media.id, label, analysis: step.photo });
      if (step.video) videos.push(step.video);
    }
    await keepLease();

    // scr-1.2+: the report's media observations are exactly the validated
    // photo and video-frame observations, each tied by the server to the photo
    // — or the video and exact instant — it came from.
    const observations: MediaObservation[] = [];
    const pushObservations = (analysis: PhotoObservationResult, evidence: MediaObservation["evidence"]) => {
      for (const o of analysis.observations) {
        observations.push({
          id: `ob-${observations.length + 1}`,
          evidence,
          observation: o.location ? `${o.location}: ${o.observation}` : o.observation,
          type: o.type,
          certainty: o.certainty,
          relatesToSymptomRefs: [],
        });
      }
    };
    const photoById = new Map(photos.map((p) => [p.mediaId, p]));
    const videoById = new Map(videos.map((v) => [v.mediaId, v]));
    for (const media of ctx.media) {
      const p = photoById.get(media.id);
      if (p) pushObservations(p.analysis, { mediaId: p.mediaId, label: p.label, frameAtSeconds: null });
      for (const f of videoById.get(media.id)?.analysedFrames ?? []) pushObservations(f.analysis, { mediaId: media.id, label: f.label, frameAtSeconds: f.at });
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
    // A video's duration is the probed one (browsers don't record it for video).
    const durationOf = (m: RequestContext["media"][number]) => videoById.get(m.id)?.probe.durationSeconds ?? m.durationSeconds;
    const input = buildServiceAiInput(
      ctx.request,
      ctx.media.map((m) => ({
        mediaId: m.id, type: m.type, durationSeconds: durationOf(m), analysed: analysed.has(m.id),
        ...(videoById.has(m.id) ? { videoCoverage: videoById.get(m.id)!.coverage } : {}),
      })),
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
      evidence: ctx.media.map((m) => ({
        mediaId: m.id, type: m.type, analysed: analysed.has(m.id), durationSeconds: durationOf(m), label: labels.get(m.id)!,
        ...(m.type === "VIDEO" ? { frameTimes: (videoById.get(m.id)?.analysedFrames ?? []).map((f) => f.at) } : {}),
      })),
      safetyFlags: safetyFlags.map((f) => f.indicator),
      // Quotes are checked against exactly what the model was given.
      sources: {
        description: input.request.description,
        transcripts: input.transcripts.map((t) => ({ mediaId: t.mediaId, text: t.text, possiblyIncomplete: t.possiblyIncomplete })),
      },
      visualAnalysis: provider.capabilities.observe,
      maxConfidence: MAX_CONFIDENCE_PHASE_4C,
      instructions: provider.instructionTexts ?? [],
    };

    // At most two attempts: the second (D5) carries only our own rule codes.
    let content: ServiceCallReport["content"] | null = null;
    let lastErrors: string[] = [];
    let lastIssue: "invalid_output" | "incomplete_output" = "invalid_output";
    for (let i = 0; i < SYNTHESIS_ATTEMPTS && !content; i++) {
      count("synthesisCalls");
      if (i > 0) count("synthesisCorrectiveAttempts");
      let res;
      const t0 = Date.now();
      try {
        res = await provider.synthesiseReport({ input, observations, correction: i > 0 ? lastErrors.slice(0, 20) : undefined });
      } catch (err) {
        if (err instanceof ServiceAiProviderError) throw new RunFailure(err.code, err.retryable);
        throw err;
      }
      addUsage({ ...res.usage, synthesisMs: Date.now() - t0 });
      if (res.outputIssue) {
        lastIssue = res.outputIssue === "incomplete_output" ? "incomplete_output" : "invalid_output";
        lastErrors = [`response: ${res.outputIssue}`];
      } else {
        // The model must return no observations of its own; the server inserts
        // the validated ones so references to them can be checked.
        const raw = res.content;
        const own = isRecord(raw) && Array.isArray(raw.mediaObservations) ? raw.mediaObservations.length : 0;
        const candidate = isRecord(raw) ? { ...raw, mediaObservations: observations } : raw;
        const analysedVideos = videos.filter((v) => v.analysedFrames.length).map((v) => ({ label: v.label, durationSeconds: v.probe.durationSeconds, partiallyAnalysed: v.assessment.partiallyAnalysed }));
        const checked = validateReportContent(withVideoUnknowns(withMandatoryUnknowns(candidate), analysedVideos), validationContext);
        if (checked.ok && own === 0) content = checked.value;
        else {
          lastIssue = "invalid_output";
          lastErrors = [...(own > 0 ? ["mediaObservations: must_be_server_provided"] : []), ...(checked.ok ? [] : checked.errors)];
        }
      }
      await keepLease();
    }
    if (!content) throw new RunFailure(lastIssue, false, { validationErrors: lastErrors.slice(0, 20) });

    // A video counts as fully processed only if every sampled frame and its audio were.
    const videoIncomplete = videos.some((v) => v.assessment.sampling.framesFailed > 0 || v.assessment.audio.status === "FAILED" || v.assessment.partiallyAnalysed);
    const status = coverage.every((c) => c.outcome === "ANALYSED") && !videoIncomplete ? "COMPLETED" : "PARTIAL";
    const transcriptByMedia = new Map(transcripts.map((t) => [t.mediaId, t]));
    const evidenceNotices: ServiceCallReport["evidenceNotices"] = [];
    const photoByMedia = new Map(photos.map((p) => [p.mediaId, p.analysis]));
    for (const c of coverage) {
      const t = transcriptByMedia.get(c.mediaId);
      const photo = photoByMedia.get(c.mediaId);
      const notice = (code: keyof typeof NOTICE_TEXT) => evidenceNotices.push({ mediaId: c.mediaId, label: c.label, code, message: NOTICE_TEXT[code] });
      const video = videoById.get(c.mediaId);
      if (c.outcome !== "ANALYSED") {
        if (c.reasonCode?.startsWith("duplicate_of_")) notice("PHOTO_DUPLICATE");
        else if (c.reasonCode === "image_blank") notice("PHOTO_BLANK");
        else if (c.type === "VIDEO" && VIDEO_UNSUPPORTED_CODES.includes(c.reasonCode ?? "")) notice("VIDEO_NOT_SUPPORTED");
        else notice("NOT_ANALYSED");
      } else if (video) {
        const a = video.assessment;
        if (a.partiallyAnalysed) notice("VIDEO_LONG_SAMPLED_SPARSELY");
        if (a.frames.some((f) => f.outcome === "ANALYSED" && (f.quality !== "CLEAR" || f.relevance === "NOT_RELEVANT"))) notice("VIDEO_LIMITED_QUALITY");
        if (a.sampling.framesDuplicate + a.sampling.framesBlank > 0) notice("VIDEO_FRAMES_DEDUPLICATED");
        if (a.audio.status === "NO_AUDIO" || a.audio.status === "NOT_SUPPORTED") notice("VIDEO_NO_AUDIO");
        if (t?.noSpeechDetected) notice("NO_SPEECH_DETECTED");
        else if (t?.possiblyIncomplete) notice("TRANSCRIPT_MAY_BE_INCOMPLETE");
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
      videoAssessments: videos.map((v) => v.assessment),
      content,
    };

    const failures = coverage.filter((c) => c.outcome !== "ANALYSED").map((c) => ({ mediaId: c.mediaId, outcome: c.outcome, reasonCode: c.reasonCode }));
    usage.runMs = Date.now() - runStarted;
    try {
      const saved = await store.complete({
        runId: run.id, worker, status, inputFingerprint,
        provider: provider.id,
        models: {
          ...provider.models,
          reportPromptVersion: provider.promptVersions.report,
          observePromptVersion: provider.promptVersions.observe,
          observeFramePromptVersion: provider.promptVersions.observeFrame,
          ...(provider.reportPromptHash ? { reportPromptHash: provider.reportPromptHash } : {}),
          ...(provider.observePromptHash ? { observePromptHash: provider.observePromptHash } : {}),
          ...(provider.observeFramePromptHash ? { observeFramePromptHash: provider.observeFramePromptHash } : {}),
          ...(deps.video && videos.length ? { videoWorker: deps.video.processor.version, videoSampling: SAMPLING_VERSION } : {}),
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
  video?: VideoResult;
}

type Tally = { addUsage: (u: ProviderUsage) => void; count: (k: string) => void; lastAttempt: boolean; seenPhotos: Map<string, string>; keepLease: () => Promise<void> };

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
    if (!deps.video) return { outcome: "SKIPPED", reasonCode: "video_processing_not_available" };
    if (!provider.capabilities.observe) return { outcome: "SKIPPED", reasonCode: "image_analysis_not_available" };
    return processVideo(media, label, ctx, deps, run, tally);
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
    const t0 = Date.now();
    const res = await provider.transcribe({ mediaId: media.id, label, mimeType: media.mimeType, read });
    tally.addUsage({ ...res.usage, transcribeMs: Date.now() - t0 });
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
    const t0 = Date.now();
    try {
      res = await provider.observePhoto({ label, productCategories: ctx.request.productCategories, image: normalised.image, correction: i > 0 ? lastErrors.slice(0, 20) : undefined });
    } catch (err) {
      return mediaFailure(err, { media, kind, inputHash, meta, store, tally });
    }
    tally.addUsage({ ...res.usage, observeMs: Date.now() - t0 });
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

function fromTranscript(media: RequestContext["media"][number], text: string | null, language: string | null, result: Record<string, unknown> | null, kind: TranscriptForAi["kind"] = "VOICE_NOTE"): MediaStep {
  return {
    outcome: "ANALYSED",
    reasonCode: null,
    transcript: {
      mediaId: media.id,
      kind,
      text: text ?? "",
      language,
      noSpeechDetected: result?.noSpeechDetected === true || !(text ?? "").trim(),
      possiblyIncomplete: (result?.completeness as { possiblyIncomplete?: unknown } | undefined)?.possiblyIncomplete === true,
    },
  };
}

// ─── Video (Phase 4E) ────────────────────────────────────────────────────────

/** Skip codes reported to staff as "format not supported" rather than "not analysed". */
const VIDEO_UNSUPPORTED_CODES = ["video_container_not_supported", "video_codec_not_supported", "video_resolution_not_supported", "video_no_video_stream"];
/** Version of the extracted-audio recipe (mono 16 kHz AAC, ≤ 180 s): part of the video transcript cache key. */
const VIDEO_AUDIO_VERSION = "va-1";
const PREP_SCHEMA = "vp-1";

interface VideoResult {
  mediaId: string;
  label: string;
  probe: VideoProbe;
  analysedFrames: { at: number; label: string; analysis: PhotoObservationResult }[];
  coverage: VideoCoverage;
  assessment: VideoAssessment;
}

/** Cached preprocessing (kind VIDEO_OBSERVATIONS): probe summary and every sampling decision. Never pixels or audio. */
interface VideoPrep {
  schema: typeof PREP_SCHEMA;
  probe: VideoProbe;
  sampling: { version: string; requested: number[]; sceneDetection: "APPLIED" | "NOT_APPLICABLE" | "FAILED"; sceneCandidates: number; partiallyAnalysed: boolean };
  frames: { requestedAt: number; at: number; outcome: "ANALYSE" | "DUPLICATE" | "BLANK" | "FAILED"; reasonCode: string | null; derivativeSha256: string | null; dhash: string | null }[];
  audio: { status: "EXTRACTED" | "ABSENT" | "NOT_SUPPORTED" | "FAILED"; seconds: number | null };
  worker: { id: string; version: string };
}

type Normalised = Extract<Awaited<ReturnType<ImageNormaliser>>, { ok: true }>;

/**
 * One video. Three independent caches, so unchanged evidence is never
 * reprocessed: preprocessing (VIDEO_OBSERVATIONS), each frame's observations
 * (IMAGE_OBSERVATIONS rows on the video, keyed by instant + derivative) and
 * the video's speech (TRANSCRIPT on the video). The media worker is started
 * only when one of them is missing, and is destroyed before any model call.
 */
async function processVideo(media: RequestContext["media"][number], label: string, ctx: RequestContext, deps: PipelineDeps, run: AiRun, tally: Tally): Promise<MediaStep> {
  const { store, provider } = deps;
  const { processor, perceptualHash, normaliserVersion } = deps.video!;
  const prepHash = mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind: "VIDEO_OBSERVATIONS", provider: processor.id, model: processor.version, promptVersion: `${SAMPLING_VERSION}/${normaliserVersion}` });
  const prepMeta = { provider: processor.id, model: processor.version, promptVersion: `${SAMPLING_VERSION}/${normaliserVersion}`, runId: run.id };
  const frameKey = (f: { at: number; derivativeSha256: string | null }) =>
    mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind: "IMAGE_OBSERVATIONS", provider: provider.id, model: provider.models.vision, promptVersion: provider.promptVersions.observeFrame, variant: `${f.at}:${f.derivativeSha256}` });
  const frameMeta = { provider: provider.id, model: provider.models.vision, promptVersion: provider.promptVersions.observeFrame, runId: run.id };
  const transcriptVersion = `${provider.promptVersions.transcribe}/${VIDEO_AUDIO_VERSION}/${processor.version}`;
  const transcriptHash = mediaInputHash({ mediaId: media.id, fileSize: media.fileSize, kind: "TRANSCRIPT", provider: provider.id, model: provider.models.transcribe, promptVersion: transcriptVersion });
  const transcriptMeta = { provider: provider.id, model: provider.models.transcribe, promptVersion: transcriptVersion, runId: run.id };

  // 1. Preprocessing cache.
  const cachedPrep = await store.getAnalysis(media.id, "VIDEO_OBSERVATIONS", prepHash);
  if (cachedPrep && cachedPrep.status !== "COMPLETED") return { outcome: cachedPrep.status, reasonCode: cachedPrep.errorCode };
  let prep: VideoPrep | null = cachedPrep?.result?.schema === PREP_SCHEMA ? (cachedPrep.result as unknown as VideoPrep) : null;

  // 2. Frame-observation and transcript caches (only knowable once the plan is).
  const cachedFrames = new Map<number, PhotoObservationResult>();
  let cachedTranscript: Awaited<ReturnType<AiRunStore["getAnalysis"]>> = null;
  const loadCaches = async (plan: VideoPrep) => {
    for (const f of plan.frames.filter((x) => x.outcome === "ANALYSE")) {
      const hit = await store.getAnalysis(media.id, "IMAGE_OBSERVATIONS", frameKey(f));
      if (hit?.status === "COMPLETED" && hit.result?.schema === PHOTO_OBSERVATION_SCHEMA_VERSION) {
        const r = hit.result as unknown as PhotoObservationResult;
        cachedFrames.set(f.at, { photo: r.photo, observations: r.observations, cannotDetermine: r.cannotDetermine });
      }
    }
    // Like voice notes and photos, only a COMPLETED result is reused; a failed one is retried.
    if (plan.audio.status === "EXTRACTED" && provider.capabilities.transcribe) {
      const t = await store.getAnalysis(media.id, "TRANSCRIPT", transcriptHash);
      cachedTranscript = t?.status === "COMPLETED" ? t : null;
    }
  };
  if (prep) await loadCaches(prep);
  const missingFrames = (plan: VideoPrep) => plan.frames.filter((f) => f.outcome === "ANALYSE" && !cachedFrames.has(f.at));
  const needAudio = (plan: VideoPrep) => plan.audio.status === "EXTRACTED" && provider.capabilities.transcribe && !cachedTranscript;

  // 3. The isolated worker, only when something is missing. Everything it
  //    returns is in memory; it is destroyed before any model call.
  const images = new Map<number, Normalised>();
  let audioBytes: Uint8Array | null = null;
  let skipped: { outcome: "SKIPPED" | "FAILED"; code: string } | null = null;
  if (!prep || missingFrames(prep).length || needAudio(prep)) {
    const source = await deps.readMedia(media.id);
    let session;
    try {
      session = await processor.withSession(source, async (w) => {
        let plan = prep;
        if (!plan) {
          const json = await w.probe();
          const assessed = json === null ? ({ ok: false, outcome: "FAILED", code: "video_unreadable" } as const) : assessProbe(json);
          if (!assessed.ok) return { skipped: { outcome: assessed.outcome, code: assessed.code } };
          const probe = assessed.probe;
          const window = Math.min(probe.durationSeconds, ANALYSIS_WINDOW_SECONDS);
          // Scene changes refine the grid; if the pass fails, the grid alone is used (and recorded).
          const sceneResult = sceneDetectionApplies(probe.durationSeconds) ? await w.sceneCandidates(window) : [];
          const scene = sceneResult ?? [];
          const sceneDetection = !sceneDetectionApplies(probe.durationSeconds) ? "NOT_APPLICABLE" : sceneResult ? "APPLIED" : "FAILED";
          // Frames exist only within the video track (audio may run longer).
          const requested = chooseTimestamps(Math.min(probe.videoDurationSeconds, probe.durationSeconds), scene);
          const raw = await w.extractFrames(requested, { hdr: probe.hdr });
          const frames: VideoPrep["frames"] = [];
          const kept: { at: number; dhash: string }[] = [];
          for (const f of raw) {
            const at = roundFrameTime(Math.max(0, f.at - probe.startSeconds));
            const n = await deps.normaliseImage(f.png, "image/png");
            if (!n.ok) {
              frames.push({ requestedAt: f.requestedAt, at, outcome: n.code === "image_blank" ? "BLANK" : "FAILED", reasonCode: n.code, derivativeSha256: null, dhash: null });
              continue;
            }
            const dhash = await perceptualHash(n.image.bytes);
            const dup = kept.find((k) => k.at === at || hammingDistance(k.dhash, dhash) <= NEAR_DUPLICATE_MAX_DISTANCE);
            if (dup) {
              frames.push({ requestedAt: f.requestedAt, at, outcome: "DUPLICATE", reasonCode: `near_duplicate_of_${formatTimestamp(dup.at)}`, derivativeSha256: n.derivative.sha256, dhash });
              continue;
            }
            kept.push({ at, dhash });
            frames.push({ requestedAt: f.requestedAt, at, outcome: "ANALYSE", reasonCode: null, derivativeSha256: n.derivative.sha256, dhash });
            images.set(at, n);
          }
          const audioStatus: VideoPrep["audio"]["status"] = probe.audio.status === "ABSENT" ? "ABSENT" : probe.audio.status === "NOT_SUPPORTED" ? "NOT_SUPPORTED" : "EXTRACTED";
          let audio: Uint8Array | null = null;
          if (audioStatus === "EXTRACTED") audio = await w.extractAudio(window);
          plan = {
            schema: PREP_SCHEMA, probe,
            sampling: { version: SAMPLING_VERSION, requested, sceneDetection, sceneCandidates: scene.length, partiallyAnalysed: probe.durationSeconds > ANALYSIS_WINDOW_SECONDS },
            frames,
            audio: { status: audioStatus === "EXTRACTED" && !audio ? "FAILED" : audioStatus, seconds: audioStatus === "EXTRACTED" && audio ? window : null },
            worker: { id: processor.id, version: processor.version },
          };
          return { plan, audio: provider.capabilities.transcribe ? audio : null };
        }
        // Known plan: re-extract exactly the frames (and audio) still missing.
        const wanted = missingFrames(plan);
        const raw = wanted.length ? await w.extractFrames(wanted.map((f) => f.requestedAt), { hdr: plan.probe.hdr }) : [];
        for (const f of wanted) {
          const r = raw.find((x) => x.requestedAt === f.requestedAt);
          const n = r ? await deps.normaliseImage(r.png, "image/png") : null;
          // Same bytes + worker + sampling version → same frame; anything else is never analysed under this key.
          if (n?.ok && n.derivative.sha256 === f.derivativeSha256) images.set(f.at, n);
        }
        const audio = needAudio(plan) ? await w.extractAudio(plan.audio.seconds ?? ANALYSIS_WINDOW_SECONDS) : null;
        return { plan, audio };
      });
    } catch (err) {
      if (!(err instanceof ServiceAiProviderError)) throw err;
      tally.count("videoWorkerFailures");
      // Worker unavailable or timed out: retried by the queue; reported (not cached) on the last attempt.
      if (err.retryable && !tally.lastAttempt) throw new RunFailure(err.code, true);
      return { outcome: "FAILED", reasonCode: err.code };
    }
    tally.addUsage(session.usage);
    const out = session.value;
    if ("skipped" in out && out.skipped) skipped = out.skipped;
    else {
      audioBytes = out.audio ?? null;
      if (!prep) {
        prep = out.plan!;
        await store.recordAnalysis({ mediaId: media.id, kind: "VIDEO_OBSERVATIONS", inputHash: prepHash, status: "COMPLETED", result: prep as unknown as Record<string, unknown>, transcriptText: null, language: null, errorCode: null, usage: session.usage, ...prepMeta });
      }
    }
    await tally.keepLease();
  } else {
    tally.count("cacheHits");
  }

  if (skipped) {
    // Deterministic for these bytes and this worker: cached, so the worker isn't started again for them.
    await store.recordAnalysis({ mediaId: media.id, kind: "VIDEO_OBSERVATIONS", inputHash: prepHash, status: skipped.outcome, result: null, transcriptText: null, language: null, errorCode: skipped.code, usage: {}, ...prepMeta });
    return { outcome: skipped.outcome, reasonCode: skipped.code };
  }
  const plan = prep!;

  // 4. Each frame on its own, exactly like a photo, plus the single-frame temporal rule.
  const frameOutcomes = new Map<number, { outcome: "ANALYSED" | "FAILED"; reasonCode: string | null; analysis?: PhotoObservationResult }>();
  for (const f of plan.frames.filter((x) => x.outcome === "ANALYSE")) {
    const cached = cachedFrames.get(f.at);
    if (cached) {
      tally.count("cacheHits");
      frameOutcomes.set(f.at, { outcome: "ANALYSED", reasonCode: null, analysis: cached });
      continue;
    }
    const image = images.get(f.at);
    if (!image) {
      frameOutcomes.set(f.at, { outcome: "FAILED", reasonCode: "frame_not_reproducible" });
      continue;
    }
    const step = await observeFrame(media, frameLabel(label, f.at), image, frameKey(f), frameMeta, f.at, ctx, deps, tally);
    frameOutcomes.set(f.at, step);
    await tally.keepLease();
  }

  // 5. Video speech: customer-reported, via the Phase 4B transcription path.
  let transcript: TranscriptForAi | undefined;
  let audioStatus: VideoAssessment["audio"]["status"] =
    plan.audio.status === "ABSENT" ? "NO_AUDIO" : plan.audio.status === "NOT_SUPPORTED" ? "NOT_SUPPORTED" : plan.audio.status === "FAILED" ? "FAILED" : provider.capabilities.transcribe ? "TRANSCRIBED" : "NOT_AVAILABLE";
  let audioReason: string | null = plan.audio.status === "FAILED" ? "audio_extraction_failed" : null;
  if (audioStatus === "TRANSCRIBED") {
    const hit = cachedTranscript as Awaited<ReturnType<AiRunStore["getAnalysis"]>>;
    if (hit) {
      tally.count("cacheHits");
      transcript = fromTranscript(media, hit.transcriptText, hit.language, hit.result, "VIDEO_AUDIO").transcript;
    } else if (!audioBytes) {
      audioStatus = "FAILED";
      audioReason = "audio_extraction_failed";
    } else {
      const bytes = audioBytes;
      try {
        tally.count("transcribeCalls");
        const t0 = Date.now();
        const res = await provider.transcribe({ mediaId: media.id, label, mimeType: "audio/mp4", read: async () => bytes });
        tally.addUsage({ ...res.usage, transcribeMs: Date.now() - t0 });
        const seconds = res.usage.openaiTranscribeSeconds ?? plan.audio.seconds;
        const result = {
          languages: res.languages ?? (res.language ? [res.language] : []),
          noSpeechDetected: !res.text.trim(),
          completeness: assessTranscriptCompleteness(res.text, seconds),
          audioSeconds: plan.audio.seconds,
        };
        await store.recordAnalysis({ mediaId: media.id, kind: "TRANSCRIPT", inputHash: transcriptHash, status: "COMPLETED", result, transcriptText: res.text, language: res.language, errorCode: null, usage: res.usage, ...transcriptMeta });
        transcript = fromTranscript(media, res.text, res.language, result, "VIDEO_AUDIO").transcript;
      } catch (err) {
        const step = await mediaFailure(err, { media, kind: "TRANSCRIPT", inputHash: transcriptHash, meta: transcriptMeta, store, tally });
        audioStatus = "FAILED";
        audioReason = step.reasonCode;
      }
    }
    await tally.keepLease();
  }

  // 6. Server-owned assessment: exactly what was, and wasn't, analysed.
  const analysedFrames = plan.frames
    .filter((f) => frameOutcomes.get(f.at)?.outcome === "ANALYSED")
    .map((f) => ({ at: f.at, label: frameLabel(label, f.at), analysis: frameOutcomes.get(f.at)!.analysis! }));
  const frames: VideoAssessment["frames"] = plan.frames.map((f) => {
    const o = frameOutcomes.get(f.at);
    const outcome = f.outcome === "ANALYSE" ? (o?.outcome ?? "FAILED") : f.outcome;
    const a = o?.analysis?.photo;
    return { atSeconds: f.at, label: frameLabel(label, f.at), outcome, reasonCode: f.outcome === "ANALYSE" ? (o?.reasonCode ?? null) : f.reasonCode, quality: a?.quality ?? null, relevance: a?.relevance ?? null };
  });
  const transcribedTo = audioStatus === "TRANSCRIBED" && transcript ? plan.audio.seconds : null;
  const partiallyAnalysed = plan.sampling.partiallyAnalysed;
  const coverage: VideoCoverage = {
    framesAnalysedAt: analysedFrames.map((f) => formatTimestamp(f.at)),
    speechTranscribedUpTo: transcribedTo !== null ? formatTimestamp(transcribedTo) : null,
    partiallyAnalysed,
  };
  const assessment: VideoAssessment = {
    mediaId: media.id,
    label,
    container: plan.probe.container,
    videoCodec: plan.probe.videoCodec,
    durationSeconds: plan.probe.durationSeconds,
    partiallyAnalysed,
    analysedPortion: describePortion(label, plan.probe.durationSeconds, analysedFrames.map((f) => f.at), transcribedTo, partiallyAnalysed),
    sampling: {
      version: plan.sampling.version,
      framesRequested: plan.sampling.requested.length,
      framesAnalysed: analysedFrames.length,
      framesDuplicate: frames.filter((f) => f.outcome === "DUPLICATE").length,
      framesBlank: frames.filter((f) => f.outcome === "BLANK").length,
      framesFailed: frames.filter((f) => f.outcome === "FAILED").length,
    },
    frames,
    audio: { status: audioStatus, transcribedSeconds: transcribedTo !== null ? { from: 0, to: transcribedTo } : null, reasonCode: audioReason },
    visibleTextPresent: analysedFrames.some((f) => f.analysis.photo.visibleTextPresent),
    personalInfoVisible: analysedFrames.some((f) => f.analysis.photo.personalInfoVisible),
    cannotDetermine: [...new Set(analysedFrames.flatMap((f) => f.analysis.cannotDetermine))].slice(0, 10),
  };
  const video: VideoResult = { mediaId: media.id, label, probe: plan.probe, analysedFrames, coverage, assessment };
  if (!analysedFrames.length && !transcript) {
    // Nothing usable came out of this video (all frames blank/failed, no speech).
    const allBlank = frames.length > 0 && frames.every((f) => f.outcome === "BLANK" || f.outcome === "DUPLICATE");
    return { outcome: allBlank ? "SKIPPED" : "FAILED", reasonCode: allBlank ? "video_blank" : "video_no_usable_frames" };
  }
  return { outcome: "ANALYSED", reasonCode: null, transcript, video };
}

/** One frame → po-1 + temporal validation (one corrective attempt) → cached per frame. */
async function observeFrame(
  media: RequestContext["media"][number], label: string, image: Normalised, inputHash: string,
  meta: { provider: string; model: string; promptVersion: string; runId: string }, at: number, ctx: RequestContext, deps: PipelineDeps, tally: Tally,
): Promise<{ outcome: "ANALYSED" | "FAILED"; reasonCode: string | null; analysis?: PhotoObservationResult }> {
  const { store, provider } = deps;
  let value: PhotoObservationResult | null = null;
  let lastErrors: string[] = [];
  for (let i = 0; i < OBSERVATION_ATTEMPTS && !value; i++) {
    tally.count("observeFrameCalls");
    if (i > 0) tally.count("observeFrameCorrectiveAttempts");
    let res;
    const t0 = Date.now();
    try {
      res = await provider.observePhoto({ label, productCategories: ctx.request.productCategories, image: image.image, correction: i > 0 ? lastErrors.slice(0, 20) : undefined, frame: true });
    } catch (err) {
      const step = await mediaFailure(err, { media, kind: "IMAGE_OBSERVATIONS", inputHash, meta, store, tally });
      return { outcome: "FAILED", reasonCode: step.reasonCode };
    }
    tally.addUsage({ ...res.usage, observeFrameMs: Date.now() - t0 });
    if (res.outputIssue) {
      lastErrors = [`response: ${res.outputIssue}`];
      continue;
    }
    const checked = validateFrameObservation(res.content);
    if (checked.ok) value = checked.value;
    else lastErrors = checked.errors;
  }
  if (!value) {
    await store.recordAnalysis({ mediaId: media.id, kind: "IMAGE_OBSERVATIONS", inputHash, status: "FAILED", result: { frame: { at }, validationErrors: lastErrors.slice(0, 20) }, transcriptText: null, language: null, errorCode: "invalid_observation", usage: {}, ...meta });
    return { outcome: "FAILED", reasonCode: "invalid_observation" };
  }
  const result = { schema: PHOTO_OBSERVATION_SCHEMA_VERSION, frame: { at, label }, ...value, derivative: image.derivative };
  await store.recordAnalysis({ mediaId: media.id, kind: "IMAGE_OBSERVATIONS", inputHash, status: "COMPLETED", result, transcriptText: null, language: null, errorCode: null, usage: {}, ...meta });
  return { outcome: "ANALYSED", reasonCode: null, analysis: value };
}

/** Fixed wording: what of the video was analysed. Never implies the whole video was reviewed. */
function describePortion(label: string, duration: number, frameTimes: number[], transcribedTo: number | null, partial: boolean): string {
  const frames = frameTimes.length
    ? `${frameTimes.length} still frame${frameTimes.length === 1 ? "" : "s"} (at ${frameTimes.map(formatTimestamp).join(", ")}) analysed individually`
    : "no frames analysed";
  const speech = transcribedTo !== null ? `speech transcribed from 00:00.0 to ${formatTimestamp(transcribedTo)}` : "no speech transcribed";
  const head = partial
    ? `PARTIALLY ANALYSED: ${label} lasts ${formatTimestamp(duration)}, beyond the ${formatTimestamp(ANALYSIS_WINDOW_SECONDS)} analysis threshold.`
    : `${label} lasts ${formatTimestamp(duration)}.`;
  return `${head} ${frames}; ${speech}. Movement and behaviour over time were not assessed.`;
}
