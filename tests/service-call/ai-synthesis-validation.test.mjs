// Phase 4C validation rules: quote provenance, text-only phase rules,
// confidence cap, advisory transcript uncertainty, contradictions, new
// forbidden-claim rules, size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseForQuote, quoteOccursIn, validateReportContent } from "../../src/lib/service-call/ai/report-validation.ts";
import { scanForbiddenClaims } from "../../src/lib/service-call/ai/safety.ts";
import { CONTEXT, PHOTO_ID, TEXT_ONLY_CONTEXT, VOICE_ID, textOnlyContent, validContent } from "../support/ai-fixtures.mjs";

const errorsOf = (content, ctx = TEXT_ONLY_CONTEXT) => {
  const r = validateReportContent(content, ctx);
  return r.ok ? [] : r.errors;
};
const has = (errors, fragment) => assert.ok(errors.some((e) => e.includes(fragment)), `expected "${fragment}" in ${JSON.stringify(errors)}`);

test("a text + voice report with valid quotes passes in the text-only phase", () => {
  assert.deepEqual(errorsOf(textOnlyContent()), []);
});

test("provenance: a quote that isn't in its source is rejected (hallucinated statement)", () => {
  const c = textOnlyContent();
  c.customerReported.statements[0].quote = "the frame is cracked and leaking";
  has(errorsOf(c), "quote_not_found_in_source");
});

test("provenance: a quote taken from the other source is rejected (wrong attribution)", () => {
  const c = textOnlyContent();
  c.customerReported.statements[0].quote = "it makes a grinding noise"; // voice words attributed to the description
  has(errorsOf(c), "customerReported.statements[0].quote: quote_not_found_in_source");
});

test("provenance: quote must be non-empty and ≤ 200 characters; required field", () => {
  const empty = textOnlyContent();
  empty.customerReported.statements[0].quote = "   ";
  has(errorsOf(empty), "quote: empty");
  const long = textOnlyContent();
  long.customerReported.statements[0].quote = "x".repeat(201);
  has(errorsOf(long), "quote: too_long");
  const missing = textOnlyContent();
  delete missing.customerReported.statements[0].quote;
  has(errorsOf(missing), "quote: missing");
});

test("quote matching tolerates case, spacing, typographic quotes, Arabic diacritics/tatweel/alef forms and edge punctuation — nothing else", () => {
  assert.ok(quoteOccursIn("Sliding  DOOR catches", "The sliding door catches halfway."));
  assert.ok(quoteOccursIn("“it won’t lock.”", 'He said "it won\'t lock" yesterday'));
  assert.ok(quoteOccursIn("مرحبا، الباب المنزلق عالق", "مرحباً، الباب المنزلـق عالق."));
  assert.ok(quoteOccursIn("الباب", "أَلْبَاب"), "alef + harakat folded");
  assert.ok(!quoteOccursIn("door is cracked", "The door is stuck."));
  assert.ok(!quoteOccursIn("...", "anything"), "punctuation-only quote never matches");
  assert.equal(normaliseForQuote("  A  B "), "a b");
});

test("voice statements need a non-empty transcript the model was given", () => {
  const ctx = { ...TEXT_ONLY_CONTEXT, sources: { ...TEXT_ONLY_CONTEXT.sources, transcripts: [{ mediaId: VOICE_ID, text: "", possiblyIncomplete: false }] } };
  has(errorsOf(textOnlyContent(), ctx), "unknown_or_unprocessed_media");
});

test("a DESCRIPTION statement when no description was given is rejected", () => {
  const ctx = { ...TEXT_ONLY_CONTEXT, sources: { ...TEXT_ONLY_CONTEXT.sources, description: "" } };
  has(errorsOf(textOnlyContent(), ctx), "no_description_given");
});

test("text-only phase: any media observation is rejected — transcripts never become observations", () => {
  const c = textOnlyContent();
  c.mediaObservations = [{ id: "ob-1", evidence: { mediaId: VOICE_ID, label: "Voice note 1", frameAtSeconds: null }, observation: "The customer can be heard describing a grinding noise.", type: "OTHER", certainty: "PROBABLE", relatesToSymptomRefs: [] }];
  const e = errorsOf(c);
  has(e, "observations_not_allowed_without_visual_analysis");
  has(e, "observation_from_audio_not_visual");
});

test("text-only phase: MEDIA_OBSERVED bases are rejected", () => {
  const products = textOnlyContent();
  products.affectedProducts = [{ category: "sliding-door", basis: "MEDIA_OBSERVED" }];
  has(errorsOf(products), "media_basis_without_observation");
  const urgency = textOnlyContent();
  urgency.urgency = { level: "HIGH", indicators: [{ indicator: "CANNOT_SECURE_PROPERTY", basis: "MEDIA_OBSERVED", refs: ["st-1"] }], reason: "x" };
  has(errorsOf(urgency), "media_basis_without_observation");
});

test("confidence can never be HIGH in Phase 4C", () => {
  const c = textOnlyContent();
  c.confidence.overall = "HIGH";
  has(errorsOf(c), "confidence_above_phase_maximum");
  c.confidence.overall = "LOW";
  assert.deepEqual(errorsOf(c), []);
});

test("possiblyIncomplete (advisory): citing that transcript requires an unknown beyond the mandatory three", () => {
  const ctx = { ...TEXT_ONLY_CONTEXT, sources: { ...TEXT_ONLY_CONTEXT.sources, transcripts: [{ ...TEXT_ONLY_CONTEXT.sources.transcripts[0], possiblyIncomplete: true }] } };
  const onlyMandatory = textOnlyContent();
  onlyMandatory.unknownsRequiringInspection = onlyMandatory.unknownsRequiringInspection.filter((u) => ["WARRANTY", "COST", "REPAIR_METHOD"].includes(u.topic));
  has(errorsOf(onlyMandatory, ctx), "uncertain_transcript_without_unknown");
  const withUnknown = textOnlyContent();
  withUnknown.unknownsRequiringInspection.push({ topic: "OTHER", question: "Whether the voice note contained more information.", whyUnknown: "The transcript may be incomplete; listen to the recording." });
  assert.deepEqual(errorsOf(withUnknown, ctx), []);
  // Not citing the uncertain transcript → no extra requirement.
  const textOnly = textOnlyContent();
  textOnly.customerReported.statements = textOnly.customerReported.statements.slice(0, 1);
  textOnly.customerReported.reportedSymptoms = [{ id: "sy-1", symptom: "Door catches halfway", statementRefs: ["st-1"] }];
  textOnly.unknownsRequiringInspection = onlyMandatory.unknownsRequiringInspection;
  assert.deepEqual(errorsOf(textOnly, ctx), []);
});

test("contradictions: both statements kept + CONFLICTING_CUSTOMER_INFORMATION is valid", () => {
  const ctx = {
    ...TEXT_ONLY_CONTEXT,
    sources: { description: "The window won't close.", transcripts: [{ mediaId: VOICE_ID, text: "The window closes but won't lock.", possiblyIncomplete: false }] },
  };
  const c = textOnlyContent();
  c.customerReported.statements = [
    { id: "st-1", text: "Customer typed that the window won't close.", quote: "The window won't close", source: { type: "DESCRIPTION", mediaId: null } },
    { id: "st-2", text: "Customer said the window closes but won't lock.", quote: "closes but won't lock", source: { type: "VOICE_NOTE", mediaId: VOICE_ID } },
  ];
  c.customerReported.reportedSymptoms = [{ id: "sy-1", symptom: "Window closing/locking problem", statementRefs: ["st-1", "st-2"] }];
  c.unknownsRequiringInspection.push({ topic: "CONFLICTING_CUSTOMER_INFORMATION", question: "Whether the window closes but won't lock, or won't close.", whyUnknown: "The typed description and the voice note disagree." });
  assert.deepEqual(errorsOf(c, ctx), []);
});

test("new forbidden claims: liability and eligibility/approval are rejected in the AI's own voice", () => {
  for (const [text, rule] of [
    ["The leak is due to poor installation by the installer.", "LIABILITY"],
    ["This is our fault.", "LIABILITY"],
    ["The customer is responsible for the damage.", "LIABILITY"],
    ["The door is eligible for a free replacement.", "ELIGIBILITY_OR_APPROVAL"],
    ["Replacement has been approved.", "ELIGIBILITY_OR_APPROVAL"],
  ]) {
    const c = textOnlyContent();
    c.issueSummary = text;
    has(errorsOf(c), `forbidden_claim:${rule}`);
  }
  // Unknowns may ask about responsibility/eligibility without asserting it.
  const ok = textOnlyContent();
  ok.unknownsRequiringInspection.push({ topic: "OTHER", question: "Whether the issue is eligible for a repair under any agreement.", whyUnknown: "Needs records and inspection." });
  assert.deepEqual(errorsOf(ok), []);
  assert.deepEqual(scanForbiddenClaims("The customer reports the door catches halfway.", ["LIABILITY", "ELIGIBILITY_OR_APPROVAL"]), []);
});

test("size sanity: oversized content is rejected (backstop above the per-field caps)", () => {
  // Per-field caps keep text-only output well under the backstop; build the
  // largest content the caps allow (with observations, visual context) to exceed it.
  const c = validContent();
  c.mediaObservations = Array.from({ length: 40 }, (_, i) => ({
    id: `ob-${i + 1}`, evidence: { mediaId: PHOTO_ID, label: "Photo 1", frameAtSeconds: null },
    observation: `An apparent gap may be visible ${"a".repeat(460)}`, type: "OTHER", certainty: "UNCERTAIN", relatesToSymptomRefs: [],
  }));
  c.unknownsRequiringInspection.push(...Array.from({ length: 16 }, () => ({ topic: "OTHER", question: "q".repeat(200), whyUnknown: "w".repeat(200) })));
  assert.ok(JSON.stringify(c).length > 30_000);
  has(errorsOf(c, CONTEXT), "content_too_large");
});
