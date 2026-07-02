// Presentation tool resolvers.
//
// - `mainDocuments` maps a frontend URL back to the Sanity document that owns it,
//   so navigating the live preview opens the right doc in the editing pane.
// - `locations` maps a Sanity document to the frontend URL(s) where it appears,
//   so editors can jump from a document to its live page.
//
// Route order matters: Presentation matches the FIRST route pattern whose query
// resolves a document, and a matched pattern with an empty result shows the
// "Missing a main document" notice (it does NOT fall through). So the resolution
// order below is deliberate:
//   1. Landing routes (exact literals)  → pageSettings, keyed by `route`.
//      Listed first so e.g. "/catalogue/brands" resolves here instead of being
//      captured by the "/catalogue/:slug" productCategory pattern.
//   2. Collection detail routes (params) → their owning document.
//   3. A nested-slug-aware catch-all      → page-builder `page` documents. This
//      also covers arbitrarily deep page slugs ("/a/b/c"), which the previous
//      single-segment "/:slug" rule missed.
import { defineDocuments, defineLocations } from "sanity/presentation";
import { LANDING_ROUTES } from "@/lib/landingRoutes";

// URL -> document (used when clicking around the live preview iframe)
export const mainDocuments = defineDocuments([
  // 1. Homepage singleton lives at the site root.
  {
    route: "/",
    filter: `_type == "homepage"`,
  },
  // 1b. Composed landing/index pages -> their pageSettings document. Exact
  //     literal routes, so they only match their own URL and win over the
  //     parameterised collection routes below.
  ...LANDING_ROUTES.map(({ route }) => ({
    route,
    filter: `_type == "pageSettings" && route == "${route}"`,
  })),
  // 2. Collection detail pages -> the individual document.
  {
    route: "/technical/blog/:slug",
    filter: `_type == "post" && slug.current == $slug`,
  },
  {
    route: "/portfolio/:slug",
    filter: `_type == "project" && slug.current == $slug`,
  },
  {
    route: "/catalogue/:category/:slug",
    filter: `_type == "product" && slug.current == $slug`,
  },
  {
    route: "/catalogue/:slug",
    filter: `_type == "productCategory" && slug.current == $slug`,
  },
  // 3. Page-builder pages at arbitrary (possibly nested) paths.
  {
    route: "/:slug(.*)",
    filter: `_type == "page" && slug.current == $slug`,
  },
]);

// document -> URL(s) (used from the document pane "open preview" affordance)
export const locations = {
  pageSettings: defineLocations({
    select: { label: "label", route: "route" },
    resolve: (doc) => ({
      locations: doc?.route
        ? [{ title: doc?.label || doc.route, href: doc.route }]
        : [],
    }),
  }),

  page: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: doc?.slug
        ? [{ title: doc?.title || "Page", href: `/${doc.slug}` }]
        : [],
    }),
  }),

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

  brand: defineLocations({
    select: { name: "name" },
    resolve: (doc) => ({
      locations: [{ title: doc?.name || "Brand", href: "/catalogue/brands" }],
    }),
  }),

  faq: defineLocations({
    select: { question: "question" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.question || "FAQ", href: "/technical/faq" },
      ],
    }),
  }),

  resource: defineLocations({
    select: { title: "title" },
    resolve: (doc) => ({
      locations: [{ title: doc?.title || "Resource", href: "/technical/resources" }],
    }),
  }),

  processStep: defineLocations({
    select: { title: "title" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || "Process step", href: "/technical/process" },
        { title: "Homepage", href: "/" },
      ],
    }),
  }),

  certification: defineLocations({
    select: { name: "name" },
    resolve: (doc) => ({
      locations: [{ title: doc?.name || "Certification", href: "/about" }],
    }),
  }),

  timelineEntry: defineLocations({
    select: { title: "title", year: "year" },
    resolve: (doc) => ({
      locations: [{ title: doc?.title || doc?.year || "Timeline entry", href: "/about" }],
    }),
  }),

  testimonial: defineLocations({
    select: { author: "author" },
    resolve: (doc) => ({
      locations: [
        { title: doc?.author ? `${doc.author} (review)` : "Testimonial", href: "/reviews" },
        { title: "Homepage", href: "/" },
      ],
    }),
  }),

  teamMember: defineLocations({
    select: { name: "name" },
    resolve: (doc) => ({
      locations: [{ title: doc?.name || "Team member", href: "/about" }],
    }),
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

  productPageSettings: defineLocations({
    select: { title: "title" },
    resolve: () => ({
      locations: [{ title: "Catalogue (affects all product pages)", href: "/catalogue" }],
    }),
  }),
};
