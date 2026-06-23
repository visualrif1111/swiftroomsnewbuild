/**
 * Seed the Homepage singleton (_id "homepage") in Sanity from the current
 * homepage values + references to migrated products/projects/brands.
 *
 *   npx tsx scripts/migrate-homepage-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-homepage-to-sanity.ts
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { stats, productCategories, portfolioProjects } from "../src/lib/data";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {}

const DRY_RUN = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }
if (!DRY_RUN && !token) { console.error("✗ Missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

const client = createClient({
  projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false,
});

const MIGRATED_PROJECTS = new Set([
  "al-barari", "palm-jumeirah", "emirates-hills", "arabian-ranches",
  "palmara-arabian-ranches", "centro-the-villas", "brookfields-damac-hills",
  "victory-heights", "jumeirah-village-triangle", "the-springs",
  "phoenix-damac-hills", "glass-room-abu-dhabi", "montys-golf-course",
  "phileas-fogg", "padel-x",
]);
const ref = (id: string, i: number) => ({ _key: `r${i}`, _type: "reference", _weak: true, _ref: id });

// Featured categories shown on the homepage product section.
const FEATURED_CATEGORIES = ["aluminium-sliding-doors", "aluminium-bi-folding-doors", "aluminium-windows", "aluminium-doors", "upvc", "skylights"];
const FEATURED_BRANDS = ["schuco", "deceuninck", "gulf-extrusions", "vetromax", "cortizo"];
const FEATURED_PROJECTS = portfolioProjects.slice(0, 4).map((p) => p.slug).filter((s) => MIGRATED_PROJECTS.has(s));

const doc = {
  _id: "homepage",
  _type: "homepage",
  hero: {
    eyebrow: "Swiftrooms",
    headingLine1: "Performance",
    headingLine2: "Windows & Doors",
    subheading:
      "Engineered to perform. Built to outlast. Premium aluminium, uPVC and glazing systems installed across the UAE by certified specialists.",
    ctaPrimaryLabel: "Get a Free Quote",
    ctaSecondaryLabel: "Book Showroom Visit",
    videoId: "xpDcSdw--hg",
  },
  statistics: stats.map((s, i) => ({ _key: `s${i}`, _type: "stat", value: s.value, label: s.label })),
  featuredProducts: FEATURED_CATEGORIES.map((s, i) => ref(`category-${s}`, i)),
  featuredProjects: FEATURED_PROJECTS.map((s, i) => ref(`project-${s}`, i)),
  featuredBrands: FEATURED_BRANDS.map((s, i) => ref(`brand-${s}`, i)),
  cta: {
    heading: "Book Your Showroom Visit Today",
    body: "See our full product range at full scale and speak with a specialist.",
    primaryLabel: "Book Showroom Visit",
    secondaryLabel: "Get a Free Quote",
  },
  trustIndicators: [
    "Cortizo Authorised Partner",
    "Gulf Extrusions Approved Installer",
    "QUALICOAT Certified",
    "ISO 9001:2015",
    "Dubai Municipality Registered",
  ],
};

async function run() {
  console.log(`\nHomepage singleton → Sanity (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`);
  console.log("HERO:");
  console.log(`  ${doc.hero.headingLine1} ${doc.hero.headingLine2}  | video:${doc.hero.videoId}`);
  console.log(`  CTA: "${doc.hero.ctaPrimaryLabel}" / "${doc.hero.ctaSecondaryLabel}"`);
  console.log(`\nSTATISTICS: ${doc.statistics.length}`);
  doc.statistics.forEach((s) => console.log(`  ${s.value}  ${s.label}`));
  console.log(`\nFEATURED PRODUCTS (categories): ${doc.featuredProducts.length}  → ${FEATURED_CATEGORIES.join(", ")}`);
  console.log(`FEATURED PROJECTS: ${doc.featuredProjects.length}  → ${FEATURED_PROJECTS.join(", ")}`);
  console.log(`FEATURED BRANDS: ${doc.featuredBrands.length}  → ${FEATURED_BRANDS.join(", ")}`);
  console.log(`\nCTA: "${doc.cta.heading}"`);
  console.log(`TRUST INDICATORS: ${doc.trustIndicators.length}  → ${doc.trustIndicators.join(" · ")}`);

  // sanity-check that referenced docs exist
  if (!DRY_RUN || true) {
    const ids = [
      ...FEATURED_CATEGORIES.map((s) => `category-${s}`),
      ...FEATURED_PROJECTS.map((s) => `project-${s}`),
      ...FEATURED_BRANDS.map((s) => `brand-${s}`),
    ];
    const existing: string[] = await client.fetch("*[_id in $ids]._id", { ids });
    const missing = ids.filter((id) => !existing.includes(id));
    console.log(`\nReference check: ${existing.length}/${ids.length} referenced docs exist` + (missing.length ? `  ⚠ missing: ${missing.join(", ")}` : "  ✓"));
  }

  if (DRY_RUN) { console.log("\n[DRY RUN] Homepage singleton not written.\n"); return; }
  await client.createOrReplace(doc);
  console.log("\n✓ Homepage singleton written.\n");
}

run().catch((e) => { console.error("\n✗ Failed:", e.message); process.exit(1); });
