import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const featureGridBlock = defineType({
  name: "featureGridBlock",
  title: "Feature grid",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 2 }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3,
    }),
    defineField({
      name: "items",
      title: "Features",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "feature",
          fields: [
            defineField({ name: "icon", title: "Icon / emoji", type: "string", description: "Optional single emoji or short label." }),
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Feature grid", subtitle: "Feature grid" }) },
});
