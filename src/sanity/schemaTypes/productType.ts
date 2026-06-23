import { defineField, defineType } from "sanity";

// Product — an individual Swiftrooms system within a category.
// URL: /catalogue/<categorySlug>/<slug>.
export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "related", title: "Related" },
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
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "content",
      to: [{ type: "productCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "brand", title: "Brand", type: "string", group: "content" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4, group: "content" }),
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "specifications",
      title: "Specifications",
      type: "array",
      group: "content",
      of: [
        defineField({
          name: "spec",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "downloads",
      title: "Downloads",
      type: "array",
      group: "content",
      of: [
        defineField({
          name: "download",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "file", title: "File", type: "file" }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
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
    // ── Related ──
    defineField({
      name: "relatedProducts",
      title: "Related products",
      type: "array",
      group: "related",
      of: [{ type: "reference", weak: true, to: [{ type: "product" }] }],
    }),
    defineField({
      name: "relatedProjects",
      title: "Related projects",
      type: "array",
      group: "related",
      of: [{ type: "reference", weak: true, to: [{ type: "project" }] }],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "brand", media: "heroImage" } },
});
