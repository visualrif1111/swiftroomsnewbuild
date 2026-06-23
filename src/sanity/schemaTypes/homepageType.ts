import { defineField, defineType } from "sanity";

// Homepage — a singleton (one document, _id "homepage") holding the editable
// homepage content: hero, stats, featured items, CTA and trust indicators.
export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
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
