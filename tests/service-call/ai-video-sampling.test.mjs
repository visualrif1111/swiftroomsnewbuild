// Phase 4E pure logic: probe assessment (codecs by stream, never by
// extension), deterministic bounded sampling (vs-1), timestamps and labels.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANALYSIS_WINDOW_SECONDS, assessProbe, chooseTimestamps, formatTimestamp, frameLabel, gridTimestamps, hammingDistance,
  MAX_VIDEO_FRAMES, MIN_FRAME_GAP_SECONDS, roundFrameTime, sceneDetectionApplies, SAMPLING_VERSION,
} from "../../src/lib/service-call/ai/video-sampling.ts";
import { probeJson } from "../support/videos.mjs";

test("supported codecs are decided by the actual streams (MP4/MOV H.264, HEVC, WebM VP8/VP9)", () => {
  for (const [container, videoCodec, audioCodec] of [
    ["mov,mp4,m4a,3gp,3g2,mj2", "h264", "aac"],
    ["mov,mp4,m4a,3gp,3g2,mj2", "hevc", "aac"],
    ["matroska,webm", "vp8", "opus"],
    ["matroska,webm", "vp9", "opus"],
  ]) {
    const r = assessProbe(probeJson({ container, videoCodec, audioCodec }));
    assert.equal(r.ok, true, `${container}/${videoCodec}`);
    assert.equal(r.probe.videoCodec, videoCodec);
    assert.deepEqual(r.probe.audio, { status: "PRESENT", codec: audioCodec });
    assert.equal(r.probe.durationSeconds, 4);
    assert.equal(r.probe.startSeconds, 0);
  }
});

test("unsupported codecs inside a valid container are SKIPPED (ProRes, AV1, anything unknown)", () => {
  for (const videoCodec of ["prores", "av1", "mjpeg", "dnxhd"]) {
    assert.deepEqual(assessProbe(probeJson({ videoCodec })), { ok: false, outcome: "SKIPPED", code: "video_codec_not_supported", detail: { container: "mov,mp4,m4a,3gp,3g2,mj2", videoCodec } });
  }
});

test("container comes from the probe, not the extension or declared MIME; unsupported containers are SKIPPED", () => {
  // A "webm" upload that is really MP4 is analysed as what it is.
  assert.equal(assessProbe(probeJson({ container: "mov,mp4,m4a,3gp,3g2,mj2" })).probe.container, "mov,mp4,m4a,3gp,3g2,mj2");
  assert.equal(assessProbe(probeJson({ container: "avi" })).code, "video_container_not_supported");
  assert.equal(assessProbe(probeJson({ container: "mpegts" })).code, "video_container_not_supported");
});

test("no video stream, cover art only, zero duration, unreadable and oversized are handled explicitly", () => {
  assert.equal(assessProbe(probeJson({ videoCodec: null })).code, "video_no_video_stream");
  assert.equal(assessProbe(probeJson({ attachedPic: true })).code, "video_no_video_stream");
  assert.deepEqual(assessProbe(probeJson({ duration: "0.000000" })).code, "video_empty");
  assert.equal(assessProbe(probeJson({ duration: "N/A" })).code, "video_unreadable");
  assert.equal(assessProbe(probeJson({ width: 0 })).code, "video_unreadable");
  assert.equal(assessProbe(probeJson({ width: 15360, height: 8640 })).code, "video_resolution_not_supported");
  for (const bad of [null, "x", {}, { streams: "no", format: {} }]) assert.deepEqual(assessProbe(bad), { ok: false, outcome: "FAILED", code: "video_unreadable" });
});

test("frames are sampled within the video track when the audio runs longer", () => {
  const j = probeJson({ duration: "8.000000" });
  j.streams[0].duration = "6.666667";
  const r = assessProbe(j);
  assert.equal(r.probe.durationSeconds, 8);
  assert.equal(r.probe.videoDurationSeconds, 6.667);
  // WebM streams carry no per-stream duration: the container's is used.
  const w = probeJson({ container: "matroska,webm", videoCodec: "vp9", audioCodec: "opus" });
  delete w.streams[0].duration;
  assert.equal(assessProbe(w).probe.videoDurationSeconds, 4);
});

test("audio: present, absent or in an unsupported codec; HDR (PQ/HLG) detected", () => {
  assert.deepEqual(assessProbe(probeJson({ audioCodec: null })).probe.audio, { status: "ABSENT" });
  assert.deepEqual(assessProbe(probeJson({ audioCodec: "ac3" })).probe.audio, { status: "NOT_SUPPORTED", codec: "ac3" });
  assert.equal(assessProbe(probeJson({ transfer: "arib-std-b67" })).probe.hdr, true);
  assert.equal(assessProbe(probeJson({ transfer: "smpte2084" })).probe.hdr, true);
  assert.equal(assessProbe(probeJson({ transfer: "bt709" })).probe.hdr, false);
});

test("probe values are sanitised: codec/container names can't carry arbitrary text", () => {
  const r = assessProbe(probeJson({ container: "mov,mp4,m4a,3gp,3g2,mj2", videoCodec: "h264; rm -rf /" }));
  assert.equal(r.code, "video_codec_not_supported");
  assert.equal(r.detail.videoCodec, "unknown");
});

test("grid: 3–8 frames at slice centres, never past the end", () => {
  assert.deepEqual(gridTimestamps(1), [0.167, 0.5, 0.833]);
  assert.equal(gridTimestamps(9).length, 3);
  assert.equal(gridTimestamps(12).length, 4);
  assert.equal(gridTimestamps(30).length, 8);
  assert.equal(gridTimestamps(3600).length, 8);
  for (const d of [0.4, 2, 7.7, 180, 600]) assert.ok(gridTimestamps(d).every((t) => t >= 0 && t < d));
});

test("sampling is deterministic, bounded to 8, keeps a minimum gap, and prefers scene changes over grid points", () => {
  const scene = [{ at: 2.0, score: 0.5 }, { at: 7.1, score: 0.9 }, { at: 7.3, score: 0.4 }, { at: 11, score: 0.35 }, { at: 15, score: 0.31 }, { at: 19, score: 0.3 }];
  const a = chooseTimestamps(30, scene);
  const b = chooseTimestamps(30, [...scene].reverse());
  assert.deepEqual(a, b, "independent of candidate order");
  assert.ok(a.length <= MAX_VIDEO_FRAMES);
  for (let i = 1; i < a.length; i++) assert.ok(a[i] - a[i - 1] >= MIN_FRAME_GAP_SECONDS);
  assert.ok(a.includes(7.1) && a.includes(2) && a.includes(11) && a.includes(15), "top-4 scene changes kept");
  assert.ok(!a.includes(19), "only 4 scene candidates");
  assert.deepEqual(chooseTimestamps(30, []), gridTimestamps(30), "no scene changes → pure grid");
  assert.deepEqual(chooseTimestamps(5, [{ at: 9, score: 1 }, { at: Number.NaN, score: 1 }]), gridTimestamps(5), "out-of-range candidates ignored");
});

test("180-second boundary: scene detection and full analysis within it; partial beyond it", () => {
  assert.equal(ANALYSIS_WINDOW_SECONDS, 180);
  assert.equal(sceneDetectionApplies(180), true);
  assert.equal(sceneDetectionApplies(180.001), false);
  // Long videos still get at most 8 frames spread across their whole length.
  const long = chooseTimestamps(600, []);
  assert.equal(long.length, 8);
  assert.ok(long.at(-1) > 500);
});

test("timestamps and labels: mm:ss.s, 0.1 s precision, exact evidence identity", () => {
  assert.equal(formatTimestamp(4.2), "00:04.2");
  assert.equal(formatTimestamp(0), "00:00.0");
  assert.equal(formatTimestamp(59.96), "01:00.0");
  assert.equal(formatTimestamp(125.04), "02:05.0");
  assert.equal(formatTimestamp(180), "03:00.0");
  assert.equal(frameLabel("Video 1", 4.2), "Video 1 @ 00:04.2");
  assert.equal(roundFrameTime(4.2333), 4.2);
  assert.equal(SAMPLING_VERSION, "vs-1");
});

test("perceptual-hash distance", () => {
  assert.equal(hammingDistance("0000000000000000", "0000000000000000"), 0);
  assert.equal(hammingDistance("ffffffffffffffff", "0000000000000000"), 64);
  assert.equal(hammingDistance("0000000000000001", "0000000000000003"), 1);
});
