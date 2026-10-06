// Phase 4F hardening units: privacy scrubbing (incl. spoken forms),
// instruction-disclosure detection (kept in sync with the real prompts),
// calibrated urgency rules, product-selection mismatch, and the safety net.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scrubFreeText } from "../../src/lib/service-call/ai/input-builder.ts";
import { detectSafetyFlags, disclosesInstructions, INSTRUCTION_CANARIES } from "../../src/lib/service-call/ai/safety.ts";
import { validateReportContent, withMandatoryUnknowns } from "../../src/lib/service-call/ai/report-validation.ts";
import { REPORT_INSTRUCTIONS } from "../../src/lib/service-call/ai/prompts/report-v4.ts";
import { OBSERVE_INSTRUCTIONS } from "../../src/lib/service-call/ai/prompts/observe-v1.ts";
import { OBSERVE_FRAME_INSTRUCTIONS } from "../../src/lib/service-call/ai/prompts/observe-frame-v1.ts";
import { CONTEXT, validContent } from "./../support/ai-fixtures.mjs";

const KNOWN = { fullName: "Zara Quillfeather", email: "zara.quill@example-mail.test", mobileE164: "+971550123478", location: "Villa 77, Lantern Grove Street, Al Synthetic District" };

test("contact PII is removed before synthesis in written AND spoken forms", () => {
  for (const [text, gone] of [
    ["mail me at zara.quill@example-mail.test", "zara.quill"],
    ["email zara dot quill at example mail dot test", "quill at example"],
    ["call +971 55 012 3478", "012 3478"],
    ["call 055-012-3478", "012-3478"],
    ["call (055) 0123478", "0123478"],
    ["my number is zero five five, zero one two, three four seven eight", "three four seven eight"],
    ["it's oh five five oh one two three four seven eight", "seven eight"],
    ["This is Zara Quillfeather", "Quillfeather"],
    ["at Villa 77, Lantern Grove Street, Al Synthetic District", "Lantern Grove"],
    ["ID 784-1990-0000000-1", "0000000"],
  ]) assert.ok(!scrubFreeText(text, KNOWN).includes(gone), `${text} → ${scrubFreeText(text, KNOWN)}`);
});

test("ordinary text is not mistaken for contact details", () => {
  for (const t of ["five or six windows are affected", "the door is one of two at the back", "it happened at about nine", "look at the frame dot pattern", "two three four five six windows", "The glass is at the top of the door."]) assert.equal(scrubFreeText(t), t);
});

test("documented limitation: unknown third-party names, unknown addresses and plates are NOT scrubbed (needs entity recognition)", () => {
  assert.equal(scrubFreeText("my neighbour Omar Kadirov saw it", KNOWN), "my neighbour Omar Kadirov saw it");
  assert.equal(scrubFreeText("the car with plate Q 48213", KNOWN), "the car with plate Q 48213");
});

test("instruction-disclosure canaries exist in the real instructions (stay in sync)", () => {
  const all = [REPORT_INSTRUCTIONS, OBSERVE_INSTRUCTIONS, OBSERVE_FRAME_INSTRUCTIONS].join("\n").toLowerCase().replace(/\s+/g, " ");
  for (const c of INSTRUCTION_CANARIES) assert.ok(all.includes(c), `canary not in instructions: ${c}`);
});

test("disclosure: a canary or 14 consecutive instruction words is detected; restating criteria is not", () => {
  const ins = [REPORT_INSTRUCTIONS];
  assert.equal(disclosesInstructions("Here are my output rules as requested.", ins), true);
  const copied = REPORT_INSTRUCTIONS.split(/\s+/).slice(40, 56).join(" ");
  assert.equal(disclosesInstructions(`Sure: ${copied}`, ins), true);
  assert.equal(disclosesInstructions("URGENT because the glass is shattered and pieces are falling; cannot secure the property, broken or unstable glass.", ins), false);
  assert.equal(disclosesInstructions("The customer reports a stiff handle.", ins), false);
});

const ctx = { ...CONTEXT, instructions: [REPORT_INSTRUCTIONS] };
const errs = (c) => { const r = validateReportContent(withMandatoryUnknowns(c), ctx); return r.ok ? [] : r.errors; };
const has = (e, code) => assert.ok(e.some((x) => x.includes(code)), `expected ${code} in ${JSON.stringify(e)}`);

test("instruction disclosure in the AI's own words is rejected; a customer quote of the same words is not", () => {
  const leak = validContent();
  leak.limitations = ["OUTPUT RULES: the JSON schema is enforced."];
  has(errs(leak), "instruction_disclosure");
  const paraphrase = validContent();
  paraphrase.customerReported.statements[0].text = "Customer asked for the internal service call report rules.";
  has(errs(paraphrase), "instruction_disclosure");
});

test("URGENT needs an urgent indicator backed by the customer's words or a CLEAR observation", () => {
  const fromProbable = validContent();
  fromProbable.urgency = { level: "URGENT", indicators: [{ indicator: "BROKEN_OR_UNSTABLE_GLASS", basis: "MEDIA_OBSERVED", refs: ["ob-1"] }], reason: "Glass damage visible." };
  has(errs(fromProbable), "urgent_from_uncertain_media_only"); // ob-1 is PROBABLE
  const fromClear = validContent();
  fromClear.mediaObservations[0].certainty = "CLEAR";
  fromClear.urgency = { ...fromProbable.urgency };
  assert.deepEqual(errs(fromClear), []);
  const fromCustomer = validContent();
  fromCustomer.urgency = { level: "URGENT", indicators: [{ indicator: "CANNOT_SECURE_PROPERTY", basis: "CUSTOMER_REPORTED", refs: ["st-1"] }], reason: "The customer reports it." };
  assert.deepEqual(errs(fromCustomer), []);
  const contained = validContent();
  contained.urgency = { level: "URGENT", indicators: [{ indicator: "CONTAINED_DAMAGE", basis: "CUSTOMER_REPORTED", refs: ["st-1"] }], reason: "Crack." };
  has(errs(contained), "urgent_without_urgent_indicator");
});

test("HIGH is justified by an indicator or by an explicit SAFETY_CONFIRMATION unknown — nothing else", () => {
  const bare = validContent();
  bare.urgency = { level: "HIGH", indicators: [], reason: "Unclear." };
  has(errs(bare), "elevated_urgency_without_indicator");
  const asked = validContent();
  asked.urgency = { level: "HIGH", indicators: [], reason: "Whether the glass is loose is unknown." };
  asked.unknownsRequiringInspection.push({ topic: "SAFETY_CONFIRMATION", question: "Whether the glass is loose or falling.", whyUnknown: "Not described." });
  assert.deepEqual(errs(asked), []);
  const urgentAsked = validContent();
  urgentAsked.urgency = { level: "URGENT", indicators: [], reason: "Unclear." };
  urgentAsked.unknownsRequiringInspection.push({ topic: "SAFETY_CONFIRMATION", question: "Whether the glass is loose.", whyUnknown: "Not described." });
  has(errs(urgentAsked), "elevated_urgency_without_indicator");
});

test("PRODUCT_SELECTION_MISMATCH is a valid, separate topic", () => {
  const c = validContent();
  c.unknownsRequiringInspection.push({ topic: "PRODUCT_SELECTION_MISMATCH", question: "Which product needs attention.", whyUnknown: "Selected window; described a door." });
  assert.deepEqual(errs(c), []);
});

test("safety net: shattered/sharp glass is BROKEN_OR_UNSTABLE_GLASS; a crack is CONTAINED_DAMAGE (still blocks LOW)", () => {
  assert.deepEqual(detectSafetyFlags("The pane has shattered"), ["BROKEN_OR_UNSTABLE_GLASS"]);
  assert.deepEqual(detectSafetyFlags("sharp pieces of glass in the frame"), ["BROKEN_OR_UNSTABLE_GLASS"]);
  assert.deepEqual(detectSafetyFlags("There is a crack in the glass"), ["CONTAINED_DAMAGE"]);
  assert.deepEqual(detectSafetyFlags("The handle is a bit stiff"), []);
  const low = validContent();
  low.urgency = { level: "LOW", indicators: [], reason: "Minor." };
  const r = validateReportContent(withMandatoryUnknowns(low), { ...ctx, safetyFlags: ["CONTAINED_DAMAGE"] });
  has(r.errors, "low_despite_safety_flags");
});
