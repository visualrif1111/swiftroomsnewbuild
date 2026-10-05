// Privacy boundary: what a model may see.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildServiceAiInput, labelEvidence, scrubFreeText } from "../../src/lib/service-call/ai/input-builder.ts";

const known = {
  fullName: "Aisha Khan",
  email: "aisha.khan@example.com",
  mobileE164: "+971501234567",
  mobileNational: "501234567",
  location: "Villa 12, Arabian Ranches, Dubai",
  projectReference: "INV-2041",
};
// A full database row: contact details sit right next to the allowed fields.
const fullRow = {
  problemDescription: "Living room sliding door catches halfway. Call Aisha on 050 123 4567 or aisha.khan@example.com. Ref INV-2041, Villa 12, Arabian Ranches, Dubai.",
  productCategories: ["sliding-door"],
  otherProduct: null,
  existingCustomer: true,
  customerName: "Aisha Khan", email: known.email, mobileE164: known.mobileE164, mobileNational: known.mobileNational,
  location: known.location, projectReference: known.projectReference, reference: "SR-2026-00042",
  uploadToken: "secret-token", storagePath: "service-requests/2026/SR-2026-00042/x.jpg",
};
const media = [
  { mediaId: "m-photo-1", type: "PHOTO", durationSeconds: null },
  { mediaId: "m-voice-1", type: "VOICE", durationSeconds: 30 },
  { mediaId: "m-photo-2", type: "PHOTO", durationSeconds: null },
];
const transcripts = [{ mediaId: "m-voice-1", kind: "VOICE_NOTE", text: "Hi, this is Aisha Khan, my number is +971 50 123 4567, the door is stuck.", language: "en" }];

const PII = ["Aisha", "Khan", "aisha.khan@example.com", "+971501234567", "501234567", "050 123 4567", "123 4567", "Villa 12", "Arabian Ranches", "INV-2041", "SR-2026-00042", "secret-token", "service-requests/"];

test("AI input contains no name, email, mobile, address, project reference, service reference, token or path", () => {
  const input = buildServiceAiInput(fullRow, media, transcripts, known);
  const json = JSON.stringify(input);
  for (const value of PII) assert.ok(!json.includes(value), `leaked: ${value}`);
});

test("AI input carries only allow-listed fields", () => {
  const input = buildServiceAiInput(fullRow, media, transcripts, known);
  assert.deepEqual(Object.keys(input).sort(), ["evidence", "request", "transcripts"]);
  assert.deepEqual(Object.keys(input.request).sort(), ["description", "existingCustomer", "otherProduct", "productCategories"]);
  assert.deepEqual(Object.keys(input.evidence[0]).sort(), ["durationSeconds", "label", "mediaId", "type"]);
  assert.deepEqual(Object.keys(input.transcripts[0]).sort(), ["kind", "label", "language", "mediaId", "text"]);
  assert.equal(input.request.existingCustomer, true);
  assert.deepEqual(input.request.productCategories, ["sliding-door"]);
  assert.match(input.request.description, /sliding door catches halfway/);
});

test("contact details typed or spoken by the customer are scrubbed even without known details", () => {
  const out = scrubFreeText("Email me at someone@domain.ae or call +971 (50) 765-4321 / 0507654321.");
  assert.ok(!/@|765|4321/.test(out), out);
  assert.match(out, /\[email removed\]/);
  assert.match(out, /\[number removed\]/);
});

test("ordinary content survives scrubbing", () => {
  const text = "The tilt and turn window in bedroom 2 stopped closing 3 days ago.";
  assert.equal(scrubFreeText(text, known), text);
});

test("evidence gets neutral, stable labels per type", () => {
  assert.deepEqual([...labelEvidence(media).values()], ["Photo 1", "Voice note 1", "Photo 2"]);
});

test("transcripts for media not in the evidence list are dropped", () => {
  const input = buildServiceAiInput(fullRow, media.slice(0, 1), transcripts, known);
  assert.equal(input.transcripts.length, 0);
});
