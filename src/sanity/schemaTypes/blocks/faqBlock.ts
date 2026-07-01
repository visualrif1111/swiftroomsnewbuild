import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBaseFields } from "./shared";

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      description: "Pick FAQs to show. Manage FAQs under Support → FAQs.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })],
    }),
    ...sectionBaseFields(),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "FAQ", subtitle: "FAQ" }) },
});
