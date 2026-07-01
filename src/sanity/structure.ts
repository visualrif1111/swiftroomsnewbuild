import type { StructureResolver } from "sanity/structure";

// Custom Studio navigation, grouped so non-developers can find what each area
// controls. Every document type stays reachable. `homepage` and `siteSettings`
// are true singletons (fixed _id) so they open the one editable document
// directly instead of a list.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Swiftrooms Content")
    .items([
      // ── Content ─────────────────────────────────────────────
      S.listItem()
        .id("content")
        .title("Content")
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("post").title("Blog Posts"),
              S.documentTypeListItem("project").title("Portfolio Projects"),
              S.documentTypeListItem("productCategory").title("Product Categories"),
              S.documentTypeListItem("product").title("Products"),
              S.documentTypeListItem("brand").title("Brands"),
            ])
        ),

      S.divider(),

      // ── Support ─────────────────────────────────────────────
      S.listItem()
        .id("support")
        .title("Support")
        .child(
          S.list()
            .title("Support")
            .items([
              S.documentTypeListItem("faq").title("FAQs"),
              S.documentTypeListItem("resource").title("Resources"),
            ])
        ),

      // ── About / Company ─────────────────────────────────────
      S.listItem()
        .id("aboutCompany")
        .title("About & Company")
        .child(
          S.list()
            .title("About & Company")
            .items([
              S.documentTypeListItem("teamMember").title("Team Members"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("timelineEntry").title("Company Timeline"),
              S.documentTypeListItem("processStep").title("Process Steps"),
              S.documentTypeListItem("certification").title("Certifications"),
              S.documentTypeListItem("location").title("Project Locations"),
            ])
        ),

      S.divider(),

      // ── Site Management (singletons) ────────────────────────
      S.listItem()
        .title("Homepage Settings")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
