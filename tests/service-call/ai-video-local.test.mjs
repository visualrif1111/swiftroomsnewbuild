// Phase 4E with real decoding: the worker's exact command lines run against
// synthetic fixtures through the local implementation (local ffmpeg test
// tool, V6). Proves codec decisions by real streams, frame timestamps,
// rotation, HDR tone-mapping, scene detection, metadata stripping and
// temp-file cleanup. The pinned production build is exercised in the
// controlled Development verification.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { createLocalVideoProcessor } from "../../src/lib/service-call/server/video-processor.ts";
import { normaliseImage } from "../../src/lib/service-call/server/image-normaliser.ts";
import { assessProbe, chooseTimestamps, sceneDetectionApplies } from "../../src/lib/service-call/ai/video-sampling.ts";
import { makeVideo, NO_TOOLS, PRIVATE_TAGS, videoTools, withDisplayRotation90 } from "../support/videos.mjs";

const local = () => createLocalVideoProcessor(videoTools);
const leftovers = async () => (await readdir(tmpdir())).filter((n) => n.startsWith("mw-"));

/** Probe → sample → extract → audio, as the pipeline drives the worker. */
async function analyse(bytes) {
  return (await local().withSession(bytes, async (w) => {
    const json = await w.probe();
    const assessed = json === null ? { ok: false, code: "video_unreadable" } : assessProbe(json);
    if (!assessed.ok) return { assessed };
    const p = assessed.probe;
    const scene = sceneDetectionApplies(p.durationSeconds) ? await w.sceneCandidates(Math.min(p.durationSeconds, 180)) : [];
    const ts = chooseTimestamps(p.durationSeconds, scene);
    const frames = await w.extractFrames(ts, { hdr: p.hdr });
    const audio = p.audio.status === "PRESENT" ? await w.extractAudio(Math.min(p.durationSeconds, 180)) : null;
    return { assessed, scene, ts, frames, audio };
  })).value;
}

test("H.264 MP4, H.264 MOV, HEVC MOV, VP8 WebM and VP9 WebM decode; frames carry their real timestamps", { skip: NO_TOOLS }, async () => {
  for (const [codec, container, audioCodec] of [["h264", "mp4", "aac"], ["h264", "mov", "aac"], ["hevc", "mov", "aac"], ["vp8", "webm", "opus"], ["vp9", "webm", "opus"]]) {
    const r = await analyse(await makeVideo({ codec, container, seconds: 4 }));
    assert.equal(r.assessed.ok, true, `${codec}/${container}: ${JSON.stringify(r.assessed)}`);
    assert.equal(r.assessed.probe.videoCodec, codec);
    assert.equal(r.assessed.probe.audio.codec, audioCodec);
    assert.ok(r.frames.length >= 3 && r.frames.length <= 8, `${codec}: ${r.frames.length} frames`);
    for (const f of r.frames) {
      assert.ok(f.at >= f.requestedAt - 0.001 && f.at - f.requestedAt < 0.2, `${codec}: decoded ${f.at} for ${f.requestedAt}`);
      const m = await sharp(f.png).metadata();
      assert.equal(m.format, "png");
      assert.deepEqual([m.width, m.height], [320, 240]);
    }
    assert.ok(r.audio && r.audio.byteLength > 100, `${codec}: audio extracted`);
  }
});

test("ProRes and AV1 inside valid containers are SKIPPED by stream, before any frame is decoded", { skip: NO_TOOLS }, async () => {
  for (const [codec, container] of [["prores", "mov"], ["av1", "mp4"]]) {
    const r = await analyse(await makeVideo({ codec, container, seconds: 2, audio: false }));
    assert.equal(r.assessed.code, "video_codec_not_supported", codec);
    assert.equal(r.frames, undefined);
  }
});

test("forged extension/MIME doesn't matter: MP4 bytes are recognised as MP4; garbage is unreadable", { skip: NO_TOOLS }, async () => {
  const r = await analyse(await makeVideo({ codec: "h264", container: "mp4", seconds: 2 }));
  assert.ok(r.assessed.probe.container.includes("mp4"));
  assert.equal((await analyse(new Uint8Array(Buffer.from("this is not a video at all, just text pretending")))).assessed.code, "video_unreadable");
  const truncated = (await makeVideo({ codec: "h264", container: "mp4", seconds: 2 })).slice(0, 600);
  assert.equal((await analyse(truncated)).assessed.ok, false);
});

test("display rotation (portrait phone video) is applied: frames come out upright", { skip: NO_TOOLS }, async () => {
  const r = await analyse(withDisplayRotation90(await makeVideo({ codec: "h264", container: "mp4", seconds: 2, audio: false })));
  const m = await sharp(r.frames[0].png).metadata();
  assert.deepEqual([m.width, m.height], [240, 320]);
});

test("HLG (HDR) HEVC is tone-mapped to SDR frames", { skip: NO_TOOLS }, async () => {
  const r = await analyse(await makeVideo({ codec: "hevc", container: "mov", seconds: 2, audio: false, hdr: true }));
  assert.equal(r.assessed.probe.hdr, true);
  assert.ok(r.frames.length >= 2);
  assert.equal(r.frames.length, r.ts.length, "every sampled instant decoded through the tone-mapping chain");
  const m = await sharp(r.frames[0].png).metadata();
  assert.equal(m.depth, "uchar", "8-bit SDR output");
});

test("scene detection finds a hard cut and the cut instant is sampled", { skip: NO_TOOLS }, async () => {
  const r = await analyse(await makeVideo({ video: "cut", codec: "h264", container: "mp4", seconds: 6, audio: false }));
  assert.ok(r.scene.some((c) => Math.abs(c.at - 3) < 0.2), JSON.stringify(r.scene));
  assert.ok(r.ts.some((t) => Math.abs(t - 3) < 0.2));
});

test("no audio stream → no extraction; silence still extracts (transcription decides speech)", { skip: NO_TOOLS }, async () => {
  const none = await analyse(await makeVideo({ seconds: 2, audio: false }));
  assert.deepEqual(none.assessed.probe.audio, { status: "ABSENT" });
  assert.equal(none.audio, null);
  const silent = await analyse(await makeVideo({ seconds: 2, audio: "silence" }));
  assert.ok(silent.audio.byteLength > 0);
});

test("container metadata (GPS, device, title) never reaches frames or extracted audio", { skip: NO_TOOLS }, async () => {
  const bytes = await makeVideo({ codec: "h264", container: "mov", seconds: 2, tags: true });
  for (const v of Object.values(PRIVATE_TAGS)) assert.ok(Buffer.from(bytes).includes(Buffer.from(v)), `fixture really carries ${v}`);
  const r = await analyse(bytes);
  const outputs = [...r.frames.map((f) => f.png), r.audio];
  const derivative = await normaliseImage(r.frames[0].png, "image/png");
  outputs.push(derivative.image.bytes);
  for (const out of outputs) {
    const buf = Buffer.from(out);
    for (const v of [...Object.values(PRIVATE_TAGS), "25.2048", "Lavf", "creation_time", "PHASE4E"]) assert.ok(!buf.includes(Buffer.from(v)), `output contains ${v}`);
  }
  const pngMeta = await sharp(r.frames[0].png).metadata();
  assert.equal(pngMeta.exif, undefined);
});

test("audio is bounded to the analysis window", { skip: NO_TOOLS }, async () => {
  const p = local();
  const { value } = await p.withSession(await makeVideo({ seconds: 6, size: "160x120", rate: 5 }), (w) => w.extractAudio(2));
  const { value: probe } = await p.withSession(value, (w) => w.probe());
  assert.ok(Math.abs(Number(probe.format.duration) - 2) < 0.15, probe.format.duration);
});

test("temporary files are removed after success and after failure", { skip: NO_TOOLS }, async () => {
  const before = await leftovers();
  await analyse(await makeVideo({ seconds: 2 }));
  await assert.rejects(local().withSession(new Uint8Array(10), async () => { throw new Error("boom"); }));
  assert.deepEqual(await leftovers(), before);
});
