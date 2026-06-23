/**
 * Convert portfolio project `productsUsed` (strings) → `products` (references
 * to Product documents). Idempotent (patch .set). Unmatched names are left in
 * productsUsed only and reported.
 *
 *   npx tsx scripts/convert-products-used-refs.ts --dry-run
 *   npx tsx scripts/convert-products-used-refs.ts
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

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

// Portfolio product-name → product slug (mirrors the portfolio page map).
const NAME_TO_SLUG: Record<string, string> = {
  "Cor Vision 4600": "cor-vision-4600", "Cor Vision 4700": "cor-vision-4700",
  "Cor Vision Plus": "cor-vision-plus", "Cortizo Bi-fold": "cortizo-bifold",
  "Cortizo Casement": "cortizo-casement", "Cortizo Cor 70 Hidden Sash": "cortizo-cor-70-hidden-sash",
  "Gulf Extrusions TB600 Window": "gulf-extrusion-tb600-tilt-and-turn",
  "Aluminium Sliding Windows": "aluminium-sliding-windows", "Cortizo Cor 70 Door": "cortizo-cor-70-door",
  "Gulf Extrusions TB600 Door": "gulf-extrusion-tb600-door", "Vetromax Pivot Door": "vetromax-pivot-door",
  "uPVC Casement": "upvc-casement", "Cortizo TP52": "cortizo-tp52",
  "Cortizo TP52 Curtain Wall": "cortizo-tp52", "Gulf Extrusions CW 50mm": "gulf-extrusion-cw-50",
  "Vetromax VF35 Facade": "vetromax-vf35", "Vetromax VF35 Curtain Wall": "vetromax-vf35",
  "Premium Garden Room": "premium-garden-room", "Garden Room": "premium-garden-room",
  "Glass Conservatory": "glass-conservatory", "Retractable Fly Screen": "retractable-fly-screen",
  "Fixed Rooflight": "fixed-rooflight", "Premium Rooflight": "fixed-rooflight",
  "Motorised Skylight": "motorised-skylight",
};

const key = () => Math.random().toString(36).slice(2, 12);

async function run() {
  console.log(`\nConvert productsUsed → references (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`);
  const projects: { _id: string; productsUsed?: string[] }[] = await client.fetch(
    `*[_type == "project"]{ _id, productsUsed }`
  );
  // Which product docs actually exist (avoid dangling, though refs are weak).
  const existingProducts: string[] = await client.fetch(`*[_type == "product"].slug.current`);
  const existing = new Set(existingProducts);

  const unmatched = new Set<string>();
  let totalRefs = 0;
  for (const p of projects) {
    const names = p.productsUsed ?? [];
    const refs: { _key: string; _type: "reference"; _weak: true; _ref: string }[] = [];
    const seen = new Set<string>();
    for (const n of names) {
      const slug = NAME_TO_SLUG[n];
      if (slug && existing.has(slug)) {
        if (!seen.has(slug)) { seen.add(slug); refs.push({ _key: key(), _type: "reference", _weak: true, _ref: `product-${slug}` }); }
      } else {
        unmatched.add(n);
      }
    }
    totalRefs += refs.length;
    console.log(`  ${p._id.replace("project-", "").padEnd(28)} ${names.length} names → ${refs.length} refs`);
    if (!DRY_RUN) await client.patch(p._id).set({ products: refs }).commit();
  }

  console.log(`\nTotal references: ${totalRefs} across ${projects.length} projects`);
  console.log(`Unmatched names (kept in productsUsed only): ${[...unmatched].sort().join(", ") || "none"}`);
  console.log(DRY_RUN ? "\n[DRY RUN] No documents changed.\n" : "\n✓ Done.\n");
}

run().catch((e) => { console.error("\n✗ Failed:", e.message); process.exit(1); });
