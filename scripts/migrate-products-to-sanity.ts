/**
 * Migrate the Swiftrooms product range (categories + products) into Sanity.
 * Idempotent (_id = category-<slug> / product-<slug>).
 *
 *   npx tsx scripts/migrate-products-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-products-to-sanity.ts
 *   npx tsx scripts/migrate-products-to-sanity.ts --no-media
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { productCategories, portfolioProjects } from "../src/lib/data";

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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }
if (!DRY_RUN && !token) { console.error("✗ Missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

const client = createClient({
  projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false,
});

const publicPath = (p: string) => resolve(ROOT, "public" + p);
const key = () => Math.random().toString(36).slice(2, 14);

// Portfolio "products used" names → product slug (mirrors the portfolio page map).
const PRODUCT_NAME_TO_SLUG: Record<string, string> = {
  "Cor Vision 4600": "cor-vision-4600", "Cor Vision 4700": "cor-vision-4700",
  "Cor Vision Plus": "cor-vision-plus", "Cortizo Bi-fold": "cortizo-bifold",
  "Cortizo Casement": "cortizo-casement", "Cortizo Cor 70 Hidden Sash": "cortizo-cor-70-hidden-sash",
  "Gulf Extrusions TB600 Window": "gulf-extrusion-tb600-tilt-and-turn",
  "Aluminium Sliding Windows": "aluminium-sliding-windows", "Cortizo Cor 70 Door": "cortizo-cor-70-door",
  "Gulf Extrusions TB600 Door": "gulf-extrusion-tb600-door", "Vetromax Pivot Door": "vetromax-pivot-door",
  "uPVC Casement": "upvc-casement", "Cortizo TP52": "cortizo-tp52",
  "Cortizo TP52 Curtain Wall": "cortizo-tp52", "Gulf Extrusions CW 50mm": "gulf-extrusion-cw-50",
  "Vetromax VF35 Facade": "vetromax-vf35", "Premium Garden Room": "premium-garden-room",
  "Glass Conservatory": "glass-conservatory", "Retractable Fly Screen": "retractable-fly-screen",
  "Fixed Rooflight": "fixed-rooflight", "Motorised Skylight": "motorised-skylight",
};

// Only these portfolio projects exist in Sanity (migrated in Phase 1) — relate
// products only to them to avoid dangling references. (Palmara shares Arabian
// Ranches' product list.)
const MIGRATED_PROJECTS = new Set([
  "al-barari", "palm-jumeirah", "emirates-hills", "arabian-ranches",
  "palmara-arabian-ranches", "centro-the-villas", "brookfields-damac-hills",
  "victory-heights", "jumeirah-village-triangle", "the-springs",
  "phoenix-damac-hills", "glass-room-abu-dhabi", "montys-golf-course",
  "phileas-fogg", "padel-x",
]);

// productSlug → [projectSlug…] from portfolio "products used" (Sanity projects only).
const relatedProjects: Record<string, Set<string>> = {};
for (const proj of portfolioProjects) {
  if (!MIGRATED_PROJECTS.has(proj.slug)) continue;
  for (const name of proj.products ?? []) {
    const ps = PRODUCT_NAME_TO_SLUG[name];
    if (ps) (relatedProjects[ps] ??= new Set()).add(proj.slug);
  }
}

async function uploadImage(src?: string): Promise<string | undefined> {
  if (SKIP_MEDIA || !src) return undefined;
  try {
    let buf: Buffer;
    let filename = src.split("/").pop()!.split("?")[0];
    if (src.startsWith("/")) {
      if (!existsSync(publicPath(src))) return undefined;
      buf = readFileSync(publicPath(src));
    } else {
      const r = await fetch(src);
      if (!r.ok) throw new Error("HTTP " + r.status);
      buf = Buffer.from(await r.arrayBuffer());
      if (!filename.includes(".")) filename += ".jpg";
    }
    const asset = await client.assets.upload("image", buf, { filename });
    return asset._id;
  } catch (e) {
    console.warn(`    ! image failed (${src?.slice(0, 50)}): ${(e as Error).message}`);
    return undefined;
  }
}

async function run() {
  const totalProducts = productCategories.reduce((n, c) => n + c.products.length, 0);
  console.log(
    `\nProduct migration → Sanity (${projectId}/${client.config().dataset})` +
      `${DRY_RUN ? "  [DRY RUN]" : ""}${SKIP_MEDIA ? "  [no media]" : ""}\n`
  );
  console.log(`CATEGORIES: ${productCategories.length}   PRODUCTS: ${totalProducts}\n`);

  let imgLocal = 0, imgStock = 0, relProjLinks = 0;
  console.log("  category / product                         img     specs benefits  relProj  url");
  for (const c of productCategories) {
    const cimg = c.image ? (c.image.startsWith("/") ? "local" : "stock") : "none";
    if (cimg === "local") imgLocal++; else if (cimg === "stock") imgStock++;
    console.log(`  ▸ ${c.slug.padEnd(40)} ${cimg.padEnd(7)}                    /catalogue/${c.slug}`);
    for (const p of c.products) {
      const pimg = p.image ? (p.image.startsWith("/") ? "local" : "stock") : "none";
      if (pimg === "local") imgLocal++; else if (pimg === "stock") imgStock++;
      const rp = relatedProjects[p.slug]?.size ?? 0;
      relProjLinks += rp;
      console.log(
        `      ${p.slug.padEnd(36)} ${pimg.padEnd(7)} ${String(Object.keys(p.specs ?? {}).length).padStart(2)}    ` +
          `${String(p.features?.length ?? 0).padStart(2)}       ${rp}       /catalogue/${c.slug}/${p.slug}`
      );
    }
  }

  console.log("\nSEO METADATA (sample — derived from existing site):");
  const c0 = productCategories[0]; const p0 = c0.products[0];
  console.log(`  category ${c0.slug}: "${c0.name} Dubai | Swiftrooms UAE"  →  ${BASE}/catalogue/${c0.slug}`);
  console.log(`  product  ${p0.slug}: "${p0.name} UAE — ${p0.brand} Glazing Specialist"  →  ${BASE}/catalogue/${c0.slug}/${p0.slug}`);

  console.log("\nRELATIONSHIPS:");
  console.log(`  relatedProducts: category siblings (auto)`);
  console.log(`  relatedProjects: ${relProjLinks} product→project links (to Phase 1 project docs)`);

  console.log("\nURL MAPPING (all preserved):");
  console.log("  category → /catalogue/<slug>   product → /catalogue/<cat>/<slug>");

  console.log(`\nASSETS: ${imgLocal} local + ${imgStock} stock = ${imgLocal + imgStock} images`);

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created, no assets uploaded.\n"); return; }

  // ── Live import ──
  console.log("\nImporting categories…");
  for (const c of productCategories) {
    const hero = await uploadImage(c.image);
    await client.createOrReplace({
      _id: `category-${c.slug}`, _type: "productCategory",
      title: c.name, slug: { _type: "slug", current: c.slug },
      tagline: c.tagline, overview: c.description,
      ...(hero ? { heroImage: { _type: "image", asset: { _type: "reference", _ref: hero } } } : {}),
      seo: {
        seoTitle: `${c.name} Dubai | Swiftrooms UAE`, seoDescription: c.description,
        canonicalUrl: `${BASE}/catalogue/${c.slug}`, noIndex: false,
        ...(hero ? { openGraphImage: { _type: "image", asset: { _type: "reference", _ref: hero } } } : {}),
      },
    });
    console.log(`  ✓ category: ${c.slug}`);
  }

  console.log("Importing products…");
  for (const c of productCategories) {
    for (const p of c.products) {
      const hero = await uploadImage(p.image);
      const siblings = c.products.filter((x) => x.slug !== p.slug).map((x) => ({
        _key: key(), _type: "reference", _weak: true, _ref: `product-${x.slug}`,
      }));
      const projs = [...(relatedProjects[p.slug] ?? [])].map((s) => ({
        _key: key(), _type: "reference", _weak: true, _ref: `project-${s}`,
      }));
      await client.createOrReplace({
        _id: `product-${p.slug}`, _type: "product",
        title: p.name, slug: { _type: "slug", current: p.slug },
        category: { _type: "reference", _ref: `category-${c.slug}` },
        brand: p.brand, description: p.description,
        benefits: p.features ?? [],
        specifications: Object.entries(p.specs ?? {}).map(([label, value]) => ({ _key: key(), _type: "spec", label, value })),
        ...(hero ? { heroImage: { _type: "image", asset: { _type: "reference", _ref: hero } } } : {}),
        ...(siblings.length ? { relatedProducts: siblings } : {}),
        ...(projs.length ? { relatedProjects: projs } : {}),
        seo: {
          seoTitle: `${p.name} UAE — ${p.brand} Glazing Specialist`, seoDescription: p.description,
          canonicalUrl: `${BASE}/catalogue/${c.slug}/${p.slug}`, noIndex: false,
          ...(hero ? { openGraphImage: { _type: "image", asset: { _type: "reference", _ref: hero } } } : {}),
        },
      });
      console.log(`  ✓ product: ${p.slug}`);
    }
  }
  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
