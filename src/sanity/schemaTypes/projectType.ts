import { defineField, defineType } from "sanity";

// Portfolio Project — a completed Swiftrooms case study. Mirrors the data.ts
// PortfolioProject + portfolioMedia shape: hero, gallery, optional video, the
// case-study narrative, products used, and a reference to its location.
export const projectType = defineType({
  name: "project",
  title: "Portfolio Project",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "reference",
      group: "content",
      to: [{ type: "location" }],
    }),
    defineField({ name: "projectType", title: "Project type", type: "string", group: "content" }),
    defineField({ name: "area", title: "Area", type: "string", group: "content" }),
    defineField({ name: "year", title: "Year", type: "string", group: "content" }),
    defineField({ name: "description", title: "Overview", type: "text", rows: 4, group: "content" }),
    defineField({ name: "brief", title: "Brief", type: "text", rows: 3, group: "content" }),
    defineField({ name: "challenge", title: "Challenge", type: "text", rows: 3, group: "content" }),
    defineField({ name: "solution", title: "Solution", type: "text", rows: 3, group: "content" }),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 3, group: "content" }),
    // ── Products used (name-based; maps to catalogue links on render) ──
    defineField({
      name: "productsUsed",
      title: "Products used",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
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
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      group: "media",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "videoPoster",
      title: "Video poster",
      type: "image",
      group: "media",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "projectType", media: "heroImage" },
  },
});
