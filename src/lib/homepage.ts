// Homepage settings: the editable hero/CTA text from the Sanity `homepage`
// singleton, with defaults that match the current hardcoded values (so the
// build/site never changes if Sanity is unavailable or a field is blank).
import { cache } from "react";
import { groq } from "next-sanity";

export type HomeSettings = {
  hero: {
    subheading: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    videoId: string;
  };
  cta: { heading: string; body: string; primaryLabel: string; secondaryLabel: string };
};

const DEFAULTS: HomeSettings = {
  hero: {
    subheading:
      "Engineered to perform. Built to outlast. Premium aluminium, uPVC and glazing systems installed across the UAE by certified specialists.",
    ctaPrimaryLabel: "Get a Free Quote",
    ctaSecondaryLabel: "Book Showroom Visit",
    videoId: "xpDcSdw--hg",
  },
  cta: {
    heading: "Book Your Showroom Visit Today",
    body: "",
    primaryLabel: "Get a Free Quote",
    secondaryLabel: "Book Showroom Visit",
  },
};

const QUERY = groq`*[_id == "homepage"][0]{ hero, cta }`;

export const getHomeSettings = cache(async (): Promise<HomeSettings> => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return DEFAULTS;
  try {
    const { client } = await import("@/sanity/lib/client");
    const d = await client.fetch<{ hero?: Partial<HomeSettings["hero"]>; cta?: Partial<HomeSettings["cta"]> } | null>(
      QUERY,
      {},
      { next: { revalidate: 60 } }
    );
    if (!d) return DEFAULTS;
    return {
      hero: {
        subheading: d.hero?.subheading || DEFAULTS.hero.subheading,
        ctaPrimaryLabel: d.hero?.ctaPrimaryLabel || DEFAULTS.hero.ctaPrimaryLabel,
        ctaSecondaryLabel: d.hero?.ctaSecondaryLabel || DEFAULTS.hero.ctaSecondaryLabel,
        videoId: d.hero?.videoId || DEFAULTS.hero.videoId,
      },
      cta: {
        heading: d.cta?.heading || DEFAULTS.cta.heading,
        body: d.cta?.body || DEFAULTS.cta.body,
        primaryLabel: d.cta?.primaryLabel || DEFAULTS.cta.primaryLabel,
        secondaryLabel: d.cta?.secondaryLabel || DEFAULTS.cta.secondaryLabel,
      },
    };
  } catch {
    return DEFAULTS;
  }
});
