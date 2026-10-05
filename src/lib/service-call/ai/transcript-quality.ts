// Conservative "transcript may be incomplete" signal (Phase 4B, AI.md).
//
// Transcription can silently leave speech out: with gpt-transcribe, English
// spoken after Arabic in the same recording was dropped (confirmed in
// Development). Nothing in the API response says so, so this is a heuristic:
// it can only say a transcript *may* be incomplete, never that content is
// missing, and it never tries to reconstruct what was said. Staff always have
// the original recording, which remains the authoritative evidence.
//
// Signals:
//   no_speech_detected     no text came back for a recording
//   low_text_for_duration  far less text than the recording's length suggests
//
// Calibration (synthetic Development samples, 2026-10-05; to be tuned with
// consented real recordings in 4F): complete transcripts measured 7.1–13.6
// non-space characters per second (Arabic, Hindi, English, mixed English→
// Arabic); the truncated Arabic→English sample measured 3.5. Slow or hesitant
// speech can also fall below the threshold — that is acceptable: the flag
// asks staff to listen, it doesn't assert anything.

export const MIN_ASSESSABLE_SECONDS = 3;
export const LOW_TEXT_CHARS_PER_SECOND = 5;

export type CompletenessSignal = "no_speech_detected" | "low_text_for_duration";

export interface TranscriptCompleteness {
  /** True when a signal fired. "May be incomplete" — never "is incomplete". */
  possiblyIncomplete: boolean;
  signals: CompletenessSignal[];
  /** False when the recording's duration is unknown or too short to judge. */
  assessed: boolean;
  durationSeconds: number | null;
  charsPerSecond: number | null;
}

export function assessTranscriptCompleteness(text: string, durationSeconds: number | null | undefined): TranscriptCompleteness {
  const chars = text.replace(/\s+/g, "").length;
  const signals: CompletenessSignal[] = [];
  if (chars === 0) signals.push("no_speech_detected");

  const duration = typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : null;
  const assessed = duration !== null && duration >= MIN_ASSESSABLE_SECONDS;
  const charsPerSecond = duration ? Math.round((chars / duration) * 10) / 10 : null;
  if (assessed && chars > 0 && charsPerSecond! < LOW_TEXT_CHARS_PER_SECOND) signals.push("low_text_for_duration");

  return { possiblyIncomplete: signals.length > 0, signals, assessed, durationSeconds: duration, charsPerSecond };
}
