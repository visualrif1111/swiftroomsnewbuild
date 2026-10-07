// Service-dashboard domain types: plain data, no provider dependencies.
// Shared by the data layer, server actions and presentation components.
import type { AiReport, AiRun } from "@/lib/service-call/ai/run-store";
import type { StaffMember, StaffRole } from "./auth/access";
import type { AiState, DashboardStatus } from "./labels";

export type MediaType = "PHOTO" | "VIDEO" | "VOICE";
export type UploadStatus = "PENDING" | "UPLOADED" | "FAILED";

/** Outcome of a staff mutation, as shown by the forms. */
export interface ActionResult {
  ok: boolean;
  message?: string;
  /** The request changed under the user: the page has been refreshed. */
  stale?: boolean;
}
export type FormAction = (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;

export interface InboxRow {
  id: string;
  reference: string;
  customerName: string;
  productCategories: string[];
  issue: string;
  submittedAt: string;
  status: DashboardStatus;
  urgency: string;
  aiState: AiState;
  reviewStatus: string | null;
  photos: number;
  videos: number;
  voiceNotes: number;
}

export interface HistoryEntry {
  id: number;
  fromStatus: DashboardStatus | null;
  toStatus: DashboardStatus;
  changedAt: string;
  changedBy: string;
  actorName: string | null;
  actorRole: StaffRole | null;
  note: string | null;
}

export interface EvidenceItem {
  id: string;
  type: MediaType;
  label: string;
  mimeType: string;
  fileSize: number | null;
  durationSeconds: number | null;
  uploadStatus: UploadStatus;
  failureReason: string | null;
  createdAt: string;
}

export interface AnalysisSummary {
  mediaId: string;
  kind: string;
  status: string;
  errorCode: string | null;
  transcript: string | null;
  language: string | null;
  createdAt: string;
}

export interface ReviewEntry {
  id: string;
  reportId: string;
  status: "APPROVED" | "EDITED" | "REJECTED";
  reviewerName: string;
  reviewerRole: StaffRole;
  notes: string | null;
  editedReport: StaffEdit | null;
  createdAt: string;
  supersededAt: string | null;
}

export interface StaffEdit {
  schema: "staff-edit-1";
  issueSummary: string;
  urgency: { level: string; reason: string };
  corrections: string;
}

export interface AllowedTransition {
  to: DashboardStatus;
  noteRequired: boolean;
  minRole: StaffRole;
}

export interface RequestDetail {
  viewer: Pick<StaffMember, "displayName" | "role">;
  request: {
    id: string;
    reference: string;
    status: DashboardStatus;
    createdAt: string;
    updatedAt: string;
    customerName: string;
    email: string;
    mobileE164: string;
    location: string;
    existingCustomer: boolean | null;
    projectReference: string | null;
    productCategories: string[];
    otherProduct: string | null;
    problemDescription: string;
    declaredMedia: { photos: number; videos: number; voiceNote: boolean };
    channel: string;
  };
  history: HistoryEntry[];
  evidence: EvidenceItem[];
  analyses: AnalysisSummary[];
  aiState: AiState;
  latestRun: Pick<AiRun, "runNumber" | "status" | "errorCode" | "trigger" | "startedAt" | "finishedAt" | "attempts" | "maxAttempts"> | null;
  reports: AiReport[];
  reviews: ReviewEntry[];
  transitions: AllowedTransition[];
}
