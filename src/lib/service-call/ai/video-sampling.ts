// Video evidence: probe validation and deterministic frame sampling — "vs-2"
// (Phase 4E, docs/service-aftercare/AI.md). Vendor-free and pure: the media
// worker (server/video-processor.ts) runs ffprobe/ffmpeg; this module decides
// what is supported and which instants are looked at.
//
// Sampling is reproducible for the same source bytes, worker build and
// sampling version:
//   1. scene-change candidates (≤ 4, ≥ 0.75 s apart, highest score first, videos ≤ 180 s only)
//   2. a fixed grid: n = clamp(ceil(d / 3 s), 3, 8) slice centres over the video
//   3. merged in that priority order, dropping instants < 0.75 s from one kept
//   4. capped at 8 by dropping the grid instants closest to a neighbour
// After extraction, frames are de-duplicated by perceptual hash and blank
// frames are dropped, so at most 8 frames ever reach a vision model.

export const SAMPLING_VERSION = "vs-2";
/** Hard ceiling on vision calls per video (V4). */
export const MAX_VIDEO_FRAMES = 8;
/** Analysis threshold (V7): longer videos are only partially analysed. */
export const ANALYSIS_WINDOW_SECONDS = 180;
export const MIN_GRID_FRAMES = 3;
export const GRID_SPACING_SECONDS = 3;
export const SCENE_THRESHOLD = 0.3;
export const MAX_SCENE_CANDIDATES = 4;
export const MIN_FRAME_GAP_SECONDS = 0.75;
/**
 * Two frames whose 64-bit difference hashes differ in ≤ this many bits are
 * near-duplicates. vs-2 (Phase 4F): 4, down from 6 — on the eval-1 video set a
 * close-up whose defect appears only at the end differed by exactly 6 bits and
 * was dropped; at 4 every defect-bearing view is retained for +1 frame in 20.
 */
export const NEAR_DUPLICATE_MAX_DISTANCE = 4;
/** Frames larger than this (pixels) are not decoded: 8K UHD. */
export const MAX_VIDEO_PIXELS = 7680 * 4320;

/** Codecs the pinned worker build decodes (scripts/media-worker/build-ffmpeg.sh). Anything else is SKIPPED. */
export const SUPPORTED_VIDEO_CODECS = ["h264", "hevc", "vp8", "vp9", "mpeg4", "h263"] as const;
export const SUPPORTED_AUDIO_CODECS = ["aac", "mp3", "opus", "vorbis", "amr_nb", "amr_wb", "alac", "pcm_s16le", "pcm_s16be", "pcm_s24le", "pcm_s24be", "pcm_f32le"] as const;
/** Demuxers the build contains (ffprobe's format_name contains one of these). */
const SUPPORTED_CONTAINERS = ["mov", "matroska", "webm"];
const HDR_TRANSFERS = ["smpte2084", "arib-std-b67"];

export interface VideoProbe {
  container: string;
  videoCodec: string;
  width: number;
  height: number;
  durationSeconds: number;
  /**
   * The video track's own length (≤ the container's when audio runs longer):
   * frames are only sampled within it.
   */
  videoDurationSeconds: number;
  /** The container's start time: frame presentation times are reported relative to it. */
  startSeconds: number;
  /** PQ or HLG transfer: frames are tone-mapped to SDR. */
  hdr: boolean;
  audio: { status: "PRESENT"; codec: string } | { status: "ABSENT" } | { status: "NOT_SUPPORTED"; codec: string };
}

export type ProbeOutcome =
  | { ok: true; probe: VideoProbe }
  | { ok: false; outcome: "SKIPPED" | "FAILED"; code: string; detail?: Record<string, string> };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const safeName = (v: unknown) => (typeof v === "string" && /^[a-z0-9_,.-]{1,40}$/i.test(v) ? v.toLowerCase() : "unknown");

/**
 * Decides from ffprobe's JSON (-show_streams -show_format) whether the file
 * can be analysed. The real streams decide — never the extension or the MIME
 * type the browser declared.
 */
export function assessProbe(json: unknown): ProbeOutcome {
  if (!isObj(json) || !Array.isArray(json.streams) || !isObj(json.format)) return { ok: false, outcome: "FAILED", code: "video_unreadable" };
  const format = json.format;
  const container = safeName(format.format_name);
  if (!SUPPORTED_CONTAINERS.some((c) => container.split(",").includes(c))) return { ok: false, outcome: "SKIPPED", code: "video_container_not_supported", detail: { container } };

  const streams = json.streams.filter(isObj);
  // Cover art in an audio file is a "video" stream with attached_pic: not footage.
  const video = streams.filter((s) => s.codec_type === "video" && !(isObj(s.disposition) && s.disposition.attached_pic === 1));
  if (!video.length) return { ok: false, outcome: "SKIPPED", code: "video_no_video_stream", detail: { container } };
  const v = video[0];
  const videoCodec = safeName(v.codec_name);
  if (!(SUPPORTED_VIDEO_CODECS as readonly string[]).includes(videoCodec)) return { ok: false, outcome: "SKIPPED", code: "video_codec_not_supported", detail: { container, videoCodec } };

  const width = num(v.width) ?? 0;
  const height = num(v.height) ?? 0;
  if (width <= 0 || height <= 0) return { ok: false, outcome: "FAILED", code: "video_unreadable", detail: { container, videoCodec } };
  if (width * height > MAX_VIDEO_PIXELS) return { ok: false, outcome: "SKIPPED", code: "video_resolution_not_supported", detail: { container, videoCodec } };

  const duration = num(format.duration) ?? num(v.duration);
  if (duration === null) return { ok: false, outcome: "FAILED", code: "video_unreadable", detail: { container, videoCodec } };
  if (duration <= 0.05) return { ok: false, outcome: "SKIPPED", code: "video_empty", detail: { container, videoCodec } };

  const a = streams.find((s) => s.codec_type === "audio");
  const audioCodec = a ? safeName(a.codec_name) : null;
  const audio: VideoProbe["audio"] = !audioCodec
    ? { status: "ABSENT" }
    : (SUPPORTED_AUDIO_CODECS as readonly string[]).includes(audioCodec)
      ? { status: "PRESENT", codec: audioCodec }
      : { status: "NOT_SUPPORTED", codec: audioCodec };

  return {
    ok: true,
    probe: {
      container, videoCodec, width, height,
      durationSeconds: Math.round(duration * 1000) / 1000,
      videoDurationSeconds: Math.round(Math.min(duration, num(v.duration) ?? duration) * 1000) / 1000,
      startSeconds: num(format.start_time) ?? 0,
      hdr: HDR_TRANSFERS.includes(String(v.color_transfer ?? "")),
      audio,
    },
  };
}

/** Rounds to 1 ms (the precision instants are requested at). */
const ms = (t: number) => Math.round(t * 1000) / 1000;

export function gridTimestamps(durationSeconds: number): number[] {
  const n = Math.min(MAX_VIDEO_FRAMES, Math.max(MIN_GRID_FRAMES, Math.ceil(durationSeconds / GRID_SPACING_SECONDS)));
  return Array.from({ length: n }, (_, i) => ms(((i + 0.5) * durationSeconds) / n));
}

/** Whether scene detection runs (bounded decode cost): only within the analysis window. */
export const sceneDetectionApplies = (durationSeconds: number) => durationSeconds <= ANALYSIS_WINDOW_SECONDS;

/**
 * The instants to extract, sorted. Deterministic for the same duration and
 * scene candidates (ties broken by time).
 */
export function chooseTimestamps(durationSeconds: number, sceneCandidates: { at: number; score: number }[]): number[] {
  const scene: { at: number; grid: boolean }[] = [];
  for (const c of sceneCandidates
    .filter((c) => Number.isFinite(c.at) && c.at >= 0 && c.at < durationSeconds && Number.isFinite(c.score))
    .sort((a, b) => b.score - a.score || a.at - b.at)) {
    if (scene.length >= MAX_SCENE_CANDIDATES) break;
    if (scene.every((k) => Math.abs(k.at - c.at) >= MIN_FRAME_GAP_SECONDS)) scene.push({ at: ms(c.at), grid: false });
  }
  const grid = gridTimestamps(durationSeconds).map((at) => ({ at, grid: true }));
  const kept: { at: number; grid: boolean }[] = [];
  for (const c of [...scene, ...grid]) if (kept.every((k) => Math.abs(k.at - c.at) >= MIN_FRAME_GAP_SECONDS)) kept.push(c);
  kept.sort((a, b) => a.at - b.at);
  while (kept.length > MAX_VIDEO_FRAMES) {
    // Drop the grid instant with the smallest gap to a neighbour (earliest on ties).
    let drop = -1;
    let best = Infinity;
    kept.forEach((k, i) => {
      if (!k.grid) return;
      const gap = Math.min(i > 0 ? k.at - kept[i - 1].at : Infinity, i < kept.length - 1 ? kept[i + 1].at - k.at : Infinity);
      if (gap < best) [best, drop] = [gap, i];
    });
    if (drop < 0) break;
    kept.splice(drop, 1);
  }
  return kept.map((k) => k.at);
}

/** Display form of a frame instant: "mm:ss.s" (one decimal). */
export function formatTimestamp(seconds: number): string {
  const tenths = Math.round(seconds * 10);
  const m = Math.floor(tenths / 600);
  const s = (tenths % 600) / 10;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

/** The exact evidence identity of one analysed frame: "Video 1 @ 00:04.2". */
export const frameLabel = (videoLabel: string, seconds: number) => `${videoLabel} @ ${formatTimestamp(seconds)}`;

/** Frame instants are stored at 0.1 s, the precision staff see. */
export const roundFrameTime = (seconds: number) => Math.round(seconds * 10) / 10;

/** Bits that differ between two 64-bit hashes (16 hex characters). */
export function hammingDistance(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < 16; i++) {
    let x = parseInt(a[i] ?? "0", 16) ^ parseInt(b[i] ?? "0", 16);
    while (x) {
      n += x & 1;
      x >>= 1;
    }
  }
  return n;
}
