/**
 * Seed one `pageSettings` document per hard-coded landing route so the
 * Presentation tool can resolve a main document for each (removing the
 * "Missing a main document for /x" notice) and editors get a place to edit each
 * page's hero + SEO.
 *
 * Idempotent: uses createIfNotExists with deterministic _ids, so re-running it
 * never overwrites content editors have added. --dry-run to preview.
 *
 *   npx tsx scripts/migrate-page-settings-to-sanity.ts [--dry-run]
 *
 * Requires (in .env.local): NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { LANDING_ROUTES, pageSettingsId } from "../src/lib/landingRoutes";

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
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token,
  useCdn: false,
});

async function run() {
  const tx = client.transaction();
  for (const { route, label } of LANDING_ROUTES) {
    const _id = pageSettingsId(route);
    console.log(`${DRY_RUN ? "[dry]" : "  +  "} ${_id}  ->  ${route}`);
    if (!DRY_RUN) {
      // createIfNotExists: seed the doc once; never clobber editor edits.
      tx.createIfNotExists({ _id, _type: "pageSettings", route, label });
    }
  }
  if (DRY_RUN) {
    console.log(`\n${LANDING_ROUTES.length} pageSettings documents would be created (if absent).`);
    return;
  }
  await tx.commit();
  console.log(`\n✓ Seeded ${LANDING_ROUTES.length} pageSettings documents (existing ones untouched).`);
}

run().catch((e) => { console.error(e); process.exit(1); });
