import { defineField, defineType } from "sanity";

// FAQ — a single question/answer, categorised. Optionally tied to a product
// category (for the per-category FAQ accordions).
export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      validation: (r) => r.required(),
      options: {
        list: ["Products", "Installation", "Maintenance", "Pricing", "Warranty", "General"],
      },
    }),
    defineField({
      name: "productCategory",
      title: "Product category (optional)",
      description: "Set for FAQs shown on a specific product category page.",
      type: "reference",
      weak: true,
      to: [{ type: "productCategory" }],
    }),
  ],
  preview: { select: { title: "question", subtitle: "category" } },
});
