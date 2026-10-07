// Staff-facing wording for enum values. Plain language; never implies the AI
// confirmed a fault, cause, liability, warranty, repair, price or appointment.
import { SERVICE_PRODUCTS } from "@/lib/service-call/config";

export const SERVICE_STATUSES = [
  "SUBMITTED", "AWAITING_REVIEW", "MORE_INFORMATION_REQUIRED", "INSPECTION_REQUIRED", "SCHEDULED", "IN_PROGRESS", "RESOLVED", "CLOSED",
] as const;
export type DashboardStatus = (typeof SERVICE_STATUSES)[number] | "AI_PROCESSED";

export const STATUS_LABEL: Record<DashboardStatus, string> = {
  SUBMITTED: "Submitted",
  AI_PROCESSED: "AI processed (unused)",
  AWAITING_REVIEW: "Awaiting review",
  MORE_INFORMATION_REQUIRED: "More info required",
  INSPECTION_REQUIRED: "Inspection required",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
export const OPEN_STATUSES = SERVICE_STATUSES.filter((s) => s !== "RESOLVED" && s !== "CLOSED");

/** Verb phrases for the status-change control. */
export const TRANSITION_VERB: Partial<Record<DashboardStatus, string>> = {
  AWAITING_REVIEW: "Move to review",
  MORE_INFORMATION_REQUIRED: "Request more information",
  INSPECTION_REQUIRED: "Mark inspection required",
  SCHEDULED: "Mark scheduled",
  IN_PROGRESS: "Start work",
  RESOLVED: "Mark resolved",
  CLOSED: "Close request",
};

export const AI_STATES = ["NOT_STARTED", "PROCESSING", "PARTIAL", "FAILED", "COMPLETED"] as const;
export type AiState = (typeof AI_STATES)[number];
export const AI_STATE_LABEL: Record<AiState, string> = {
  NOT_STARTED: "AI not run",
  PROCESSING: "AI processing",
  PARTIAL: "AI partial",
  FAILED: "AI failed",
  COMPLETED: "AI complete",
};
/** Run status → dashboard AI state (same mapping as list_service_requests). */
export function aiStateOf(runStatus: string | null | undefined): AiState {
  if (!runStatus) return "NOT_STARTED";
  if (runStatus === "QUEUED" || runStatus === "PROCESSING") return "PROCESSING";
  if (runStatus === "COMPLETED" || runStatus === "PARTIAL") return runStatus;
  return "FAILED";
}

export const URGENCIES = ["URGENT", "HIGH", "NORMAL", "LOW", "NONE"] as const;
export type Urgency = (typeof URGENCIES)[number];
export const URGENCY_LABEL: Record<Urgency, string> = { URGENT: "Urgent", HIGH: "High", NORMAL: "Normal", LOW: "Low", NONE: "Not assessed" };

export const REVIEW_LABEL: Record<string, string> = {
  AWAITING_REVIEW: "Not reviewed",
  APPROVED: "Approved",
  EDITED: "Edited by staff",
  REJECTED: "Rejected",
};

export const PRODUCT_LABEL: Record<string, string> = Object.fromEntries(SERVICE_PRODUCTS.map((p) => [p.id, p.label]));
export const productLabel = (id: string) => PRODUCT_LABEL[id] ?? id;

export const DISCREPANCY_TOPICS = ["CONFLICTING_CUSTOMER_INFORMATION", "PRODUCT_SELECTION_MISMATCH", "EVIDENCE_DISCREPANCY"] as const;
export const TOPIC_LABEL: Record<string, string> = {
  COMPONENT_FAILURE: "Component failure",
  CAUSE: "Cause",
  REPAIR_METHOD: "Repair method",
  REPLACEMENT_NEEDED: "Replacement needed",
  WARRANTY: "Warranty",
  COST: "Cost",
  PRODUCT_IDENTIFICATION: "Product identification",
  SAFETY_CONFIRMATION: "Safety confirmation",
  CONFLICTING_CUSTOMER_INFORMATION: "Customer statements conflict",
  PRODUCT_SELECTION_MISMATCH: "Product selection mismatch",
  EVIDENCE_DISCREPANCY: "Media disagrees with customer's account",
  BEHAVIOUR_OVER_TIME: "Behaviour over time",
  OTHER: "Other",
};

export const OBSERVATION_LABEL: Record<string, string> = {
  VISIBLE_GAP_OR_MISALIGNMENT: "Gap or misalignment",
  GLASS_CRACK_OR_CHIP: "Glass crack or chip",
  CONDENSATION_BETWEEN_PANES: "Condensation between panes",
  SEAL_OR_GASKET_DISPLACED: "Seal or gasket displaced",
  HARDWARE_LOOSE_OR_MISSING: "Hardware loose or missing",
  CORROSION_OR_FINISH_DAMAGE: "Corrosion or finish damage",
  WATER_STAINING: "Water staining",
  DEBRIS_OR_OBSTRUCTION: "Debris or obstruction",
  NOTHING_NOTABLE_VISIBLE: "Nothing notable visible",
  OTHER: "Other",
};

export const INDICATOR_LABEL: Record<string, string> = {
  CANNOT_SECURE_PROPERTY: "Property can't be secured",
  BROKEN_OR_UNSTABLE_GLASS: "Broken or unstable glass",
  ACTIVE_WATER_INGRESS: "Active water entry",
  INJURY_RISK_LOOSE_COMPONENT: "Injury risk: loose component",
  BLOCKED_EXIT_OR_ACCESS: "Blocked exit or access",
  ELECTRICAL_OR_MOTOR_HAZARD: "Electrical or motor hazard",
  SIGNIFICANT_LOSS_OF_FUNCTION: "Significant loss of function",
  CONTAINED_DAMAGE: "Contained damage",
};
export const BASIS_LABEL: Record<string, string> = { CUSTOMER_REPORTED: "Customer reported", MEDIA_OBSERVED: "Seen in media", BOTH: "Customer + media" };

export const NEXT_STEP_LABEL: Record<string, string> = {
  STAFF_CALLBACK: "Staff call-back",
  REQUEST_MORE_INFORMATION: "Request more information",
  INSPECTION_VISIT: "Inspection visit",
  URGENT_CALLBACK: "Urgent call-back",
};

export const ISSUE_CATEGORY_LABEL: Record<string, string> = {
  OPERATION_STIFF_OR_STUCK: "Stiff or stuck operation",
  LOCKING_OR_SECURITY: "Locking or security",
  WATER_INGRESS_OR_SEALS: "Water entry or seals",
  GLASS_DAMAGE: "Glass damage",
  CONDENSATION: "Condensation",
  HARDWARE: "Hardware",
  ALIGNMENT: "Alignment",
  MOTOR_OR_CONTROLS: "Motor or controls",
  NOISE: "Noise",
  DRAUGHT: "Draught",
  COSMETIC: "Cosmetic",
  OTHER: "Other",
};

/** Per-file analysis outcomes and failure reasons, in staff language. */
export const REASON_LABEL: Record<string, string> = {
  audio_empty: "Recording is empty",
  audio_exceeds_provider_limit: "Recording too long to transcribe",
  audio_extraction_failed: "Couldn't extract the video's audio",
  audio_format_not_supported: "Audio format not supported for transcription",
  audio_unreadable: "Recording couldn't be read",
  transcription_not_available: "Transcription not available",
  image_analysis_not_available: "Photo analysis not available",
  image_blank: "Image is blank",
  image_format_not_supported: "Image format not supported for analysis",
  image_refused: "Photo analysis declined by the AI provider",
  image_too_large_to_process: "Image too large to analyse",
  image_unreadable: "Image couldn't be read",
  invalid_observation: "Photo analysis returned an unusable result",
  frame_not_reproducible: "Frame couldn't be re-extracted",
  video_blank: "Video frames are blank",
  video_codec_not_supported: "Video codec not supported for analysis",
  video_container_not_supported: "Video format not supported for analysis",
  video_empty: "Video is empty",
  video_no_usable_frames: "No usable frames in the video",
  video_no_video_stream: "File has no video stream",
  video_processing_not_available: "Video analysis not available",
  video_processing_timeout: "Video processing timed out",
  video_resolution_not_supported: "Video resolution not supported",
  video_unreadable: "Video couldn't be read",
  video_worker_unavailable: "Video processing unavailable",
  invalid_output: "AI returned an invalid result",
  model_refusal: "AI declined to answer",
  output_refusal: "AI declined to answer",
  provider_auth_failed: "AI provider not configured",
  provider_model_not_found: "AI model not available",
  provider_network_error: "AI provider network error",
  provider_rate_limited: "AI provider busy (rate limited)",
  provider_timeout: "AI provider timed out",
  provider_unavailable: "AI provider unavailable",
  report_stage_not_available: "Report generation not available",
  internal_error: "Internal processing error",
  ai_disabled: "AI processing is disabled",
};
export const reasonLabel = (code: string | null | undefined) => (code ? (REASON_LABEL[code] ?? code.replace(/_/g, " ")) : null);

export const MEDIA_LABEL: Record<string, string> = { PHOTO: "Photo", VIDEO: "Video", VOICE: "Voice note" };

export function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}
