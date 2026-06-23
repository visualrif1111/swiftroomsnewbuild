/**
 * Migrate the existing data.ts blog posts into Sanity.
 *
 * Idempotent: each post is upserted with a deterministic _id (`post-<slug>`),
 * so you can run it repeatedly without creating duplicates.
 *
 * Usage (locally — never in CI/production):
 *   1. Put the ROTATED write token in .env.local:
 *        SANITY_API_WRITE_TOKEN=<your-new-write-token>
 *   2. Run:
 *        npx tsx scripts/migrate-blog-to-sanity.ts            # migrate
 *        npx tsx scripts/migrate-blog-to-sanity.ts --dry-run  # preview only
 *        npx tsx scripts/migrate-blog-to-sanity.ts --no-images # skip image upload
 *
 * The write token is read from env and never logged.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@sanity/client";
import { blogPosts, type BlogPost } from "../src/lib/data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Minimal .env.local loader (no extra deps) ──────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // no .env.local — rely on process env
  }
}
loadEnv();

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_IMAGES = process.argv.includes("--no-images");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID (set it in .env.local).");
  process.exit(1);
}
if (!DRY_RUN && !token) {
  console.error("✗ Missing SANITY_API_WRITE_TOKEN (add the rotated write token to .env.local).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

function publishedAtFromDate(date: string): string {
  const [month, year] = date.split(" ");
  const m = MONTHS[month] ?? 1;
  const y = parseInt(year) || new Date().getFullYear();
  return new Date(Date.UTC(y, m - 1, 1, 9, 0, 0)).toISOString();
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

// { heading?, paragraphs[] }[] → Portable Text blocks
function toPortableText(body: BlogPost["body"]) {
  const blocks: Record<string, unknown>[] = [];
  for (const section of body) {
    if (section.heading) {
      blocks.push({
        _type: "block", _key: key(), style: "h2", markDefs: [],
        children: [{ _type: "span", _key: key(), text: section.heading, marks: [] }],
      });
    }
    for (const para of section.paragraphs) {
      blocks.push({
        _type: "block", _key: key(), style: "normal", markDefs: [],
        children: [{ _type: "span", _key: key(), text: para, marks: [] }],
      });
    }
  }
  return blocks;
}

async function uploadImage(url: string, slug: string) {
  if (SKIP_IMAGES || !url) return undefined;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload("image", buf, { filename: `${slug}.jpg` });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } catch (e) {
    console.warn(`  ! image upload failed for ${slug}: ${(e as Error).message}`);
    return undefined;
  }
}

async function run() {
  console.log(
    `\nMigrating ${blogPosts.length} posts → Sanity (${projectId}/${dataset})` +
      `${DRY_RUN ? "  [DRY RUN]" : ""}${SKIP_IMAGES ? "  [no images]" : ""}\n`
  );

  let ok = 0;
  for (const post of blogPosts) {
    const mainImage = DRY_RUN ? undefined : await uploadImage(post.image, post.slug);
    const doc = {
      _id: `post-${post.slug}`,
      _type: "post",
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      category: post.category,
      excerpt: post.excerpt,
      publishedAt: publishedAtFromDate(post.date),
      readTime: post.readTime,
      ...(mainImage ? { mainImage } : {}),
      body: toPortableText(post.body),
      ...(post.relatedProducts && post.relatedProducts.length > 0
        ? {
            relatedProducts: post.relatedProducts.map((p) => ({
              _key: key(),
              _type: "relatedProduct",
              name: p.name,
              href: p.href,
            })),
          }
        : {}),
    };

    if (DRY_RUN) {
      console.log(`  • ${post.slug}  (${doc.body.length} blocks${mainImage ? ", +image" : ""})`);
      ok++;
      continue;
    }

    await client.createOrReplace(doc);
    console.log(`  ✓ ${post.slug}${mainImage ? "  +image" : ""}`);
    ok++;
  }

  console.log(`\nDone. ${ok}/${blogPosts.length} ${DRY_RUN ? "previewed" : "upserted"}.\n`);
}

run().catch((e) => {
  console.error("\n✗ Migration failed:", e.message);
  process.exit(1);
});
