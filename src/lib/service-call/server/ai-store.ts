// Supabase implementation of the AI run store (server-only). All state
// changes go through the SQL functions in 0003_service_ai.sql.
import "server-only";
import type { FingerprintMedia } from "../ai/fingerprint";
import type { ServiceCallReport } from "../ai/report-schema";
import {
  RunNotOwnedError,
  type AiReport, type AiRun, type AiRunStore, type EnqueueOutcome, type MediaAnalysis, type RequestContext,
} from "../ai/run-store";
import { EVIDENCE_BUCKET, SupabaseError, supabaseFetch, supabaseJson } from "./supabase";

/* eslint-disable @typescript-eslint/no-explicit-any -- rows come from PostgREST as JSON */
const toRun = (r: any): AiRun => ({
  id: r.id,
  serviceRequestId: r.service_request_id,
  runNumber: r.run_number,
  trigger: r.trigger,
  status: r.status,
  inputFingerprint: r.input_fingerprint,
  pipelineVersion: r.pipeline_version,
  promptVersion: r.prompt_version,
  schemaVersion: r.schema_version,
  provider: r.provider,
  models: r.models ?? {},
  leaseOwner: r.lease_owner,
  leaseExpiresAt: r.lease_expires_at,
  attempts: r.attempts,
  maxAttempts: r.max_attempts,
  nextAttemptAt: r.next_attempt_at,
  startedAt: r.started_at,
  finishedAt: r.finished_at,
  errorCode: r.error_code,
  errorDetail: r.error_detail,
  usage: r.usage ?? {},
  requestedBy: r.requested_by,
  createdAt: r.created_at,
});

const toReport = (r: any): AiReport => ({
  id: r.id,
  serviceRequestId: r.service_request_id,
  runId: r.run_id,
  version: r.version,
  schemaVersion: r.schema_version,
  processingStatus: r.processing_status,
  provider: r.provider,
  models: r.models ?? {},
  promptVersion: r.prompt_version,
  pipelineVersion: r.pipeline_version,
  inputFingerprint: r.input_fingerprint,
  aiReport: r.ai_report,
  generatedAt: r.generated_at,
  reviewStatus: r.review_status,
  reviewedReport: r.reviewed_report,
  reviewedBy: r.reviewed_by,
  reviewedAt: r.reviewed_at,
  supersededAt: r.superseded_at,
  supersededBy: r.superseded_by,
});

const toAnalysis = (r: any): MediaAnalysis => ({
  mediaId: r.media_id,
  kind: r.kind,
  inputHash: r.input_hash,
  status: r.status,
  result: r.result,
  transcriptText: r.transcript_text,
  language: r.language,
  errorCode: r.error_code,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const rpc = <T = unknown[]>(name: string, body: Record<string, unknown>) =>
  supabaseJson<T>(`/rest/v1/rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
const eq = (v: string) => `eq.${encodeURIComponent(v)}`;

export const supabaseAiStore: AiRunStore & {
  findRequestByReference(reference: string): Promise<{ id: string; reference: string } | null>;
  listRuns(requestId: string): Promise<AiRun[]>;
  listReports(requestId: string): Promise<AiReport[]>;
  readMedia(mediaId: string): Promise<Uint8Array>;
} = {
  async loadRequestContext(requestId) {
    const select = [
      "id", "reference", "problem_description", "product_categories", "other_product", "existing_customer",
      // Contact details: only for scrubbing free text (input-builder.ts).
      "customer_name", "email", "mobile_e164", "mobile_national", "location", "project_reference",
    ].join(",");
    const rows = await supabaseJson<Record<string, unknown>[]>(`/rest/v1/service_requests?id=${eq(requestId)}&select=${select}`);
    const r = rows[0];
    if (!r) return null;
    const media = await supabaseJson<Record<string, unknown>[]>(
      `/rest/v1/service_media?service_request_id=${eq(requestId)}&upload_status=eq.UPLOADED&select=id,media_type,mime_type,file_size,duration_seconds&order=created_at.asc,id.asc`,
    );
    const ctx: RequestContext = {
      requestId,
      reference: String(r.reference),
      request: {
        problemDescription: String(r.problem_description ?? ""),
        productCategories: (r.product_categories as string[]) ?? [],
        otherProduct: (r.other_product as string | null) ?? null,
        existingCustomer: (r.existing_customer as boolean | null) ?? null,
      },
      known: {
        fullName: r.customer_name as string,
        email: r.email as string,
        mobileE164: r.mobile_e164 as string,
        mobileNational: r.mobile_national as string,
        location: r.location as string,
        projectReference: (r.project_reference as string | null) ?? null,
      },
      media: media.map((m) => ({
        id: String(m.id),
        type: m.media_type as FingerprintMedia["type"],
        mimeType: String(m.mime_type),
        fileSize: Number(m.file_size),
        durationSeconds: m.duration_seconds === null ? null : Number(m.duration_seconds),
      })),
    };
    return ctx;
  },

  async enqueue(a) {
    const rows = await rpc<{ outcome: EnqueueOutcome; run: unknown }[]>("enqueue_service_ai_run", {
      p_request_id: a.requestId,
      p_trigger: a.trigger,
      p_input_fingerprint: a.inputFingerprint,
      p_pipeline_version: a.pipelineVersion,
      p_prompt_version: a.promptVersion,
      p_schema_version: a.schemaVersion,
      p_requested_by: a.requestedBy,
      p_max_auto_runs: a.maxAutoRuns,
    });
    return { outcome: rows[0].outcome, run: rows[0].run ? toRun(rows[0].run) : null };
  },

  async claim(worker, leaseSeconds, limit) {
    const rows = await rpc("claim_service_ai_runs", { p_worker: worker, p_lease_seconds: leaseSeconds, p_limit: limit });
    return rows.map(toRun);
  },

  async extendLease(runId, worker, leaseSeconds) {
    return rpc<boolean>("extend_service_ai_run_lease", { p_run_id: runId, p_worker: worker, p_lease_seconds: leaseSeconds });
  },

  async complete(a) {
    try {
      const rows = await rpc("complete_service_ai_run", {
        p_run_id: a.runId,
        p_worker: a.worker,
        p_status: a.status,
        p_input_fingerprint: a.inputFingerprint,
        p_provider: a.provider,
        p_models: a.models,
        p_usage: a.usage,
        p_error_detail: a.errorDetail,
        p_report: a.report satisfies ServiceCallReport,
      });
      return toReport(rows[0]);
    } catch (err) {
      // PostgREST reports raise_exception as P0001; the message identifies it.
      if (err instanceof SupabaseError && err.code === "P0001") throw new RunNotOwnedError();
      throw err;
    }
  },

  async fail(a) {
    const rows = await rpc("fail_service_ai_run", {
      p_run_id: a.runId,
      p_worker: a.worker,
      p_error_code: a.errorCode,
      p_error_detail: a.errorDetail,
      p_retryable: a.retryable,
      p_usage: a.usage,
    });
    return rows[0] ? toRun(rows[0]) : null;
  },

  async findEligibleRequests(limit, idleMinutes, maxAgeHours) {
    const rows = await rpc<{ service_request_id: string }[]>("find_service_requests_for_ai", {
      p_limit: limit, p_idle_minutes: idleMinutes, p_max_age_hours: maxAgeHours,
    });
    return rows.map((r) => r.service_request_id);
  },

  async getAnalysis(mediaId, kind, inputHash) {
    const rows = await supabaseJson<unknown[]>(
      `/rest/v1/service_media_analyses?media_id=${eq(mediaId)}&kind=${eq(kind)}&input_hash=${eq(inputHash)}&select=*`,
    );
    return rows[0] ? toAnalysis(rows[0]) : null;
  },

  async recordAnalysis(a) {
    const rows = await rpc("record_service_media_analysis", {
      p_media_id: a.mediaId,
      p_kind: a.kind,
      p_input_hash: a.inputHash,
      p_status: a.status,
      p_provider: a.provider,
      p_model: a.model,
      p_prompt_version: a.promptVersion,
      p_result: a.result,
      p_transcript_text: a.transcriptText,
      p_language: a.language,
      p_error_code: a.errorCode,
      p_usage: a.usage,
      p_run_id: a.runId,
    });
    return toAnalysis(rows[0]);
  },

  async findRequestByReference(reference) {
    const rows = await supabaseJson<{ id: string; reference: string }[]>(`/rest/v1/service_requests?reference=${eq(reference)}&select=id,reference`);
    return rows[0] ?? null;
  },

  async listRuns(requestId) {
    const rows = await supabaseJson<unknown[]>(`/rest/v1/service_ai_runs?service_request_id=${eq(requestId)}&select=*&order=run_number.asc`);
    return rows.map(toRun);
  },

  async listReports(requestId) {
    const rows = await supabaseJson<unknown[]>(`/rest/v1/service_ai_reports?service_request_id=${eq(requestId)}&select=*&order=version.asc`);
    return rows.map(toReport);
  },

  /** Original bytes of an UPLOADED evidence file, read with the service role. Never a URL. */
  async readMedia(mediaId) {
    const rows = await supabaseJson<{ storage_path: string }[]>(
      `/rest/v1/service_media?id=${eq(mediaId)}&upload_status=eq.UPLOADED&select=storage_path`,
    );
    if (!rows[0]) throw new Error("media_not_available");
    const path = rows[0].storage_path.split("/").map(encodeURIComponent).join("/");
    const res = (await supabaseFetch(`/storage/v1/object/authenticated/${EVIDENCE_BUCKET}/${path}`)) as Response;
    return new Uint8Array(await res.arrayBuffer());
  },
};
