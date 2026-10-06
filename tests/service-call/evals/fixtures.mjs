// Phase 4F synthetic evaluation fixtures. Everything is generated: drawn
// window/door scenes (sharp + SVG), synthetic speech (macOS `say`, real
// evaluation only) and videos (local ffmpeg test tool, V6). No real customer
// data, photos, voices or documents. All personal details are invented.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { videoTools } from "../../support/videos.mjs";

/** Invented personal data planted in fixtures; none of it belongs to anyone. */
export const SYNTHETIC_PII = {
  name: "Zara Quillfeather",
  phone: "+971 55 012 3478",
  phoneSpoken: "zero five five, zero one two, three four seven eight",
  email: "zara.quill@example-mail.test",
  address: "Villa 77, Lantern Grove Street, Al Synthetic District",
  plate: "Q 48213",
  documentId: "784-1990-0000000-1",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A drawn window/door scene. Options describe what is visible; they're the
 * ground truth for evaluation labels.
 */
export async function scene({
  kind = "window", glass = "intact", handle = "ok", dark = false, condensation = false, note = null,
  document = null, screen = null, plate = null, figure = false, gap = false, panelOffset = 0, width = 1280, height = 960, seed = 1,
  crackColor = "#fdfdfd",
} = {}) {
  const parts = [`<rect width="${width}" height="${height}" fill="${kind === "irrelevant" ? "#c9b48a" : "#d8d2c4"}"/>`];
  if (kind === "irrelevant") {
    // Wallpaper and a radiator: no window, door or glazing anywhere.
    for (let x = 0; x < width; x += 80) for (let y = 0; y < height; y += 80) parts.push(`<circle cx="${x + 40}" cy="${y + 40}" r="14" fill="#a8905f"/>`);
    for (let i = 0; i < 12; i++) parts.push(`<rect x="${300 + i * 55}" y="520" width="40" height="300" rx="10" fill="#f1f1ee" stroke="#bbb" stroke-width="3"/>`);
  } else {
    const fx = 240, fy = 120, fw = 800, fh = 720;
    parts.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#f4f4f2" stroke="#8a8a8a" stroke-width="18"/>`);
    const gx = fx + 40 + panelOffset, gy = fy + 40, gw = fw - 80, gh = fh - 80;
    parts.push(`<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#9fc3d9" stroke="#6d6d6d" stroke-width="10"/>`);
    parts.push(`<line x1="${gx + gw / 2}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + gh}" stroke="#6d6d6d" stroke-width="10"/>`);
    if (gap) parts.push(`<rect x="${fx + fw - 34}" y="${fy + 30}" width="16" height="${fh - 60}" fill="#2b2b2b"/>`);
    if (condensation) for (let i = 0; i < 40; i++) parts.push(`<circle cx="${gx + 40 + ((i * 97 + seed * 13) % (gw - 80))}" cy="${gy + 40 + ((i * 61 + seed * 7) % (gh - 80))}" r="${10 + (i % 5) * 4}" fill="#e8f0f4" opacity="0.75"/>`);
    const cx = gx + gw * 0.28, cy = gy + gh * 0.7;
    if (glass === "small_crack") parts.push(`<polyline points="${cx},${cy} ${cx + 30},${cy - 18} ${cx + 52},${cy - 10} ${cx + 80},${cy - 34}" fill="none" stroke="${crackColor}" stroke-width="4"/>`);
    if (glass === "large_crack") {
      parts.push(`<polyline points="${gx + 20},${gy + 60} ${gx + 160},${gy + 210} ${gx + 120},${gy + 330} ${gx + 300},${gy + 480} ${gx + 280},${gy + 620}" fill="none" stroke="#fdfdfd" stroke-width="6"/>`);
      parts.push(`<polyline points="${gx + 160},${gy + 210} ${gx + 330},${gy + 160}" fill="none" stroke="#fdfdfd" stroke-width="5"/>`);
    }
    if (glass === "shattered") {
      const ox = gx + gw * 0.25, oy = gy + gh * 0.45;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        parts.push(`<line x1="${ox}" y1="${oy}" x2="${ox + Math.cos(a) * 320}" y2="${oy + Math.sin(a) * 300}" stroke="#ffffff" stroke-width="4"/>`);
      }
      parts.push(`<polygon points="${ox - 60},${oy - 40} ${ox + 70},${oy - 70} ${ox + 90},${oy + 60} ${ox - 50},${oy + 80}" fill="#3a3a3a"/>`);
      for (let i = 0; i < 9; i++) parts.push(`<polygon points="${400 + i * 60},${900} ${430 + i * 60},${870} ${450 + i * 60},${905}" fill="#cfe6f2" stroke="#fff"/>`);
    }
    const hx = fx + fw - 70, hy = fy + fh / 2;
    if (handle === "ok") parts.push(`<rect x="${hx}" y="${hy - 70}" width="22" height="140" rx="10" fill="#555"/>`);
    if (handle === "detached") parts.push(`<rect x="${hx - 30}" y="${fy + fh + 40}" width="140" height="22" rx="10" fill="#555" transform="rotate(12 ${hx} ${fy + fh + 50})"/><circle cx="${hx + 11}" cy="${hy}" r="9" fill="#333"/>`);
    if (note) {
      parts.push(`<rect x="${gx + 60}" y="${gy + 80}" width="560" height="260" fill="#fffbe6" stroke="#c9b25c" stroke-width="4"/>`);
      note.split("\n").forEach((l, i) => parts.push(`<text x="${gx + 80}" y="${gy + 130 + i * 44}" font-family="Arial" font-size="30" fill="#111">${esc(l)}</text>`));
    }
  }
  if (document) {
    parts.push(`<rect x="60" y="560" width="520" height="360" fill="#ffffff" stroke="#999" stroke-width="3" transform="rotate(-4 300 740)"/>`);
    document.split("\n").forEach((l, i) => parts.push(`<text x="90" y="${620 + i * 46}" font-family="Arial" font-size="28" fill="#111" transform="rotate(-4 300 740)">${esc(l)}</text>`));
  }
  if (screen) {
    parts.push(`<rect x="820" y="520" width="360" height="400" rx="30" fill="#111"/><rect x="840" y="560" width="320" height="320" fill="#f6f6ff"/>`);
    screen.split("\n").forEach((l, i) => parts.push(`<text x="856" y="${610 + i * 40}" font-family="Arial" font-size="24" fill="#222">${esc(l)}</text>`));
  }
  if (plate) parts.push(`<rect x="420" y="860" width="440" height="90" fill="#fff" stroke="#000" stroke-width="5"/><text x="450" y="925" font-family="Arial" font-weight="bold" font-size="58" fill="#000">${esc(plate)}</text>`);
  if (figure) parts.push(`<circle cx="1120" cy="300" r="70" fill="#e0b48a"/><circle cx="1095" cy="285" r="9" fill="#222"/><circle cx="1145" cy="285" r="9" fill="#222"/><path d="M1090 330 Q1120 355 1150 330" stroke="#222" stroke-width="6" fill="none"/><rect x="1060" y="370" width="120" height="260" rx="40" fill="#3b5998"/>`);
  let img = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${parts.join("")}</svg>`));
  if (dark) img = img.modulate({ brightness: 0.12 }).blur(6);
  return new Uint8Array(await img.jpeg({ quality: 88 }).toBuffer());
}

// ─── Real-evaluation-only fixtures (macOS `say` + local ffmpeg test tool) ───

const run = (bin, args) => new Promise((resolve, reject) => execFile(bin, args, { maxBuffer: 64 * 1024 * 1024 }, (err, _o, stderr) => (err ? reject(new Error(String(stderr || err.message).slice(0, 400))) : resolve())));
const ff = (args) => run(videoTools.ffmpegPath, ["-hide_banner", "-v", "error", "-y", ...args]);

/**
 * Synthetic speech as AAC .m4a (audio/mp4). `segments` are spoken in order
 * with `pauseSeconds` of silence between them: [{ text, voice }].
 */
export async function speech(segments, { pauseSeconds = 0.8, tags = false } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "eval-say-"));
  try {
    const inputs = [];
    for (const [i, s] of segments.entries()) {
      const f = path.join(dir, `s${i}.aiff`);
      await run("/usr/bin/say", ["-v", s.voice ?? "Samantha", "-o", f, s.text]);
      inputs.push(f);
    }
    const out = path.join(dir, "out.m4a");
    const filter = inputs.map((_, i) => `[${i}:a]aresample=16000,aformat=channel_layouts=mono,apad=pad_dur=${pauseSeconds}[a${i}]`).join(";") + `;${inputs.map((_, i) => `[a${i}]`).join("")}concat=n=${inputs.length}:v=0:a=1[out]`;
    await ff([...inputs.flatMap((f) => ["-i", f]), "-filter_complex", filter, "-map", "[out]", "-c:a", "aac", "-b:a", "48k", ...(tags ? ["-metadata", "title=PHASE4F-SECRET-TITLE", "-metadata", "artist=Zara Quillfeather"] : []), out]);
    return new Uint8Array(await readFile(out));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * A video from still scenes. Each shot: { image (bytes), seconds, pan: "none"|"slow"|"fast"|"zoom" }.
 * Optional speech track (m4a bytes). codec: h264 | prores. container: mp4 | mov.
 */
export async function video(shots, { audio = null, codec = "h264", container = "mp4", size = "1280x720", fps = 25 } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "eval-vid-"));
  try {
    const [w, h] = size.split("x").map(Number);
    const args = [];
    const chains = [];
    for (const [i, s] of shots.entries()) {
      const f = path.join(dir, `shot${i}.jpg`);
      await sharp(s.image).toFile(f);
      args.push("-loop", "1", "-t", String(s.seconds), "-i", f);
      const n = Math.round(s.seconds * fps);
      const motion = {
        none: `scale=${w}:${h},setsar=1`,
        slow: `scale=${w * 1.25}:-2,crop=${w}:${h}:'(in_w-${w})*n/${n}':'(in_h-${h})/2',setsar=1`,
        fast: `scale=${w * 2}:-2,crop=${w}:${h}:'(in_w-${w})*n/${n}':'(in_h-${h})/2',setsar=1`,
        zoom: `scale=${w * 2}:-2,zoompan=z='min(zoom+0.004,1.6)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${w}x${h}:fps=${fps},setsar=1`,
        // Camera moves right→left across a 2× view: something at the left enters the frame late.
        reveal: `scale=${w * 2}:-2,crop=${w}:${h}:'(in_w-${w})*(1-n/${n})':'(in_h-${h})/2',setsar=1`,
      }[s.pan ?? "none"];
      chains.push(`[${i}:v]${motion},fps=${fps},format=yuv420p[v${i}]`);
    }
    let filter = `${chains.join(";")};${shots.map((_, i) => `[v${i}]`).join("")}concat=n=${shots.length}:v=1:a=0[v]`;
    const maps = ["-map", "[v]"];
    if (audio) {
      const a = path.join(dir, "a.m4a");
      await (await import("node:fs/promises")).writeFile(a, audio);
      args.push("-i", a);
      filter += `;[${shots.length}:a]apad[a]`;
      maps.push("-map", "[a]");
    }
    const total = shots.reduce((t, s) => t + s.seconds, 0);
    const out = path.join(dir, `out.${container}`);
    const vcodec = codec === "prores" ? ["-c:v", "prores_ks", "-profile:v", "0"] : ["-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p"];
    await ff([...args, "-filter_complex", filter, ...maps, "-t", String(total), ...vcodec, ...(audio ? ["-c:a", "aac", "-b:a", "64k"] : []), "-metadata", "location=+25.2048+055.2708/", "-metadata", "title=PHASE4F-SECRET-TITLE", out]);
    return new Uint8Array(await readFile(out));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
