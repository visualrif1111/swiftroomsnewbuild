/**
 * Migrate the remaining content types into Sanity: testimonials, team members
 * (+ photos), timeline entries, process steps, certifications.
 * Idempotent (deterministic _ids). --dry-run / --no-media.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { testimonials, teamMembers, timeline, processSteps } from "../src/lib/data";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {}

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_MEDIA = process.argv.includes("--no-media");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID"); process.exit(1); }
if (!DRY_RUN && !token) { console.error("✗ Missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

const client = createClient({
  projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false,
});

// certifications live in AboutClient (not exported) — mirrored here.
const certifications = [
  { name: "Cortizo Authorised Partner", detail: "UAE — since 2011" },
  { name: "Gulf Extrusions Approved Installer", detail: "UAE — since 2015" },
  { name: "Vetromax Authorised Partner", detail: "UAE — since 2017" },
  { name: "QUALICOAT Certified", detail: "Powder coat quality standard" },
  { name: "Dubai Municipality Registered", detail: "Commercial contractor" },
  { name: "ISO 9001:2015", detail: "Quality management system" },
];

async function uploadImage(src?: string): Promise<string | undefined> {
  if (SKIP_MEDIA || !src || !src.startsWith("/")) return undefined;
  const p = resolve(ROOT, "public" + src);
  if (!existsSync(p)) return undefined;
  const asset = await client.assets.upload("image", readFileSync(p), { filename: src.split("/").pop()! });
  return asset._id;
}

async function run() {
  console.log(`\nMisc content migration → Sanity (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`);
  const teamWithImg = teamMembers.filter((t) => t.image).length;
  console.log(`  testimonials:   ${testimonials.length}`);
  console.log(`  teamMembers:    ${teamMembers.length}  (${teamWithImg} with photos to upload)`);
  console.log(`  timeline:       ${timeline.length}`);
  console.log(`  processSteps:   ${processSteps.length}`);
  console.log(`  certifications: ${certifications.length}`);
  console.log(`  TOTAL DOCS:     ${testimonials.length + teamMembers.length + timeline.length + processSteps.length + certifications.length}`);

  if (DRY_RUN) { console.log("\n[DRY RUN] No documents created, no photos uploaded.\n"); return; }

  console.log("\nImporting…");
  for (const [i, t] of testimonials.entries()) {
    await client.createOrReplace({ _id: `testimonial-${i}`, _type: "testimonial", ...t, order: i });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  for (const [i, t] of teamMembers.entries()) {
    const img = await uploadImage(t.image);
    await client.createOrReplace({
      _id: `team-${i}`, _type: "teamMember",
      name: t.name, role: t.role, group: t.group, ...(t.bio ? { bio: t.bio } : {}),
      ...(img ? { image: { _type: "image", asset: { _type: "reference", _ref: img } } } : {}),
      order: i,
    });
  }
  console.log(`  ✓ ${teamMembers.length} team members`);

  for (const [i, t] of timeline.entries()) {
    await client.createOrReplace({ _id: `timeline-${i}`, _type: "timelineEntry", ...t, order: i });
  }
  console.log(`  ✓ ${timeline.length} timeline entries`);

  for (const [i, s] of processSteps.entries()) {
    await client.createOrReplace({ _id: `process-${i}`, _type: "processStep", stepNumber: s.number, title: s.title, description: s.description, order: i });
  }
  console.log(`  ✓ ${processSteps.length} process steps`);

  for (const [i, c] of certifications.entries()) {
    await client.createOrReplace({ _id: `cert-${i}`, _type: "certification", ...c, order: i });
  }
  console.log(`  ✓ ${certifications.length} certifications`);

  console.log("\nDone.\n");
}

run().catch((e) => { console.error("\n✗ Failed:", e.message); process.exit(1); });
