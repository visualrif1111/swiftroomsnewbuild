import { defineArrayMember, defineField, defineType } from "sanity";

// A fully editable, modular page. Editors compose a page from reorderable
// sections (blocks) — add / remove / duplicate / drag to reorder / hide — and
// it renders at its slug via the catch-all route. Used for landing pages, legal
// pages, thank-you pages, custom 404 content, and is the migration target for
// existing pages.
export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "For the CMS list only — not shown on the page.",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL path",
      type: "slug",
      description: 'The page URL, e.g. "privacy-policy" → /privacy-policy. Use "/" for nested paths.',
      group: "content",
      options: { source: "title", slugify: (input) => input.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "").slice(0, 96) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description: "Build the page from sections. Drag to reorder, or use the ⋮ menu to add, duplicate, hide or remove.",
      group: "content",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "richTextBlock" }),
        defineArrayMember({ type: "imageBlock" }),
        defineArrayMember({ type: "galleryBlock" }),
        defineArrayMember({ type: "videoBlock" }),
        defineArrayMember({ type: "statsBlock" }),
        defineArrayMember({ type: "featureGridBlock" }),
        defineArrayMember({ type: "testimonialsBlock" }),
        defineArrayMember({ type: "logosBlock" }),
        defineArrayMember({ type: "faqBlock" }),
        defineArrayMember({ type: "ctaBlock" }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
    defineField({
      name: "hidden",
      title: "Unpublished / hidden page",
      type: "boolean",
      description: "Hide the whole page from the live site (returns 404) without deleting it.",
      group: "settings",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({ title: title || "Untitled page", subtitle: slug ? `/${slug}` : "no url" }),
  },
});
