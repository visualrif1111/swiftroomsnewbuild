// Synthetic video fixtures for Phase 4E tests, generated on demand with a
// LOCAL ffmpeg test tool (V6: a test-only binary, never shipped, never in the
// app runtime). Default location ~/.cache/swiftrooms-test-tools/ffmpeg-6.1.1,
// or SERVICE_TEST_FFMPEG_DIR. Without it, the integration tests that need real
// decoding are skipped with an explicit reason; every other 4E test runs.
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";

const dir = process.env.SERVICE_TEST_FFMPEG_DIR ?? path.join(homedir(), ".cache/swiftrooms-test-tools/ffmpeg-6.1.1");
export const videoTools = existsSync(path.join(dir, "ffmpeg")) && existsSync(path.join(dir, "ffprobe"))
  ? { ffmpegPath: path.join(dir, "ffmpeg"), ffprobePath: path.join(dir, "ffprobe") }
  : null;
export const NO_TOOLS = videoTools ? false : `local ffmpeg test tool not found in ${dir} (set SERVICE_TEST_FFMPEG_DIR)`;

/** Private metadata planted in fixtures: none of it may reach frames, audio or model requests. */
export const PRIVATE_TAGS = { location: "+25.2048+055.2708/", make: "PHASE4E-SECRET-MAKE", model: "PHASE4E-SECRET-MODEL", title: "PHASE4E customer-name holiday clip" };

const run = (args) => new Promise((resolve, reject) => execFile(videoTools.ffmpegPath, ["-hide_banner", "-v", "error", "-y", ...args], { maxBuffer: 64 * 1024 * 1024 }, (err, _o, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve())));

const cache = new Map();
/**
 * Builds (once per process) a fixture and returns its bytes.
 *   video: testsrc2 | cut (two scenes) | static | black | movement
 *   codec: h264 | hevc | vp8 | vp9 | prores | av1
 *   container: mp4 | mov | webm | mkv
 *   audio: "tone" | "silence" | false
 */
export async function makeVideo({ video = "testsrc2", codec = "h264", container = "mp4", seconds = 4, size = "320x240", rate = 15, audio = "tone", tags = false, hdr = false } = {}) {
  const key = JSON.stringify({ video, codec, container, seconds, size, rate, audio, tags, hdr });
  if (cache.has(key)) return cache.get(key);
  const work = await mkdtemp(path.join(tmpdir(), "fx-"));
  try {
    const out = path.join(work, `fixture.${container}`);
    const inputs = [];
    const filters = [];
    if (video === "cut") {
      const half = (seconds / 2).toFixed(2);
      inputs.push("-f", "lavfi", "-i", `testsrc2=size=${size}:rate=${rate}:duration=${half}`, "-f", "lavfi", "-i", `color=c=0x2060c0:size=${size}:rate=${rate}:duration=${half}`);
      filters.push("-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]", "-map", "[v]");
    } else {
      const src = { testsrc2: `testsrc2=size=${size}:rate=${rate}`, static: `testsrc=size=${size}:rate=${rate}`, black: `color=c=black:size=${size}:rate=${rate}`, movement: `testsrc2=size=${size}:rate=${rate}` }[video];
      inputs.push("-f", "lavfi", "-i", `${src}:duration=${seconds}`);
      filters.push("-map", "0:v");
      if (video === "static") filters.push("-vf", "trim=end_frame=1,loop=loop=-1:size=1,setpts=N/FRAME_RATE/TB", "-t", String(seconds));
    }
    if (audio) {
      const asrc = audio === "tone" ? `sine=frequency=440:duration=${seconds}` : `anullsrc=r=48000:cl=mono`;
      inputs.push("-f", "lavfi", "-t", String(seconds), "-i", asrc);
      filters.push("-map", `${inputs.filter((x) => x === "-i").length - 1}:a`);
    }
    const vcodec = {
      h264: ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast"],
      hevc: ["-c:v", "libx265", "-pix_fmt", hdr ? "yuv420p10le" : "yuv420p", "-preset", "ultrafast", "-tag:v", "hvc1", "-x265-params", hdr ? "log-level=error:colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc" : "log-level=error"],
      vp8: ["-c:v", "libvpx", "-b:v", "300k"],
      vp9: ["-c:v", "libvpx-vp9", "-b:v", "300k", "-deadline", "realtime", "-cpu-used", "8"],
      prores: ["-c:v", "prores_ks", "-profile:v", "0"],
      av1: ["-c:v", "libaom-av1", "-cpu-used", "8", "-b:v", "200k"],
    }[codec];
    const acodec = container === "webm" ? ["-c:a", "libopus", "-b:a", "48k"] : ["-c:a", "aac", "-b:a", "64k"];
    const extra = [];
    if (hdr) extra.push("-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc");
    if (tags) for (const [k, v] of Object.entries(PRIVATE_TAGS)) extra.push("-metadata", `${k}=${v}`);
    await run([...inputs, ...filters, ...vcodec, ...(audio ? acodec : []), ...extra, "-shortest", out]);
    const bytes = new Uint8Array(await readFile(out));
    cache.set(key, bytes);
    return bytes;
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

/** A minimal ffprobe JSON (as the worker's -show_entries returns it). */
export function probeJson({ container = "mov,mp4,m4a,3gp,3g2,mj2", videoCodec = "h264", width = 320, height = 240, duration = "4.000000", start = "0.000000", audioCodec = "aac", transfer, attachedPic = false } = {}) {
  const streams = [];
  if (videoCodec) streams.push({ index: 0, codec_name: videoCodec, codec_type: "video", width, height, duration, ...(transfer ? { color_transfer: transfer } : {}), disposition: { attached_pic: attachedPic ? 1 : 0 } });
  if (audioCodec) streams.push({ index: streams.length, codec_name: audioCodec, codec_type: "audio", duration, disposition: { attached_pic: 0 } });
  return { programs: [], streams, format: { format_name: container, start_time: start, duration } };
}

/**
 * Sets a 90° display matrix on the first track of an MP4/MOV (as phones do
 * for portrait video) by rewriting the tkhd matrix in place.
 */
export function withDisplayRotation90(bytes) {
  const out = new Uint8Array(bytes);
  const at = Buffer.from(out).indexOf(Buffer.from("tkhd"));
  if (at < 0) throw new Error("no tkhd");
  const version = out[at + 4];
  const matrix = at + 4 + 4 + (version === 1 ? 8 + 8 + 4 + 4 + 8 : 4 + 4 + 4 + 4 + 4) + 8 + 2 + 2 + 2 + 2;
  const dv = new DataView(out.buffer, out.byteOffset);
  const m = [0, 0x00010000, 0, -0x00010000, 0, 0, 0, 0, 0x40000000];
  m.forEach((v, i) => dv.setInt32(matrix + i * 4, v));
  return out;
}
