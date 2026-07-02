// Shared reader for `pageSettings` documents (one per hard-coded landing route).
//
// - `getPageSettings(route)` returns the editable hero chrome for a page, or
//   null when Sanity isn't configured / the doc doesn't exist. Draft-aware so
//   edits show live in the Presentation tool; falls back safely otherwise.
// - `pageMetadata(route, defaults)` merges the doc's SEO over a page's existing
//   hard-coded Metadata, so pages keep their current output until an editor
//   fills a field in.
//
// Mirrors the draft-mode + projectId-guard pattern used in src/lib/homepage.ts.
import type { Metadata } from "next";
import { cache } from "react";
import { draftMode } from "next/headers";
import { stegaClean } from "next-sanity";
import { SITE_URL } from "@/lib/site";
import { urlFor } from "@/sanity/lib/image";

export type PageHero = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
};

type RawSeo = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  openGraphImage?: unknown;
  noIndex?: boolean;
};

export type PageSettings = {
  hero: PageHero;
  seo: RawSeo;
};

const QUERY = `*[_type == "pageSettings" && route == $route][0]{
  hero, seo
}`;

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export const getPageSettings = cache(
  async (route: string): Promise<PageSettings | null> => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return null;
    try {
      let d: PageSettings | null;
      if (await isDraft()) {
        const { sanityFetch } = await import("@/sanity/lib/live");
        d = (await sanityFetch({ query: QUERY, params: { route } })).data as PageSettings | null;
      } else {
        const { client } = await import("@/sanity/lib/client");
        d = await client.fetch<PageSettings | null>(QUERY, { route }, { next: { revalidate: 60 } });
      }
      if (!d) return null;
      return { hero: d.hero ?? {}, seo: d.seo ?? {} };
    } catch {
      return null;
    }
  }
);

// Merge a pageSettings document's SEO over a page's existing Metadata. Any field
// left blank in Sanity keeps the page's current hard-coded value — so the live
// output never regresses before/without seeding.
export async function pageMetadata(route: string, defaults: Metadata): Promise<Metadata> {
  const ps = await getPageSettings(route);
  const seo = ps?.seo;
  if (!seo) return defaults;

  const title = stegaClean(seo.seoTitle) || (defaults.title as string | undefined);
  const description = stegaClean(seo.seoDescription) || (defaults.description as string | undefined);
  const canonical =
    stegaClean(seo.canonicalUrl) ||
    (defaults.alternates?.canonical as string | undefined) ||
    `${SITE_URL}${route}`;

  let ogImage: string | undefined;
  try {
    if (seo.openGraphImage) ogImage = urlFor(seo.openGraphImage as never).width(1200).url();
  } catch {
    ogImage = undefined;
  }

  const baseOg = defaults.openGraph ?? {};
  return {
    ...defaults,
    title,
    description,
    alternates: { ...defaults.alternates, canonical },
    robots: seo.noIndex ? { index: false, follow: false } : defaults.robots,
    openGraph: {
      ...baseOg,
      title: (baseOg as { title?: string }).title ?? title,
      description: (baseOg as { description?: string }).description ?? description,
      url: canonical,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}
