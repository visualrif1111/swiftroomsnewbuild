// Deterministic fixtures for AI report tests, plus an AiRunStore backed by
// PGlite that calls the real SQL functions from 0003_service_ai.sql.

export const PHOTO_ID = "11111111-1111-4111-8111-111111111111";
export const VIDEO_ID = "22222222-2222-4222-8222-222222222222";
export const VOICE_ID = "33333333-3333-4333-8333-333333333333";

export const DESCRIPTION = "The living room sliding door catches halfway when opening. It started last week.";
export const VOICE_TEXT = "Hi, the sliding door has been like this since last week and it makes a grinding noise.";

/** Validation context with visual analysis available (4A/stub-style). */
export const CONTEXT = {
  evidence: [
    { mediaId: PHOTO_ID, type: "PHOTO", analysed: true, durationSeconds: null },
    { mediaId: VIDEO_ID, type: "VIDEO", analysed: true, durationSeconds: 20 },
    { mediaId: VOICE_ID, type: "VOICE", analysed: true, durationSeconds: 30 },
  ],
  safetyFlags: [],
  sources: { description: DESCRIPTION, transcripts: [{ mediaId: VOICE_ID, text: VOICE_TEXT, possiblyIncomplete: false }] },
  visualAnalysis: true,
  maxConfidence: "MEDIUM",
};

/** Phase 4C context: text + voice only, no visual analysis. */
export const TEXT_ONLY_CONTEXT = {
  ...CONTEXT,
  evidence: CONTEXT.evidence.map((e) => (e.type === "VOICE" ? e : { ...e, analysed: false })),
  visualAnalysis: false,
};

/** Phase 4C-shaped content: no observations, nothing media-based. */
export function textOnlyContent() {
  const c = validContent();
  c.mediaObservations = [];
  c.customerReported.reportedSymptoms.forEach((s) => (s.statementRefs = s.statementRefs.filter((r) => r.startsWith("st-"))));
  c.potentialIssueCategories = [{ category: "OPERATION_STIFF_OR_STUCK", likelihood: "LIKELY", basedOnRefs: ["st-1"] }];
  return c;
}

/** A complete, valid report content object (fresh copy each call). */
export function validContent() {
  return {
    issueSummary: "Customer reports the living room sliding door catches halfway when opening.",
    customerReported: {
      statements: [
        { id: "st-1", text: "The sliding door catches halfway when opening.", quote: "sliding door catches halfway when opening", source: { type: "DESCRIPTION", mediaId: null } },
        { id: "st-2", text: "Customer says it started last week and makes a grinding noise.", quote: "it makes a grinding noise", source: { type: "VOICE_NOTE", mediaId: VOICE_ID } },
      ],
      reportedSymptoms: [
        { id: "sy-1", symptom: "Door catches halfway", statementRefs: ["st-1"] },
        { id: "sy-2", symptom: "Grinding noise", statementRefs: ["st-2"] },
      ],
      reportedOnset: "Last week",
      locationInProperty: "Living room",
    },
    mediaObservations: [
      {
        id: "ob-1",
        evidence: { mediaId: PHOTO_ID, label: "Photo 1", frameAtSeconds: null },
        observation: "An apparent gap is visible between the frame and the sliding panel at the top.",
        type: "VISIBLE_GAP_OR_MISALIGNMENT",
        certainty: "PROBABLE",
        relatesToSymptomRefs: ["sy-1"],
      },
      {
        id: "ob-2",
        evidence: { mediaId: VIDEO_ID, label: "Video 1", frameAtSeconds: 4 },
        observation: "The panel appears to stop partway along the track.",
        type: "DEBRIS_OR_OBSTRUCTION",
        certainty: "UNCERTAIN",
        relatesToSymptomRefs: ["sy-1"],
      },
    ],
    unknownsRequiringInspection: [
      { topic: "COMPONENT_FAILURE", question: "Which component is causing the door to catch.", whyUnknown: "Rollers and track can't be assessed from the photos." },
      { topic: "WARRANTY", question: "Whether any warranty applies.", whyUnknown: "Needs records and inspection." },
      { topic: "COST", question: "The cost of any work.", whyUnknown: "Needs assessment by the service team." },
      { topic: "REPAIR_METHOD", question: "The appropriate repair method.", whyUnknown: "Needs confirmation by the service team." },
    ],
    affectedProducts: [{ category: "sliding-door", basis: "CUSTOMER_SELECTED" }],
    potentialIssueCategories: [
      { category: "OPERATION_STIFF_OR_STUCK", likelihood: "LIKELY", basedOnRefs: ["st-1", "ob-1"] },
      { category: "ALIGNMENT", likelihood: "POSSIBLE", basedOnRefs: ["ob-1"] },
    ],
    urgency: {
      level: "NORMAL",
      indicators: [{ indicator: "SIGNIFICANT_LOSS_OF_FUNCTION", basis: "CUSTOMER_REPORTED", refs: ["st-1"] }],
      reason: "The door still opens partly; no security or safety indicator was reported or seen.",
    },
    inspection: { recommended: true, reason: "The cause of the catching can't be established from the evidence." },
    recommendedNextStep: "INSPECTION_VISIT",
    moreInformationNeeded: ["A photo of the bottom track"],
    confidence: { overall: "MEDIUM", reason: "Clear description; photo shows a possible gap." },
    limitations: ["Video was sampled as still frames."],
  };
}

// ─── PGlite-backed AiRunStore (same contract as server/ai-store.ts) ──────────

const run = (r) => r && ({
  id: r.id, serviceRequestId: r.service_request_id, runNumber: r.run_number, trigger: r.trigger, status: r.status,
  inputFingerprint: r.input_fingerprint, pipelineVersion: r.pipeline_version, promptVersion: r.prompt_version,
  schemaVersion: r.schema_version, provider: r.provider, models: r.models ?? {}, leaseOwner: r.lease_owner,
  leaseExpiresAt: r.lease_expires_at, attempts: r.attempts, maxAttempts: r.max_attempts, nextAttemptAt: r.next_attempt_at,
  startedAt: r.started_at, finishedAt: r.finished_at, errorCode: r.error_code, errorDetail: r.error_detail,
  usage: r.usage ?? {}, requestedBy: r.requested_by, createdAt: r.created_at,
});
const analysis = (r) => r && ({
  mediaId: r.media_id, kind: r.kind, inputHash: r.input_hash, status: r.status, result: r.result,
  transcriptText: r.transcript_text, language: r.language, errorCode: r.error_code,
});

export function pgliteAiStore(db, { RunNotOwnedError }) {
  const q = async (sql, params = []) => (await db.query(sql, params)).rows;
  return {
    calls: [],
    async loadRequestContext(requestId) {
      this.calls.push("loadRequestContext");
      const [r] = await q("select * from service_requests where id = $1", [requestId]);
      if (!r) return null;
      const media = await q("select * from service_media where service_request_id = $1 and upload_status = 'UPLOADED' order by created_at, id", [requestId]);
      return {
        requestId, reference: r.reference,
        request: { problemDescription: r.problem_description, productCategories: r.product_categories, otherProduct: r.other_product, existingCustomer: r.existing_customer },
        known: { fullName: r.customer_name, email: r.email, mobileE164: r.mobile_e164, mobileNational: r.mobile_national, location: r.location, projectReference: r.project_reference },
        media: media.map((m) => ({ id: m.id, type: m.media_type, mimeType: m.mime_type, fileSize: Number(m.file_size), durationSeconds: m.duration_seconds === null ? null : Number(m.duration_seconds) })),
      };
    },
    async enqueue(a) {
      const [r] = await q("select * from enqueue_service_ai_run($1, $2, $3, $4, $5, $6, $7, $8)",
        [a.requestId, a.trigger, a.inputFingerprint, a.pipelineVersion, a.promptVersion, a.schemaVersion, a.requestedBy, a.maxAutoRuns]);
      return { outcome: r.outcome, run: r.run ? run(r.run) : null };
    },
    async claim(worker, lease, limit) {
      return (await q("select * from claim_service_ai_runs($1, $2, $3)", [worker, lease, limit])).map(run);
    },
    async extendLease(id, worker, lease) {
      return (await q("select extend_service_ai_run_lease($1, $2, $3) as ok", [id, worker, lease]))[0].ok;
    },
    async complete(a) {
      try {
        const [r] = await q("select * from complete_service_ai_run($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [a.runId, a.worker, a.status, a.inputFingerprint, a.provider, JSON.stringify(a.models), JSON.stringify(a.usage), a.errorDetail && JSON.stringify(a.errorDetail), JSON.stringify(a.report)]);
        return { id: r.id, version: r.version, processingStatus: r.processing_status };
      } catch (err) {
        if (String(err.message).includes("run_not_owned")) throw new RunNotOwnedError();
        throw err;
      }
    },
    async fail(a) {
      const rows = await q("select * from fail_service_ai_run($1, $2, $3, $4, $5, $6)",
        [a.runId, a.worker, a.errorCode, a.errorDetail && JSON.stringify(a.errorDetail), a.retryable, JSON.stringify(a.usage)]);
      return rows[0] ? run(rows[0]) : null;
    },
    async findEligibleRequests(limit, idle, age) {
      return (await q("select * from find_service_requests_for_ai($1, $2, $3)", [limit, idle, age])).map((r) => r.service_request_id);
    },
    async getAnalysis(mediaId, kind, hash) {
      return analysis((await q("select * from service_media_analyses where media_id = $1 and kind = $2 and input_hash = $3", [mediaId, kind, hash]))[0]) ?? null;
    },
    async recordAnalysis(a) {
      const [r] = await q("select * from record_service_media_analysis($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
        [a.mediaId, a.kind, a.inputHash, a.status, a.provider, a.model, a.promptVersion, a.result && JSON.stringify(a.result), a.transcriptText, a.language, a.errorCode, JSON.stringify(a.usage), a.runId]);
      return analysis(r);
    },
  };
}
