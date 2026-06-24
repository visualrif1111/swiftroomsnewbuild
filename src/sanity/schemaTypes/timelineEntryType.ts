import { defineField, defineType } from "sanity";

export const timelineEntryType = defineType({
  name: "timelineEntry",
  title: "Timeline Entry",
  type: "document",
  fields: [
    defineField({ name: "year", title: "Year", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "year" } },
});
