import { defineArrayMember, defineField, defineType } from "sanity";

// Landing-page settings — one document per hard-coded route (e.g. "/about",
// "/technical", "/catalogue"). These pages are composed from many collections
// (team, FAQs, categories, …) so they have no single "owning" document; this
// singleton holds the page-level editable chrome (hero heading/intro + SEO) and
// gives the Presentation tool a main document to resolve for the URL — which is
// what removes the "Missing a main document for /x" notice.
//
// `route` is the canonical key (matched by the Presentation resolver and read
// by the frontend). It is fixed per document and should not be edited.
export const pageSettingsType = defineType({
  name: "pageSettings",
  title: "Landing Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "route",
      title: "Route (fixed)",
      type: "string",
      description: 'The URL this document controls, e.g. "/about". Do not change.',
      group: "hero",
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "For the CMS list only — not shown on the page.",
      group: "hero",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      description:
        "Page hero. Leave any field blank to keep the current built-in text for that page.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow / label", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "text", rows: 2 }),
        defineField({ name: "subheading", title: "Subheading", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "sections",
      description:
        "Optional extra content blocks rendered below this page's built-in content. Drag to reorder, or use the ⋮ menu to add, duplicate, hide or remove. Leave empty to keep the page exactly as it is.",
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
  ],
  preview: {
    select: { title: "label", subtitle: "route" },
  },
});
