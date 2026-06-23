import { defineField, defineType } from "sanity";

// Portfolio Location — a place projects were delivered (e.g. "Al Barari").
// Projects reference a location so the portfolio can be browsed by place.
export const locationType = defineType({
  name: "location",
  title: "Portfolio Location",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emirate",
      title: "Emirate",
      type: "string",
      options: {
        list: [
          "Dubai", "Abu Dhabi", "Sharjah", "Ajman",
          "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
        ],
      },
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({
      name: "introContent",
      title: "Intro content",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "emirate", media: "heroImage" } },
});
