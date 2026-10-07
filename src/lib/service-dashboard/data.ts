// Dashboard data access. Each exported function verifies the caller itself
// (requireStaff) before touching data, so it stays safe whichever page,
// action or route calls it. Mutations pass the verified Supabase Auth user id
// to the database as the actor; nothing the browser sends can name an actor.
import "server-only";
import { supabaseFetch, supabaseJson } from "@/lib/service-call/server/supabase";
import { mediaStore } from "@/lib/service-call/server/media-store";
import { supabaseAiStore } from "@/lib/service-call/server/ai-store";
import { REFERENCE_PATTERN } from "@/lib/service-call/server/http";
import { labelEvidence } from "@/lib/service-call/ai/input-builder";
import { requireStaff, type StaffRole } from "./auth/session";
import { evidenceAccess } from "./evidence-access";
import { aiStateOf, type AiState, type DashboardStatus } from "./labels";
import type { InboxRow, RequestDetail, ReviewEntry, StaffEdit } from "./types";

export type * from "./types";
import { toRpcArgs, type InboxQuery } from "./inbox-query";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const eq = (v: string) => `eq.${encodeURIComponent(v)}`;

/** A rule the database refused (P0001), e.g. status_changed or note_required. */
export class DashboardRuleError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "DashboardRuleError";
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = (await supabaseFetch(`/rest/v1/rpc/${fn}`, { method: "POST", body: JSON.stringify(args), raw: true })) as Response;
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (body?.code === "P0001" && typeof body.message === "string" && /^[a-z_]{3,60}$/.test(body.message)) throw new DashboardRuleError(body.message);
    throw new Error(`Supabase rpc ${fn} failed: ${res.status} ${body?.code ?? ""}`.trim());
  }
  return body as T;
}

// ─── Inbox ──────────────────────────────────────────────────────────────────

export async function listInbox(q: InboxQuery): Promise<{ rows: InboxRow[]; total: number }> {
  await requireStaff();
  const rows = await rpc<Record<string, unknown>[]>("list_service_requests", toRpcArgs(q));
  return {
    total: rows.length ? Number(rows[0].total_count) : 0,
    rows: rows.map((r) => ({
      id: r.id as string,
      reference: r.reference as string,
      customerName: r.customer_name as string,
      productCategories: r.product_categories as string[],
      issue: (r.issue as string) ?? "",
      submittedAt: r.submitted_at as string,
      status: r.status as DashboardStatus,
      urgency: r.urgency as string,
      aiState: r.ai_state as AiState,
      reviewStatus: (r.review_status as string) ?? null,
      photos: r.photos as number,
      videos: r.videos as number,
      voiceNotes: r.voice_notes as number,
    })),
  };
}

// ─── Detail ─────────────────────────────────────────────────────────────────







export async function getRequestDetail(reference: string): Promise<RequestDetail | null> {
  const staff = await requireStaff();
  if (!REFERENCE_PATTERN.test(reference)) return null;
  const rows = await supabaseJson<Record<string, unknown>[]>(`/rest/v1/service_requests?reference=${eq(reference)}&select=*`);
  const r = rows[0];
  if (!r) return null;
  const id = r.id as string;

  const [history, media, runs, reports, analyses, transitions] = await Promise.all([
    supabaseJson<Record<string, unknown>[]>(
      `/rest/v1/status_history?service_request_id=${eq(id)}&select=id,from_status,to_status,changed_by,note,changed_at,actor_role,actor:staff_members(display_name)&order=changed_at.asc,id.asc`,
    ),
    mediaStore.list(id),
    supabaseAiStore.listRuns(id),
    supabaseAiStore.listReports(id),
    supabaseAiStore.listAnalyses(id),
    supabaseJson<{ to_status: DashboardStatus; min_role: StaffRole; note_required: boolean }[]>(
      `/rest/v1/service_status_transitions?from_status=${eq(r.status as string)}&select=to_status,min_role,note_required`,
    ),
  ]);
  const reviews = reports.length
    ? await supabaseJson<Record<string, unknown>[]>(
        `/rest/v1/service_ai_report_reviews?report_id=in.(${reports.map((x) => x.id).join(",")})&select=id,report_id,review_status,reviewer_role,notes,edited_report,created_at,superseded_at,reviewer:staff_members(display_name)&order=created_at.asc`,
      )
    : [];

  // Labels: the report's own labels when present, else the pipeline's ordering (created_at, id).
  const uploaded = media.filter((m) => m.uploadStatus === "UPLOADED").sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const labels = labelEvidence(uploaded.map((m) => ({ mediaId: m.id, type: m.mediaType }) as Parameters<typeof labelEvidence>[0][number]));
  const current = reports.filter((x) => !x.supersededAt).at(-1);
  for (const c of current?.aiReport?.processing?.mediaCoverage ?? []) labels.set(c.mediaId, c.label);

  const latest = [...runs].sort((a, b) => b.runNumber - a.runNumber)[0] ?? null;
  const rank: Record<StaffRole, number> = { STAFF: 0, ADMIN: 1 };
  const order = ["AWAITING_REVIEW", "MORE_INFORMATION_REQUIRED", "INSPECTION_REQUIRED", "SCHEDULED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  return {
    viewer: { displayName: staff.displayName, role: staff.role },
    request: {
      id,
      reference: r.reference as string,
      status: r.status as DashboardStatus,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
      customerName: r.customer_name as string,
      email: r.email as string,
      mobileE164: r.mobile_e164 as string,
      location: r.location as string,
      existingCustomer: (r.existing_customer as boolean | null) ?? null,
      projectReference: (r.project_reference as string | null) ?? null,
      productCategories: r.product_categories as string[],
      otherProduct: (r.other_product as string | null) ?? null,
      problemDescription: (r.problem_description as string) ?? "",
      declaredMedia: r.declared_media as RequestDetail["request"]["declaredMedia"],
      channel: r.channel as string,
    },
    history: history.map((h) => ({
      id: h.id as number,
      fromStatus: (h.from_status as DashboardStatus | null) ?? null,
      toStatus: h.to_status as DashboardStatus,
      changedAt: h.changed_at as string,
      changedBy: h.changed_by as string,
      actorName: ((h.actor as { display_name?: string } | null)?.display_name as string) ?? null,
      actorRole: (h.actor_role as StaffRole | null) ?? null,
      note: (h.note as string | null) ?? null,
    })),
    evidence: [...media]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
      .map((m) => ({
        id: m.id,
        type: m.mediaType,
        label: labels.get(m.id) ?? "Not uploaded",
        mimeType: m.mimeType,
        fileSize: m.fileSize,
        durationSeconds: m.durationSeconds,
        uploadStatus: m.uploadStatus,
        failureReason: m.failureReason,
        createdAt: m.createdAt,
      })),
    analyses: (analyses as Record<string, unknown>[]).map((a) => ({
      mediaId: a.mediaId as string,
      kind: a.kind as string,
      status: a.status as string,
      errorCode: (a.errorCode as string | null) ?? null,
      transcript: (a.transcript as string | null) ?? null,
      language: (a.language as string | null) ?? null,
      createdAt: a.createdAt as string,
    })),
    aiState: aiStateOf(latest?.status),
    latestRun: latest
      ? { runNumber: latest.runNumber, status: latest.status, errorCode: latest.errorCode, trigger: latest.trigger, startedAt: latest.startedAt, finishedAt: latest.finishedAt, attempts: latest.attempts, maxAttempts: latest.maxAttempts }
      : null,
    reports,
    reviews: reviews.map((v) => ({
      id: v.id as string,
      reportId: v.report_id as string,
      status: v.review_status as ReviewEntry["status"],
      reviewerName: ((v.reviewer as { display_name?: string } | null)?.display_name as string) ?? "Unknown",
      reviewerRole: v.reviewer_role as StaffRole,
      notes: (v.notes as string | null) ?? null,
      editedReport: (v.edited_report as StaffEdit | null) ?? null,
      createdAt: v.created_at as string,
      supersededAt: (v.superseded_at as string | null) ?? null,
    })),
    // Only what the database matrix permits for this viewer's role.
    transitions: transitions
      .filter((t) => rank[staff.role] >= rank[t.min_role])
      .map((t) => ({ to: t.to_status, noteRequired: t.note_required, minRole: t.min_role }))
      .sort((a, b) => order.indexOf(a.to) - order.indexOf(b.to)),
  };
}

// ─── Mutations ──────────────────────────────────────────────────────────────
async function requestIdFor(reference: string) {
  if (!REFERENCE_PATTERN.test(reference)) throw new DashboardRuleError("not_found");
  const rows = await supabaseJson<{ id: string }[]>(`/rest/v1/service_requests?reference=${eq(reference)}&select=id`);
  if (!rows[0]) throw new DashboardRuleError("not_found");
  return rows[0].id;
}

export async function changeRequestStatus(input: { reference: string; expectedFrom: string; to: string; note: string | null }) {
  const staff = await requireStaff();
  const id = await requestIdFor(input.reference);
  const rows = await rpc<{ to_status: string }[]>("change_service_request_status", {
    p_request_id: id,
    p_expected_from: input.expectedFrom,
    p_to: input.to,
    p_auth_user_id: staff.authUserId,
    p_note: input.note,
  });
  return rows[0];
}

export async function reviewAiReport(input: { reference: string; reportId: string; expectedStatus: string; status: string; notes: string | null; edited: StaffEdit | null }) {
  const staff = await requireStaff();
  if (!UUID.test(input.reportId)) throw new DashboardRuleError("not_found");
  const id = await requestIdFor(input.reference);
  // The report must belong to this request.
  const owner = await supabaseJson<{ id: string }[]>(`/rest/v1/service_ai_reports?id=${eq(input.reportId)}&service_request_id=${eq(id)}&select=id`);
  if (!owner[0]) throw new DashboardRuleError("not_found");
  const rows = await rpc<{ id: string }[]>("review_service_ai_report", {
    p_report_id: input.reportId,
    p_expected_status: input.expectedStatus,
    p_status: input.status,
    p_auth_user_id: staff.authUserId,
    p_notes: input.notes,
    p_edited_report: input.edited,
  });
  return rows[0];
}

// ─── Evidence ───────────────────────────────────────────────────────────────
/** A short-lived read URL for one uploaded evidence file of this request, or null. */
export async function signEvidence(reference: string, mediaId: string, expiresInSeconds = 300): Promise<string | null> {
  await requireStaff();
  if (!REFERENCE_PATTERN.test(reference) || !UUID.test(mediaId)) return null;
  const rows = await supabaseJson<{ id: string }[]>(`/rest/v1/service_requests?reference=${eq(reference)}&select=id`);
  if (!rows[0]) return null;
  return evidenceAccess.signedReadUrl(rows[0].id, mediaId, expiresInSeconds);
}
