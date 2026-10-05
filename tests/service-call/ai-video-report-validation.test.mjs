// scr-1.3 report validation for video evidence: exact frame provenance,
// photo/video identities that can't be confused, no behaviour over time from
// frames, no whole-video claims, BEHAVIOUR_OVER_TIME always present.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReportContent, withMandatoryUnknowns, withVideoUnknowns } from "../../src/lib/service-call/ai/report-validation.ts";
import { findTemporalClaims } from "../../src/lib/service-call/ai/frame-observation.ts";
import { scanForbiddenClaims } from "../../src/lib/service-call/ai/safety.ts";
import { DESCRIPTION, PHOTO_ID, VIDEO_ID, VOICE_ID, VOICE_TEXT, validContent } from "../support/ai-fixtures.mjs";

const VIDEO_2 = "44444444-4444-4444-8444-444444444444";
const ctx = {
  evidence: [
    { mediaId: PHOTO_ID, type: "PHOTO", analysed: true, durationSeconds: null, label: "Photo 1" },
    { mediaId: VIDEO_ID, type: "VIDEO", analysed: true, durationSeconds: 20, label: "Video 1", frameTimes: [1.2, 4.2, 9.8] },
    { mediaId: VIDEO_2, type: "VIDEO", analysed: true, durationSeconds: 8, label: "Video 2", frameTimes: [2.5] },
    { mediaId: VOICE_ID, type: "VOICE", analysed: true, durationSeconds: 30, label: "Voice note 1" },
  ],
  safetyFlags: [],
  sources: { description: DESCRIPTION, transcripts: [{ mediaId: VOICE_ID, text: VOICE_TEXT, possiblyIncomplete: false }, { mediaId: VIDEO_ID, text: "You can see it won't lock when I push it.", possiblyIncomplete: false }] },
  visualAnalysis: true,
  maxConfidence: "MEDIUM",
};
const videos = [{ label: "Video 1", durationSeconds: 20, partiallyAnalysed: false }, { label: "Video 2", durationSeconds: 8, partiallyAnalysed: false }];

function content() {
  const c = validContent();
  c.mediaObservations[1] = { ...c.mediaObservations[1], evidence: { mediaId: VIDEO_ID, label: "Video 1 @ 00:04.2", frameAtSeconds: 4.2 }, observation: "Debris appears visible in the lower track." };
  c.mediaObservations.push({ id: "ob-3", evidence: { mediaId: VIDEO_2, label: "Video 2 @ 00:02.5", frameAtSeconds: 2.5 }, observation: "A gap appears visible at the top of the frame.", type: "VISIBLE_GAP_OR_MISALIGNMENT", certainty: "PROBABLE", relatesToSymptomRefs: [] });
  c.customerReported.statements.push({ id: "st-3", text: "In the video the customer says it won't lock.", quote: "it won't lock", source: { type: "VIDEO_AUDIO", mediaId: VIDEO_ID } });
  return withVideoUnknowns(withMandatoryUnknowns(c), videos);
}
const errorsOf = (c, context = ctx) => {
  const r = validateReportContent(c, context);
  return r.ok ? [] : r.errors;
};
const has = (e, f) => assert.ok(e.some((x) => x.includes(f)), `expected ${f} in ${JSON.stringify(e)}`);

test("photo + two videos + video speech with exact identities validate", () => {
  assert.deepEqual(errorsOf(content()), []);
});

test("frame provenance: wrong media, wrong video, absent instant, label mismatch, cross-video attribution all fail", () => {
  const cases = [
    [(c) => (c.mediaObservations[1].evidence.mediaId = "99999999-9999-4999-8999-999999999999"), "unknown_evidence"],
    [(c) => (c.mediaObservations[1].evidence.frameAtSeconds = 5.0), "timestamp_not_in_analysed_frames"],
    [(c) => (c.mediaObservations[1].evidence.frameAtSeconds = 4.3), "timestamp_not_in_analysed_frames"],
    [(c) => (c.mediaObservations[1].evidence.label = "Video 1 @ 00:01.2"), "label_mismatch"],
    [(c) => (c.mediaObservations[1].evidence.label = "Video 1"), "label_mismatch"],
    // Video 2's instant attributed to Video 1, and vice versa.
    [(c) => (c.mediaObservations[2].evidence = { mediaId: VIDEO_ID, label: "Video 1 @ 00:02.5", frameAtSeconds: 2.5 }), "timestamp_not_in_analysed_frames"],
    [(c) => (c.mediaObservations[1].evidence = { mediaId: VIDEO_2, label: "Video 2 @ 00:04.2", frameAtSeconds: 4.2 }), "timestamp_not_in_analysed_frames"],
    [(c) => (c.mediaObservations[1].evidence.frameAtSeconds = null), "required_for_video"],
    [(c) => (c.mediaObservations[0].evidence.frameAtSeconds = 4.2), "must_be_null_for_photo"],
    [(c) => (c.mediaObservations[0].evidence.label = "Video 1 @ 00:04.2"), "label_mismatch"],
    [(c) => (c.mediaObservations[0].evidence.mediaId = VOICE_ID), "observation_from_audio_not_visual"],
  ];
  for (const [mutate, code] of cases) {
    const c = content();
    mutate(c);
    has(errorsOf(c), code);
  }
});

test("a video with no analysed frames can't be cited visually", () => {
  const c = content();
  const noFrames = { ...ctx, evidence: ctx.evidence.map((e) => (e.mediaId === VIDEO_2 ? { ...e, frameTimes: [] } : e)) };
  has(errorsOf(c, noFrames), "timestamp_not_in_analysed_frames");
});

test("video speech is customer-reported: VIDEO_AUDIO with that video's transcript only", () => {
  const wrongType = content();
  wrongType.customerReported.statements[2].source.type = "VOICE_NOTE";
  has(errorsOf(wrongType), "unknown_or_unprocessed_media");
  const otherVideo = content();
  otherVideo.customerReported.statements[2].source.mediaId = VIDEO_2;
  has(errorsOf(otherVideo), "unknown_or_unprocessed_media");
  const invented = content();
  invented.customerReported.statements[2].quote = "it is covered by warranty";
  has(errorsOf(invented), "quote_not_found_in_source");
});

test("behaviour over time can't rest on frames alone (categories and urgency indicators)", () => {
  const cat = content();
  cat.potentialIssueCategories = [{ category: "OPERATION_STIFF_OR_STUCK", likelihood: "POSSIBLE", basedOnRefs: ["ob-2"] }];
  has(errorsOf(cat), "behaviour_over_time_from_frames_only");
  const okCat = content();
  okCat.potentialIssueCategories = [{ category: "OPERATION_STIFF_OR_STUCK", likelihood: "POSSIBLE", basedOnRefs: ["ob-2", "st-1"] }];
  assert.deepEqual(errorsOf(okCat), [], "with the customer's own statement it's fine");
  const visible = content();
  visible.potentialIssueCategories = [{ category: "GLASS_DAMAGE", likelihood: "POSSIBLE", basedOnRefs: ["ob-3"] }];
  assert.deepEqual(errorsOf(visible), [], "static, visible categories may rest on a frame");
  const urgent = content();
  urgent.urgency = { level: "URGENT", indicators: [{ indicator: "ACTIVE_WATER_INGRESS", basis: "MEDIA_OBSERVED", refs: ["ob-2"] }], reason: "Water ingress indicated." };
  has(errorsOf(urgent), "behaviour_over_time_from_frames_only");
});

test("no whole-video claims in the AI's own words", () => {
  for (const [field, set] of [
    ["issueSummary", (c) => (c.issueSummary = "The video shows the door sticking throughout.")],
    ["inspection.reason", (c) => (c.inspection.reason = "Across the video the panel is misaligned.")],
    ["limitations", (c) => c.limitations.push("The entire video was reviewed.")],
  ]) {
    const c = content();
    set(c);
    has(errorsOf(c), `${field}`);
    has(errorsOf(c), "whole_video_claim");
  }
});

test("BEHAVIOUR_OVER_TIME is mandatory for analysed videos and its fixed wording is itself clean", () => {
  const c = validateReportContent(withMandatoryUnknowns(validContent()), ctx);
  assert.equal(c.ok, false);
  has(c.errors, "missing_mandatory_topic:BEHAVIOUR_OVER_TIME");
  const injected = content().unknownsRequiringInspection.filter((u) => u.topic === "BEHAVIOUR_OVER_TIME");
  assert.deepEqual(injected.map((u) => u.question.match(/Video \d/)[0]), ["Video 1", "Video 2"]);
  for (const u of injected) {
    assert.ok(u.question.length <= 200 && u.whyUnknown.length <= 200);
    assert.deepEqual(scanForbiddenClaims(`${u.question} ${u.whyUnknown}`, ["PRICE_OR_QUOTE", "REPAIR_COMMITMENT", "APPOINTMENT_COMMITMENT", "MEASUREMENT"]), []);
  }
});

test("partially analysed video: an extra unknown for what wasn't analysed, never 'the whole video was reviewed'", () => {
  const c = withVideoUnknowns(withMandatoryUnknowns(validContent()), [{ label: "Video 1", durationSeconds: 312, partiallyAnalysed: true }]);
  const other = c.unknownsRequiringInspection.find((u) => u.topic === "OTHER");
  assert.match(other.whyUnknown, /Video 1 \(05:12\.0\) exceeds the 03:00\.0 analysis threshold; it was only partially analysed\./);
  assert.deepEqual(findTemporalClaims(other.question).filter((r) => r === "WHOLE_VIDEO"), []);
  // Idempotent: applying twice adds nothing more.
  assert.equal(withVideoUnknowns(c, [{ label: "Video 1", durationSeconds: 312, partiallyAnalysed: true }]).unknownsRequiringInspection.length, c.unknownsRequiringInspection.length);
});
