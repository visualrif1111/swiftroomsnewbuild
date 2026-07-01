import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const testimonialsBlock = defineType({
  name: "testimonialsBlock",
  title: "Testimonials",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      description: "Pick testimonials to feature. Manage the testimonials themselves under About & Company → Testimonials.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "testimonial" }] })],
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Testimonials", subtitle: "Testimonials" }) },
});
