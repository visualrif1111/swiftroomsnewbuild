// Service Call Report — schema "scr-1" (Phase 4, docs/service-aftercare/AI.md).
//
// A report has two layers:
//   - server-owned facts (processing coverage, media counts, transcripts,
//     deterministic safety flags) that the AI never writes;
//   - AI-owned `content`, validated by report-validation.ts before storage.
//
// The content keeps three things structurally apart:
//   customerReported            what the customer said (description, voice, video audio)
//   mediaObservations           what can be seen in their photos/video frames
//   unknownsRequiringInspection what can't be established without a visit
//
// No vendor types: this file is shared by the pipeline, validators and tests.
import type { ServiceProductId } from "../types";

export const REPORT_SCHEMA_VERSION = "scr-1";

export const PRODUCT_IDS: readonly ServiceProductId[] = [
  "window", "sliding-door", "bi-fold-door", "entrance-door", "glass",
  "hardware", "motorised-system", "curtain-wall", "other",
];

export const STATEMENT_SOURCES = ["DESCRIPTION", "VOICE_NOTE", "VIDEO_AUDIO"] as const;

export const OBSERVATION_TYPES = [
  "VISIBLE_GAP_OR_MISALIGNMENT",
  "GLASS_CRACK_OR_CHIP",
  "CONDENSATION_BETWEEN_PANES",
  "SEAL_OR_GASKET_DISPLACED",
  "HARDWARE_LOOSE_OR_MISSING",
  "CORROSION_OR_FINISH_DAMAGE",
  "WATER_STAINING",
  "DEBRIS_OR_OBSTRUCTION",
  "NOTHING_NOTABLE_VISIBLE",
  "OTHER",
] as const;

export const CERTAINTIES = ["CLEAR", "PROBABLE", "UNCERTAIN"] as const;

export const UNKNOWN_TOPICS = [
  "COMPONENT_FAILURE",
  "CAUSE",
  "REPAIR_METHOD",
  "REPLACEMENT_NEEDED",
  "WARRANTY",
  "COST",
  "PRODUCT_IDENTIFICATION",
  "SAFETY_CONFIRMATION",
  "OTHER",
] as const;

/** Always present in a stored report — added by the server, never left to the AI. */
export const MANDATORY_UNKNOWN_TOPICS = ["WARRANTY", "COST", "REPAIR_METHOD"] as const;

export const PRODUCT_BASES = ["CUSTOMER_SELECTED", "CUSTOMER_DESCRIBED", "MEDIA_OBSERVED"] as const;

export const ISSUE_CATEGORIES = [
  "OPERATION_STIFF_OR_STUCK",
  "LOCKING_OR_SECURITY",
  "WATER_INGRESS_OR_SEALS",
  "GLASS_DAMAGE",
  "CONDENSATION",
  "HARDWARE",
  "ALIGNMENT",
  "MOTOR_OR_CONTROLS",
  "NOISE",
  "DRAUGHT",
  "COSMETIC",
  "OTHER",
] as const;

/** "CONFIRMED" deliberately doesn't exist: confirmation needs an inspection. */
export const LIKELIHOODS = ["POSSIBLE", "LIKELY"] as const;

export const URGENCY_LEVELS = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const URGENCY_INDICATORS = [
  "CANNOT_SECURE_PROPERTY",
  "BROKEN_OR_UNSTABLE_GLASS",
  "ACTIVE_WATER_INGRESS",
  "INJURY_RISK_LOOSE_COMPONENT",
  "BLOCKED_EXIT_OR_ACCESS",
  "ELECTRICAL_OR_MOTOR_HAZARD",
  "SIGNIFICANT_LOSS_OF_FUNCTION",
] as const;

/** URGENT is only explainable by one of these. */
export const URGENT_INDICATORS: readonly UrgencyIndicator[] = [
  "CANNOT_SECURE_PROPERTY",
  "BROKEN_OR_UNSTABLE_GLASS",
  "ACTIVE_WATER_INGRESS",
  "INJURY_RISK_LOOSE_COMPONENT",
  "ELECTRICAL_OR_MOTOR_HAZARD",
];

export const INDICATOR_BASES = ["CUSTOMER_REPORTED", "MEDIA_OBSERVED", "BOTH"] as const;

export const NEXT_STEPS = ["STAFF_CALLBACK", "REQUEST_MORE_INFORMATION", "INSPECTION_VISIT", "URGENT_CALLBACK"] as const;

export const CONFIDENCE_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

export type StatementSource = (typeof STATEMENT_SOURCES)[number];
export type ObservationType = (typeof OBSERVATION_TYPES)[number];
export type Certainty = (typeof CERTAINTIES)[number];
export type UnknownTopic = (typeof UNKNOWN_TOPICS)[number];
export type ProductBasis = (typeof PRODUCT_BASES)[number];
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export type Likelihood = (typeof LIKELIHOODS)[number];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
export type UrgencyIndicator = (typeof URGENCY_INDICATORS)[number];
export type IndicatorBasis = (typeof INDICATOR_BASES)[number];
export type NextStep = (typeof NEXT_STEPS)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

/** Field length caps (characters). */
export const LIMITS = {
  issueSummary: 400,
  text: 500,
  shortText: 200,
  listItems: 20,
  observations: 40,
} as const;

// ─── AI-owned content ────────────────────────────────────────────────────────

export interface CustomerStatement {
  id: string; // "st-1"
  text: string;
  source: { type: StatementSource; mediaId: string | null };
}

export interface ReportedSymptom {
  id: string; // "sy-1"
  symptom: string;
  statementRefs: string[];
}

export interface MediaObservation {
  id: string; // "ob-1"
  evidence: { mediaId: string; label: string; frameAtSeconds: number | null };
  observation: string;
  type: ObservationType;
  certainty: Certainty;
  relatesToSymptomRefs: string[];
}

export interface UnknownItem {
  topic: UnknownTopic;
  question: string;
  whyUnknown: string;
}

export interface ServiceCallReportContent {
  issueSummary: string;
  customerReported: {
    statements: CustomerStatement[];
    reportedSymptoms: ReportedSymptom[];
    reportedOnset: string | null;
    locationInProperty: string | null;
  };
  mediaObservations: MediaObservation[];
  unknownsRequiringInspection: UnknownItem[];
  affectedProducts: { category: ServiceProductId; basis: ProductBasis }[];
  potentialIssueCategories: { category: IssueCategory; likelihood: Likelihood; basedOnRefs: string[] }[];
  urgency: {
    level: UrgencyLevel;
    indicators: { indicator: UrgencyIndicator; basis: IndicatorBasis; refs: string[] }[];
    reason: string;
  };
  inspection: { recommended: boolean; reason: string };
  recommendedNextStep: NextStep;
  moreInformationNeeded: string[];
  confidence: { overall: ConfidenceLevel; reason: string };
  limitations: string[];
}

// ─── Server-owned envelope (stored as service_ai_reports.ai_report) ──────────

export type MediaCoverageOutcome = "ANALYSED" | "SKIPPED" | "FAILED";
export type EvidenceType = "PHOTO" | "VIDEO" | "VOICE";

export interface ServiceCallReport {
  schemaVersion: typeof REPORT_SCHEMA_VERSION;
  serviceReference: string;
  processing: {
    status: "COMPLETED" | "PARTIAL";
    mediaCoverage: { mediaId: string; label: string; type: EvidenceType; outcome: MediaCoverageOutcome; reasonCode: string | null }[];
  };
  mediaSummary: { photos: number; videos: number; voiceNotes: number };
  transcripts: { mediaId: string; label: string; kind: "VOICE_NOTE" | "VIDEO_AUDIO"; language: string | null; text: string; machineGenerated: true; noSpeechDetected: boolean; possiblyIncomplete: boolean }[];
  /** Deterministic keyword net over customer text — independent of the AI. */
  safetyFlags: { indicator: UrgencyIndicator; matchedIn: "DESCRIPTION" | "TRANSCRIPT" }[];
  content: ServiceCallReportContent;
}
