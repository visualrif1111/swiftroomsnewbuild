/**
 * Migrate Swiftrooms FAQs into Sanity.
 *  - 37 standalone FAQs (the /technical/faq page) → categories normalised to 6.
 *  - 31 product-category FAQs → category "Products" + productCategory reference.
 * Idempotent (_id = faq-std-<i> / faq-<catSlug>-<i>).
 *
 *   npx tsx scripts/migrate-faqs-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-faqs-to-sanity.ts
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { faqs, productCategories } from "../src/lib/data";

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

// Normalise the existing 8 labels → the 6 canonical categories.
const CATEGORY_MAP: Record<string, string> = {
  Products: "Products", Installation: "Installation", Pricing: "Pricing",
  Aftercare: "Maintenance", Maintenance: "Maintenance",
  Guarantees: "Warranty", Warranties: "Warranty",
  Timelines: "General",
};
const VALID = new Set(["Products", "Installation", "Maintenance", "Pricing", "Warranty", "General"]);

type Doc = { _id: string; _type: "faq"; question: string; answer: string; category: string; productCategory?: { _type: "reference"; _weak: true; _ref: string } };

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  faqs.forEach((f, i) => {
    const cat = CATEGORY_MAP[f.category] ?? "General";
    docs.push({ _id: `faq-std-${i}`, _type: "faq", question: f.question, answer: f.answer, category: cat });
  });
  for (const c of productCategories) {
    (c.faqs ?? []).forEach((f, i) => {
      docs.push({
        _id: `faq-${c.slug}-${i}`, _type: "faq",
        question: f.q, answer: f.a, category: "Products",
        productCategory: { _type: "reference", _weak: true, _ref: `category-${c.slug}` },
      });
    });
  }
  return docs;
}

async function run() {
  const docs = buildDocs();
  console.log(
    `\nFAQ migration → Sanity (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`
  );
  const std = docs.filter((d) => d._id.startsWith("faq-std-")).length;
  console.log(`TOTAL FAQs: ${docs.length}   (standalone: ${std}, product-category: ${docs.length - std})`);

  console.log("\nCATEGORY NORMALISATION (standalone 8 labels → 6):");
  const before: Record<string, number> = {};
  faqs.forEach((f) => (before[f.category] = (before[f.category] ?? 0) + 1));
  for (const [k, v] of Object.entries(before).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(2)}x  ${k.padEnd(13)} → ${CATEGORY_MAP[k] ?? "General"}`);
  }

  console.log("\nFINAL CATEGORY DISTRIBUTION (all FAQs):");
  const after: Record<string, number> = {};
  docs.forEach((d) => (after[d.category] = (after[d.category] ?? 0) + 1));
  for (const [k, v] of Object.entries(after).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(2)}x  ${k}`);

  const invalid = docs.filter((d) => !VALID.has(d.category));
  console.log(`\nInvalid categories: ${invalid.length ? invalid.map((d) => d.category).join(", ") : "none"}`);
  console.log(`Product-category links: ${docs.filter((d) => d.productCategory).length}`);

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created.\n"); return; }

  console.log("\nImporting…");
  let n = 0;
  for (const d of docs) { await client.createOrReplace(d); n++; }
  console.log(`\nDone. ${n} FAQs upserted.\n`);
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
