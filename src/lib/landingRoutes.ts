// Canonical list of hard-coded landing/index routes that are composed from many
// documents and therefore need a `pageSettings` document to (a) give the
// Presentation tool a main document to resolve (removing the "Missing a main
// document" notice) and (b) hold their editable hero + SEO chrome.
//
// Shared by the Presentation resolver (src/sanity/presentation/resolve.ts) and
// the seed script (scripts/migrate-page-settings-to-sanity.ts) so the two never
// drift. Dynamic routes (/portfolio/[slug], /catalogue/[slug], …), the homepage
// singleton and /studio are intentionally excluded — they already resolve to
// their own documents.
export type LandingRoute = { route: string; label: string };

export const LANDING_ROUTES: LandingRoute[] = [
  { route: "/about", label: "About" },
  { route: "/portfolio", label: "Portfolio (index)" },
  { route: "/reviews", label: "Reviews" },
  { route: "/enquire", label: "Enquire / Get a Quote" },
  { route: "/contact", label: "Contact" },
  { route: "/showroom", label: "Showroom" },
  { route: "/catalogue", label: "Catalogue (index)" },
  { route: "/catalogue/brands", label: "Catalogue — Brands" },
  { route: "/catalogue/gallery", label: "Catalogue — Gallery" },
  { route: "/catalogue/promotions", label: "Catalogue — Promotions" },
  { route: "/catalogue/gallery/4900", label: "Gallery — 4900 Showroom" },
  { route: "/catalogue/gallery/cor-vision", label: "Gallery — Cor Vision" },
  { route: "/catalogue/gallery/cor-vision-plus", label: "Gallery — Cor Vision Plus" },
  { route: "/technical", label: "Technical Hub" },
  { route: "/technical/blog", label: "Technical — Blog (index)" },
  { route: "/technical/faq", label: "Technical — FAQ" },
  { route: "/technical/process", label: "Technical — Process" },
  { route: "/technical/resources", label: "Technical — Resources" },
];

// Deterministic document _id for a route, so the seed is idempotent and the
// Presentation resolver always finds the same document.
// "/about" -> "pageSettings.about", "/catalogue/gallery/4900" -> "pageSettings.catalogue-gallery-4900"
export function pageSettingsId(route: string): string {
  const key = route.replace(/^\//, "").replace(/\//g, "-") || "home";
  return `pageSettings.${key}`;
}
