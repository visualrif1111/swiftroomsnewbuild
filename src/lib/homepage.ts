// Homepage settings: editable hero / section-heading / CTA copy from the Sanity
// `homepage` singleton, with defaults that match the current hardcoded values so
// the site is byte-identical when Sanity is blank or unavailable.
//
// Draft-aware (mirrors the blog): published visitors use the CDN + 60s ISR path;
// inside Draft Mode / Presentation we route through sanityFetch so stega
// click-to-edit overlays work on the homepage. Values used in logic (videoId,
// which goes into a YouTube URL) are stegaClean'd so they never break in preview.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";

export type HomeSettings = {
  hero: {
    eyebrow: string;
    subheading: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    videoId: string;
  };
  sections: {
    solutionEyebrow: string;
    solutionHeading: string;
    transformEyebrow: string;
    transformHeading: string;
    transformBody: string;
    productsEyebrow: string;
    productsHeading: string;
    brandsEyebrow: string;
    portfolioEyebrow: string;
    portfolioHeading: string;
    processEyebrow: string;
    processHeading: string;
    blogEyebrow: string;
    blogHeading: string;
    testimonialsEyebrow: string;
    testimonialsHeading: string;
  };
  cta: { heading: string; body: string; primaryLabel: string; secondaryLabel: string };
};

const DEFAULTS: HomeSettings = {
  hero: {
    eyebrow: "Dubai · Abu Dhabi · UAE — Built for the UAE Climate",
    subheading:
      "Engineered to perform. Built to outlast. Premium aluminium, uPVC and glazing systems installed across the UAE by certified specialists.",
    ctaPrimaryLabel: "Get a Free Quote",
    ctaSecondaryLabel: "Book Showroom Visit",
    videoId: "xpDcSdw--hg",
  },
  sections: {
    solutionEyebrow: "From common problems to premium solutions",
    solutionHeading: "The Swiftrooms Solution",
    transformEyebrow: "Transform Your Space",
    transformHeading: "Transform unused space\ninto living space.",
    transformBody:
      "From panoramic sliding doors connecting living rooms to pools, to glass garden rooms transforming unused plots — Swiftrooms turns architectural ambition into reality across every UAE climate zone.",
    productsEyebrow: "Our Premium Products",
    productsHeading: "The complete\nproduct range",
    brandsEyebrow: "Brands We Work With",
    portfolioEyebrow: "Selected Work",
    portfolioHeading: "Portfolio\nacross the UAE",
    processEyebrow: "Start Your Swiftrooms Journey",
    processHeading: "From first call to\ncompleted project",
    blogEyebrow: "Technical Insights",
    blogHeading: "From the Swiftrooms blog.",
    testimonialsEyebrow: "Client Feedback",
    testimonialsHeading: "What clients say.",
  },
  cta: {
    heading: "Book Your Showroom Visit Today",
    body:
      "Experience our full product range at full scale. Free consultation, no obligation. Jebel Ali, Dubai — open Sunday to Thursday.",
    primaryLabel: "Get a Free Quote",
    secondaryLabel: "Book Showroom Visit",
  },
};

const QUERY = groq`*[_id == "homepage"][0]{ hero, sections, cta }`;

type RawHome = {
  hero?: Partial<HomeSettings["hero"]>;
  sections?: Partial<HomeSettings["sections"]>;
  cta?: Partial<HomeSettings["cta"]>;
} | null;

// merge: use the Sanity value when present, else the default (keeps stega on
// displayed strings; the whole object is not stegaClean'd).
function pick<T extends Record<string, string>>(raw: Partial<T> | undefined, defaults: T): T {
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const v = raw?.[key];
    if (typeof v === "string" && v.trim()) out[key] = v as T[keyof T];
  }
  return out;
}

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export const getHomeSettings = cache(async (): Promise<HomeSettings> => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return DEFAULTS;
  try {
    let d: RawHome;
    if (await isDraft()) {
      const { sanityFetch } = await import("@/sanity/lib/live");
      d = (await sanityFetch({ query: QUERY })).data as RawHome;
    } else {
      const { client } = await import("@/sanity/lib/client");
      d = await client.fetch<RawHome>(QUERY, {}, { next: { revalidate: 60 } });
    }
    if (!d) return DEFAULTS;
    const hero = pick(d.hero, DEFAULTS.hero);
    // videoId is used inside a URL — strip any stega encoding so preview works.
    hero.videoId = stegaClean(hero.videoId);
    return {
      hero,
      sections: pick(d.sections, DEFAULTS.sections),
      cta: pick(d.cta, DEFAULTS.cta),
    };
  } catch {
    return DEFAULTS;
  }
});
