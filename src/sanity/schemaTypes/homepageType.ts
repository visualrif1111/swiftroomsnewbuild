import { defineField, defineType } from "sanity";

// Homepage — a singleton (one document, _id "homepage") holding the editable
// homepage content: hero, stats, featured items, CTA and trust indicators.
export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Section headings" },
    { name: "lists", title: "Section lists" },
    { name: "featured", title: "Featured" },
    { name: "cta", title: "CTA & Trust" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "headingLine1", title: "Heading line 1", type: "string" }),
        defineField({ name: "headingLine2", title: "Heading line 2", type: "string" }),
        defineField({ name: "subheading", title: "Subheading", type: "text", rows: 2 }),
        defineField({ name: "ctaPrimaryLabel", title: "Primary CTA label", type: "string" }),
        defineField({ name: "ctaSecondaryLabel", title: "Secondary CTA label", type: "string" }),
        defineField({ name: "videoId", title: "YouTube video ID", type: "string" }),
        defineField({ name: "posterImage", title: "Poster image", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "statistics",
      title: "Statistics",
      type: "array",
      group: "hero",
      of: [
        defineField({
          name: "stat",
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Section headings",
      type: "object",
      group: "sections",
      description: "Eyebrow labels and headings for each homepage section. Leave blank to keep the current default text. Use line breaks in the multi-line headings to control wrapping.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "solutionEyebrow", title: "Solution — eyebrow", type: "string" }),
        defineField({ name: "solutionHeading", title: "Solution — heading", type: "string" }),
        defineField({ name: "transformEyebrow", title: "Transform — eyebrow", type: "string" }),
        defineField({ name: "transformHeading", title: "Transform — heading", type: "text", rows: 2 }),
        defineField({ name: "transformBody", title: "Transform — body", type: "text", rows: 3 }),
        defineField({ name: "productsEyebrow", title: "Products — eyebrow", type: "string" }),
        defineField({ name: "productsHeading", title: "Products — heading", type: "text", rows: 2 }),
        defineField({ name: "brandsEyebrow", title: "Brands — eyebrow", type: "string" }),
        defineField({ name: "portfolioEyebrow", title: "Portfolio — eyebrow", type: "string" }),
        defineField({ name: "portfolioHeading", title: "Portfolio — heading", type: "text", rows: 2 }),
        defineField({ name: "processEyebrow", title: "Process — eyebrow", type: "string" }),
        defineField({ name: "processHeading", title: "Process — heading", type: "text", rows: 2 }),
        defineField({ name: "blogEyebrow", title: "Blog — eyebrow", type: "string" }),
        defineField({ name: "blogHeading", title: "Blog — heading", type: "string" }),
        defineField({ name: "testimonialsEyebrow", title: "Testimonials — eyebrow", type: "string" }),
        defineField({ name: "testimonialsHeading", title: "Testimonials — heading", type: "string" }),
      ],
    }),
    defineField({
      name: "usps",
      title: "USP strip",
      type: "array",
      group: "lists",
      description: "The green bar of selling points under the hero. Leave blank to keep defaults.",
      of: [
        defineField({
          name: "usp",
          type: "object",
          fields: [
            defineField({ name: "icon", title: "Icon (emoji)", type: "string" }),
            defineField({ name: "text", title: "Text", type: "string" }),
          ],
          preview: { select: { title: "text", subtitle: "icon" } },
        }),
      ],
    }),
    defineField({
      name: "problems",
      title: "Problem → Solution pairs",
      type: "array",
      group: "lists",
      description: "The Swiftrooms Solution section: each row shows the frustration (left) and the advantage (right).",
      of: [
        defineField({
          name: "problem",
          type: "object",
          fields: [
            defineField({ name: "problem", title: "Frustration", type: "string" }),
            defineField({ name: "solution", title: "Advantage", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "problem", subtitle: "solution" } },
        }),
      ],
    }),
    defineField({
      name: "transformFeatures",
      title: "Transform section — features",
      type: "array",
      group: "lists",
      description: "The three bullet points in the “Transform Your Space” section.",
      of: [
        defineField({
          name: "feature",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "desc" } },
        }),
      ],
    }),
    defineField({
      name: "brandCards",
      title: "Brand cards",
      type: "array",
      group: "lists",
      description: "The “Brands We Work With” cards. Logos are matched by name for known brands (Cortizo, Schüco, Deceuninck, Vetromax, Gulf Extrusions).",
      of: [
        defineField({
          name: "brandCard",
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "country", title: "Country", type: "string" }),
            defineField({ name: "tagline", title: "Tagline", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "tagline" } },
        }),
      ],
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured products / categories",
      type: "array",
      group: "featured",
      of: [{ type: "reference", weak: true, to: [{ type: "productCategory" }, { type: "product" }] }],
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured projects",
      type: "array",
      group: "featured",
      of: [{ type: "reference", weak: true, to: [{ type: "project" }] }],
    }),
    defineField({
      name: "featuredBrands",
      title: "Featured brands",
      type: "array",
      group: "featured",
      of: [{ type: "reference", weak: true, to: [{ type: "brand" }] }],
    }),
    defineField({
      name: "cta",
      title: "CTA section",
      type: "object",
      group: "cta",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
        defineField({ name: "primaryLabel", title: "Primary label", type: "string" }),
        defineField({ name: "secondaryLabel", title: "Secondary label", type: "string" }),
      ],
    }),
    defineField({
      name: "trustIndicators",
      title: "Trust indicators",
      type: "array",
      group: "cta",
      of: [{ type: "string" }],
    }),
  ],
  preview: { select: { title: "hero.headingLine1" }, prepare: ({ title }) => ({ title: "Homepage", subtitle: title }) },
});
