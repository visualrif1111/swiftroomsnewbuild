import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField, sectionBaseFields } from "./shared";

export const galleryBlock = defineType({
  name: "galleryBlock",
  title: "Gallery",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3,
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [defineArrayMember({ ...imageField("image", "Image"), name: "galleryImage", type: "image" })],
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Gallery", subtitle: "Gallery" }) },
});
