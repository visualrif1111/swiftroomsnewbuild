import { defineField, defineType } from "sanity";

// Portfolio Project — a completed Swiftrooms case study. Mirrors the data.ts
// PortfolioProject + portfolioMedia shape: location reference, hero, gallery,
// optional video, the case-study narrative, products used, and SEO.
export const projectType = defineType({
  name: "project",
  title: "Portfolio Project",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", title: "Location", type: "reference", group: "content", to: [{ type: "location" }] }),
    defineField({ name: "projectType", title: "Project type", type: "string", group: "content" }),
    defineField({ name: "area", title: "Area", type: "string", group: "content" }),
    defineField({ name: "year", title: "Year", type: "string", group: "content" }),
    defineField({ name: "description", title: "Overview", type: "text", rows: 4, group: "content" }),
    defineField({ name: "brief", title: "Brief", type: "text", rows: 3, group: "content" }),
    defineField({ name: "challenge", title: "Challenge", type: "text", rows: 3, group: "content" }),
    defineField({ name: "solution", title: "Solution", type: "text", rows: 3, group: "content" }),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 3, group: "content" }),
    // Products used — name-based in Phase 1; converts to references in Phase 2.
    // Products used — references to Product documents.
    defineField({
      name: "products",
      title: "Products used",
      type: "array",
      group: "content",
      of: [{ type: "reference", weak: true, to: [{ type: "product" }] }],
    }),
    // Legacy name list — kept for display fallback and names not yet matched to
    // a product. Superseded by the `products` references above.
    defineField({
      name: "productsUsed",
      title: "Products used (legacy names)",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({ name: "tags", title: "Tags", type: "array", group: "content", of: [{ type: "string" }] }),
    // ── Media ──
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      of: [
        defineField({
          name: "galleryImage",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        }),
      ],
    }),
    defineField({ name: "video", title: "Video", type: "file", group: "media", options: { accept: "video/*" } }),
    defineField({ name: "videoPoster", title: "Video poster", type: "image", group: "media", options: { hotspot: true } }),
    // ── SEO ──
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "projectType", media: "heroImage" } },
});
