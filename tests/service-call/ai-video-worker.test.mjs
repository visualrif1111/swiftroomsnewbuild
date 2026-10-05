// Phase 4E media-worker isolation (deterministic, SDK faked at the boundary):
// exactly what a sandbox is created with and receives, and that it is always
// destroyed — success, failure, timeout. The real-sandbox proof is part of
// the controlled Development verification (AI.md § Video verification).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  audioArgs, createSandboxVideoProcessor, frameArgs, parseSceneLog, parseShowinfoTime, probeArgs, sceneArgs, WORKER_BIN,
} from "../../src/lib/service-call/server/video-processor.ts";
import { resolveVideoWorker } from "../../src/lib/service-call/server/ai-config.ts";
import { probeJson } from "../support/videos.mjs";

const SECRETS = {
  OPENAI_API_KEY: "sk-PHASE4E-SECRET-OPENAI",
  SUPABASE_SERVICE_ROLE_KEY: "eyPHASE4E-SECRET-SERVICE-ROLE",
  NEXT_PUBLIC_SUPABASE_URL: "https://phase4e-secret-project.supabase.co",
  SERVICE_ADMIN_TOKEN: "PHASE4E-SECRET-ADMIN",
};
const IDENTIFIERS = ["SR-2026-PHASE4E", "4e4e4e4e-0000-4000-8000-000000000001", "e2e+phase4e@visualrif.com", "service-evidence/", "token-PHASE4E"];

/** A recording fake of the @vercel/sandbox surface the worker uses. */
function fakeSandboxApi({ exit = {}, failCreate = false, failWrite = false, resumeOnCommand = null, png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) } = {}) {
  const log = { creates: [], writes: [], commands: [], reads: [], stops: 0, deletes: 0 };
  const api = {
    async create(params) {
      const { onResume, ...plain } = params;
      log.creates.push({ ...structuredClone(plain), onResume: typeof onResume });
      if (failCreate) throw new Error("quota");
      return {
        name: "fake-sbx", region: params.region,
        async writeFiles(files) {
          log.writes.push(files.map((f) => ({ path: f.path, bytes: f.content.byteLength, content: Buffer.from(f.content).toString("latin1") })));
          if (failWrite) throw new Error("write failed");
        },
        async runCommand(p) {
          log.commands.push(structuredClone(p));
          // Simulates the SDK transparently starting a fresh session after the VM was stopped.
          if (resumeOnCommand === log.commands.length) await params.onResume();
          const bin = p.cmd.split("/").pop();
          const code = typeof exit[bin] === "function" ? exit[bin](p) : (exit[bin] ?? 0);
          const stdout = bin === "ffprobe" ? JSON.stringify(probeJson()) : "";
          const at = p.args[p.args.indexOf("-ss") + 1];
          const stderr = bin === "ffmpeg" && p.args.includes("-ss") ? `[Parsed_showinfo_2 @ 0x1] n:   0 pts:  1 pts_time:${at} duration: 1` : "[Parsed_metadata_2 @ 0x1] frame:3 pts:3 pts_time:1.2\n[Parsed_metadata_2 @ 0x1] lavfi.scene_score=0.512000";
          return { exitCode: code, stdout: async () => stdout, stderr: async () => stderr };
        },
        async readFileToBuffer({ path }) {
          log.reads.push(path);
          return path.endsWith(".m4a") ? Buffer.from("audio") : Buffer.from(png);
        },
        async stop() { log.stops++; },
        async delete() { log.deletes++; },
      };
    },
  };
  return { api, log };
}

const SOURCE = new Uint8Array(Buffer.from("....ftypqt  ...synthetic video bytes..."));
const processor = (api, extra = {}) => createSandboxVideoProcessor({ snapshotId: "snap_TESTSNAPSHOT01", region: "bom1", api, ...extra });
const fullSession = async (s) => {
  const json = await s.probe();
  const scene = await s.sceneCandidates(4);
  const frames = await s.extractFrames([0.5, 2], { hdr: false });
  const audio = await s.extractAudio(4);
  return { json, scene, frames, audio };
};

test("sandbox is created deny-all, non-persistent, time-bounded, explicit region, pinned snapshot — and nothing else", async () => {
  const { api, log } = fakeSandboxApi();
  await processor(api).withSession(SOURCE, fullSession);
  assert.equal(log.creates.length, 1);
  assert.deepEqual(log.creates[0], {
    source: { type: "snapshot", snapshotId: "snap_TESTSNAPSHOT01" },
    region: "bom1",
    networkPolicy: "deny-all",
    persistent: false,
    timeout: 180_000,
    resources: { vcpus: 2 },
    onResume: "function",
  });
  assert.ok(!("env" in log.creates[0]) && !("tags" in log.creates[0]) && !("name" in log.creates[0]) && !("ports" in log.creates[0]));
});

test("the worker receives the bytes only, under a neutral name; commands are the pinned binaries with no identifiers", async () => {
  const old = { ...process.env };
  Object.assign(process.env, SECRETS);
  try {
    const { api, log } = fakeSandboxApi();
    const out = await processor(api).withSession(SOURCE, fullSession);
    assert.deepEqual(log.writes, [[{ path: "/tmp/mw/input", bytes: SOURCE.byteLength, content: Buffer.from(SOURCE).toString("latin1") }]]);
    for (const c of log.commands) {
      assert.ok(c.cmd === `${WORKER_BIN}/ffmpeg` || c.cmd === `${WORKER_BIN}/ffprobe`, c.cmd);
      assert.deepEqual(Object.keys(c).sort(), ["args", "cmd", "timeoutMs"], "no env, no sudo, no cwd");
    }
    const everything = JSON.stringify(log);
    for (const v of [...Object.values(SECRETS), ...IDENTIFIERS]) assert.ok(!everything.includes(v), `worker saw ${v}`);
    for (const k of Object.keys(SECRETS)) assert.ok(!everything.includes(k), `worker saw ${k}`);
    assert.ok(!/https?:\/\//.test(everything), "no URLs");
    assert.equal(out.value.frames.length, 2);
    assert.deepEqual(out.value.scene, [{ at: 1.2, score: 0.512 }]);
    assert.equal(out.usage.videoWorkerSessions, 1);
    assert.equal(typeof out.usage.videoWorkerMs, "number");
  } finally {
    for (const k of Object.keys(SECRETS)) if (k in old) process.env[k] = old[k]; else delete process.env[k];
  }
});

test("destroyed on success, on failure inside the session, and on worker timeout", async () => {
  {
    const { api, log } = fakeSandboxApi();
    await processor(api).withSession(SOURCE, fullSession);
    assert.deepEqual([log.stops, log.deletes], [1, 1], "success");
  }
  {
    const { api, log } = fakeSandboxApi();
    await assert.rejects(processor(api).withSession(SOURCE, async () => { throw new Error("boom"); }), /boom/);
    assert.deepEqual([log.stops, log.deletes], [1, 1], "failure");
  }
  {
    const { api, log } = fakeSandboxApi({ exit: { ffmpeg: 137 } });
    await assert.rejects(processor(api).withSession(SOURCE, fullSession), (e) => e.code === "video_processing_timeout" && e.retryable === true);
    assert.deepEqual([log.stops, log.deletes], [1, 1], "timeout (SIGKILL)");
  }
  {
    const { api, log } = fakeSandboxApi({ exit: { ffprobe: () => null } });
    await assert.rejects(processor(api).withSession(SOURCE, fullSession), (e) => e.code === "video_processing_timeout");
    assert.deepEqual([log.stops, log.deletes], [1, 1], "VM deadline");
  }
  {
    const { api, log } = fakeSandboxApi({ failWrite: true });
    await assert.rejects(processor(api).withSession(SOURCE, fullSession), (e) => e.code === "video_worker_unavailable");
    assert.deepEqual([log.stops, log.deletes], [1, 1], "upload failure");
  }
});

test("a silently resumed (fresh) VM is never trusted: the step fails as a timeout and the worker is destroyed", async () => {
  // Observed with the real SDK: a call after the platform stopped the VM starts a new session without our files.
  const { api, log } = fakeSandboxApi({ resumeOnCommand: 2 });
  await assert.rejects(processor(api).withSession(SOURCE, fullSession), (e) => e.code === "video_processing_timeout" && e.retryable === true);
  assert.equal(log.commands.length, 2, "nothing runs after the resume");
  assert.deepEqual([log.stops, log.deletes], [1, 1]);
});

test("no step starts near the VM deadline; command timeouts never outlive it", async () => {
  const { api, log } = fakeSandboxApi();
  await assert.rejects(
    processor(api, { sessionTimeoutMs: 10_400 }).withSession(SOURCE, async (s) => {
      await new Promise((r) => setTimeout(r, 500));
      return s.probe();
    }),
    (e) => e.code === "video_processing_timeout",
  );
  assert.equal(log.commands.length, 0);
  assert.deepEqual([log.stops, log.deletes], [1, 1]);
  const bounded = fakeSandboxApi();
  await processor(bounded.api, { sessionTimeoutMs: 40_000, commandTimeoutMs: 90_000 }).withSession(SOURCE, (s) => s.probe());
  assert.ok(bounded.log.commands[0].timeoutMs <= 30_000, `${bounded.log.commands[0].timeoutMs}`);
});

test("a worker that can't start is a retryable 'unavailable' — never a fallback to local ffmpeg", async () => {
  const { api, log } = fakeSandboxApi({ failCreate: true });
  await assert.rejects(processor(api).withSession(SOURCE, fullSession), (e) => e.code === "video_worker_unavailable" && e.retryable === true);
  assert.equal(log.commands.length, 0);
});

test("probe failure and non-zero exits are data, not crashes", async () => {
  const { api } = fakeSandboxApi({ exit: { ffprobe: 1, ffmpeg: 1 } });
  const out = await processor(api).withSession(SOURCE, fullSession);
  assert.equal(out.value.json, null);
  assert.equal(out.value.scene, null, "a failed scene pass is reported, not 'no scene changes'");
  assert.deepEqual(out.value.frames, []);
  assert.equal(out.value.audio, null);
});

test("command lines: no network protocols, metadata stripped, bounded, tags never requested", () => {
  const all = [probeArgs("/tmp/mw/input"), sceneArgs("/tmp/mw/input", 180), frameArgs("/tmp/mw/input", 4.2, false, "/tmp/mw/f.png"), frameArgs("/tmp/mw/input", 4.2, true, "/tmp/mw/f.png"), audioArgs("/tmp/mw/input", 180, "/tmp/mw/a.m4a")];
  for (const a of all) assert.ok(!a.join(" ").match(/https?:|tcp:|udp:|rtmp:|-i http/), a.join(" "));
  assert.ok(!probeArgs("x").join(" ").includes("tags"), "probe never asks for tags (GPS, device, dates)");
  for (const a of [all[2], all[3], all[4]]) assert.deepEqual(a.slice(a.indexOf("-map_metadata"), a.indexOf("-map_metadata") + 2), ["-map_metadata", "-1"]);
  assert.ok(all[4].includes("-map_chapters"));
  assert.equal(all[1][all[1].indexOf("-t") + 1], "180.000", "scene pass bounded to the analysis window");
  assert.equal(all[4][all[4].indexOf("-t") + 1], "180.000", "audio bounded to the analysis window");
  assert.ok(all[3].join(" ").includes("tonemap"), "HDR frames are tone-mapped");
  assert.ok(!all[2].join(" ").includes("tonemap"));
});

test("log parsers", () => {
  assert.deepEqual(parseSceneLog("x pts_time:1.5\nlavfi.scene_score=0.40\ny pts_time:3\nlavfi.scene_score=0.9\nlavfi.scene_score=0.1"), [{ at: 1.5, score: 0.4 }, { at: 3, score: 0.9 }]);
  assert.equal(parseShowinfoTime("[Parsed_showinfo_2 @ 0x6] n:   0 pts:  61440 pts_time:4       duration:"), 4);
  assert.equal(parseShowinfoTime("[Parsed_showinfo_2 @ 0x6] n: 0 pts: 1 pts_time:4.0333\n[Parsed_showinfo_2 @ 0x6] n: 1 pts_time:4.0667"), 4.0333, "first decoded frame");
  assert.equal(parseShowinfoTime("nothing"), null);
});

test("worker configuration fails closed: both snapshot and explicit region required, no default region", () => {
  assert.deepEqual(resolveVideoWorker({}), { ok: false, reason: "video_worker_not_configured" });
  assert.deepEqual(resolveVideoWorker({ SERVICE_AI_VIDEO_WORKER_SNAPSHOT: "snap_TESTSNAPSHOT01" }), { ok: false, reason: "video_worker_config_invalid" });
  assert.deepEqual(resolveVideoWorker({ SERVICE_AI_VIDEO_WORKER_REGION: "bom1" }), { ok: false, reason: "video_worker_config_invalid" });
  assert.deepEqual(resolveVideoWorker({ SERVICE_AI_VIDEO_WORKER_SNAPSHOT: "ubuntu:latest", SERVICE_AI_VIDEO_WORKER_REGION: "bom1" }), { ok: false, reason: "video_worker_config_invalid" });
  const ok = resolveVideoWorker({ SERVICE_AI_VIDEO_WORKER_SNAPSHOT: "snap_TESTSNAPSHOT01", SERVICE_AI_VIDEO_WORKER_REGION: "BOM1" });
  assert.equal(ok.ok, true);
  assert.equal(ok.region, "bom1");
  assert.equal(ok.processor.id, "vercel-sandbox");
  assert.equal(ok.processor.version, "mw-1:snap_TESTSNAPSHOT01");
});
