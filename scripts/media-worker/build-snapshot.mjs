// Builds the Phase 4E media-worker snapshot (operator tool; not part of the app).
//
//   node --env-file=<file with VERCEL_OIDC_TOKEN> scripts/media-worker/build-snapshot.mjs <src-dir> <region>
//
// <src-dir> holds ffmpeg-8.1.3.tar.xz (PGP-verified by the operator against
// key FCF986EA15E6E293A5644F10B4322F04D67658D8) and zimg-3.0.6.tar.gz. The
// build VM is a separate sandbox with network access for apt only; it never
// sees customer data. The resulting snapshot is what processing VMs boot from
// (SERVICE_AI_VIDEO_WORKER_SNAPSHOT), always with network "deny-all".
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Sandbox } from "@vercel/sandbox";

const [srcDir, region] = process.argv.slice(2);
if (!srcDir || !region) {
  console.error("usage: build-snapshot.mjs <src-dir> <region>");
  process.exit(2);
}
const here = path.dirname(new URL(import.meta.url).pathname);
const files = [
  { path: "/tmp/mw-src/ffmpeg-8.1.3.tar.xz", content: await readFile(path.join(srcDir, "ffmpeg-8.1.3.tar.xz")) },
  { path: "/tmp/mw-src/zimg-3.0.6.tar.gz", content: await readFile(path.join(srcDir, "zimg-3.0.6.tar.gz")) },
  { path: "/tmp/mw-src/build-ffmpeg.sh", content: await readFile(path.join(here, "build-ffmpeg.sh")), mode: 0o755 },
];

const sandbox = await Sandbox.create({ image: "vercel/sandbox/ubuntu:latest", region, persistent: false, timeout: 40 * 60_000, resources: { vcpus: 8 } });
console.log(`build sandbox ${sandbox.name} in ${sandbox.region}`);
let snapshotted = false;
try {
  await sandbox.writeFiles(files);
  const build = await sandbox.runCommand({ cmd: "bash", args: ["/tmp/mw-src/build-ffmpeg.sh"], stdout: process.stdout, stderr: process.stderr });
  if (build.exitCode !== 0) throw new Error(`build failed (${build.exitCode})`);
  const info = await sandbox.runCommand({ cmd: "bash", args: ["-c", "cat /opt/media-worker/BUILD-INFO.txt /opt/media-worker/LICENSE-BUILD.txt; ldd /opt/media-worker/bin/ffmpeg; sha256sum /opt/media-worker/bin/*"] });
  console.log(await info.stdout());
  const snap = await sandbox.snapshot({ expiration: 0 });
  snapshotted = true;
  console.log(`SNAPSHOT ${snap.snapshotId} regions=${snap.regions.join(",")} bytes=${snap.sizeBytes}`);
} finally {
  if (!snapshotted) await sandbox.stop().catch(() => {});
  await sandbox.delete().catch((e) => console.error("delete failed:", e.message));
}
