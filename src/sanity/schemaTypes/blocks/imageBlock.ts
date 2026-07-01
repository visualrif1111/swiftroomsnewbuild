import { defineField, defineType } from "sanity";
import { imageField, sectionBaseFields } from "./shared";

export const imageBlock = defineType({
  name: "imageBlock",
  title: "Image",
  type: "object",
  fields: [
    imageField("image", "Image"),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "width",
      title: "Width",
      type: "string",
      options: { list: [{ title: "Full bleed", value: "full" }, { title: "Wide", value: "wide" }, { title: "Narrow", value: "narrow" }], layout: "radio" },
      initialValue: "wide",
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "caption", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Image", subtitle: "Image", media }) },
});
