/**
 * Seed the Site Settings singleton (_id "siteSettings") in Sanity from the
 * current global config (company, contact, showroom, footer, CTA).
 *
 *   npx tsx scripts/migrate-site-settings-to-sanity.ts --dry-run
 *   npx tsx scripts/migrate-site-settings-to-sanity.ts
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

const k = (p: string) => (v: unknown, i: number) => ({ _key: `${p}${i}`, ...(v as object) });

const doc = {
  _id: "siteSettings",
  _type: "siteSettings",
  company: { name: "Swiftrooms", foundedYear: "2009", tagline: "Performance Windows & Doors", description: "Premium aluminium, uPVC and glazing systems supplied and installed across the UAE since 2009." },
  contact: { phone: "+971 505 269 149", phoneRaw: "+971505269149", email: "info@swiftrooms.ae", whatsapp: "971505269149" },
  showroom: {
    name: "4900 Showroom", addressLine1: "Jebel Ali Industrial Area 1", city: "Dubai", country: "UAE",
    latitude: 24.9942, longitude: 55.0614,
    hours: [
      { days: "Sunday – Thursday", opens: "08:30", closes: "17:30" },
      { days: "Saturday", opens: "10:00", closes: "14:00" },
    ].map(k("h")),
  },
  social: [] as unknown[], // none in the current site — editor adds in Studio
  footerLinks: [
    {
      heading: "Products",
      links: [
        { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
        { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
        { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
        { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
        { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
        { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
        { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
        { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
        { label: "Insect Screens", href: "/catalogue/insect-screens" },
      ].map(k("l")),
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Technical Hub", href: "/technical" },
        { label: "Blog", href: "/technical/blog" },
        { label: "Resources", href: "/technical/resources" },
        { label: "FAQ", href: "/technical/faq" },
        { label: "Gallery", href: "/catalogue/gallery" },
      ].map(k("l")),
    },
  ].map(k("g")),
  cta: { quoteLabel: "Get a Free Quote", quoteHref: "/enquire", showroomLabel: "Book Showroom Visit", showroomHref: "/showroom" },
};

async function run() {
  console.log(`\nSite Settings singleton → Sanity (${projectId}/${client.config().dataset})${DRY_RUN ? "  [DRY RUN]" : ""}\n`);
  console.log("COMPANY:  " + doc.company.name + " (since " + doc.company.foundedYear + ")");
  console.log("CONTACT:  " + doc.contact.phone + " · " + doc.contact.email + " · WhatsApp " + doc.contact.whatsapp);
  console.log("SHOWROOM: " + doc.showroom.name + ", " + doc.showroom.addressLine1 + ", " + doc.showroom.city +
    "  geo(" + doc.showroom.latitude + "," + doc.showroom.longitude + ")");
  doc.showroom.hours.forEach((h: any) => console.log("            " + h.days + "  " + h.opens + "–" + h.closes));
  console.log("SOCIAL:   " + (doc.social.length || "0 (none in current site — add in Studio)"));
  console.log("FOOTER:   " + doc.footerLinks.length + " groups (" + doc.footerLinks.map((g: any) => g.heading + ":" + g.links.length).join(", ") + ")");
  console.log("CTA:      \"" + doc.cta.quoteLabel + "\" → " + doc.cta.quoteHref + "   \"" + doc.cta.showroomLabel + "\" → " + doc.cta.showroomHref);

  if (DRY_RUN) { console.log("\n[DRY RUN] Site Settings singleton not written.\n"); return; }
  await client.createOrReplace(doc);
  console.log("\n✓ Site Settings singleton written.\n");
}

run().catch((e) => { console.error("\n✗ Failed:", e.message); process.exit(1); });
