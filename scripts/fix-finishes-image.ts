// One-off: set a cover image for the single post whose source image 404'd.
// Uploads a real local asset and patches mainImage. Idempotent.
// Run: npx tsx scripts/fix-finishes-image.ts
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
}

const POST_ID = "post-aluminium-window-finishes-uae";
const IMAGE = resolve(ROOT, "public/images/products/aluminium-windows.png");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  console.log("Uploading cover image…");
  const asset = await client.assets.upload("image", readFileSync(IMAGE), {
    filename: "aluminium-window-finishes-uae.png",
  });
  await client
    .patch(POST_ID)
    .set({
      mainImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: "Aluminium window finishes" },
    })
    .commit();
  console.log(`✓ ${POST_ID} cover image set.`);
}
main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
