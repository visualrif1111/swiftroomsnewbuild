// Photo observation — schema "po-1" (Phase 4D, docs/service-aftercare/AI.md).
//
// The output of the per-photo vision stage: an honest assessment of the
// photo and conservative observations of what is VISIBLE in it. There are
// deliberately no media ids or labels in it: one photo is analysed per call
// and the server attaches the photo's identity, so an observation can never
// be attributed to a different photo.
//
// Validation is fail-closed: structure, then safety (forbidden claims,
// causation, hedging, no transcribed text, no descriptions of people), then
// consistency and size. Nothing invalid is stored.
import { CERTAINTIES, HEDGE_TYPES_ALLOWED_WHEN_UNUSABLE, OBSERVATION_TYPES, PRODUCT_IDS, type Certainty, type ObservationType } from "./report-schema";
import { HEDGE, scanForbiddenClaims, type ForbiddenClaimRule } from "./safety";

export const PHOTO_OBSERVATION_SCHEMA_VERSION = "po-1";
export const PHOTO_QUALITIES = ["CLEAR", "LIMITED", "UNUSABLE"] as const;
export const PHOTO_QUALITY_ISSUES = ["BLURRY", "DARK", "OVEREXPOSED", "OBSTRUCTED", "TOO_FAR", "TOO_CLOSE", "PARTIAL_VIEW"] as const;
export const PHOTO_RELEVANCE = ["RELEVANT", "UNCLEAR", "NOT_RELEVANT"] as const;
export const PO_LIMITS = { observations: 8, observation: 300, location: 80, cannotDetermine: 5, cannotDetermineText: 200 } as const;

export interface PhotoObservationResult {
  photo: {
    quality: (typeof PHOTO_QUALITIES)[number];
    qualityIssues: (typeof PHOTO_QUALITY_ISSUES)[number][];
    relevance: (typeof PHOTO_RELEVANCE)[number];
    visibleProductTypes: string[];
    visibleTextPresent: boolean;
    personalInfoVisible: boolean;
  };
  observations: { type: ObservationType; observation: string; certainty: Certainty; location: string | null }[];
  cannotDetermine: string[];
}

type Schema = Record<string, unknown>;
const obj = (properties: Record<string, Schema>): Schema => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const str = (maxLength: number): Schema => ({ type: "string", maxLength });
const oneOf = (values: readonly string[]): Schema => ({ type: "string", enum: [...values] });
const arr = (items: Schema, maxItems: number): Schema => ({ type: "array", items, maxItems });

export const PHOTO_OBSERVATION_JSON_SCHEMA_NAME = "photo_observation_po_1";
export const PHOTO_OBSERVATION_JSON_SCHEMA: Schema = obj({
  photo: obj({
    quality: oneOf(PHOTO_QUALITIES),
    qualityIssues: arr(oneOf(PHOTO_QUALITY_ISSUES), PHOTO_QUALITY_ISSUES.length),
    relevance: oneOf(PHOTO_RELEVANCE),
    visibleProductTypes: arr(oneOf(PRODUCT_IDS), PRODUCT_IDS.length),
    visibleTextPresent: { type: "boolean" },
    personalInfoVisible: { type: "boolean" },
  }),
  observations: arr(
    obj({ type: oneOf(OBSERVATION_TYPES), observation: str(PO_LIMITS.observation), certainty: oneOf(CERTAINTIES), location: { type: ["string", "null"], maxLength: PO_LIMITS.location } }),
    PO_LIMITS.observations,
  ),
  cannotDetermine: arr(str(PO_LIMITS.cannotDetermineText), PO_LIMITS.cannotDetermine),
});

/** Every forbidden-claim rule, including causation: observations describe, never explain. */
const OBSERVATION_RULES: ForbiddenClaimRule[] = [
  "PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "MEASUREMENT",
  "DEFINITIVE_DIAGNOSIS", "LIABILITY", "ELIGIBILITY_OR_APPROVAL", "CAUSATION",
];
/** "cannotDetermine" lists open questions ("whether the seal is damaged…"); it may not commit to anything. */
const OPEN_QUESTION_RULES: ForbiddenClaimRule[] = ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"];
/** A quoted run this long means text from the image was transcribed. */
const TRANSCRIBED_TEXT = /["“”'‘’«»][^"“”'‘’«»]{15,}["“”'‘’«»]/;
/**
 * Conclusions a photo can never support (on top of the shared forbidden-claim
 * rules): warranty of any kind, a failed/defective component named as such,
 * repair or replacement need, fault attribution.
 */
const PHOTO_CONCLUSION = /\bwarrant(y|ies|ed)\b|\b(failed|failing|defective|faulty|malfunctioning) (hinge|lock|locking mechanism|mechanism|seal|roller|motor|component|part|gasket|handle|frame|unit|glazing)\b|\b(replacement|repair) (is )?(required|needed|necessary)\b|\bmust be (repaired|replaced|fixed)\b|\bneeds? (to be )?(repaired|replaced|fixed|repair|replacing)\b|\b(installation|installer|fitting|manufacturing|manufacturer)('?s)? (fault|error|defect|issue|problem|mistake)\b|\b(customer|owner|occupant|user)s? (caused|damaged|broke|misused)\b|\bwear and tear\b/i;

/** Observations are about products, never about people. */
const PEOPLE = /\b(man|men|woman|women|boy|girl|child|children|kid|person|people|someone|face|faces|resident|occupant)\b/i;

export type PhotoValidation = { ok: true; value: PhotoObservationResult } | { ok: false; errors: string[] };

export function validatePhotoObservation(input: unknown): PhotoValidation {
  const errors: string[] = [];
  const err = (path: string, code: string) => errors.length < 40 && errors.push(`${path}: ${code}`);
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  const exact = (v: unknown, path: string, keys: string[]): v is Record<string, unknown> => {
    if (!isObj(v)) return err(path, "expected_object"), false;
    for (const k of Object.keys(v)) if (!keys.includes(k)) err(`${path}.${k}`, "unexpected_field");
    for (const k of keys) if (!(k in v)) err(`${path}.${k}`, "missing");
    return true;
  };
  const oneOfCheck = (v: unknown, path: string, allowed: readonly string[]) => (typeof v === "string" && allowed.includes(v)) || (err(path, "invalid_value"), false);
  const text = (v: unknown, path: string, max: number, { nullable = false } = {}): v is string => {
    if (v === null && nullable) return false;
    if (typeof v !== "string") return err(path, "expected_string"), false;
    if (!v.trim()) err(path, "empty");
    if (v.length > max) err(path, "too_long");
    return true;
  };
  const list = (v: unknown, path: string, max: number): v is unknown[] => {
    if (!Array.isArray(v)) return err(path, "expected_array"), false;
    if (v.length > max) err(path, "too_many_items");
    return true;
  };
  const scan = (s: string, path: string, rules: ForbiddenClaimRule[]) => scanForbiddenClaims(s, rules).forEach((h) => err(path, `forbidden_claim:${h.rule}`));

  if (!exact(input, "photoObservation", ["photo", "observations", "cannotDetermine"])) return { ok: false, errors };
  const r = input;
  let quality: unknown;
  let relevance: unknown;
  if (exact(r.photo, "photo", ["quality", "qualityIssues", "relevance", "visibleProductTypes", "visibleTextPresent", "personalInfoVisible"])) {
    const p = r.photo;
    quality = p.quality;
    relevance = p.relevance;
    oneOfCheck(p.quality, "photo.quality", PHOTO_QUALITIES);
    if (list(p.qualityIssues, "photo.qualityIssues", PHOTO_QUALITY_ISSUES.length)) p.qualityIssues.forEach((q, i) => oneOfCheck(q, `photo.qualityIssues[${i}]`, PHOTO_QUALITY_ISSUES));
    oneOfCheck(p.relevance, "photo.relevance", PHOTO_RELEVANCE);
    if (list(p.visibleProductTypes, "photo.visibleProductTypes", PRODUCT_IDS.length)) p.visibleProductTypes.forEach((q, i) => oneOfCheck(q, `photo.visibleProductTypes[${i}]`, PRODUCT_IDS));
    if (typeof p.visibleTextPresent !== "boolean") err("photo.visibleTextPresent", "expected_boolean");
    if (typeof p.personalInfoVisible !== "boolean") err("photo.personalInfoVisible", "expected_boolean");
  }

  if (list(r.observations, "observations", PO_LIMITS.observations)) {
    r.observations.forEach((o, i) => {
      const path = `observations[${i}]`;
      if (!exact(o, path, ["type", "observation", "certainty", "location"])) return;
      const typeOk = oneOfCheck(o.type, `${path}.type`, OBSERVATION_TYPES);
      const certOk = oneOfCheck(o.certainty, `${path}.certainty`, CERTAINTIES);
      const hasLocation = text(o.location, `${path}.location`, PO_LIMITS.location, { nullable: true });
      if (text(o.observation, `${path}.observation`, PO_LIMITS.observation)) {
        const s = o.observation;
        if (certOk && o.certainty !== "CLEAR" && !HEDGE.test(s)) err(`${path}.observation`, "uncertain_observation_stated_as_fact");
        scan(s, `${path}.observation`, OBSERVATION_RULES);
        if (TRANSCRIBED_TEXT.test(s)) err(`${path}.observation`, "transcribed_text_not_allowed");
        if (PEOPLE.test(s)) err(`${path}.observation`, "describes_people");
        if (PHOTO_CONCLUSION.test(s)) err(`${path}.observation`, "conclusion_not_supported_by_photo");
      }
      if (hasLocation) {
        const loc = o.location as string;
        scan(loc, `${path}.location`, OBSERVATION_RULES);
        if (TRANSCRIBED_TEXT.test(loc)) err(`${path}.location`, "transcribed_text_not_allowed");
        if (PEOPLE.test(loc)) err(`${path}.location`, "describes_people");
        if (PHOTO_CONCLUSION.test(loc)) err(`${path}.location`, "conclusion_not_supported_by_photo");
      }
      // An unusable or irrelevant photo can't support defect observations.
      if (typeOk && (quality === "UNUSABLE" || relevance === "NOT_RELEVANT") && !HEDGE_TYPES_ALLOWED_WHEN_UNUSABLE.includes(o.type as ObservationType)) {
        err(`${path}.type`, quality === "UNUSABLE" ? "defect_observation_on_unusable_photo" : "defect_observation_on_irrelevant_photo");
      }
    });
  }

  if (list(r.cannotDetermine, "cannotDetermine", PO_LIMITS.cannotDetermine)) {
    r.cannotDetermine.forEach((c, i) => {
      if (text(c, `cannotDetermine[${i}]`, PO_LIMITS.cannotDetermineText)) {
        scan(c, `cannotDetermine[${i}]`, OPEN_QUESTION_RULES);
        if (/\b(is|are) (covered|under) (by )?(the )?warrant/i.test(c)) err(`cannotDetermine[${i}]`, "forbidden_claim:WARRANTY_CONFIRMATION");
        if (TRANSCRIBED_TEXT.test(c)) err(`cannotDetermine[${i}]`, "transcribed_text_not_allowed");
      }
    });
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: r as unknown as PhotoObservationResult };
}
