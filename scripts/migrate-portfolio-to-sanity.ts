/**
 * Migrate the Swiftrooms portfolio (projects + locations + media) into Sanity.
 *
 * Idempotent: locations and projects use deterministic _ids
 * (location-<slug> / project-<slug>), so re-running won't duplicate.
 *
 * Usage (locally only — write token never deployed):
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts --dry-run   # report only
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts             # live import
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts --no-media  # skip uploads
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { portfolioProjects, portfolioMedia } from "../src/lib/data";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of (() => {
  try { return readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n"); } catch { return []; }
})()) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
}

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_MEDIA = process.argv.includes("--no-media");

const SLUGS = [
  "al-barari", "palm-jumeirah", "emirates-hills", "arabian-ranches",
  "centro-the-villas", "brookfields-damac-hills", "victory-heights",
  "jumeirah-village-triangle", "the-springs", "phoenix-damac-hills",
  "glass-room-abu-dhabi", "montys-golf-course", "phileas-fogg", "padel-x",
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }
if (!DRY_RUN && !token) { console.error("✗ Missing SANITY_API_WRITE_TOKEN (add to .env.local)"); process.exit(1); }

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token,
  useCdn: false,
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseLocation(loc: string) {
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { name: parts[0], emirate: parts[parts.length - 1] };
  return { name: parts[0] || "UAE", emirate: parts[0] || "Dubai" };
}

const publicPath = (p: string) => resolve(ROOT, "public" + p);

async function uploadAsset(kind: "image" | "file", path: string, contentType?: string) {
  const buf = readFileSync(publicPath(path));
  const filename = path.split("/").pop()!;
  const asset = await client.assets.upload(kind, buf, { filename, contentType });
  return asset._id;
}

async function run() {
  // ── Collect locations ──
  const locations = new Map<string, { name: string; emirate: string }>();
  for (const slug of SLUGS) {
    const p = portfolioProjects.find((x) => x.slug === slug);
    if (!p) continue;
    const loc = parseLocation(p.location);
    locations.set(slugify(loc.name), loc);
  }

  console.log(
    `\nPortfolio migration → Sanity (${projectId}/${client.config().dataset})` +
      `${DRY_RUN ? "  [DRY RUN]" : ""}${SKIP_MEDIA ? "  [no media]" : ""}\n`
  );
  console.log(`Locations: ${locations.size}`);
  for (const [s, l] of locations) console.log(`  • ${l.name} (${l.emirate})  →  location-${s}`);

  let imgCount = 0, vidCount = 0, missing: string[] = [];
  console.log(`\nProjects: ${SLUGS.length}`);
  console.log("  slug                        loc                      gallery video products  media-check");
  for (const slug of SLUGS) {
    const p = portfolioProjects.find((x) => x.slug === slug);
    if (!p) { console.log(`  ${slug}  ✗ NOT FOUND IN data.ts`); missing.push(slug); continue; }
    const m = portfolioMedia[slug] ?? ({} as (typeof portfolioMedia)[string]);
    const gal = m.gallery ?? [];
    const allMedia = [m.hero, ...gal, m.videoPoster].filter(Boolean) as string[];
    const bad = allMedia.filter((x) => !existsSync(publicPath(x)));
    const vidBad = m.video && !existsSync(publicPath(m.video)) ? [m.video] : [];
    imgCount += (m.hero ? 1 : 0) + gal.length + (m.videoPoster ? 1 : 0);
    if (m.video) vidCount += 1;
    const loc = parseLocation(p.location);
    console.log(
      `  ${slug.padEnd(27)} ${loc.name.padEnd(24)} ${String(gal.length).padStart(3)}    ` +
        `${m.video ? "Y" : "-"}     ${String(p.products?.length ?? 0).padStart(2)}       ` +
        `${bad.length || vidBad.length ? "⚠ " + (bad.length + vidBad.length) + " missing file(s)" : "ok"}`
    );
    if (bad.length || vidBad.length) missing.push(...bad, ...vidBad);
  }

  console.log(`\nAssets to upload:  ${imgCount} images + ${vidCount} videos`);
  console.log(`Missing files:     ${missing.length ? missing.length : "none"}`);

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created, no assets uploaded.\n"); return; }

  // ── Live import ──
  console.log("\nImporting…");
  const locRefId = new Map<string, string>();
  for (const [s, l] of locations) {
    const _id = `location-${s}`;
    await client.createOrReplace({
      _id, _type: "location", name: l.name,
      slug: { _type: "slug", current: s }, emirate: l.emirate,
    });
    locRefId.set(s, _id);
    console.log(`  ✓ location: ${l.name}`);
  }

  for (const slug of SLUGS) {
    const p = portfolioProjects.find((x) => x.slug === slug);
    if (!p) continue;
    const m = portfolioMedia[slug] ?? ({} as (typeof portfolioMedia)[string]);
    const loc = parseLocation(p.location);
    const imageField = async (path?: string, alt?: string) => {
      if (SKIP_MEDIA || !path || !existsSync(publicPath(path))) return undefined;
      const ref = await uploadAsset("image", path);
      return { _type: "image", asset: { _type: "reference", _ref: ref }, ...(alt ? { alt } : {}) };
    };
    const hero = await imageField(m.hero, p.name);
    const gallery: unknown[] = [];
    for (const g of m.gallery ?? []) {
      const img = await imageField(g, `${p.name} — ${p.type}`);
      if (img) gallery.push({ ...img, _key: slugify(g) || Math.random().toString(36).slice(2) });
    }
    let video, videoPoster;
    if (!SKIP_MEDIA && m.video && existsSync(publicPath(m.video))) {
      const ref = await uploadAsset("file", m.video, "video/mp4");
      video = { _type: "file", asset: { _type: "reference", _ref: ref } };
    }
    videoPoster = await imageField(m.videoPoster, `${p.name} video`);

    await client.createOrReplace({
      _id: `project-${slug}`,
      _type: "project",
      name: p.name,
      slug: { _type: "slug", current: slug },
      location: { _type: "reference", _ref: `location-${slugify(loc.name)}` },
      projectType: p.type,
      area: p.area,
      year: p.year,
      description: p.description,
      ...(p.brief ? { brief: p.brief } : {}),
      ...(p.challenge ? { challenge: p.challenge } : {}),
      ...(p.solution ? { solution: p.solution } : {}),
      ...(p.outcome ? { outcome: p.outcome } : {}),
      productsUsed: p.products ?? [],
      tags: p.tags ?? [],
      ...(hero ? { heroImage: hero } : {}),
      ...(gallery.length ? { gallery } : {}),
      ...(video ? { video } : {}),
      ...(videoPoster ? { videoPoster } : {}),
    });
    console.log(`  ✓ project: ${slug}  (${gallery.length} gallery${video ? ", +video" : ""})`);
  }
  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
