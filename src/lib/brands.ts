// Brands data layer: Sanity-first with a data.ts fallback.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { brands as dataBrands, type Brand } from "@/lib/data";
import { brandRouteSlug, brandSlugFromRoute } from "@/lib/brandRoutes";

export type BrandSeo = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  openGraphImage?: unknown;
  noIndex?: boolean;
};

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  country: string;
  tagline: string;
  description: string;
  logo?: string;
  /** Editorial imagery for the brand detail page. */
  gallery: string[];
  speciality: string[];
  seo?: BrandSeo;
};

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

// Curated display order; specialities come from data.ts where available.
const ORDER = ["cortizo", "vetro", "vetromax", "gulf-extrusions", "reynaers", "schuco", "deceuninck", "ultraframe"];
const orderIndex = (slug: string) => {
  const i = ORDER.indexOf(slug);
  return i === -1 ? ORDER.length : i;
};
const specByName = new Map(dataBrands.map((b) => [b.name.toLowerCase(), b.speciality ?? []]));

function fromData(b: Brand): BrandItem {
  return {
    id: b.id,
    name: b.name,
    slug: b.id,
    country: b.country,
    tagline: b.tagline,
    description: b.description,
    gallery: [],
    speciality: b.speciality ?? [],
  };
}

type Raw = {
  id: string;
  title: string;
  slug: string;
  country?: string;
  tagline?: string;
  description?: string;
  logo?: string | null;
  gallery?: (string | null)[] | null;
  seo?: BrandSeo | null;
};

function fromSanity(b: Raw): BrandItem {
  return {
    id: b.slug,
    name: b.title,
    // Slugs drive routing, so strip any stega-encoded draft metadata.
    slug: stegaClean(b.slug),
    country: b.country ?? "",
    tagline: b.tagline ?? "",
    description: b.description ?? "",
    logo: b.logo ?? undefined,
    gallery: (b.gallery ?? []).filter((url): url is string => Boolean(url)),
    speciality: specByName.get((b.title ?? "").toLowerCase()) ?? [],
    seo: b.seo ?? undefined,
  };
}

const BRANDS_QUERY = groq`*[_type == "brand"]{
  "id": _id, title, "slug": slug.current, country, tagline, description,
  "logo": logo.asset->url,
  "gallery": gallery[].asset->url,
  seo
}`;

export const getBrands = cache(async (): Promise<BrandItem[]> => {
  if (sanityConfigured()) {
    try {
      const { client } = await import("@/sanity/lib/client");
      const rows: Raw[] = await client.fetch(BRANDS_QUERY, {}, { next: { revalidate: 60 } });
      if (rows?.length) {
        return rows.map(fromSanity).sort((a, b) => orderIndex(a.slug) - orderIndex(b.slug));
      }
    } catch {
      // fall through
    }
  }
  return dataBrands.map(fromData);
});

/** A single brand by its Sanity slug, or null when nothing matches. */
export const getBrand = cache(async (slug: string): Promise<BrandItem | null> => {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug) ?? null;
});

/**
 * A brand by its public URL segment (e.g. "cortizo-aluminium-systems").
 * Returns null for brands that have no page, so unmapped slugs 404.
 */
export const getBrandByRoute = cache(async (routeSlug: string): Promise<BrandItem | null> => {
  const sanitySlug = brandSlugFromRoute(routeSlug);
  return sanitySlug ? getBrand(sanitySlug) : null;
});

/** Brands that have a public page, in the curated display order. */
export const getPublishedBrands = cache(async (): Promise<BrandItem[]> => {
  const brands = await getBrands();
  return brands.filter((b) => brandRouteSlug(b.slug));
});
