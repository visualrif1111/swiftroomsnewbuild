import { defineField } from "sanity";

// Common per-section controls shared by every page-builder block. Spread these
// into each block's `fields` so editors get consistent hide / anchor /
// background options on every section.
export const sectionBaseFields = () => [
  defineField({
    name: "hidden",
    title: "Hide this section",
    type: "boolean",
    description: "Temporarily remove this section from the live site without deleting it.",
    initialValue: false,
  }),
  defineField({
    name: "anchorId",
    title: "Anchor ID",
    type: "string",
    description: "Optional. Lets other links jump to this section, e.g. #pricing.",
  }),
  defineField({
    name: "background",
    title: "Background",
    type: "string",
    description: "Section background colour.",
    options: {
      list: [
        { title: "White", value: "white" },
        { title: "Light grey", value: "alt" },
        { title: "Dark", value: "dark" },
        { title: "Brand green", value: "brand" },
      ],
      layout: "radio",
    },
    initialValue: "white",
  }),
];

// Reusable image field with alt text + hotspot, used across blocks.
export const imageField = (name = "image", title = "Image") =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "Describe the image for accessibility & SEO.",
      }),
    ],
  });
