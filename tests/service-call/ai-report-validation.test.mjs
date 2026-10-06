// Report schema + safety validation (scr-1). Deterministic fixtures only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReportContent, withMandatoryUnknowns } from "../../src/lib/service-call/ai/report-validation.ts";
import { detectSafetyFlags, scanForbiddenClaims } from "../../src/lib/service-call/ai/safety.ts";
import { CONTEXT, PHOTO_ID, VOICE_ID, validContent } from "../support/ai-fixtures.mjs";

const errorsOf = (content, ctx = CONTEXT) => {
  const r = validateReportContent(content, ctx);
  return r.ok ? [] : r.errors;
};
const has = (errors, fragment) => assert.ok(errors.some((e) => e.includes(fragment)), `expected "${fragment}" in ${JSON.stringify(errors)}`);

test("a well-formed report passes", () => {
  const r = validateReportContent(validContent(), CONTEXT);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test("structure: missing, extra and wrongly typed fields are rejected", () => {
  const c = validContent();
  delete c.confidence;
  c.extra = "x";
  c.mediaObservations[0].certainty = "DEFINITE";
  c.urgency.level = "SEVERE";
  c.inspection.recommended = "yes";
  const e = errorsOf(c);
  has(e, "confidence: missing");
  has(e, "content.extra: unexpected_field");
  has(e, "mediaObservations[0].certainty: invalid_value");
  has(e, "urgency.level: invalid_value");
  has(e, "inspection.recommended: expected_boolean");
});

test("malformed inputs never pass", () => {
  for (const bad of [null, "report", [], 42, {}, { issueSummary: "x" }]) assert.equal(validateReportContent(bad, CONTEXT).ok, false);
});

test("the three sections stay separate: a symptom must come from a customer statement", () => {
  const c = validContent();
  c.customerReported.reportedSymptoms[0].statementRefs = ["ob-1"];
  has(errorsOf(c), "unknown_statement:ob-1");
});

test("observations must cite real, analysed visual evidence", () => {
  const unknown = validContent();
  unknown.mediaObservations[0].evidence.mediaId = "99999999-9999-4999-8999-999999999999";
  has(errorsOf(unknown), "unknown_evidence");

  const fromVoice = validContent();
  fromVoice.mediaObservations[0].evidence.mediaId = VOICE_ID;
  has(errorsOf(fromVoice), "observation_from_audio_not_visual");

  const notAnalysed = validContent();
  const ctx = { ...CONTEXT, evidence: CONTEXT.evidence.map((e) => (e.mediaId === PHOTO_ID ? { ...e, analysed: false } : e)) };
  has(errorsOf(notAnalysed, ctx), "evidence_not_analysed");

  const videoNoTime = validContent();
  videoNoTime.mediaObservations[1].evidence.frameAtSeconds = null;
  has(errorsOf(videoNoTime), "required_for_video");

  const beyond = validContent();
  beyond.mediaObservations[1].evidence.frameAtSeconds = 95;
  has(errorsOf(beyond), "beyond_video_duration");
});

test("uncertain observations must be hedged, not stated as fact", () => {
  const c = validContent();
  c.mediaObservations[1].observation = "The roller is broken.";
  has(errorsOf(c), "uncertain_observation_stated_as_fact");
});

test("statements from voice must point at a transcribed voice note", () => {
  const c = validContent();
  c.customerReported.statements[1].source.mediaId = PHOTO_ID;
  has(errorsOf(c), "unknown_or_unprocessed_media");
  const d = validContent();
  d.customerReported.statements[0].source.mediaId = VOICE_ID;
  has(errorsOf(d), "must_be_null_for_description");
});

test("forbidden claims are rejected wherever the AI speaks in its own voice", () => {
  const cases = [
    ["issueSummary", "We will repair the sliding door next week.", "REPAIR_COMMITMENT"],
    ["issueSummary", "The door is covered by the warranty.", "WARRANTY_CONFIRMATION"],
    ["issueSummary", "Replacement rollers cost AED 450.", "PRICE_OR_QUOTE"],
    ["issueSummary", "The roller has failed and must be replaced.", "DEFINITIVE_DIAGNOSIS"],
    ["inspection.reason", "An appointment has been booked for Monday.", "APPOINTMENT_COMMITMENT"],
    ["urgency.reason", "There is a 5 mm gap at the top of the frame.", "MEASUREMENT"],
  ];
  for (const [field, text, rule] of cases) {
    const c = validContent();
    if (field === "issueSummary") c.issueSummary = text;
    else if (field === "inspection.reason") c.inspection.reason = text;
    else c.urgency.reason = text;
    has(errorsOf(c), `forbidden_claim:${rule}`);
  }
  const obs = validContent();
  obs.mediaObservations[0].observation = "An apparent gap of about 12mm is visible at the top.";
  has(errorsOf(obs), "forbidden_claim:MEASUREMENT");
});

test("customer statements may report what the customer said (attributed, not scanned)", () => {
  const c = validContent();
  c.customerReported.statements[0].text = "Customer says the door is under warranty and was quoted AED 300.";
  assert.equal(validateReportContent(c, CONTEXT).ok, true);
});

test("unknowns may discuss warranty and replacement, but not commit to them", () => {
  const ok = validContent();
  ok.unknownsRequiringInspection[0].question = "Whether the rollers need replacing, and whether warranty covers it.";
  assert.equal(validateReportContent(ok, CONTEXT).ok, true, JSON.stringify(errorsOf(ok)));
  const bad = validContent();
  bad.unknownsRequiringInspection[0].whyUnknown = "We will replace the rollers once confirmed.";
  has(errorsOf(bad), "forbidden_claim:REPAIR_COMMITMENT");
});

test("urgency: HIGH/URGENT need explainable indicators backed by evidence", () => {
  const noIndicator = validContent();
  noIndicator.urgency = { level: "URGENT", indicators: [], reason: "Looks serious." };
  has(errorsOf(noIndicator), "elevated_urgency_without_indicator");

  const wrongKind = validContent();
  wrongKind.urgency = { level: "URGENT", indicators: [{ indicator: "SIGNIFICANT_LOSS_OF_FUNCTION", basis: "CUSTOMER_REPORTED", refs: ["st-1"] }], reason: "Door hard to use." };
  has(errorsOf(wrongKind), "urgent_without_urgent_indicator");

  const unsupportedBasis = validContent();
  unsupportedBasis.urgency = { level: "URGENT", indicators: [{ indicator: "BROKEN_OR_UNSTABLE_GLASS", basis: "MEDIA_OBSERVED", refs: ["st-1"] }], reason: "Glass." };
  has(errorsOf(unsupportedBasis), "media_basis_without_observation");

  const noRefs = validContent();
  noRefs.urgency = { level: "HIGH", indicators: [{ indicator: "CANNOT_SECURE_PROPERTY", basis: "CUSTOMER_REPORTED", refs: [] }], reason: "Can't lock." };
  has(errorsOf(noRefs), "indicator_without_evidence");

  const ok = validContent();
  ok.urgency = { level: "URGENT", indicators: [{ indicator: "CANNOT_SECURE_PROPERTY", basis: "CUSTOMER_REPORTED", refs: ["st-1"] }], reason: "Customer reports the door cannot be locked." };
  assert.equal(validateReportContent(ok, CONTEXT).ok, true);
});

test("urgency can't be LOW when the customer's own words raised a safety flag", () => {
  const c = validContent();
  c.urgency = { level: "LOW", indicators: [], reason: "Minor." };
  assert.equal(validateReportContent(c, CONTEXT).ok, true);
  has(errorsOf(c, { ...CONTEXT, safetyFlags: ["ACTIVE_WATER_INGRESS"] }), "low_despite_safety_flags");
});

test("LIKELY can't rest only on uncertain observations", () => {
  const c = validContent();
  c.potentialIssueCategories[0] = { category: "OPERATION_STIFF_OR_STUCK", likelihood: "LIKELY", basedOnRefs: ["ob-2"] };
  has(errorsOf(c), "likely_based_only_on_uncertain_observations");
});

test("mandatory unknowns (warranty, cost, repair method) are required and added by the server", () => {
  const c = validContent();
  c.unknownsRequiringInspection = c.unknownsRequiringInspection.filter((u) => u.topic === "COMPONENT_FAILURE");
  has(errorsOf(c), "missing_mandatory_topic:WARRANTY");
  const fixed = withMandatoryUnknowns(c);
  assert.equal(validateReportContent(fixed, CONTEXT).ok, true);
  assert.deepEqual(fixed.unknownsRequiringInspection.map((u) => u.topic), ["COMPONENT_FAILURE", "WARRANTY", "COST", "REPAIR_METHOD"]);
  assert.equal(withMandatoryUnknowns("garbage"), "garbage");
});

test("duplicate and dangling ids are rejected", () => {
  const c = validContent();
  c.mediaObservations[1].id = "st-1";
  has(errorsOf(c), "duplicate_id");
  const d = validContent();
  d.potentialIssueCategories[0].basedOnRefs = ["ob-9"];
  has(errorsOf(d), "unknown_ref:ob-9");
});

test("length caps apply", () => {
  const c = validContent();
  c.issueSummary = "x".repeat(401);
  has(errorsOf(c), "issueSummary: too_long");
});

test("forbidden-claim scanner: known phrasings caught, ordinary hedged text not", () => {
  assert.deepEqual(scanForbiddenClaims("Free of charge.").map((h) => h.rule), ["PRICE_OR_QUOTE"]);
  assert.deepEqual(scanForbiddenClaims("The team will fix it.").map((h) => h.rule), ["REPAIR_COMMITMENT"]);
  for (const ok of [
    "An apparent gap is visible between the frame and sash in Photo 2.",
    "The cost of any work can't be assessed from photos.",
    "Problem started 3 weeks ago in the morning.",
    "We cannot confirm warranty status.",
  ]) assert.deepEqual(scanForbiddenClaims(ok, ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "WARRANTY_CONFIRMATION", "MEASUREMENT", "APPOINTMENT_COMMITMENT"]), [], ok);
});

test("safety keyword net flags the obvious customer-reported hazards", () => {
  assert.deepEqual(detectSafetyFlags("The front door won't lock since yesterday"), ["CANNOT_SECURE_PROPERTY"]);
  // Phase 4F: a crack is flagged as damage (still blocks LOW), not as broken/unstable glass.
  assert.deepEqual(detectSafetyFlags("glass is cracked and water is coming in"), ["CONTAINED_DAMAGE", "ACTIVE_WATER_INGRESS"]);
  assert.deepEqual(detectSafetyFlags("The pane has shattered"), ["BROKEN_OR_UNSTABLE_GLASS"]);
  assert.deepEqual(detectSafetyFlags("there are sharp pieces hanging in the frame"), ["BROKEN_OR_UNSTABLE_GLASS"]);
  assert.deepEqual(detectSafetyFlags("The handle is a bit stiff"), []);
});
