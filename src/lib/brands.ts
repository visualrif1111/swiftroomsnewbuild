// Brands data layer: Sanity-first with a data.ts fallback.
import { cache } from "react";
import { groq } from "next-sanity";
import { brands as dataBrands, type Brand } from "@/lib/data";

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  country: string;
  tagline: string;
  description: string;
  logo?: string;
  speciality: string[];
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
    speciality: b.speciality ?? [],
  };
}

type Raw = { id: string; title: string; slug: string; country?: string; tagline?: string; description?: string; logo?: string | null };

function fromSanity(b: Raw): BrandItem {
  return {
    id: b.slug,
    name: b.title,
    slug: b.slug,
    country: b.country ?? "",
    tagline: b.tagline ?? "",
    description: b.description ?? "",
    logo: b.logo ?? undefined,
    speciality: specByName.get((b.title ?? "").toLowerCase()) ?? [],
  };
}

const BRANDS_QUERY = groq`*[_type == "brand"]{ "id": _id, title, "slug": slug.current, country, tagline, description, "logo": logo.asset->url }`;

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
