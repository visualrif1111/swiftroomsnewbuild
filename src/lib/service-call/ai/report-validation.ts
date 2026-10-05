// Server-side validation of AI report content (schema "scr-1.1").
//
// Runs on every report before it can be stored, whatever the provider
// promised about structured output:
//   1. structure  — exact shape, closed enums, lengths (no extra fields)
//   2. provenance — every customer statement carries a verbatim quote that
//                   occurs in the source the model was given
//   3. semantics  — every reference resolves; observations cite real visual
//                   evidence (none at all in a text-only phase); urgency is
//                   explained by indicators; confidence capped
//   4. safety     — forbidden claims (safety.ts)
//   5. size       — overall output bounded
// Anything that fails is not a report. Errors are internal codes/paths, never
// shown to customers.
import {
  CERTAINTIES, CONFIDENCE_LEVELS, type ConfidenceLevel, INDICATOR_BASES, ISSUE_CATEGORIES, LIKELIHOODS, LIMITS,
  MANDATORY_UNKNOWN_TOPICS, NEXT_STEPS, OBSERVATION_TYPES, PRODUCT_BASES, PRODUCT_IDS,
  STATEMENT_SOURCES, UNKNOWN_TOPICS, URGENCY_INDICATORS, URGENCY_LEVELS, URGENT_INDICATORS,
  type EvidenceType, type ServiceCallReportContent, type UnknownItem, type UrgencyIndicator,
} from "./report-schema";
import { HEDGE, scanForbiddenClaims, type ForbiddenClaimRule } from "./safety";

export interface ValidationContext {
  /** Media the AI was given, and whether it was actually analysed/transcribed. */
  evidence: { mediaId: string; type: EvidenceType; analysed: boolean; durationSeconds: number | null }[];
  /** Deterministic safety flags raised from the customer's own words. */
  safetyFlags: UrgencyIndicator[];
  /**
   * Exactly the text the model was given (scrubbed), so quotes can be
   * checked against it. Transcripts carry the Phase 4B advisory flag.
   */
  sources: { description: string; transcripts: { mediaId: string; text: string; possiblyIncomplete: boolean }[] };
  /** False when no image/video analysis exists (Phase 4C): no observations allowed at all. */
  visualAnalysis: boolean;
  /** Highest confidence the phase allows. */
  maxConfidence: ConfidenceLevel;
}

/** Content larger than this (serialised characters) is rejected as not sane. */
const MAX_CONTENT_CHARS = 30_000;

/**
 * Normalises text for quote matching only: Unicode compatibility form,
 * Arabic diacritics/tatweel and alef variants folded, typographic quotes and
 * dashes unified, case folded, whitespace collapsed. Never used to rewrite
 * what is stored.
 */
export function normaliseForQuote(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Quote edges may differ in surrounding punctuation only. */
const trimEdges = (s: string) => s.replace(/^[\s"'«»“”.,;:!?،؛…-]+|[\s"'«»“”.,;:!?،؛…-]+$/gu, "");

export function quoteOccursIn(quote: string, source: string): boolean {
  const q = trimEdges(normaliseForQuote(quote));
  return q.length > 0 && normaliseForQuote(source).includes(q);
}

export type ReportValidation = { ok: true; value: ServiceCallReportContent } | { ok: false; errors: string[] };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

class Checker {
  errors: string[] = [];
  err(path: string, code: string) {
    if (this.errors.length < 50) this.errors.push(`${path}: ${code}`);
  }
  exact(v: unknown, path: string, keys: string[]): v is Obj {
    if (!isObj(v)) return this.err(path, "expected_object"), false;
    for (const k of Object.keys(v)) if (!keys.includes(k)) this.err(`${path}.${k}`, "unexpected_field");
    for (const k of keys) if (!(k in v)) this.err(`${path}.${k}`, "missing");
    return true;
  }
  str(v: unknown, path: string, max: number, { nullable = false, allowEmpty = false } = {}): v is string {
    if (v === null && nullable) return false;
    if (typeof v !== "string") return this.err(path, "expected_string"), false;
    if (!allowEmpty && !v.trim()) this.err(path, "empty");
    if (v.length > max) this.err(path, "too_long");
    return true;
  }
  oneOf<T extends string>(v: unknown, path: string, allowed: readonly T[]): v is T {
    if (typeof v !== "string" || !allowed.includes(v as T)) return this.err(path, "invalid_value"), false;
    return true;
  }
  arr(v: unknown, path: string, max: number): v is unknown[] {
    if (!Array.isArray(v)) return this.err(path, "expected_array"), false;
    if (v.length > max) this.err(path, "too_many_items");
    return true;
  }
  bool(v: unknown, path: string) {
    if (typeof v !== "boolean") this.err(path, "expected_boolean");
  }
  ids(v: unknown, path: string): string[] {
    if (!this.arr(v, path, LIMITS.listItems)) return [];
    return v.filter((x, i) => (typeof x === "string" ? true : (this.err(`${path}[${i}]`, "expected_string"), false))) as string[];
  }
}

/**
 * Validates AI-produced content. Returns the content (typed) only when every
 * structural, semantic and safety rule passes.
 */
export function validateReportContent(input: unknown, ctx: ValidationContext): ReportValidation {
  const c = new Checker();
  const top = ["issueSummary", "customerReported", "mediaObservations", "unknownsRequiringInspection", "affectedProducts",
    "potentialIssueCategories", "urgency", "inspection", "recommendedNextStep", "moreInformationNeeded", "confidence", "limitations"];
  if (!c.exact(input, "content", top)) return { ok: false, errors: c.errors };
  const r = input;

  // ── Structure ──
  c.str(r.issueSummary, "issueSummary", LIMITS.issueSummary);

  const statementIds = new Set<string>();
  /** Statements resting on a transcript flagged possibly incomplete (advisory). */
  const citedUncertain = new Set<string>();
  const symptomIds = new Set<string>();
  const evidenceById = new Map(ctx.evidence.map((e) => [e.mediaId, e]));
  // Ids are shared across statements, symptoms and observations, so refs are unambiguous.
  const allIds = new Set<string>();
  const addUnique = (set: Set<string>, id: string, path: string) => {
    if (allIds.has(id)) return c.err(path, "duplicate_id");
    allIds.add(id);
    set.add(id);
  };
  if (c.exact(r.customerReported, "customerReported", ["statements", "reportedSymptoms", "reportedOnset", "locationInProperty"])) {
    const cr = r.customerReported;
    if (c.arr(cr.statements, "customerReported.statements", LIMITS.listItems)) {
      cr.statements.forEach((s, i) => {
        const p = `customerReported.statements[${i}]`;
        if (!c.exact(s, p, ["id", "text", "quote", "source"])) return;
        if (c.str(s.id, `${p}.id`, 20)) addUnique(statementIds, s.id, `${p}.id`);
        c.str(s.text, `${p}.text`, LIMITS.text);
        const hasQuote = c.str(s.quote, `${p}.quote`, LIMITS.quote);
        if (c.exact(s.source, `${p}.source`, ["type", "mediaId"]) && c.oneOf(s.source.type, `${p}.source.type`, STATEMENT_SOURCES)) {
          const src = s.source;
          let sourceText: string | null = null;
          if (src.type === "DESCRIPTION") {
            if (src.mediaId !== null) c.err(`${p}.source.mediaId`, "must_be_null_for_description");
            sourceText = ctx.sources.description;
            if (!sourceText.trim()) c.err(`${p}.source.type`, "no_description_given");
          } else {
            // Voice note or video audio: must point at media whose (non-empty) transcript the AI was given.
            const ev = typeof src.mediaId === "string" ? evidenceById.get(src.mediaId) : undefined;
            const expected = src.type === "VOICE_NOTE" ? "VOICE" : "VIDEO";
            const transcript = ctx.sources.transcripts.find((t) => t.mediaId === src.mediaId);
            if (!ev || ev.type !== expected || !ev.analysed || !transcript || !transcript.text.trim()) {
              c.err(`${p}.source.mediaId`, "unknown_or_unprocessed_media");
            } else {
              sourceText = transcript.text;
              if (transcript.possiblyIncomplete && typeof s.id === "string") citedUncertain.add(s.id);
            }
          }
          // Provenance: the quote must occur verbatim (after normalisation) in that source.
          if (hasQuote && sourceText !== null && !quoteOccursIn(s.quote as string, sourceText)) c.err(`${p}.quote`, "quote_not_found_in_source");
        }
      });
    }
    if (c.arr(cr.reportedSymptoms, "customerReported.reportedSymptoms", LIMITS.listItems)) {
      cr.reportedSymptoms.forEach((s, i) => {
        const p = `customerReported.reportedSymptoms[${i}]`;
        if (!c.exact(s, p, ["id", "symptom", "statementRefs"])) return;
        if (c.str(s.id, `${p}.id`, 20)) addUnique(symptomIds, s.id, `${p}.id`);
        c.str(s.symptom, `${p}.symptom`, LIMITS.shortText);
        const refs = c.ids(s.statementRefs, `${p}.statementRefs`);
        if (!refs.length) c.err(`${p}.statementRefs`, "symptom_without_customer_statement");
        refs.forEach((ref) => statementIds.has(ref) || c.err(`${p}.statementRefs`, `unknown_statement:${ref}`));
      });
    }
    c.str(cr.reportedOnset, "customerReported.reportedOnset", LIMITS.shortText, { nullable: true });
    c.str(cr.locationInProperty, "customerReported.locationInProperty", LIMITS.shortText, { nullable: true });
  }

  const observationIds = new Set<string>();
  const observationCertainty = new Map<string, string>();
  if (c.arr(r.mediaObservations, "mediaObservations", LIMITS.observations)) {
    // Text-only phase: nothing was looked at, so nothing can be observed.
    if (!ctx.visualAnalysis && r.mediaObservations.length) c.err("mediaObservations", "observations_not_allowed_without_visual_analysis");
    r.mediaObservations.forEach((o, i) => {
      const p = `mediaObservations[${i}]`;
      if (!c.exact(o, p, ["id", "evidence", "observation", "type", "certainty", "relatesToSymptomRefs"])) return;
      if (c.str(o.id, `${p}.id`, 20)) addUnique(observationIds, o.id, `${p}.id`);
      c.oneOf(o.type, `${p}.type`, OBSERVATION_TYPES);
      const certain = c.oneOf(o.certainty, `${p}.certainty`, CERTAINTIES);
      if (certain && typeof o.id === "string") observationCertainty.set(o.id, o.certainty as string);
      if (c.str(o.observation, `${p}.observation`, LIMITS.text) && certain && o.certainty !== "CLEAR" && !HEDGE.test(o.observation)) {
        c.err(`${p}.observation`, "uncertain_observation_stated_as_fact");
      }
      // Observations come from pixels only: a real, analysed photo or video.
      if (c.exact(o.evidence, `${p}.evidence`, ["mediaId", "label", "frameAtSeconds"])) {
        const ev = typeof o.evidence.mediaId === "string" ? evidenceById.get(o.evidence.mediaId) : undefined;
        c.str(o.evidence.label, `${p}.evidence.label`, 40);
        if (!ev) c.err(`${p}.evidence.mediaId`, "unknown_evidence");
        else if (ev.type === "VOICE") c.err(`${p}.evidence.mediaId`, "observation_from_audio_not_visual");
        else if (!ev.analysed) c.err(`${p}.evidence.mediaId`, "evidence_not_analysed");
        const t = o.evidence.frameAtSeconds;
        if (ev?.type === "PHOTO" && t !== null) c.err(`${p}.evidence.frameAtSeconds`, "must_be_null_for_photo");
        if (ev?.type === "VIDEO") {
          if (typeof t !== "number" || !Number.isFinite(t) || t < 0) c.err(`${p}.evidence.frameAtSeconds`, "required_for_video");
          else if (ev.durationSeconds !== null && t > ev.durationSeconds + 1) c.err(`${p}.evidence.frameAtSeconds`, "beyond_video_duration");
        }
      }
      c.ids(o.relatesToSymptomRefs, `${p}.relatesToSymptomRefs`).forEach((ref) => symptomIds.has(ref) || c.err(`${p}.relatesToSymptomRefs`, `unknown_symptom:${ref}`));
    });
  }

  const unknownTopics = new Set<string>();
  if (c.arr(r.unknownsRequiringInspection, "unknownsRequiringInspection", LIMITS.listItems)) {
    r.unknownsRequiringInspection.forEach((u, i) => {
      const p = `unknownsRequiringInspection[${i}]`;
      if (!c.exact(u, p, ["topic", "question", "whyUnknown"])) return;
      if (c.oneOf(u.topic, `${p}.topic`, UNKNOWN_TOPICS)) unknownTopics.add(u.topic);
      c.str(u.question, `${p}.question`, LIMITS.shortText);
      c.str(u.whyUnknown, `${p}.whyUnknown`, LIMITS.shortText);
    });
  }
  for (const topic of MANDATORY_UNKNOWN_TOPICS) if (!unknownTopics.has(topic)) c.err("unknownsRequiringInspection", `missing_mandatory_topic:${topic}`);
  // A statement resting on a possibly-incomplete transcript must leave room for
  // what may be missing: at least one unknown beyond the mandatory three.
  const extraUnknowns = [...unknownTopics].filter((t) => !(MANDATORY_UNKNOWN_TOPICS as readonly string[]).includes(t));
  if (citedUncertain.size && !extraUnknowns.length) c.err("unknownsRequiringInspection", "uncertain_transcript_without_unknown");

  if (c.arr(r.affectedProducts, "affectedProducts", PRODUCT_IDS.length)) {
    r.affectedProducts.forEach((a, i) => {
      const p = `affectedProducts[${i}]`;
      if (!c.exact(a, p, ["category", "basis"])) return;
      c.oneOf(a.category, `${p}.category`, PRODUCT_IDS);
      if (c.oneOf(a.basis, `${p}.basis`, PRODUCT_BASES) && a.basis === "MEDIA_OBSERVED" && !observationIds.size) c.err(`${p}.basis`, "media_basis_without_observation");
    });
  }

  const isRef = (ref: string) => statementIds.has(ref) || observationIds.has(ref) || symptomIds.has(ref);
  if (c.arr(r.potentialIssueCategories, "potentialIssueCategories", ISSUE_CATEGORIES.length)) {
    r.potentialIssueCategories.forEach((pc, i) => {
      const p = `potentialIssueCategories[${i}]`;
      if (!c.exact(pc, p, ["category", "likelihood", "basedOnRefs"])) return;
      c.oneOf(pc.category, `${p}.category`, ISSUE_CATEGORIES);
      c.oneOf(pc.likelihood, `${p}.likelihood`, LIKELIHOODS);
      const refs = c.ids(pc.basedOnRefs, `${p}.basedOnRefs`);
      if (!refs.length) c.err(`${p}.basedOnRefs`, "category_without_basis");
      refs.forEach((ref) => isRef(ref) || c.err(`${p}.basedOnRefs`, `unknown_ref:${ref}`));
      // LIKELY needs more than uncertain visual impressions.
      if (pc.likelihood === "LIKELY" && refs.length && refs.every((ref) => observationCertainty.get(ref) === "UNCERTAIN")) {
        c.err(`${p}.likelihood`, "likely_based_only_on_uncertain_observations");
      }
    });
  }

  if (c.exact(r.urgency, "urgency", ["level", "indicators", "reason"])) {
    const u = r.urgency;
    c.oneOf(u.level, "urgency.level", URGENCY_LEVELS);
    c.str(u.reason, "urgency.reason", LIMITS.text);
    const indicators: UrgencyIndicator[] = [];
    if (c.arr(u.indicators, "urgency.indicators", URGENCY_INDICATORS.length)) {
      u.indicators.forEach((ind, i) => {
        const p = `urgency.indicators[${i}]`;
        if (!c.exact(ind, p, ["indicator", "basis", "refs"])) return;
        const okInd = c.oneOf(ind.indicator, `${p}.indicator`, URGENCY_INDICATORS);
        c.oneOf(ind.basis, `${p}.basis`, INDICATOR_BASES);
        const refs = c.ids(ind.refs, `${p}.refs`);
        if (!refs.length) c.err(`${p}.refs`, "indicator_without_evidence");
        const hasStatement = refs.some((ref) => statementIds.has(ref) || symptomIds.has(ref));
        const hasObservation = refs.some((ref) => observationIds.has(ref));
        refs.forEach((ref) => isRef(ref) || c.err(`${p}.refs`, `unknown_ref:${ref}`));
        if ((ind.basis === "CUSTOMER_REPORTED" || ind.basis === "BOTH") && !hasStatement) c.err(`${p}.basis`, "customer_basis_without_statement");
        if ((ind.basis === "MEDIA_OBSERVED" || ind.basis === "BOTH") && !hasObservation) c.err(`${p}.basis`, "media_basis_without_observation");
        if (okInd) indicators.push(ind.indicator as UrgencyIndicator);
      });
    }
    if ((u.level === "HIGH" || u.level === "URGENT") && !indicators.length) c.err("urgency.level", "elevated_urgency_without_indicator");
    if (u.level === "URGENT" && !indicators.some((i) => URGENT_INDICATORS.includes(i))) c.err("urgency.level", "urgent_without_urgent_indicator");
    // Conservative: the customer's own words flagged a safety issue, so the
    // AI may not downgrade the case to LOW.
    if (u.level === "LOW" && ctx.safetyFlags.length) c.err("urgency.level", "low_despite_safety_flags");
  }

  if (c.exact(r.inspection, "inspection", ["recommended", "reason"])) {
    c.bool(r.inspection.recommended, "inspection.recommended");
    c.str(r.inspection.reason, "inspection.reason", LIMITS.text);
  }
  c.oneOf(r.recommendedNextStep, "recommendedNextStep", NEXT_STEPS);
  if (c.arr(r.moreInformationNeeded, "moreInformationNeeded", 10)) r.moreInformationNeeded.forEach((m, i) => c.str(m, `moreInformationNeeded[${i}]`, LIMITS.shortText));
  if (c.exact(r.confidence, "confidence", ["overall", "reason"])) {
    if (c.oneOf(r.confidence.overall, "confidence.overall", CONFIDENCE_LEVELS)
      && CONFIDENCE_LEVELS.indexOf(r.confidence.overall as ConfidenceLevel) > CONFIDENCE_LEVELS.indexOf(ctx.maxConfidence)) {
      c.err("confidence.overall", "confidence_above_phase_maximum");
    }
    c.str(r.confidence.reason, "confidence.reason", LIMITS.shortText);
  }
  if (c.arr(r.limitations, "limitations", 10)) r.limitations.forEach((m, i) => c.str(m, `limitations[${i}]`, LIMITS.shortText));

  // ── Safety: forbidden claims in text the AI writes in its own voice ──
  // Customer statements are attributed quotes/paraphrases and are exempt
  // (a customer may say "it's under warranty"); unknowns naturally discuss
  // warranty and replacement, so they're checked for commitments only.
  if (!c.errors.length) {
    const content = input as unknown as ServiceCallReportContent;
    const scan = (text: string, path: string, rules?: ForbiddenClaimRule[]) =>
      scanForbiddenClaims(text, rules).forEach((h) => c.err(path, `forbidden_claim:${h.rule}`));
    scan(content.issueSummary, "issueSummary", ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "DEFINITIVE_DIAGNOSIS", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]);
    content.mediaObservations.forEach((o, i) => scan(o.observation, `mediaObservations[${i}].observation`));
    content.unknownsRequiringInspection.forEach((u, i) => {
      const rules: ForbiddenClaimRule[] = ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "APPOINTMENT_COMMITMENT", "MEASUREMENT"];
      scan(u.question, `unknownsRequiringInspection[${i}].question`, rules);
      scan(u.whyUnknown, `unknownsRequiringInspection[${i}].whyUnknown`, rules);
    });
    scan(content.urgency.reason, "urgency.reason", ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "MEASUREMENT", "DEFINITIVE_DIAGNOSIS", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]);
    scan(content.inspection.reason, "inspection.reason", ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "MEASUREMENT", "DEFINITIVE_DIAGNOSIS", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]);
    content.moreInformationNeeded.forEach((m, i) => scan(m, `moreInformationNeeded[${i}]`, ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]));
    scan(content.confidence.reason, "confidence.reason", ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]);
    content.limitations.forEach((m, i) => scan(m, `limitations[${i}]`, ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "APPOINTMENT_COMMITMENT", "LIABILITY", "ELIGIBILITY_OR_APPROVAL"]));
  }

  if (!c.errors.length && JSON.stringify(input).length > MAX_CONTENT_CHARS) c.err("content", "content_too_large");

  return c.errors.length ? { ok: false, errors: c.errors } : { ok: true, value: input as unknown as ServiceCallReportContent };
}

/** Fixed wording for the unknowns every report must carry. */
export const MANDATORY_UNKNOWNS: Record<(typeof MANDATORY_UNKNOWN_TOPICS)[number], UnknownItem> = {
  WARRANTY: { topic: "WARRANTY", question: "Whether any warranty applies.", whyUnknown: "Warranty depends on records and an inspection, not on the submitted evidence." },
  COST: { topic: "COST", question: "The cost of any work.", whyUnknown: "Cost can only be assessed by the service team after review or inspection." },
  REPAIR_METHOD: { topic: "REPAIR_METHOD", question: "The appropriate repair method.", whyUnknown: "The repair approach needs confirmation by the service team." },
};

/**
 * Adds the mandatory unknowns the AI left out. Works on untrusted input and
 * returns it unchanged if it isn't shaped like content (validation then fails).
 */
export function withMandatoryUnknowns(content: unknown): unknown {
  if (!isObj(content) || !Array.isArray(content.unknownsRequiringInspection)) return content;
  const present = new Set(content.unknownsRequiringInspection.map((u) => (isObj(u) ? u.topic : undefined)));
  const missing = MANDATORY_UNKNOWN_TOPICS.filter((t) => !present.has(t)).map((t) => MANDATORY_UNKNOWNS[t]);
  return { ...content, unknownsRequiringInspection: [...content.unknownsRequiringInspection, ...missing] };
}
