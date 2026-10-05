// "Transcript may be incomplete" heuristic (Phase 4B).
import { test } from "node:test";
import assert from "node:assert/strict";
import { assessTranscriptCompleteness, LOW_TEXT_CHARS_PER_SECOND, MIN_ASSESSABLE_SECONDS } from "../../src/lib/service-call/ai/transcript-quality.ts";

// Real Development results (synthetic recordings, 2026-10-05): duration, transcript.
const SAMPLES = {
  english: [7.99, "Hello, this is a test. The sliding door in the living room will not lock since yesterday, and it makes a grinding noise when I open it.", false],
  arabic: [6.76, "مرحبا، باب الشرفة لا يغلق بشكل صحيح ويدخل الماء عند المطر.", false],
  hindi: [4.23, "नमस्ते, खिड़की का हैंडल ढीला है और वे ठीक से बंद नहीं होती।", false],
  englishThenArabic: [6.8, "The sliding door is stuck halfway. Please send someone. مرحباً، الباب المنزلق عالق.", false],
  arabicThenEnglishTruncated: [6.8, "مرحباً، الباب المنزلق عالق.", true],
};

test("calibration: complete real transcripts are not flagged; the truncated Arabic→English one is", () => {
  for (const [name, [duration, text, flagged]] of Object.entries(SAMPLES)) {
    const r = assessTranscriptCompleteness(text, duration);
    assert.equal(r.possiblyIncomplete, flagged, `${name}: ${r.charsPerSecond} chars/s`);
    assert.equal(r.assessed, true);
  }
});

test("no speech → flagged as possibly incomplete (staff should listen), whatever the duration", () => {
  for (const d of [null, 1, 3, 30]) {
    const r = assessTranscriptCompleteness("   ", d);
    assert.deepEqual(r.signals, ["no_speech_detected"]);
    assert.equal(r.possiblyIncomplete, true);
  }
});

test("unknown or very short duration → density not assessed (no false alarm)", () => {
  assert.deepEqual(assessTranscriptCompleteness("Hi.", null), { possiblyIncomplete: false, signals: [], assessed: false, durationSeconds: null, charsPerSecond: null });
  const short = assessTranscriptCompleteness("Hi.", MIN_ASSESSABLE_SECONDS - 0.5);
  assert.equal(short.assessed, false);
  assert.equal(short.possiblyIncomplete, false);
  for (const bad of [0, -5, NaN, Infinity]) assert.equal(assessTranscriptCompleteness("x", bad).assessed, false);
});

test("threshold boundary and whitespace-insensitive counting", () => {
  const at = assessTranscriptCompleteness("a".repeat(LOW_TEXT_CHARS_PER_SECOND * 10), 10);
  assert.equal(at.possiblyIncomplete, false, "exactly at the threshold is not flagged");
  const below = assessTranscriptCompleteness("a".repeat(LOW_TEXT_CHARS_PER_SECOND * 10 - 1), 10);
  assert.deepEqual(below.signals, ["low_text_for_duration"]);
  assert.equal(assessTranscriptCompleteness("a b\nc", 1).charsPerSecond, 3);
});

test("the flag only ever says 'possibly' — it carries no claim about what is missing", () => {
  const r = assessTranscriptCompleteness(SAMPLES.arabicThenEnglishTruncated[1], 6.8);
  assert.deepEqual(Object.keys(r).sort(), ["assessed", "charsPerSecond", "durationSeconds", "possiblyIncomplete", "signals"]);
  assert.ok(!JSON.stringify(r).match(/missing|english|dropped|language/i));
});
