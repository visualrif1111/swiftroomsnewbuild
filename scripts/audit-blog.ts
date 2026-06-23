// Read-only pre-migration audit of data.ts blog posts. No writes.
// Run: npx tsx scripts/audit-blog.ts
import { blogPosts } from "../src/lib/data";

const cats: Record<string, number> = {};
let missingAny = 0;
const rows: string[] = [];

for (const p of blogPosts) {
  cats[p.category] = (cats[p.category] ?? 0) + 1;
  const blocks = p.body.reduce((n, s) => n + (s.heading ? 1 : 0) + s.paragraphs.length, 0);
  const imgType = !p.image ? "MISSING" : p.image.includes("unsplash") ? "stock" : "other";
  const miss: string[] = [];
  if (!p.image) miss.push("image");
  if (!p.excerpt) miss.push("excerpt");
  if (!p.readTime) miss.push("readTime");
  if (!p.date) miss.push("date");
  if (!p.body?.length) miss.push("body");
  if (miss.length) missingAny++;
  rows.push(
    `  ${p.slug.padEnd(40)} ${p.category.padEnd(22)} img:${imgType.padEnd(7)} ` +
      `blocks:${String(blocks).padStart(2)} rel:${p.relatedProducts?.length ?? 0}` +
      (miss.length ? `  ⚠ MISSING: ${miss.join(",")}` : "")
  );
}

console.log(`TOTAL POSTS: ${blogPosts.length}\n`);
console.log("CATEGORIES:");
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) console.log(`  ${n}× ${c}`);
console.log("\nPER-POST:");
console.log(rows.join("\n"));
console.log(`\nFEATURED IMAGES: ${blogPosts.filter((p) => p.image).length}/${blogPosts.length} have an image`);
const stock = blogPosts.filter((p) => p.image?.includes("unsplash")).length;
console.log(`  - ${stock} stock (Unsplash), ${blogPosts.length - stock} other/none`);
console.log(`\nPOSTS WITH MISSING DATA: ${missingAny}`);
