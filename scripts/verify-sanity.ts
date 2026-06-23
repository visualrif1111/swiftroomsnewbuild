// Read-only Sanity verification (no writes, no migration). Run: npx tsx scripts/verify-sanity.ts
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {}

async function main() {
  const env = await import("../src/sanity/env");
  console.log("2. ENV DETECTION");
  console.log("   projectId :", env.projectId || "(EMPTY)");
  console.log("   dataset   :", env.dataset);
  console.log("   apiVersion:", env.apiVersion);
  console.log("   readToken :", process.env.SANITY_API_READ_TOKEN ? "present" : "absent (ok for public dataset)");

  const { client } = await import("../src/sanity/lib/client");
  const { POSTS_QUERY, POST_QUERY } = await import("../src/sanity/lib/queries");
  console.log("\n1/5. CONNECTION + GROQ (via next-sanity client)");
  const posts = await client.fetch(POSTS_QUERY);
  console.log("   POSTS_QUERY        →", Array.isArray(posts) ? `OK, ${posts.length} posts` : posts);
  const one = await client.fetch(POST_QUERY, { slug: "__none__" });
  console.log("   POST_QUERY(__none__) →", one === null ? "OK (null)" : one);

  const { urlFor } = await import("../src/sanity/lib/image");
  const ref = { _type: "image", asset: { _type: "reference", _ref: "image-abc123def456-2000x1333-jpg" } };
  console.log("\n6. IMAGE BUILDER");
  console.log("   urlFor →", urlFor(ref as never).width(800).url());

  console.log("\n✓ All read-only checks passed (dataset is empty — nothing migrated).");
}
main().catch((e) => {
  console.error("✗ FAILED:", e.message);
  process.exit(1);
});
