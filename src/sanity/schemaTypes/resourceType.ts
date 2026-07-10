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
    defineField({
      name: "file",
      title: "PDF file",
      type: "file",
      group: "content",
      description:
        "Upload the PDF here. When present, the resource shows a direct Download link; leave empty to keep the 'Request' (email) flow instead.",
      options: { accept: ".pdf,application/pdf", storeOriginalFilename: true },
    }),
    defineField({
      name: "fileType",
      title: "File type (optional)",
      type: "string",
      group: "content",
      description: 'Shown as the badge, e.g. "PDF". Auto-filled from the upload when left blank.',
    }),
    defineField({
      name: "fileSize",
      title: "File size (optional)",
      type: "string",
      group: "content",
      description: 'e.g. "2.4 MB". Auto-filled from the upload when left blank.',
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
