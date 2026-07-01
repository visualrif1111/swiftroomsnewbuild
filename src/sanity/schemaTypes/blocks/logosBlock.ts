import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const logosBlock = defineType({
  name: "logosBlock",
  title: "Brand logos",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "brands",
      title: "Brands",
      type: "array",
      description: "Pick brands to display. Manage brands under Content → Brands.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "brand" }] })],
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Brand logos", subtitle: "Brand logos" }) },
});
