import { defineArrayMember, defineField, defineType } from "sanity";

// Landing-page settings — one document per hard-coded route (e.g. "/about",
// "/technical", "/catalogue"). These pages are composed from many collections
// (team, FAQs, categories, …) so they have no single "owning" document; this
// singleton holds the page-level editable chrome (hero heading/intro + SEO) and
// gives the Presentation tool a main document to resolve for the URL — which is
// what removes the "Missing a main document for /x" notice.
//
// `route` is the canonical key (matched by the Presentation resolver and read
// by the frontend). It is fixed per document and should not be edited.
export const pageSettingsType = defineType({
  name: "pageSettings",
  title: "Landing Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Page content" },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "route",
      title: "Route (fixed)",
      type: "string",
      description: 'The URL this document controls, e.g. "/about". Do not change.',
      group: "hero",
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "For the CMS list only — not shown on the page.",
      group: "hero",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      description:
        "Page hero. Leave any field blank to keep the current built-in text for that page.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow / label", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "text", rows: 2 }),
        defineField({ name: "subheading", title: "Subheading", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "sections",
      description:
        "Optional extra content blocks rendered below this page's built-in content. Drag to reorder, or use the ⋮ menu to add, duplicate, hide or remove. Leave empty to keep the page exactly as it is.",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "richTextBlock" }),
        defineArrayMember({ type: "imageBlock" }),
        defineArrayMember({ type: "galleryBlock" }),
        defineArrayMember({ type: "videoBlock" }),
        defineArrayMember({ type: "statsBlock" }),
        defineArrayMember({ type: "featureGridBlock" }),
        defineArrayMember({ type: "testimonialsBlock" }),
        defineArrayMember({ type: "logosBlock" }),
        defineArrayMember({ type: "faqBlock" }),
        defineArrayMember({ type: "ctaBlock" }),
      ],
    }),
    // ── Per-page "chrome" ────────────────────────────────────────────────────
    // Route-gated objects: only the block matching this document's route shows.
    // Every field is optional — blank keeps the page's built-in copy.
    defineField({
      name: "contact",
      title: "Contact page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/contact",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "showroomLabel", title: "Showroom label", type: "string" }),
        defineField({ name: "phoneLabel", title: "Telephone label", type: "string" }),
        defineField({ name: "emailLabel", title: "Email label", type: "string" }),
        defineField({ name: "hoursLabel", title: "Business-hours label", type: "string" }),
        defineField({
          name: "hours",
          title: "Business hours",
          type: "array",
          of: [hoursRow()],
        }),
        defineField({ name: "quickLinksEyebrow", title: "Quick-links eyebrow", type: "string" }),
        defineField({
          name: "quickLinks",
          title: "Quick links",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
                defineField({ name: "href", title: "URL / path", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "href" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "showroom",
      title: "Showroom page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/showroom",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "bookLabel", title: "Hero — book button", type: "string" }),
        defineField({ name: "galleryLabel", title: "Hero — gallery button", type: "string" }),
        defineField({ name: "fullBleedCaption", title: "Full-bleed image caption", type: "string" }),
        defineField({ name: "displaysEyebrow", title: "On display — eyebrow", type: "string" }),
        defineField({ name: "displaysHeading", title: "On display — heading", type: "string" }),
        defineField({
          name: "displays",
          title: "Display cards",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "name", title: "Name", type: "string" }),
                defineField({ name: "type", title: "Type / label", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
                defineField({ name: "image", title: "Image URL", type: "url" }),
                defineField({ name: "link", title: "Product link", type: "string" }),
              ],
              preview: { select: { title: "name", subtitle: "type" } },
            }),
          ],
        }),
        defineField({ name: "librariesLabel", title: "Libraries card — label", type: "string" }),
        defineField({ name: "librariesBody", title: "Libraries card — body", type: "text", rows: 3 }),
        defineField({ name: "librariesButtonLabel", title: "Libraries card — button", type: "string" }),
        defineField({ name: "visitEyebrow", title: "Visit steps — eyebrow", type: "string" }),
        defineField({
          name: "visitSteps",
          title: "Visit steps",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "num", title: "Number", type: "string" }),
                defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
              ],
              preview: { select: { title: "num", subtitle: "text" } },
            }),
          ],
        }),
        defineField({ name: "alsoLabel", title: "Also on display — label", type: "string" }),
        defineField({ name: "alsoList", title: "Also on display — items", type: "array", of: [{ type: "string" }] }),
        defineField({ name: "locationLabel", title: "Location — label", type: "string" }),
        defineField({ name: "locationNote", title: "Location — note", type: "text", rows: 2 }),
        defineField({ name: "hoursLabel", title: "Opening hours — label", type: "string" }),
        defineField({ name: "hours", title: "Opening hours", type: "array", of: [hoursRow()] }),
        defineField({ name: "callLabel", title: "Call — label", type: "string" }),
        defineField({ name: "callNote", title: "Call — note", type: "string" }),
        defineField({ name: "bookFormLabel", title: "Booking form — label", type: "string" }),
        defineField({ name: "galleryEyebrow", title: "Gallery link — eyebrow", type: "string" }),
        defineField({ name: "galleryBody", title: "Gallery link — body", type: "text", rows: 3 }),
        defineField({ name: "galleryViewLabel", title: "Gallery link — view button", type: "string" }),
        defineField({ name: "galleryProjectsLabel", title: "Gallery link — projects button", type: "string" }),
      ],
    }),
    defineField({
      name: "enquire",
      title: "Enquire page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/enquire",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "stats",
          title: "Trust stats",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "value", title: "Value", type: "string" }),
                defineField({ name: "label", title: "Label", type: "string" }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
        }),
        defineField({ name: "nextLabel", title: "'What happens next' label", type: "string" }),
        defineField({
          name: "nextSteps",
          title: "'What happens next' steps",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "step", title: "Number", type: "string" }),
                defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
              ],
              preview: { select: { title: "step", subtitle: "text" } },
            }),
          ],
        }),
        defineField({ name: "clientsLabel", title: "'What clients say' label", type: "string" }),
        defineField({ name: "callLabel", title: "'Prefer to call' label", type: "string" }),
        defineField({ name: "callNote", title: "Call note", type: "string" }),
        defineField({ name: "visitLabel", title: "'Or visit us' label", type: "string" }),
        defineField({ name: "visitLinkLabel", title: "'Or visit us' link label", type: "string" }),
      ],
    }),
    defineField({
      name: "reviews",
      title: "Reviews page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/reviews",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "ctaEyebrow", title: "CTA — eyebrow", type: "string" }),
        defineField({ name: "ctaHeading", title: "CTA — heading", type: "string" }),
        defineField({ name: "ctaBody", title: "CTA — body", type: "text", rows: 3 }),
        defineField({ name: "ctaButtonLabel", title: "CTA — button", type: "string" }),
      ],
    }),
    defineField({
      name: "catalogue",
      title: "Catalogue page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/catalogue",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "brandsLabel", title: "Quick link — Brands label", type: "string" }),
        defineField({ name: "promotionsLabel", title: "Quick link — Promotions label", type: "string" }),
        defineField({ name: "partnersHeading", title: "Partner brands — heading", type: "string" }),
        defineField({ name: "promoEyebrow", title: "Promotions card — eyebrow", type: "string" }),
        defineField({ name: "promoTitle", title: "Promotions card — title", type: "string" }),
        defineField({ name: "promoText", title: "Promotions card — text", type: "string" }),
        defineField({ name: "galleryEyebrow", title: "Gallery card — eyebrow", type: "string" }),
        defineField({ name: "galleryTitle", title: "Gallery card — title", type: "string" }),
        defineField({ name: "galleryText", title: "Gallery card — text", type: "string" }),
      ],
    }),
    defineField({
      name: "technical",
      title: "Technical hub page",
      type: "object",
      group: "content",
      hidden: ({ document }) => document?.route !== "/technical",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "blogEyebrow", title: "Blog — eyebrow", type: "string" }),
        defineField({ name: "blogHeading", title: "Blog — heading", type: "string" }),
        defineField({ name: "blogAllLabel", title: "Blog — 'all articles' link", type: "string" }),
        defineField({ name: "faqEyebrow", title: "FAQ — eyebrow", type: "string" }),
        defineField({ name: "faqHeading", title: "FAQ — heading", type: "string" }),
        defineField({ name: "faqBody", title: "FAQ — body", type: "text", rows: 3 }),
        defineField({ name: "faqButtonLabel", title: "FAQ — button", type: "string" }),
        defineField({ name: "ctaEyebrow", title: "CTA — eyebrow", type: "string" }),
        defineField({ name: "ctaHeading", title: "CTA — heading", type: "string" }),
        defineField({ name: "ctaBody", title: "CTA — body", type: "text", rows: 3 }),
        defineField({ name: "ctaQuoteLabel", title: "CTA — quote button", type: "string" }),
        defineField({ name: "ctaShowroomLabel", title: "CTA — showroom button", type: "string" }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "label", subtitle: "route" },
  },
});

// A { days, value } row, reused by the contact + showroom hours arrays.
function hoursRow() {
  return defineArrayMember({
    type: "object",
    fields: [
      defineField({ name: "days", title: "Days", type: "string" }),
      defineField({ name: "value", title: "Value", type: "string" }),
    ],
    preview: { select: { title: "days", subtitle: "value" } },
  });
}
