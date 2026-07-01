import { defineField, defineType } from "sanity";

// Reusable button/link used by hero, CTA and other blocks.
export const buttonType = defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Internal path (e.g. /contact) or a full URL (https://…).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      options: {
        list: [
          { title: "Primary (filled)", value: "brand" },
          { title: "Outline", value: "outline" },
          { title: "Text link", value: "link" },
        ],
        layout: "radio",
      },
      initialValue: "brand",
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
