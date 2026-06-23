import { defineField, defineType } from "sanity";

// Reusable SEO object — embedded on every content type to preserve and manage
// per-page metadata (title, description, canonical, OG image, noindex).
export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      validation: (r) => r.max(70).warning("Keep under ~60 characters"),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (r) => r.max(180).warning("Keep under ~160 characters"),
    }),
    defineField({ name: "canonicalUrl", title: "Canonical URL", type: "url" }),
    defineField({ name: "openGraphImage", title: "Open Graph image", type: "image" }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines (noindex)",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
