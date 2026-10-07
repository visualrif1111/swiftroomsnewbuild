"use server";
// Staff mutations. Each action is a public POST endpoint: it verifies the
// session and allow-list itself (inside the data functions), validates its
// input, and the database re-checks the transition matrix, role, note and
// expected current state. The actor is never read from the form.
import { revalidatePath } from "next/cache";
import { StaffAuthError } from "@/lib/service-dashboard/auth/session";
import { changeRequestStatus, reviewAiReport, DashboardRuleError } from "@/lib/service-dashboard/data";
import type { ActionResult, StaffEdit } from "@/lib/service-dashboard/types";
import { STATUS_LABEL, URGENCIES, type DashboardStatus } from "@/lib/service-dashboard/labels";


const STATUS_VALUES = Object.keys(STATUS_LABEL);

const MESSAGES: Record<string, string> = {
  not_authorised: "Your session has ended or you don't have access. Sign in again.",
  forbidden: "Your role can't make this change.",
  status_changed: "Another member of staff changed this request first. The latest status and history are now shown. Nothing was overwritten.",
  review_changed: "This report's review changed while you were working. The latest review is now shown. Nothing was overwritten.",
  report_superseded: "A newer report version exists. Review the current version instead.",
  transition_not_allowed: "That status change isn't allowed from the current status for your role.",
  note_required: "This change needs a note (3–2,000 characters).",
  note_invalid: "Notes must be 3–2,000 characters.",
  edited_report_invalid: "The edited report is incomplete or too long.",
  review_status_invalid: "Choose approve, edit or reject.",
  not_found: "This request or report no longer exists.",
};

function fail(e: unknown, reference: string): ActionResult {
  if (e instanceof StaffAuthError) return { ok: false, message: MESSAGES[e.message] ?? MESSAGES.not_authorised };
  if (e instanceof DashboardRuleError) {
    const stale = e.code === "status_changed" || e.code === "review_changed" || e.code === "report_superseded";
    if (stale) revalidatePath(`/admin/service/${reference}`);
    return { ok: false, stale, message: MESSAGES[e.code] ?? "That change couldn't be made." };
  }
  console.error(`[dashboard] action failed: ${(e as Error)?.name ?? "Error"}`);
  return { ok: false, message: "Something went wrong. Nothing was changed. Try again." };
}

const text = (form: FormData, key: string, max: number) => {
  const v = String(form.get(key) ?? "").trim();
  return v.length > max ? null : v;
};

export async function changeStatusAction(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const reference = String(form.get("reference") ?? "");
  const expectedFrom = String(form.get("expectedFrom") ?? "");
  const to = String(form.get("to") ?? "");
  const note = text(form, "note", 2000);
  if (!STATUS_VALUES.includes(expectedFrom) || !STATUS_VALUES.includes(to)) return { ok: false, message: "Choose a new status." };
  if (note === null) return { ok: false, message: MESSAGES.note_invalid };
  if (note && note.length < 3) return { ok: false, message: MESSAGES.note_invalid };
  try {
    await changeRequestStatus({ reference, expectedFrom, to, note: note || null });
  } catch (e) {
    return fail(e, reference);
  }
  revalidatePath(`/admin/service/${reference}`);
  revalidatePath("/admin/service");
  return { ok: true, message: `Status changed to ${STATUS_LABEL[to as DashboardStatus]}.` };
}

export async function reviewReportAction(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const reference = String(form.get("reference") ?? "");
  const reportId = String(form.get("reportId") ?? "");
  const expectedStatus = String(form.get("expectedStatus") ?? "");
  const status = String(form.get("decision") ?? "");
  const notes = text(form, "notes", 4000);
  if (!["APPROVED", "EDITED", "REJECTED"].includes(status)) return { ok: false, message: MESSAGES.review_status_invalid };
  if (!["AWAITING_REVIEW", "APPROVED", "EDITED", "REJECTED"].includes(expectedStatus)) return { ok: false, message: MESSAGES.review_status_invalid };
  if (notes === null) return { ok: false, message: "Review notes must be at most 4,000 characters." };

  let edited: StaffEdit | null = null;
  if (status === "EDITED") {
    const issueSummary = text(form, "editSummary", 400);
    const level = String(form.get("editUrgency") ?? "");
    const reason = text(form, "editUrgencyReason", 500);
    const corrections = text(form, "editCorrections", 2000);
    if (!issueSummary || issueSummary.length < 3 || reason === null || corrections === null || !URGENCIES.includes(level as (typeof URGENCIES)[number]) || level === "NONE") {
      return { ok: false, message: "An edited report needs a summary (3–400 characters) and an urgency level." };
    }
    edited = { schema: "staff-edit-1", issueSummary, urgency: { level, reason: reason ?? "" }, corrections: corrections ?? "" };
  }
  try {
    await reviewAiReport({ reference, reportId, expectedStatus, status, notes: notes || null, edited });
  } catch (e) {
    return fail(e, reference);
  }
  revalidatePath(`/admin/service/${reference}`);
  revalidatePath("/admin/service");
  return { ok: true, message: status === "APPROVED" ? "Report approved." : status === "EDITED" ? "Staff-edited version saved. The original AI report is unchanged." : "Report rejected." };
}
