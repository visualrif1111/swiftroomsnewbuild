// Media worker for video evidence (server-only, Phase 4E; AI.md § Video).
//
// Untrusted customer video is parsed and decoded ONLY inside an isolated
// Vercel Sandbox microVM booted from the pinned media-worker snapshot
// (scripts/media-worker/: FFmpeg 8.1.3, LGPL-2.1-or-later, decode-only codec
// set). Never in the application function: the function holds the OpenAI and
// Supabase credentials, the worker holds nothing.
//
// Isolation, per video:
//   - a fresh, non-persistent sandbox with network "deny-all", no environment
//     variables, no tags, a random name and a hard timeout;
//   - it receives the video's bytes only, as /tmp/mw/input — no media id,
//     reference, customer data, file name, storage path, URL or key;
//   - frames (PNG) and audio (.m4a) are read back into memory, then the
//     sandbox is stopped and deleted in `finally` — on success, failure and
//     timeout alike. Nothing persists.
//
// The same ffmpeg/ffprobe command lines drive the local implementation used by
// tests (createLocalVideoProcessor), so integration tests exercise exactly the
// commands the worker runs.
import "server-only";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ServiceAiProviderError, type ProviderUsage, type VideoFrame, type VideoProcessor, type VideoWorkerSession } from "../ai/provider";
import { SCENE_THRESHOLD } from "../ai/video-sampling";

/** Worker protocol version: bump when any command line below changes (it is part of every video cache key). */
export const WORKER_PROTOCOL_VERSION = "mw-1";
export const WORKER_BIN = "/opt/media-worker/bin";
const WORKDIR = "/tmp/mw";
/** Long edge of extracted frames before the 4D normaliser (which bounds to 1536 px). */
const FRAME_MAX_EDGE = 1920;
const AUDIO_SAMPLE_RATE = 16_000;
const AUDIO_BITRATE = "48k";

// ─── Command lines (shared by both implementations) ──────────────────────────

/** Only the fields assessProbe() reads: container/stream tags (GPS, device, dates) are never requested. */
export const probeArgs = (input: string) => [
  "-v", "error", "-hide_banner", "-print_format", "json",
  "-show_entries", "format=format_name,duration,start_time:stream=index,codec_type,codec_name,width,height,duration,color_transfer:stream_disposition=attached_pic",
  input,
];

export const sceneArgs = (input: string, maxSeconds: number) => [
  "-nostdin", "-hide_banner", "-v", "info", "-t", maxSeconds.toFixed(3), "-i", input,
  "-map", "0:v:0", "-an", "-sn", "-dn",
  "-vf", `scale=320:-2,select='gt(scene,${SCENE_THRESHOLD})',metadata=print`,
  "-f", "null", "-",
];

const SDR_CHAIN = `scale='min(${FRAME_MAX_EDGE},iw)':'min(${FRAME_MAX_EDGE},ih)':force_original_aspect_ratio=decrease:flags=bicubic,format=rgb24`;
/** PQ/HLG → SDR (BT.709) before scaling, so HDR iPhone frames aren't washed out. */
const HDR_CHAIN = `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,${SDR_CHAIN}`;

/**
 * One frame at (or just after) `seconds`. Autorotation is ffmpeg's default
 * (display matrix applied); -copyts keeps the file's timeline so showinfo
 * reports the decoded frame's real presentation time.
 */
export const frameArgs = (input: string, seconds: number, hdr: boolean, output: string) => [
  "-nostdin", "-hide_banner", "-v", "info", "-copyts", "-ss", seconds.toFixed(3), "-i", input,
  "-map", "0:v:0", "-an", "-sn", "-dn", "-frames:v", "1",
  "-vf", `${hdr ? HDR_CHAIN : SDR_CHAIN},showinfo`,
  "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:v", "+bitexact",
  "-f", "image2", "-update", "1", "-c:v", "png", "-y", output,
];

/** First audio track only, bounded, mono 16 kHz AAC in .m4a, with no metadata or chapters. */
export const audioArgs = (input: string, maxSeconds: number, output: string) => [
  "-nostdin", "-hide_banner", "-v", "error", "-t", maxSeconds.toFixed(3), "-i", input,
  "-map", "0:a:0", "-vn", "-sn", "-dn",
  "-ac", "1", "-ar", String(AUDIO_SAMPLE_RATE), "-c:a", "aac", "-b:a", AUDIO_BITRATE,
  "-map_metadata", "-1", "-map_chapters", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact",
  "-f", "ipod", "-y", output,
];

/** Pairs metadata=print's "pts_time:" lines with the following "lavfi.scene_score=" lines. */
export function parseSceneLog(log: string): { at: number; score: number }[] {
  const out: { at: number; score: number }[] = [];
  let at: number | null = null;
  for (const line of log.split(/\r?\n/)) {
    const t = /\bpts_time:\s*(-?[\d.]+)/.exec(line);
    if (t) at = Number(t[1]);
    const s = /lavfi\.scene_score=([\d.]+)/.exec(line);
    if (s && at !== null && Number.isFinite(at)) {
      out.push({ at, score: Number(s[1]) });
      at = null;
    }
  }
  return out;
}

/** The decoded frame's presentation time from showinfo ("pts_time:4.2"). */
export function parseShowinfoTime(log: string): number | null {
  const m = /Parsed_showinfo[^\n]*\bpts_time:\s*(-?[\d.]+)/.exec(log);
  return m && Number.isFinite(Number(m[1])) ? Number(m[1]) : null;
}

// ─── Shared session logic ────────────────────────────────────────────────────

interface Runner {
  /** Runs a worker binary; resolves even on non-zero exit. Throws ServiceAiProviderError on timeout/transport. */
  run(bin: "ffmpeg" | "ffprobe", args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }>;
  read(file: string): Promise<Uint8Array | null>;
  file(name: string): string;
}

function sessionOver(r: Runner): VideoWorkerSession {
  const input = r.file("input");
  return {
    async probe() {
      const res = await r.run("ffprobe", probeArgs(input));
      if (res.exitCode !== 0) return null;
      try {
        return JSON.parse(res.stdout) as unknown;
      } catch {
        return null;
      }
    },
    async sceneCandidates(maxSeconds) {
      const res = await r.run("ffmpeg", sceneArgs(input, maxSeconds));
      // A failed pass is reported (null), never mistaken for "no scene changes".
      return res.exitCode === 0 ? parseSceneLog(res.stderr) : null;
    },
    async extractFrames(timestamps, { hdr }) {
      const frames: VideoFrame[] = [];
      for (const [i, t] of timestamps.entries()) {
        const out = r.file(`frame-${i}.png`);
        const res = await r.run("ffmpeg", frameArgs(input, t, hdr, out));
        const at = parseShowinfoTime(res.stderr);
        const png = res.exitCode === 0 ? await r.read(out) : null;
        // No frame at/after this instant (e.g. past the last frame): nothing to analyse there.
        if (png && png.byteLength && at !== null) frames.push({ requestedAt: t, at, png });
      }
      return frames;
    },
    async extractAudio(maxSeconds) {
      const out = r.file("audio.m4a");
      const res = await r.run("ffmpeg", audioArgs(input, maxSeconds, out));
      if (res.exitCode !== 0) return null;
      const bytes = await r.read(out);
      return bytes && bytes.byteLength ? bytes : null;
    },
  };
}

// ─── Vercel Sandbox implementation ───────────────────────────────────────────

/** The subset of @vercel/sandbox the worker uses (injected in tests). */
export interface SandboxLike {
  readonly name: string;
  readonly region: string;
  writeFiles(files: { path: string; content: Uint8Array }[]): Promise<void>;
  runCommand(params: { cmd: string; args: string[]; timeoutMs: number }): Promise<{ exitCode: number | null; stdout(): Promise<string>; stderr(): Promise<string> }>;
  readFileToBuffer(file: { path: string }): Promise<Buffer | null>;
  stop(): Promise<unknown>;
  delete(): Promise<unknown>;
}
export interface SandboxApi {
  create(params: SandboxCreateParams): Promise<SandboxLike>;
}
/** Exactly what is sent to create a worker: no env, no tags, no name, no source code, no secrets. */
export interface SandboxCreateParams {
  source: { type: "snapshot"; snapshotId: string };
  region: string;
  networkPolicy: "deny-all";
  persistent: false;
  timeout: number;
  resources: { vcpus: number };
  /**
   * The SDK silently starts a NEW session if a call reaches a VM the platform
   * already stopped (its deadline). That fresh VM has none of our files, so
   * results from it would be wrong: we record the resume and fail the step.
   */
  onResume: () => Promise<void>;
}

export interface SandboxVideoProcessorConfig {
  snapshotId: string;
  /** Explicit Vercel region (never the SDK default by omission). */
  region: string;
  vcpus?: number;
  /** Hard lifetime of the microVM: the platform stops it even if we can't. */
  sessionTimeoutMs?: number;
  /** Per-command kill timeout. */
  commandTimeoutMs?: number;
  api?: SandboxApi;
}

/** No new step starts this close to the VM's deadline (it could outlive the VM). */
const DEADLINE_MARGIN_MS = 10_000;

const defaultSandboxApi: SandboxApi = {
  async create(params) {
    const { Sandbox } = await import("@vercel/sandbox");
    return (await Sandbox.create(params as unknown as Parameters<typeof Sandbox.create>[0])) as unknown as SandboxLike;
  },
};

export function createSandboxVideoProcessor(config: SandboxVideoProcessorConfig): VideoProcessor {
  const api = config.api ?? defaultSandboxApi;
  const vcpus = config.vcpus ?? 2;
  const sessionTimeoutMs = config.sessionTimeoutMs ?? 180_000;
  const commandTimeoutMs = config.commandTimeoutMs ?? 90_000;
  return {
    id: "vercel-sandbox",
    version: `${WORKER_PROTOCOL_VERSION}:${config.snapshotId}`,
    async withSession(source, fn) {
      const t0 = Date.now();
      let resumed = false;
      let sandbox: SandboxLike;
      try {
        sandbox = await api.create({
          source: { type: "snapshot", snapshotId: config.snapshotId },
          region: config.region,
          networkPolicy: "deny-all",
          persistent: false,
          timeout: sessionTimeoutMs,
          resources: { vcpus },
          onResume: async () => {
            resumed = true;
          },
        });
      } catch {
        throw new ServiceAiProviderError("video_worker_unavailable", true);
      }
      const usage: ProviderUsage = { videoWorkerSessions: 1 };
      /** The VM we wrote the video into is gone (deadline) or about to be: never continue on another. */
      const assertAlive = () => {
        if (resumed || Date.now() - t0 > sessionTimeoutMs - DEADLINE_MARGIN_MS) throw new ServiceAiProviderError("video_processing_timeout", true);
      };
      try {
        await sandbox.writeFiles([{ path: `${WORKDIR}/input`, content: source }]).catch(() => {
          throw new ServiceAiProviderError("video_worker_unavailable", true);
        });
        assertAlive();
        const runner: Runner = {
          file: (name) => `${WORKDIR}/${name}`,
          async run(bin, args) {
            assertAlive();
            const timeoutMs = Math.max(1_000, Math.min(commandTimeoutMs, sessionTimeoutMs - DEADLINE_MARGIN_MS - (Date.now() - t0)));
            let res;
            try {
              res = await sandbox.runCommand({ cmd: `${WORKER_BIN}/${bin}`, args, timeoutMs });
            } catch {
              assertAlive();
              throw new ServiceAiProviderError("video_worker_unavailable", true);
            }
            assertAlive();
            // Killed by the per-command timeout (SIGKILL) or the VM's own deadline.
            if (res.exitCode === null || res.exitCode === 137 || res.exitCode === -1) throw new ServiceAiProviderError("video_processing_timeout", true);
            return { exitCode: res.exitCode, stdout: await res.stdout(), stderr: await res.stderr() };
          },
          async read(file) {
            assertAlive();
            const b = await sandbox.readFileToBuffer({ path: file }).catch(() => null);
            assertAlive();
            return b ? new Uint8Array(b) : null;
          },
        };
        const value = await fn(sessionOver(runner));
        return { value, usage };
      } finally {
        usage.videoWorkerMs = Date.now() - t0;
        // Destroy on every path. delete() alone also ends the VM; stop() first
        // makes the stop explicit and observable in tests.
        await sandbox.stop().catch(() => {});
        await sandbox.delete().catch((err) => console.error("[service-ai] media worker delete failed:", err instanceof Error ? err.name : "error"));
      }
    },
  };
}

// ─── Local implementation (tests and local development only) ─────────────────

export interface LocalVideoProcessorConfig {
  ffmpegPath: string;
  ffprobePath: string;
  commandTimeoutMs?: number;
}

/** Runs the same command lines with local binaries in a private temp directory that is always removed. */
export function createLocalVideoProcessor(config: LocalVideoProcessorConfig): VideoProcessor {
  const timeout = config.commandTimeoutMs ?? 60_000;
  return {
    id: "local-ffmpeg",
    version: `${WORKER_PROTOCOL_VERSION}:local`,
    async withSession(source, fn) {
      const t0 = Date.now();
      const dir = await mkdtemp(path.join(tmpdir(), "mw-"));
      const usage: ProviderUsage = { videoWorkerSessions: 1 };
      try {
        await writeFile(path.join(dir, "input"), source);
        const runner: Runner = {
          file: (name) => path.join(dir, name),
          run: (bin, args) =>
            new Promise((resolve, reject) => {
              execFile(bin === "ffmpeg" ? config.ffmpegPath : config.ffprobePath, args, { timeout, maxBuffer: 32 * 1024 * 1024, env: {} as NodeJS.ProcessEnv, encoding: "utf8" }, (err, stdout, stderr) => {
                if (err && (err as { killed?: boolean }).killed) return reject(new ServiceAiProviderError("video_processing_timeout", true));
                const code = err ? (typeof (err as { code?: unknown }).code === "number" ? ((err as { code: number }).code) : 1) : 0;
                resolve({ exitCode: code, stdout, stderr });
              });
            }),
          read: async (file) => readFile(file).then((b) => new Uint8Array(b)).catch(() => null),
        };
        return { value: await fn(sessionOver(runner)), usage };
      } finally {
        usage.videoWorkerMs = Date.now() - t0;
        await rm(dir, { recursive: true, force: true });
      }
    },
  };
}
