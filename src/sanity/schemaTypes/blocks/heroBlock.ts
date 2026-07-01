import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField, sectionBaseFields } from "./shared";

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", description: "Small label above the heading." }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (r) => r.required().max(120) }),
    defineField({ name: "subheading", title: "Subheading", type: "text", rows: 3, validation: (r) => r.max(280) }),
    imageField("image", "Background image"),
    defineField({
      name: "align",
      title: "Text alignment",
      type: "string",
      options: { list: ["left", "center"], layout: "radio" },
      initialValue: "left",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (r) => r.max(2),
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Hero", subtitle: "Hero", media }) },
});
