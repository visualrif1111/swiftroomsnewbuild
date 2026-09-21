// Canonical map of which brands have a public page, and the URL each one uses.
//
// The public paths are fixed externally — these are the URLs already indexed on
// the live domain — so they cannot be derived from the Sanity slug ("cortizo"
// -> "cortizo-aluminium-systems"). This map is the single source of truth for
// that translation and is shared by the /brands routes, the sitemap, the
// catalogue brand index and the Presentation resolver, so the four never drift.
//
// A brand absent from this map deliberately has NO page: Vetro and Vetromax
// exist as `brand` documents and appear on the catalogue index, but have no
// standalone page on the live site. Adding a brand here is all that is needed
// to publish one — the route, sitemap entry and Studio preview follow.
//
// Pure constants only (no React/Sanity imports) so it is safe to pull into the
// Studio config, exactly like `landingRoutes.ts`.

/** Sanity `brand` slug -> public URL segment under /brands. */
export const BRAND_ROUTES: Record<string, string> = {
  cortizo: "cortizo-aluminium-systems",
  deceuninck: "deceuninck-upvc-windows-doors",
  "gulf-extrusions": "gulf-extrusions-aluminium-systems",
  reynaers: "reynaers-aluminium-systems",
  schuco: "schuco-aluminium-windows",
  ultraframe: "ultraframe-roof-systems",
};

export const BRAND_ROUTE_ENTRIES = Object.entries(BRAND_ROUTES);

/** Public URL segment for a Sanity brand slug, or null when it has no page. */
export function brandRouteSlug(sanitySlug: string): string | null {
  return BRAND_ROUTES[sanitySlug] ?? null;
}

/** Full path for a Sanity brand slug, or null when it has no page. */
export function brandHref(sanitySlug: string): string | null {
  const segment = brandRouteSlug(sanitySlug);
  return segment ? `/brands/${segment}` : null;
}

/** Reverse lookup: public URL segment -> Sanity brand slug. */
export function brandSlugFromRoute(routeSlug: string): string | null {
  return BRAND_ROUTE_ENTRIES.find(([, segment]) => segment === routeSlug)?.[0] ?? null;
}

/** Every public URL segment, for generateStaticParams and the sitemap. */
export const BRAND_ROUTE_SLUGS = Object.values(BRAND_ROUTES);
