/**
 * Migrate Swiftrooms resources into Sanity.
 * Idempotent (_id = resource-<slug>).
 *
 *   npx tsx scripts/migrate-resources-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-resources-to-sanity.ts
 *
 * NOTE: the data.ts resources have no actual files (fileType/fileSize only),
 * so docs import without a file — editors upload the PDF in the Studio.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { resources } from "../src/lib/data";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {}

const DRY_RUN = process.argv.includes("--dry-run");
const BASE = "https://www.swiftrooms.ae";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }
if (!DRY_RUN && !token) { console.error("✗ Missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

const client = createClient({
  projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false,
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const CATEGORY_MAP: Record<string, string> = {
  guides: "Guides & Knowledge",
  projects: "Projects & Inspiration",
  planning: "Planning & Costs",
};

async function run() {
  console.log(`\nResource migration → Sanity (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`);
  console.log(`RESOURCES: ${resources.length}\n`);

  const dist: Record<string, number> = {};
  let noFile = 0;
  console.log("  category               title                                          file");
  for (const r of resources) {
    const cat = CATEGORY_MAP[r.category] ?? "Guides & Knowledge";
    dist[cat] = (dist[cat] ?? 0) + 1;
    const hasFile = Boolean((r as { file?: string }).file);
    if (!hasFile) noFile++;
    console.log(`  ${cat.padEnd(22)} ${r.title.slice(0, 44).padEnd(45)} ${hasFile ? "✓" : "— (" + (r.fileType ?? "?") + " " + (r.fileSize ?? "") + ")"}`);
  }
  console.log("\nCATEGORY MAPPING (3 → 3):  guides→Guides & Knowledge, projects→Projects & Inspiration, planning→Planning & Costs");
  console.log("DISTRIBUTION:");
  for (const [k, v] of Object.entries(dist)) console.log(`  ${v}x  ${k}`);
  console.log(`\nFiles to upload: ${resources.length - noFile} (no source PDFs in repo — ${noFile} import without a file; add in Studio)`);
  console.log("SEO: seoTitle = title, canonical " + BASE + "/technical/resources");
  console.log("URL: resources listed on /technical/resources (no per-resource route today). New CMS content.");

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created.\n"); return; }

  console.log("\nImporting…");
  for (const r of resources) {
    const slug = slugify(r.title);
    const cat = CATEGORY_MAP[r.category] ?? "Guides & Knowledge";
    await client.createOrReplace({
      _id: `resource-${slug}`, _type: "resource",
      title: r.title, slug: { _type: "slug", current: slug },
      description: r.description, category: cat,
      ...(r.fileType ? { fileType: r.fileType } : {}),
      ...(r.fileSize ? { fileSize: r.fileSize } : {}),
      seo: { seoTitle: r.title, seoDescription: r.description, canonicalUrl: `${BASE}/technical/resources`, noIndex: false },
    });
    console.log(`  ✓ resource: ${slug}`);
  }
  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Migration failed:", e.message); process.exit(1); });
