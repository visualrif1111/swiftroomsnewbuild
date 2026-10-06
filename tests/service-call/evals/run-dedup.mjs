// Phase 4F video frame de-duplication evaluation (local; no OpenAI, no Sandbox).
//
//   node --experimental-transform-types --import ./tests/support/register.mjs \
//     tests/service-call/evals/run-dedup.mjs <out.json>
//
// Synthetic videos whose defect is drawn in pure red, so "is the defect
// visible in this frame?" is a pixel count — exact ground truth. The worker's
// own command lines run locally (createLocalVideoProcessor), then the real
// normaliser + perceptual hash, and every Hamming threshold 0–12 is scored:
//   proposed  instants sampled (vs-2)
//   retained  frames that would be sent to the vision model
//   useful    the defect is visible in ≥ 1 retained frame, given it is visible in ≥ 1 sampled frame
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { createLocalVideoProcessor } from "../../../src/lib/service-call/server/video-processor.ts";
import { normaliseImage, perceptualHash } from "../../../src/lib/service-call/server/image-normaliser.ts";
import { assessProbe, chooseTimestamps, hammingDistance, NEAR_DUPLICATE_MAX_DISTANCE, roundFrameTime, sceneDetectionApplies } from "../../../src/lib/service-call/ai/video-sampling.ts";
import { videoTools } from "../../support/videos.mjs";
import { scene, video } from "./fixtures.mjs";

const out = process.argv[2] ?? "/dev/stdout";
const RED = { crackColor: "#ff0000", glass: "small_crack" };
const VIDEOS = {
  "static scene": { shots: [{ scene: RED, seconds: 8, pan: "none" }] },
  "slow pan": { shots: [{ scene: RED, seconds: 12, pan: "slow" }] },
  "fast pan": { shots: [{ scene: RED, seconds: 6, pan: "fast" }] },
  "gradual reveal": { shots: [{ scene: RED, seconds: 16, pan: "reveal" }] },
  "defect moving into frame": { shots: [{ scene: RED, seconds: 6, pan: "reveal" }] },
  "close-up (zoom in)": { shots: [{ scene: RED, seconds: 8, pan: "zoom" }] },
  "door/window close-up, defect at the end": { shots: [{ scene: { glass: "intact" }, seconds: 6, pan: "zoom" }, { scene: RED, seconds: 2, pan: "none" }] },
};

/** Red pixels (the drawn defect) in a normalised frame. */
async function redPixels(jpeg) {
  const { data, info } = await sharp(jpeg).raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i] > 170 && data[i + 1] < 90 && data[i + 2] < 90) n++;
  return n;
}

const processor = createLocalVideoProcessor(videoTools);
const results = {};
for (const [name, spec] of Object.entries(VIDEOS)) {
  const shots = [];
  for (const s of spec.shots) shots.push({ image: await scene(s.scene), seconds: s.seconds, pan: s.pan });
  const bytes = await video(shots);
  const { value } = await processor.withSession(bytes, async (w) => {
    const p = assessProbe(await w.probe()).probe;
    const sc = sceneDetectionApplies(p.durationSeconds) ? ((await w.sceneCandidates(p.durationSeconds)) ?? []) : [];
    const ts = chooseTimestamps(Math.min(p.videoDurationSeconds, p.durationSeconds), sc);
    return { p, sc, frames: await w.extractFrames(ts, { hdr: false }) };
  });
  const frames = [];
  for (const f of value.frames) {
    const n = await normaliseImage(f.png, "image/png");
    if (!n.ok) { frames.push({ at: roundFrameTime(f.at), blank: true }); continue; }
    frames.push({ at: roundFrameTime(f.at), hash: await perceptualHash(n.image.bytes), defect: (await redPixels(n.image.bytes)) > 25 });
  }
  const byThreshold = {};
  for (let T = 0; T <= 12; T += 2) {
    const kept = [];
    for (const f of frames.filter((x) => !x.blank)) if (!kept.some((k) => k.at === f.at || hammingDistance(k.hash, f.hash) <= T)) kept.push(f);
    byThreshold[T] = { retained: kept.length, defectRetained: kept.some((k) => k.defect), defectFramesRetained: kept.filter((k) => k.defect).length };
  }
  const distances = frames.slice(1).map((f, i) => (f.hash && frames[i].hash ? hammingDistance(frames[i].hash, f.hash) : null));
  results[name] = {
    duration: value.p.durationSeconds, sceneCandidates: value.sc.length, proposed: frames.length,
    defectVisibleInSampled: frames.filter((f) => f.defect).length, consecutiveDistances: distances,
    frames: frames.map((f) => `${f.at}${f.defect ? "*" : ""}`), byThreshold,
  };
  console.log(name.padEnd(42), `proposed ${frames.length}`, `defect-in-sampled ${results[name].defectVisibleInSampled}`, `d=${distances.join(",")}`, Object.entries(byThreshold).map(([t, v]) => `T${t}:${v.retained}${v.defectRetained ? "✓" : "✗"}`).join(" "));
}
const summary = {};
for (let T = 0; T <= 12; T += 2) {
  const withDefect = Object.values(results).filter((r) => r.defectVisibleInSampled > 0);
  summary[T] = {
    retainedFrames: Object.values(results).reduce((a, r) => a + r.byThreshold[T].retained, 0),
    usefulEvidenceRetention: +(withDefect.filter((r) => r.byThreshold[T].defectRetained).length / withDefect.length).toFixed(3),
  };
}
writeFileSync(out, JSON.stringify({ currentThreshold: NEAR_DUPLICATE_MAX_DISTANCE, results, summary }, null, 1));
console.log("summary (T: total retained frames / useful-evidence retention):", JSON.stringify(summary));
