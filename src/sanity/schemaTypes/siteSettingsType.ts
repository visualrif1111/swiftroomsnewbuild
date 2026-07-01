import { defineField, defineType } from "sanity";

// Site Settings — a singleton (_id "siteSettings") for global company, contact,
// showroom, social, footer and CTA configuration.
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "company", title: "Company & Contact", default: true },
    { name: "showroom", title: "Showroom" },
    { name: "header", title: "Navigation" },
    { name: "nav", title: "Footer & Social" },
    { name: "footer", title: "Footer content" },
    { name: "cta", title: "CTA" },
  ],
  fields: [
    defineField({
      name: "company",
      title: "Company information",
      type: "object",
      group: "company",
      fields: [
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "foundedYear", title: "Founded year", type: "string" }),
        defineField({ name: "tagline", title: "Tagline", type: "string" }),
        defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact information",
      type: "object",
      group: "company",
      fields: [
        defineField({ name: "phone", title: "Phone (display)", type: "string" }),
        defineField({ name: "phoneRaw", title: "Phone (tel: link)", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "whatsapp", title: "WhatsApp number", type: "string" }),
      ],
    }),
    defineField({
      name: "showroom",
      title: "Showroom",
      type: "object",
      group: "showroom",
      fields: [
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "addressLine1", title: "Address line 1", type: "string" }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "country", title: "Country", type: "string" }),
        defineField({ name: "latitude", title: "Latitude", type: "number" }),
        defineField({ name: "longitude", title: "Longitude", type: "number" }),
        defineField({
          name: "hours",
          title: "Opening hours",
          type: "array",
          of: [
            defineField({
              name: "hourRow",
              type: "object",
              fields: [
                defineField({ name: "days", title: "Days", type: "string" }),
                defineField({ name: "opens", title: "Opens", type: "string" }),
                defineField({ name: "closes", title: "Closes", type: "string" }),
              ],
              preview: { select: { title: "days", subtitle: "opens" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      group: "nav",
      of: [
        defineField({
          name: "socialLink",
          type: "object",
          fields: [
            defineField({ name: "platform", title: "Platform", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "footerLinks",
      title: "Footer link groups",
      type: "array",
      group: "nav",
      of: [
        defineField({
          name: "group",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                defineField({
                  name: "link",
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "href", title: "Href", type: "string" }),
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
    defineField({
      name: "navigation",
      title: "Header navigation",
      type: "object",
      group: "header",
      description: "Header menu labels & links. Leave blank to keep the current defaults.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "catalogueBlurb", title: "Catalogue menu — blurb", type: "text", rows: 2 }),
        defineField({
          name: "catalogue",
          title: "Catalogue menu — links",
          type: "array",
          of: [
            defineField({
              name: "navLink",
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "href", title: "Link", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "href" } },
            }),
          ],
        }),
        defineField({ name: "technicalBlurb", title: "Technical menu — blurb", type: "text", rows: 2 }),
        defineField({
          name: "technical",
          title: "Technical menu — links",
          type: "array",
          of: [
            defineField({
              name: "navLink",
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "href", title: "Link", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "href" } },
            }),
          ],
        }),
        defineField({
          name: "mobile",
          title: "Mobile menu — links",
          type: "array",
          of: [
            defineField({
              name: "navLink",
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "href", title: "Link", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "href" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer content",
      type: "object",
      group: "footer",
      description: "Editable footer text. Leave blank to keep the current defaults.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "brandBlurb", title: "Brand blurb", type: "text", rows: 3 }),
        defineField({ name: "ctaHeading", title: "CTA strip — heading", type: "string" }),
        defineField({ name: "ctaSubtext", title: "CTA strip — subtext", type: "string" }),
        defineField({ name: "brandPartners", title: "Brand partners", type: "array", of: [{ type: "string" }] }),
        defineField({ name: "bottomTagline", title: "Bottom bar tagline", type: "string" }),
      ],
    }),
    defineField({
      name: "cta",
      title: "CTA settings",
      type: "object",
      group: "cta",
      fields: [
        defineField({ name: "quoteLabel", title: "Quote button label", type: "string" }),
        defineField({ name: "quoteHref", title: "Quote button href", type: "string" }),
        defineField({ name: "showroomLabel", title: "Showroom button label", type: "string" }),
        defineField({ name: "showroomHref", title: "Showroom button href", type: "string" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
