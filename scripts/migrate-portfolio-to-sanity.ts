/**
 * Migrate the Swiftrooms portfolio (projects + locations + media) into Sanity.
 *
 * Idempotent: locations and projects use deterministic _ids
 * (location-<slug> / project-<slug>), so re-running won't duplicate.
 *
 * Usage (locally only — write token never deployed):
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts --dry-run   # report only
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts             # live import
 *   npx tsx scripts/migrate-portfolio-to-sanity.ts --no-media  # docs only
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { portfolioProjects, portfolioMedia, type PortfolioProject } from "../src/lib/data";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {}

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_MEDIA = process.argv.includes("--no-media");
const BASE = "https://www.swiftrooms.ae";

// 15 projects — Palmara 2 is split out from Arabian Ranches (own project).
const SLUGS = [
  "al-barari", "palm-jumeirah", "emirates-hills", "arabian-ranches",
  "palmara-arabian-ranches", "centro-the-villas", "brookfields-damac-hills",
  "victory-heights", "jumeirah-village-triangle", "the-springs",
  "phoenix-damac-hills", "glass-room-abu-dhabi", "montys-golf-course",
  "phileas-fogg", "padel-x",
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

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const publicPath = (p: string) => resolve(ROOT, "public" + p);

function parseLocation(loc: string) {
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2
    ? { name: parts[0], emirate: parts[parts.length - 1] }
    : { name: parts[0] || "UAE", emirate: parts[0] || "Dubai" };
}

type Media = { hero?: string; gallery?: string[]; video?: string; videoPoster?: string };
type Resolved = PortfolioProject & { media: Media };

// Resolve a project, splitting Arabian Ranches ↔ Palmara 2 by image prefix.
function resolveProject(slug: string): Resolved | null {
  const ar = portfolioProjects.find((x) => x.slug === "arabian-ranches")!;
  const arMedia = portfolioMedia["arabian-ranches"] ?? {};
  const arGallery = arMedia.gallery ?? [];

  if (slug === "palmara-arabian-ranches") {
    const g = arGallery.filter((x) => x.includes("/palmara-"));
    return {
      ...ar,
      name: "Palmara 2 Arabian Ranches",
      slug,
      media: { hero: g[0], gallery: g },
    };
  }
  if (slug === "arabian-ranches") {
    const g = arGallery.filter((x) => x.includes("/arabian-ranches-"));
    return { ...ar, media: { hero: g[0], gallery: g } };
  }
  const p = portfolioProjects.find((x) => x.slug === slug);
  if (!p) return null;
  return { ...p, media: portfolioMedia[slug] ?? {} };
}

function seoFor(p: Resolved) {
  return {
    seoTitle: `${p.name} — ${p.type} UAE Glazing Project`,
    seoDescription: p.description,
    canonicalUrl: `${BASE}/portfolio/${p.slug}`,
    noIndex: false,
  };
}

async function uploadAsset(kind: "image" | "file", path: string, contentType?: string) {
  const asset = await client.assets.upload(kind, readFileSync(publicPath(path)), {
    filename: path.split("/").pop()!,
    contentType,
  });
  return asset._id;
}

async function run() {
  const projects = SLUGS.map(resolveProject);
  const locations = new Map<string, { name: string; emirate: string }>();
  for (const p of projects) if (p) locations.set(slugify(parseLocation(p.location).name), parseLocation(p.location));

  console.log(
    `\nPortfolio migration → Sanity (${projectId}/${client.config().dataset})` +
      `${DRY_RUN ? "  [DRY RUN]" : ""}${SKIP_MEDIA ? "  [no media]" : ""}\n`
  );

  console.log(`LOCATIONS (${locations.size}):`);
  for (const [s, l] of locations) console.log(`  • ${l.name} (${l.emirate})  →  location-${s}`);

  let images = 0, videos = 0;
  const missing: string[] = [];
  console.log(`\nPROJECTS (${projects.filter(Boolean).length}):`);
  console.log("  slug                          location          gallery  video  products  url(→preserved)");
  for (const p of projects) {
    if (!p) continue;
    const gal = p.media.gallery ?? [];
    const checkList = [p.media.hero, ...gal, p.media.videoPoster, p.media.video].filter(Boolean) as string[];
    const bad = checkList.filter((x) => !existsSync(publicPath(x)));
    images += (p.media.hero ? 1 : 0) + gal.length + (p.media.videoPoster ? 1 : 0);
    if (p.media.video) videos += 1;
    if (bad.length) missing.push(...bad);
    const loc = parseLocation(p.location);
    console.log(
      `  ${p.slug.padEnd(29)} ${loc.name.padEnd(16)} ${String(gal.length).padStart(4)}    ` +
        `${p.media.video ? "Y" : "-"}     ${String(p.products?.length ?? 0).padStart(2)}      ` +
        `/portfolio/${p.slug}` + (bad.length ? `  ⚠ ${bad.length} missing` : "")
    );
  }

  console.log("\nSEO METADATA (sample — derived from existing site):");
  for (const p of projects.filter(Boolean).slice(0, 3) as Resolved[]) {
    const s = seoFor(p);
    console.log(`  ${p.slug}`);
    console.log(`    title : ${s.seoTitle}`);
    console.log(`    canon : ${s.canonicalUrl}`);
  }

  console.log("\nPRODUCTS REFERENCED (name-based; → Sanity refs in Phase 2):");
  const allProducts = new Set<string>();
  for (const p of projects) if (p) (p.products ?? []).forEach((x) => allProducts.add(x));
  console.log("  " + [...allProducts].sort().join(", "));

  console.log("\nURL MAPPING (all preserved — no redirects needed except new Palmara page):");
  console.log("  every project → /portfolio/<slug>  (unchanged)");
  console.log("  NEW: /portfolio/palmara-arabian-ranches  (legacy /palmara-2-arabian-ranches redirect to be repointed here)");

  console.log(`\nASSETS: ${images} images + ${videos} videos  |  MISSING FILES: ${missing.length || "none"}`);

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created, no assets uploaded.\n"); return; }

  // ── Live import ──
  console.log("\nImporting…");
  for (const [s, l] of locations) {
    await client.createOrReplace({
      _id: `location-${s}`, _type: "location", title: l.name,
      slug: { _type: "slug", current: s }, emirate: l.emirate,
    });
    console.log(`  ✓ location: ${l.name}`);
  }

  for (const p of projects) {
    if (!p) continue;
    const loc = parseLocation(p.location);
    const img = async (path?: string, alt?: string) => {
      if (SKIP_MEDIA || !path || !existsSync(publicPath(path))) return undefined;
      const ref = await uploadAsset("image", path);
      return { _type: "image", asset: { _type: "reference", _ref: ref }, ...(alt ? { alt } : {}) };
    };
    const hero = await img(p.media.hero, p.name);
    const gallery: unknown[] = [];
    for (const g of p.media.gallery ?? []) {
      const im = await img(g, `${p.name} — ${p.type}`);
      if (im) gallery.push({ ...im, _key: slugify(g) });
    }
    let video, videoPoster;
    if (!SKIP_MEDIA && p.media.video && existsSync(publicPath(p.media.video))) {
      video = { _type: "file", asset: { _type: "reference", _ref: await uploadAsset("file", p.media.video, "video/mp4") } };
    }
    videoPoster = await img(p.media.videoPoster, `${p.name} video`);
    const s = seoFor(p);

    await client.createOrReplace({
      _id: `project-${p.slug}`,
      _type: "project",
      title: p.name,
      slug: { _type: "slug", current: p.slug },
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
      seo: { ...s, ...(hero ? { openGraphImage: hero } : {}) },
    });
    console.log(`  ✓ project: ${p.slug}  (${gallery.length} gallery${video ? ", +video" : ""})`);
  }
  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
