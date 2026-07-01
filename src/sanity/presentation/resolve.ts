// Presentation tool resolvers.
//
// - `mainDocuments` maps a frontend URL back to the Sanity document that owns it,
//   so navigating the live preview opens the right doc in the editing pane.
// - `locations` maps a Sanity document to the frontend URL(s) where it appears,
//   so editors can jump from a document to its live page.
//
// Blog is wired end-to-end today. Portfolio / Product / Category are scaffolded
// against their real routes and activate automatically once that content is
// migrated. Add new types by extending the two blocks below — the plumbing
// (draft mode, stega, overlays) is already generic.
import { defineDocuments, defineLocations } from "sanity/presentation";

// URL -> document (used when clicking around the live preview iframe)
export const mainDocuments = defineDocuments([
  {
    route: "/technical/blog/:slug",
    filter: `_type == "post" && slug.current == $slug`,
  },
  {
    route: "/portfolio/:slug",
    filter: `_type == "project" && slug.current == $slug`,
  },
  {
    route: "/catalogue/:slug",
    filter: `_type == "productCategory" && slug.current == $slug`,
  },
  {
    route: "/catalogue/:category/:slug",
    filter: `_type == "product" && slug.current == $slug`,
  },
]);

// document -> URL(s) (used from the document pane "open preview" affordance)
export const locations = {
  post: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled post",
          href: `/technical/blog/${doc?.slug}`,
        },
        { title: "Blog index", href: "/technical/blog" },
      ],
    }),
  }),

  project: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || "Untitled project", href: `/portfolio/${doc?.slug}` },
        { title: "Portfolio index", href: "/portfolio" },
      ],
    }),
  }),

  productCategory: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || "Untitled category", href: `/catalogue/${doc?.slug}` },
        { title: "Catalogue index", href: "/catalogue" },
      ],
    }),
  }),

  product: defineLocations({
    select: { title: "title", slug: "slug.current", category: "category->slug.current" },
    resolve: (doc) =>
      doc?.category && doc?.slug
        ? {
            locations: [
              {
                title: doc?.title || "Untitled product",
                href: `/catalogue/${doc.category}/${doc.slug}`,
              },
            ],
          }
        : { message: "Add a category and slug to preview this product." },
  }),

  homepage: defineLocations({
    select: { title: "title" },
    resolve: () => ({ locations: [{ title: "Homepage", href: "/" }] }),
  }),

  siteSettings: defineLocations({
    select: { title: "title" },
    resolve: () => ({
      locations: [{ title: "Home (site-wide settings)", href: "/" }],
    }),
  }),
};
