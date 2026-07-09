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
import type { PageSection } from "@/lib/page";

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

// Deeper per-page "chrome" (section labels, list content, CTA copy) beyond the
// shared hero. Every field is optional — a blank field keeps the page's built-in
// value, so pages render byte-identically until an editor fills something in.
// These live under route-gated object fields on the pageSettings document, so an
// editor only ever sees the block for the route they're editing.
export type HoursRow = { days: string; value: string };

export type ContactChrome = {
  showroomLabel?: string;
  phoneLabel?: string;
  emailLabel?: string;
  hoursLabel?: string;
  hours?: HoursRow[];
  quickLinksEyebrow?: string;
  quickLinks?: { label: string; description: string; href: string }[];
};

export type ShowroomChrome = {
  bookLabel?: string;
  galleryLabel?: string;
  fullBleedCaption?: string;
  displaysEyebrow?: string;
  displaysHeading?: string;
  displays?: { name: string; type: string; description: string; image: string; link: string }[];
  librariesLabel?: string;
  librariesBody?: string;
  librariesButtonLabel?: string;
  visitEyebrow?: string;
  visitSteps?: { num: string; text: string }[];
  alsoLabel?: string;
  alsoList?: string[];
  locationLabel?: string;
  locationNote?: string;
  hoursLabel?: string;
  hours?: HoursRow[];
  callLabel?: string;
  callNote?: string;
  bookFormLabel?: string;
  galleryEyebrow?: string;
  galleryBody?: string;
  galleryViewLabel?: string;
  galleryProjectsLabel?: string;
};

export type EnquireChrome = {
  stats?: { value: string; label: string }[];
  nextLabel?: string;
  nextSteps?: { step: string; text: string }[];
  clientsLabel?: string;
  callLabel?: string;
  callNote?: string;
  visitLabel?: string;
  visitLinkLabel?: string;
};

export type ReviewsChrome = {
  ctaEyebrow?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
};

export type CatalogueChrome = {
  brandsLabel?: string;
  promotionsLabel?: string;
  partnersHeading?: string;
  promoEyebrow?: string;
  promoTitle?: string;
  promoText?: string;
  galleryEyebrow?: string;
  galleryTitle?: string;
  galleryText?: string;
};

export type TechnicalChrome = {
  blogEyebrow?: string;
  blogHeading?: string;
  blogAllLabel?: string;
  faqEyebrow?: string;
  faqHeading?: string;
  faqBody?: string;
  faqButtonLabel?: string;
  ctaEyebrow?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaQuoteLabel?: string;
  ctaShowroomLabel?: string;
};

export type PageSettings = {
  hero: PageHero;
  sections: PageSection[];
  seo: RawSeo;
  contact?: ContactChrome;
  showroom?: ShowroomChrome;
  enquire?: EnquireChrome;
  reviews?: ReviewsChrome;
  catalogue?: CatalogueChrome;
  technical?: TechnicalChrome;
};

// Mirrors the reference expansions in PAGE_QUERY (src/sanity/lib/pageQueries.ts)
// so blocks that reference other documents (testimonials, faqs, brand logos)
// resolve inside pageSettings sections too.
const QUERY = `*[_type == "pageSettings" && route == $route][0]{
  hero,
  seo,
  contact,
  showroom,
  enquire,
  reviews,
  catalogue,
  technical,
  sections[]{
    ...,
    _type == "testimonialsBlock" => {
      testimonials[]->{ _id, quote, author, location, project }
    },
    _type == "faqBlock" => {
      faqs[]->{ _id, question, answer }
    },
    _type == "logosBlock" => {
      brands[]->{ _id, title, logo }
    }
  }
}`;

// Chrome fields are rendered as plain text (stega overlays give click-to-edit),
// so most keep their encoding. Only values used as an href or an <Image> src must
// be stripped, or the URL would carry invisible stega characters and break.
function cleanContact(c: ContactChrome): ContactChrome {
  return {
    ...c,
    quickLinks: c.quickLinks?.map((l) => ({ ...l, href: stegaClean(l.href) })),
  };
}

function cleanShowroom(s: ShowroomChrome): ShowroomChrome {
  return {
    ...s,
    displays: s.displays?.map((d) => ({
      ...d,
      image: stegaClean(d.image),
      link: stegaClean(d.link),
    })),
  };
}

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
      return {
        hero: d.hero ?? {},
        sections: d.sections ?? [],
        seo: d.seo ?? {},
        contact: d.contact ? cleanContact(d.contact) : undefined,
        showroom: d.showroom ? cleanShowroom(d.showroom) : undefined,
        enquire: d.enquire,
        reviews: d.reviews,
        catalogue: d.catalogue,
        technical: d.technical,
      };
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
