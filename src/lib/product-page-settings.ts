// Product page settings: shared section labels + CTA copy for every product
// detail page, from the `productPageSettings` singleton. Defaults match the
// current hardcoded copy so nothing changes when Sanity is blank. Draft-aware
// (mirrors the rest of the CMS) so the chrome is click-to-editable in
// Presentation; all fields are display-only, so no stega stripping is needed.
import { cache } from "react";
import { groq } from "next-sanity";
import { draftMode } from "next/headers";

export type ProductPageSettings = {
  heroEnquireLabel: string;
  heroShowroomLabel: string;
  introEyebrow: string;
  specsEyebrow: string;
  specsHeading: string;
  specsFootnote: string;
  featuresEyebrow: string;
  featuresHeading: string;
  galleryEyebrow: string;
  galleryHeading: string;
  downloadsEyebrow: string;
  downloadsHeading: string;
  installedEyebrow: string;
  installedHeading: string;
  readingEyebrow: string;
  readingHeading: string;
  ctaHeading: string;
  ctaBody: string;
  ctaEnquireLabel: string;
  ctaShowroomLabel: string;
};

const DEFAULTS: ProductPageSettings = {
  heroEnquireLabel: "Enquire About This Product",
  heroShowroomLabel: "See It In Our Showroom",
  introEyebrow: "Product Introduction",
  specsEyebrow: "Technical Specifications",
  specsHeading: "Performance data.",
  specsFootnote:
    "Specifications shown are manufacturer-published values. Contact our technical team for project-specific performance data or independent test reports.",
  featuresEyebrow: "Key Features",
  featuresHeading: "What sets it apart.",
  galleryEyebrow: "Gallery",
  galleryHeading: "Installed & at scale.",
  downloadsEyebrow: "Downloads",
  downloadsHeading: "Technical documentation.",
  installedEyebrow: "Installed Projects",
  installedHeading: "See it in completed projects.",
  readingEyebrow: "Technical Insights",
  readingHeading: "Further reading.",
  ctaHeading: "Get a specification and quote",
  ctaBody: "Our team will assess your project requirements and provide a detailed quotation for this system.",
  ctaEnquireLabel: "Enquire Now",
  ctaShowroomLabel: "Book Showroom Visit",
};

const QUERY = groq`*[_id == "productPageSettings"][0]`;

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export const getProductPageSettings = cache(async (): Promise<ProductPageSettings> => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return DEFAULTS;
  try {
    let d: Partial<ProductPageSettings> | null;
    if (await isDraft()) {
      const { sanityFetch } = await import("@/sanity/lib/live");
      d = (await sanityFetch({ query: QUERY })).data as Partial<ProductPageSettings> | null;
    } else {
      const { client } = await import("@/sanity/lib/client");
      d = await client.fetch<Partial<ProductPageSettings> | null>(QUERY, {}, { next: { revalidate: 60 } });
    }
    if (!d) return DEFAULTS;
    const out = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as (keyof ProductPageSettings)[]) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) out[key] = v;
    }
    return out;
  } catch {
    return DEFAULTS;
  }
});
