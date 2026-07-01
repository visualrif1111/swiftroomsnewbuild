import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const ctaBlock = defineType({
  name: "ctaBlock",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Supporting text", type: "text", rows: 2 }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (r) => r.max(2),
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Call to action", subtitle: "Call to action" }) },
});
