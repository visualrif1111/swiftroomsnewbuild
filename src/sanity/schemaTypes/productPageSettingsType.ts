import { defineField, defineType } from "sanity";

// Product page settings — a singleton (_id "productPageSettings") holding the
// section labels/headings and CTA copy that are shared across EVERY product
// detail page (the "chrome"). Per-product content lives on the product docs.
export const productPageSettingsType = defineType({
  name: "productPageSettings",
  title: "Product Page Settings",
  type: "document",
  groups: [
    { name: "hero", title: "Hero buttons", default: true },
    { name: "sections", title: "Section labels" },
    { name: "cta", title: "Bottom CTA" },
  ],
  fields: [
    // Hero
    defineField({ name: "heroEnquireLabel", title: "Hero — enquire button", type: "string", group: "hero" }),
    defineField({ name: "heroShowroomLabel", title: "Hero — showroom button", type: "string", group: "hero" }),
    // Section eyebrows / headings
    defineField({ name: "introEyebrow", title: "Introduction — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "specsEyebrow", title: "Specifications — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "specsHeading", title: "Specifications — heading", type: "string", group: "sections" }),
    defineField({ name: "specsFootnote", title: "Specifications — footnote", type: "text", rows: 2, group: "sections" }),
    defineField({ name: "featuresEyebrow", title: "Features — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "featuresHeading", title: "Features — heading", type: "string", group: "sections" }),
    defineField({ name: "galleryEyebrow", title: "Gallery — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "galleryHeading", title: "Gallery — heading", type: "string", group: "sections" }),
    defineField({ name: "downloadsEyebrow", title: "Downloads — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "downloadsHeading", title: "Downloads — heading", type: "string", group: "sections" }),
    defineField({ name: "installedEyebrow", title: "Installed projects — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "installedHeading", title: "Installed projects — heading", type: "string", group: "sections" }),
    defineField({ name: "readingEyebrow", title: "Further reading — eyebrow", type: "string", group: "sections" }),
    defineField({ name: "readingHeading", title: "Further reading — heading", type: "string", group: "sections" }),
    // Bottom CTA
    defineField({ name: "ctaHeading", title: "CTA — heading", type: "string", group: "cta" }),
    defineField({ name: "ctaBody", title: "CTA — body", type: "text", rows: 2, group: "cta" }),
    defineField({ name: "ctaEnquireLabel", title: "CTA — enquire button", type: "string", group: "cta" }),
    defineField({ name: "ctaShowroomLabel", title: "CTA — showroom button", type: "string", group: "cta" }),
  ],
  preview: { prepare: () => ({ title: "Product Page Settings" }) },
});
