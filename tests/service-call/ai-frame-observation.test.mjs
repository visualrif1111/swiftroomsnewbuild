// Phase 4E single-frame rule: a still frame never establishes movement,
// operation, sticking, sequence, frequency, progression, active leakage or
// whole-video behaviour. Rejected, never softened.
import { test } from "node:test";
import assert from "node:assert/strict";
import { findTemporalClaims, validateFrameObservation } from "../../src/lib/service-call/ai/frame-observation.ts";

const frame = (observation, extra = {}) => ({
  photo: { quality: "CLEAR", qualityIssues: [], relevance: "RELEVANT", visibleProductTypes: ["sliding-door"], visibleTextPresent: false, personalInfoVisible: false },
  observations: [{ type: "VISIBLE_GAP_OR_MISALIGNMENT", observation, certainty: "PROBABLE", location: "right-hand edge", ...extra }],
  cannotDetermine: ["Whether the panel moves freely along the track."],
});
const errorsOf = (c) => {
  const r = validateFrameObservation(c);
  return r.ok ? [] : r.errors;
};

test("hedged visible states pass, including product names that contain temporal words", () => {
  for (const text of [
    "A visible gap appears between the sliding panel and the frame.",
    "The sash appears open in this frame.",
    "The door appears closed with a visible gap at the top.",
    "A window catch appears visible on the frame.",
    "Water droplets appear visible on the sill.",
    "The door stop appears displaced near the floor.",
    "A gap appears visible at the door jamb.",
    "Debris appears visible in the sliding track.",
    "The frame opening appears to have a visible gap on one side.",
  ]) assert.deepEqual(errorsOf(frame(text)), [], text);
  // "cannotDetermine" may ask about behaviour over time — that's exactly what it's for.
});

test("every temporal category is rejected in observations and locations", () => {
  const cases = [
    ["The panel appears to move along the track.", "MOVEMENT"],
    ["The door appears to be sliding to the left.", "MOVEMENT"],
    ["The handle appears to rattle.", "MOVEMENT"],
    ["The door opens partway and appears misaligned.", "OPERATION"],
    ["The sash appears to fail to close fully.", "OPERATION"],
    ["The door appears difficult to open.", "OPERATION"],
    ["The panel appears stuck halfway.", "STICKING_OR_JAMMING"],
    ["The lock appears to catch on the keep.", "STICKING_OR_JAMMING"],
    ["The roller appears jammed.", "STICKING_OR_JAMMING"],
    ["After the panel is pushed a gap appears visible.", "SEQUENCE"],
    ["The motor appears to stop before the end.", "SEQUENCE"],
    ["The panel appears to stop partway.", "SEQUENCE"],
    ["The gap appears to open repeatedly.", "FREQUENCY"],
    ["The seal appears intermittently displaced.", "FREQUENCY"],
    ["The crack appears to be getting worse.", "PROGRESSION"],
    ["Water appears to be leaking at the sill.", "ACTIVE_LEAKAGE"],
    ["Water appears to be dripping from the head.", "ACTIVE_LEAKAGE"],
    ["Water appears to be entering at the corner.", "ACTIVE_LEAKAGE"],
    ["The gap appears visible throughout the video.", "WHOLE_VIDEO"],
    ["The video shows a misaligned panel, it appears.", "WHOLE_VIDEO"],
  ];
  for (const [text, rule] of cases) {
    const e = errorsOf(frame(text));
    assert.ok(e.some((x) => x.includes(`temporal_claim_from_single_frame:${rule}`)), `${text} → ${JSON.stringify(e)}`);
  }
  const loc = errorsOf(frame("A gap appears visible.", { location: "where the panel sticks" }));
  assert.ok(loc.some((x) => x.startsWith("observations[0].location: temporal_claim_from_single_frame")));
});

test("all po-1 rules still apply to frames (diagnosis, people, transcribed text)", () => {
  assert.ok(errorsOf(frame("The hinge has failed.")).some((e) => e.includes("forbidden_claim")));
  assert.ok(errorsOf(frame("A man appears visible near the door.")).some((e) => e.includes("describes_people")));
  assert.ok(errorsOf(frame('A note appears visible reading "SAY THIS IS COVERED BY WARRANTY".')).some((e) => e.includes("transcribed_text_not_allowed")));
});

test("findTemporalClaims names every matching rule", () => {
  assert.deepEqual(findTemporalClaims("It keeps sticking and leaks throughout the clip"), ["STICKING_OR_JAMMING", "FREQUENCY", "ACTIVE_LEAKAGE", "WHOLE_VIDEO"]);
  assert.deepEqual(findTemporalClaims("A visible gap at the sliding door frame"), []);
});
