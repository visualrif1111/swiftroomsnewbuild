import { defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const videoBlock = defineType({
  name: "videoBlock",
  title: "Video",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "youtubeId",
      title: "YouTube ID",
      type: "string",
      description: "The video ID only, e.g. dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ",
      validation: (r) => r.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading", subtitle: "youtubeId" }, prepare: ({ title, subtitle }) => ({ title: title || "Video", subtitle: subtitle || "Video" }) },
});
