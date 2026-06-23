/**
 * Migrate Swiftrooms manufacturer brands into Sanity.
 * Idempotent (_id = brand-<slug>).
 *
 *   npx tsx scripts/migrate-brands-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-brands-to-sanity.ts
 *   npx tsx scripts/migrate-brands-to-sanity.ts --no-media
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { brands as dataBrands } from "../src/lib/data";

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

// Look up a data.ts brand's description/tagline/country by name.
const byName = (n: string) => dataBrands.find((b) => b.name.toLowerCase() === n.toLowerCase());

// 8 brands. Descriptions for the 4 not in data.ts are brief factual summaries
// (flagged review:true) — editors should expand them in the Studio.
type B = { name: string; slug: string; country: string; tagline?: string; description: string; logo?: string; review?: boolean };
const BRANDS: B[] = [
  { name: "Cortizo", slug: "cortizo", country: byName("Cortizo")?.country ?? "Spain", tagline: byName("Cortizo")?.tagline, description: byName("Cortizo")?.description ?? "", logo: "/brand/logos/cortizo.png" },
  { name: "Vetro", slug: "vetro", country: byName("Vetro")?.country ?? "UAE", tagline: byName("Vetro")?.tagline, description: byName("Vetro")?.description ?? "" /* no dedicated logo */ },
  { name: "Vetromax", slug: "vetromax", country: byName("Vetromax")?.country ?? "UAE", tagline: byName("Vetromax")?.tagline, description: byName("Vetromax")?.description ?? "", logo: "/brand/logos/vetromax-teal.png" },
  { name: "Gulf Extrusions", slug: "gulf-extrusions", country: byName("Gulf Extrusions")?.country ?? "UAE", tagline: byName("Gulf Extrusions")?.tagline, description: byName("Gulf Extrusions")?.description ?? "", logo: "/brand/logos/gulf-extrusions-teal.png" },
  { name: "Reynaers", slug: "reynaers", country: "Belgium", description: "A European supplier of architectural aluminium window, door, curtain wall and sliding systems.", logo: "/brand/logos/reynaers.webp", review: true },
  { name: "Schüco", slug: "schuco", country: "Germany", description: "A global manufacturer of aluminium and uPVC window, door and façade systems for residential and commercial projects.", logo: "/brand/logos/schuco.webp", review: true },
  { name: "Deceuninck", slug: "deceuninck", country: "Belgium", description: "A specialist in high-performance uPVC window and door profile systems.", logo: "/brand/logos/deceuninck.webp", review: true },
  { name: "UltraFrame", slug: "ultraframe", country: "United Kingdom", description: "A manufacturer of conservatory, orangery and glazed roof systems.", logo: "/brand/logos/ultraframe.webp", review: true },
];

async function uploadImage(src?: string): Promise<string | undefined> {
  if (SKIP_MEDIA || !src || !existsSync(publicPath(src))) return undefined;
  const asset = await client.assets.upload("image", readFileSync(publicPath(src)), { filename: src.split("/").pop()! });
  return asset._id;
}

async function run() {
  console.log(
    `\nBrand migration → Sanity (${projectId}/${client.config().dataset})` +
      `${DRY_RUN ? "  [DRY RUN]" : ""}${SKIP_MEDIA ? "  [no media]" : ""}\n`
  );
  console.log(`BRANDS: ${BRANDS.length}\n`);
  console.log("  brand            country         logo          description           seo");
  for (const b of BRANDS) {
    const logoOk = b.logo && existsSync(publicPath(b.logo));
    console.log(
      `  ${b.name.padEnd(16)} ${b.country.padEnd(15)} ${(logoOk ? "✓ " + b.logo!.split("/").pop() : "— none").padEnd(13)} ` +
        `${(b.description ? b.description.length + "ch" + (b.review ? " (review)" : "") : "MISSING").padEnd(21)} ✓`
    );
  }
  const noLogo = BRANDS.filter((b) => !b.logo || !existsSync(publicPath(b.logo))).map((b) => b.name);
  const review = BRANDS.filter((b) => b.review).map((b) => b.name);
  console.log(`\nLogos: ${BRANDS.length - noLogo.length}/${BRANDS.length}  (no logo: ${noLogo.join(", ") || "none"})`);
  console.log(`Descriptions to review (not from data.ts): ${review.join(", ")}`);
  console.log("\nSEO: seoTitle '<Brand> Glazing Systems | Swiftrooms UAE', canonical " + BASE + "/catalogue/brands");
  console.log("URL: brands have no dedicated route today (listed on /catalogue/brands). New CMS content.");

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created, no assets uploaded.\n"); return; }

  console.log("\nImporting…");
  for (const b of BRANDS) {
    const logo = await uploadImage(b.logo);
    await client.createOrReplace({
      _id: `brand-${b.slug}`, _type: "brand",
      title: b.name, slug: { _type: "slug", current: b.slug },
      country: b.country, ...(b.tagline ? { tagline: b.tagline } : {}),
      description: b.description,
      ...(logo ? { logo: { _type: "image", asset: { _type: "reference", _ref: logo }, alt: `${b.name} logo` } } : {}),
      seo: {
        seoTitle: `${b.name} Glazing Systems | Swiftrooms UAE`,
        seoDescription: b.description,
        canonicalUrl: `${BASE}/catalogue/brands`, noIndex: false,
      },
    });
    console.log(`  ✓ brand: ${b.slug}${logo ? "  +logo" : ""}`);
  }
  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
