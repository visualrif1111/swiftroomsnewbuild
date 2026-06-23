import { defineField, defineType } from "sanity";

// Product Category — a Swiftrooms product range (e.g. Aluminium Sliding Doors).
// Products reference their category. URL: /catalogue/<slug>.
export const productCategoryType = defineType({
  name: "productCategory",
  title: "Product Category",
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
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "content" }),
    defineField({ name: "overview", title: "Overview", type: "text", rows: 4, group: "content" }),
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
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "tagline", media: "heroImage" } },
});
