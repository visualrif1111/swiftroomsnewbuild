import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const richTextBlock = defineType({
  name: "richTextBlock",
  title: "Rich text",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", description: "Optional section heading." }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alt text" })] }),
      ],
    }),
    defineField({
      name: "width",
      title: "Content width",
      type: "string",
      options: { list: [{ title: "Narrow (article)", value: "narrow" }, { title: "Wide", value: "wide" }], layout: "radio" },
      initialValue: "narrow",
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Rich text", subtitle: "Rich text" }) },
});
