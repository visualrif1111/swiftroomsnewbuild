// Strict JSON Schema for the AI-owned report content (scr-1.4), sent to the
// provider as a structured-output constraint. It mirrors report-schema.ts and
// report-validation.ts exactly — a parity test keeps them in step. The
// server re-validates everything regardless (the schema can't express
// provenance, references or safety rules).
import {
  CERTAINTIES, CONFIDENCE_LEVELS, INDICATOR_BASES, ISSUE_CATEGORIES, LIKELIHOODS, LIMITS, NEXT_STEPS,
  OBSERVATION_TYPES, PRODUCT_BASES, PRODUCT_IDS, STATEMENT_SOURCES, UNKNOWN_TOPICS, URGENCY_INDICATORS, URGENCY_LEVELS,
} from "./report-schema";

type Schema = Record<string, unknown>;

const str = (maxLength: number): Schema => ({ type: "string", maxLength });
const nullableStr = (maxLength: number): Schema => ({ type: ["string", "null"], maxLength });
const oneOf = (values: readonly string[]): Schema => ({ type: "string", enum: [...values] });
const arr = (items: Schema, maxItems: number): Schema => ({ type: "array", items, maxItems });
/** Strict-mode object: every property required, nothing else allowed. */
const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const ids = arr(str(20), LIMITS.listItems);

export const REPORT_JSON_SCHEMA_NAME = "service_call_report_scr_1_4";

export const REPORT_JSON_SCHEMA: Schema = obj({
  issueSummary: str(LIMITS.issueSummary),
  customerReported: obj({
    statements: arr(
      obj({
        id: str(20),
        text: str(LIMITS.text),
        quote: str(LIMITS.quote),
        source: obj({ type: oneOf(STATEMENT_SOURCES), mediaId: nullableStr(64) }),
      }),
      LIMITS.listItems,
    ),
    reportedSymptoms: arr(obj({ id: str(20), symptom: str(LIMITS.shortText), statementRefs: ids }), LIMITS.listItems),
    reportedOnset: nullableStr(LIMITS.shortText),
    locationInProperty: nullableStr(LIMITS.shortText),
  }),
  mediaObservations: arr(
    obj({
      id: str(20),
      evidence: obj({ mediaId: str(64), label: str(40), frameAtSeconds: { type: ["number", "null"] } }),
      observation: str(LIMITS.text),
      type: oneOf(OBSERVATION_TYPES),
      certainty: oneOf(CERTAINTIES),
      relatesToSymptomRefs: ids,
    }),
    // scr-1.2+: observations are injected by the server from validated photo
    // and video-frame analysis; the report model must return none of its own.
    0,
  ),
  unknownsRequiringInspection: arr(obj({ topic: oneOf(UNKNOWN_TOPICS), question: str(LIMITS.shortText), whyUnknown: str(LIMITS.shortText) }), LIMITS.listItems),
  affectedProducts: arr(obj({ category: oneOf(PRODUCT_IDS), basis: oneOf(PRODUCT_BASES) }), PRODUCT_IDS.length),
  potentialIssueCategories: arr(obj({ category: oneOf(ISSUE_CATEGORIES), likelihood: oneOf(LIKELIHOODS), basedOnRefs: ids }), ISSUE_CATEGORIES.length),
  urgency: obj({
    level: oneOf(URGENCY_LEVELS),
    indicators: arr(obj({ indicator: oneOf(URGENCY_INDICATORS), basis: oneOf(INDICATOR_BASES), refs: ids }), URGENCY_INDICATORS.length),
    reason: str(LIMITS.text),
  }),
  inspection: obj({ recommended: { type: "boolean" }, reason: str(LIMITS.text) }),
  recommendedNextStep: oneOf(NEXT_STEPS),
  moreInformationNeeded: arr(str(LIMITS.shortText), 10),
  confidence: obj({ overall: oneOf(CONFIDENCE_LEVELS), reason: str(LIMITS.shortText) }),
  limitations: arr(str(LIMITS.shortText), 10),
});
