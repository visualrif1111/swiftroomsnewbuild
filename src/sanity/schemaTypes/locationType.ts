import { defineField, defineType } from "sanity";

// Portfolio Location — a place a project was delivered (e.g. "Al Barari").
// Projects reference a location, so the portfolio can be browsed/filtered by place.
export const locationType = defineType({
  name: "location",
  title: "Portfolio Location",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emirate",
      title: "Emirate",
      type: "string",
      options: {
        list: [
          "Dubai",
          "Abu Dhabi",
          "Sharjah",
          "Ajman",
          "Ras Al Khaimah",
          "Fujairah",
          "Umm Al Quwain",
        ],
      },
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "name", subtitle: "emirate" } },
});
