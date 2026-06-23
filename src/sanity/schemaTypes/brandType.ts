import { defineField, defineType } from "sanity";

// Brand — a manufacturer partner whose systems Swiftrooms supplies/installs.
export const brandType = defineType({
  name: "brand",
  title: "Brand",
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
    defineField({ name: "country", title: "Country", type: "string", group: "content" }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "content" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4, group: "content" }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "media",
      options: { hotspot: false },
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
  preview: { select: { title: "title", subtitle: "country", media: "logo" } },
});
