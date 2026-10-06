// Phase 4F transcription evaluation (operator tool; Development key; synthetic TTS only).
//
//   node --experimental-transform-types --import ./tests/support/register.mjs \
//     tests/service-call/evals/run-transcription.mjs <out.json>
//
// 1. Each sample is spoken in segments (one language per segment) with
//    marker words, so ground truth "was every segment transcribed?" is
//    measured automatically, not by eye.
// 2. The production completeness flag (assessTranscriptCompleteness) is
//    scored against that ground truth.
// 3. EXPERIMENT ONLY (not production code): the same recordings are split at
//    pauses with a local ffmpeg silencedetect pass and each piece transcribed
//    separately, to see whether pause splitting would recover lost speech.
//    Pieces are never merged into a "complete" transcript for any report.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createOpenAiProvider } from "../../../src/lib/service-call/server/openai-provider.ts";
import { assessTranscriptCompleteness } from "../../../src/lib/service-call/ai/transcript-quality.ts";
import { videoTools } from "../../support/videos.mjs";
import { speech } from "./fixtures.mjs";

const out = process.argv[2];
if (!process.env.OPENAI_API_KEY || !out) throw new Error("usage: OPENAI_API_KEY=… run-transcription.mjs <out.json>");
const en = (text, markers) => ({ text, voice: "Samantha", markers });
const enB = (text, markers) => ({ text, voice: "Daniel", markers });
const ar = (text, markers) => ({ text, voice: "Majed", markers });
const hi = (text, markers) => ({ text, voice: "Lekha", markers });

// markers: words (any one is enough, case-insensitive) that prove a segment was transcribed.
export const AUDIO_SET = [
  { id: "a-en1", kind: "single", segments: [en("The sliding door in the living room is hard to open and it grinds halfway.", ["grind", "sliding"])] },
  { id: "a-en2", kind: "single", segments: [enB("Good afternoon. The bedroom window handle has become loose and the window does not seal when it rains.", ["handle", "seal"])] },
  { id: "a-en3", kind: "hesitant", pause: 2.5, segments: [en("Hello.", ["hello"]), en("Erm, the door.", ["door"]), en("It doesn't lock properly.", ["lock"]), en("Thanks.", ["thank"])] },
  { id: "a-en4", kind: "short", segments: [en("Window broken.", ["window", "broken"])] },
  { id: "a-ar1", kind: "single", segments: [ar("مرحبا، النافذة في غرفة النوم لا تغلق بشكل جيد والمقبض مكسور.", ["النافذة", "المقبض"])] },
  { id: "a-ar2", kind: "single", segments: [ar("الباب الزجاجي في الصالة صعب الفتح ويصدر صوتا عاليا عند التحريك.", ["الباب", "صوت"])] },
  { id: "a-hi1", kind: "single", segments: [hi("नमस्ते, रसोई की खिड़की ठीक से बंद नहीं होती है और हैंडल ढीला है।", ["खिड़की", "हैंडल"])] },
  { id: "a-mx1", kind: "ar→en", segments: [ar("مرحبا، عندي مشكلة في نافذة غرفة النوم.", ["نافذة", "مشكلة"]), en("The handle is loose and water comes in when it rains.", ["handle", "water", "rain"])] },
  { id: "a-mx2", kind: "ar→en", segments: [ar("السلام عليكم، الباب الأمامي.", ["الباب", "السلام"]), en("It won't lock at night and the key gets stuck.", ["lock", "key"])] },
  { id: "a-mx3", kind: "ar→en→ar", segments: [ar("مرحبا.", ["مرحبا"]), en("The glass in the kitchen window has a crack.", ["glass", "crack", "kitchen"]), ar("شكرا جزيلا.", ["شكرا"])] },
  { id: "a-mx4", kind: "en→ar", segments: [en("Hi, the patio door is stuck.", ["patio", "stuck"]), ar("ولا يمكن فتحه من الخارج.", ["فتح", "الخارج"])] },
  { id: "a-mx5", kind: "hi→en", segments: [hi("नमस्ते, खिड़की में समस्या है।", ["खिड़की", "समस्या"]), en("The seal has come off at the top.", ["seal", "top"])] },
  { id: "a-mx6", kind: "en→ar→en", segments: [en("Hello, about my window.", ["window"]), ar("المقبض مكسور.", ["المقبض", "مكسور"]), en("Please call me back.", ["call", "back"])] },
  // Continuous code-switching (no pause between languages): the 4B failure condition.
  { id: "a-mx7", kind: "ar→en (no pause)", pause: 0.05, segments: [ar("مرحبا، عندي مشكلة في نافذة غرفة النوم.", ["نافذة", "مشكلة"]), en("The handle is loose and water comes in when it rains.", ["handle", "water", "rain"])] },
  { id: "a-mx8", kind: "ar→en (no pause)", pause: 0.05, segments: [ar("السلام عليكم، عندي مشكلة في الباب", ["الباب", "السلام"]), en("it won't lock at night and the key gets stuck in the cylinder.", ["lock", "key", "cylinder"])] },
  { id: "a-mx9", kind: "ar→en (mid-sentence)", pause: 0.02, segments: [ar("النافذة في المطبخ", ["النافذة", "المطبخ"]), en("has a crack in the glass near the corner, can someone come and check it", ["crack", "glass", "corner"])] },
  { id: "a-mx10", kind: "ar→en→ar (no pause)", pause: 0.05, segments: [ar("مرحبا", ["مرحبا"]), en("the sliding door is stuck and very hard to move", ["sliding", "stuck"]), ar("شكرا لكم", ["شكرا"])] },
  { id: "a-mx11", kind: "en→ar (no pause)", pause: 0.05, segments: [en("Hi, the patio door is stuck", ["patio", "stuck"]), ar("ولا يمكن فتحه من الخارج أبدا", ["فتح", "الخارج"])] },
  { id: "a-mx12", kind: "hi→en (no pause)", pause: 0.05, segments: [hi("नमस्ते, खिड़की में समस्या है", ["खिड़की", "समस्या"]), en("the seal has come off at the top and it lets the wind in", ["seal", "wind"])] },
];

const run = (bin, args) => new Promise((resolve, reject) => execFile(bin, args, { maxBuffer: 16 * 1024 * 1024 }, (err, so, se) => (err ? reject(new Error(String(se || err.message).slice(0, 300))) : resolve({ stdout: so, stderr: se }))));
const duration = async (file) => Number((await run(videoTools.ffprobePath, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])).stdout.trim());
const norm = (s) => s.toLowerCase().normalize("NFKC").replace(/[ً-ٰٟـ]/g, "");
const covered = (text, segments) => segments.map((s) => s.markers.some((m) => norm(text).includes(norm(m))));

const provider = createOpenAiProvider({ apiKey: process.env.OPENAI_API_KEY, transcribeModel: "gpt-transcribe" });
const transcribe = async (bytes) => {
  const t0 = Date.now();
  const r = await provider.transcribe({ mediaId: "eval", label: "Voice note 1", mimeType: "audio/mp4", read: async () => bytes });
  return { ...r, ms: Date.now() - t0 };
};

const results = [];
const only = process.argv[3] ? process.argv[3].split(",") : null;
for (const s of AUDIO_SET.filter((x) => !only || only.includes(x.id))) {
  const dir = await mkdtemp(path.join(tmpdir(), "eval-tr-"));
  try {
    const bytes = await speech(s.segments, { pauseSeconds: s.pause ?? 0.9 });
    const f = path.join(dir, "a.m4a");
    await writeFile(f, bytes);
    const dur = await duration(f);
    const r = await transcribe(bytes);
    const cov = covered(r.text, s.segments);
    const flag = assessTranscriptCompleteness(r.text, dur);
    // Experiment: split at pauses (≥ 0.5 s below -35 dB) and transcribe each piece separately.
    let split = null;
    if (s.segments.length > 1) {
      const { stderr } = await run(videoTools.ffmpegPath, ["-hide_banner", "-i", f, "-af", "silencedetect=noise=-35dB:d=0.5", "-f", "null", "-"]);
      const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
      const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
      const cuts = starts.map((st, i) => ((st + (ends[i] ?? st)) / 2)).filter((c) => c > 0.3 && c < dur - 0.3);
      const bounds = [0, ...cuts, dur];
      const pieces = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const pf = path.join(dir, `p${i}.m4a`);
        await run(videoTools.ffmpegPath, ["-hide_banner", "-v", "error", "-y", "-i", f, "-ss", String(bounds[i]), "-to", String(bounds[i + 1]), "-c:a", "aac", "-b:a", "48k", pf]);
        pieces.push(await transcribe(new Uint8Array(await readFile(pf))));
      }
      const joined = pieces.map((p) => p.text).join(" ");
      split = { pieces: pieces.length, cuts: cuts.map((c) => +c.toFixed(2)), segmentsCovered: covered(joined, s.segments), calls: pieces.length, seconds: pieces.reduce((a, p) => a + (p.usage.openaiTranscribeSeconds ?? 0), 0) };
    }
    results.push({
      id: s.id, kind: s.kind, durationSeconds: +dur.toFixed(2), language: r.language, languages: r.languages, chars: r.text.replace(/\s+/g, "").length, text: r.text,
      segmentsCovered: cov, complete: cov.every(Boolean), flag: { possiblyIncomplete: flag.possiblyIncomplete, signals: flag.signals, assessed: flag.assessed, charsPerSecond: flag.charsPerSecond },
      ms: r.ms, seconds: r.usage.openaiTranscribeSeconds ?? null, split,
    });
    console.log(s.id, s.kind, cov.map((x) => (x ? "✓" : "✗")).join(""), `flag=${flag.possiblyIncomplete}`, `cps=${flag.charsPerSecond}`, split ? `split→${split.segmentsCovered.map((x) => (x ? "✓" : "✗")).join("")}` : "");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
const incomplete = results.filter((r) => !r.complete), complete = results.filter((r) => r.complete);
const multi = results.filter((r) => r.split);
const metrics = {
  samples: results.length,
  actuallyIncomplete: incomplete.map((r) => r.id),
  incompleteRecall: incomplete.length ? +(incomplete.filter((r) => r.flag.possiblyIncomplete).length / incomplete.length).toFixed(3) : null,
  completeFalseFlag: +(complete.filter((r) => r.flag.possiblyIncomplete).length / complete.length).toFixed(3),
  falseNegatives: incomplete.filter((r) => !r.flag.possiblyIncomplete).map((r) => r.id),
  falsePositives: complete.filter((r) => r.flag.possiblyIncomplete).map((r) => r.id),
  mixedLanguageLoss: results.filter((r) => r.kind.includes("→")).map((r) => `${r.id}(${r.kind}):${r.complete ? "complete" : "LOST " + r.segmentsCovered.map((x) => (x ? "✓" : "✗")).join("")}`),
  pauseSplit: { recordings: multi.length, recoveredWhereLost: multi.filter((r) => !r.complete && r.split.segmentsCovered.every(Boolean)).map((r) => r.id), stillLost: multi.filter((r) => !r.split.segmentsCovered.every(Boolean)).map((r) => r.id), extraCalls: multi.reduce((a, r) => a + r.split.calls, 0) },
  latencyMs: results.map((r) => r.ms),
  transcribedSeconds: results.reduce((a, r) => a + (r.seconds ?? r.durationSeconds), 0) + multi.reduce((a, r) => a + (r.split.seconds || 0), 0),
};
writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), model: "gpt-transcribe", results, metrics }, null, 1));
console.log(JSON.stringify(metrics, null, 1));
