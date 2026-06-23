import { defineField, defineType } from "sanity";

// Resource — a downloadable guide, brochure or spec sheet.
export const resourceType = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
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
    defineField({ name: "description", title: "Description", type: "text", rows: 3, group: "content" }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
      options: { list: ["Guides & Knowledge", "Projects & Inspiration", "Planning & Costs"] },
    }),
    defineField({ name: "file", title: "File", type: "file", group: "content" }),
    defineField({ name: "fileType", title: "File type", type: "string", group: "content", description: 'e.g. "PDF"' }),
    defineField({ name: "fileSize", title: "File size", type: "string", group: "content", description: 'e.g. "2.4 MB"' }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
