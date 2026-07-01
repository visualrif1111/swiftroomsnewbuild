// Portfolio data layer: Sanity-first with a data.ts fallback (mirrors blog.ts).
//
// - Sanity project docs (Phase 1) are normalised into a flat PortfolioItem.
// - Sanity is merged over data.ts (Sanity wins on slug); data.ts-only projects
//   (the net-new ones not migrated) are kept.
// - If Sanity isn't configured or a fetch fails, everything falls back to
//   data.ts so the build/site never breaks.
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";
import { portfolioProjects as dataProjects, portfolioMedia, type PortfolioProject } from "@/lib/data";

export type PortfolioItem = {
  id: string;
  name: string;
  slug: string;
  location: string;
  area: string;
  year: string;
  type: string;
  description: string;
  products: string[];
  productLinks: { name: string; href: string }[];
  tags: string[];
  brief?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  image?: string;
  gallery: string[];
  video?: string;
  videoPoster?: string;
};

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

// Product name → catalogue href, for the data.ts fallback (Sanity projects use
// resolved references instead).
const NAME_TO_HREF: Record<string, string> = {
  "Cor Vision 4600": "/catalogue/aluminium-sliding-doors/cor-vision-4600",
  "Cor Vision 4700": "/catalogue/aluminium-sliding-doors/cor-vision-4700",
  "Cor Vision Plus": "/catalogue/aluminium-sliding-doors/cor-vision-plus",
  "Cortizo Bi-fold": "/catalogue/aluminium-bi-folding-doors/cortizo-bifold",
  "Cortizo Casement": "/catalogue/aluminium-windows/cortizo-casement",
  "Cortizo Cor 70 Hidden Sash": "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash",
  "Gulf Extrusions TB600 Window": "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn",
  "Aluminium Sliding Windows": "/catalogue/aluminium-windows/aluminium-sliding-windows",
  "Cortizo Cor 70 Door": "/catalogue/aluminium-doors/cortizo-cor-70-door",
  "Gulf Extrusions TB600 Door": "/catalogue/aluminium-doors/gulf-extrusion-tb600-door",
  "Vetromax Pivot Door": "/catalogue/aluminium-doors/vetromax-pivot-door",
  "uPVC Casement": "/catalogue/upvc/upvc-casement",
  "Cortizo TP52": "/catalogue/curtain-wall/cortizo-tp52",
  "Cortizo TP52 Curtain Wall": "/catalogue/curtain-wall/cortizo-tp52",
  "Gulf Extrusions CW 50mm": "/catalogue/curtain-wall/gulf-extrusion-cw-50",
  "Vetromax VF35 Facade": "/catalogue/curtain-wall/vetromax-vf35",
  "Premium Garden Room": "/catalogue/garden-rooms/premium-garden-room",
  "Glass Conservatory": "/catalogue/garden-rooms/glass-conservatory",
  "Retractable Fly Screen": "/catalogue/insect-screens/retractable-fly-screen",
  "Fixed Rooflight": "/catalogue/skylights/fixed-rooflight",
  "Motorised Skylight": "/catalogue/skylights/motorised-skylight",
};
const linksFromNames = (names: string[]) =>
  names.flatMap((n) => (NAME_TO_HREF[n] ? [{ name: n, href: NAME_TO_HREF[n] }] : []));

function fromData(p: PortfolioProject): PortfolioItem {
  const m = portfolioMedia[p.slug] ?? {};
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    location: p.location,
    area: p.area,
    year: p.year,
    type: p.type,
    description: p.description,
    products: p.products ?? [],
    productLinks: linksFromNames(p.products ?? []),
    tags: p.tags ?? [],
    brief: p.brief,
    challenge: p.challenge,
    solution: p.solution,
    outcome: p.outcome,
    image: m.hero ?? p.image,
    gallery: m.gallery ?? [],
    video: m.video,
    videoPoster: m.videoPoster,
  };
}

type RawSanityProject = {
  id: string;
  title: string;
  slug: string;
  location?: string;
  projectType?: string;
  area?: string;
  year?: string;
  description?: string;
  brief?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  productsUsed?: string[];
  productRefs?: { name?: string; slug?: string; categorySlug?: string }[];
  tags?: string[];
  image?: string | null;
  gallery?: (string | null)[];
  video?: string | null;
  videoPoster?: string | null;
};

function fromSanity(p: RawSanityProject): PortfolioItem {
  // In Draft Mode, Sanity strings arrive stega-encoded. Strip it from anything
  // used for routing, keys, filtering (tags), image/video URLs and hrefs so the
  // page never breaks in preview; keep it on displayed prose (name, description,
  // brief/challenge/solution/outcome, location, type, area, year) so those stay
  // click-to-editable in Presentation.
  return {
    id: p.id,
    name: p.title,
    slug: stegaClean(p.slug),
    location: p.location ?? "",
    area: p.area ?? "",
    year: p.year ?? "",
    type: p.projectType ?? "",
    description: p.description ?? "",
    products: (p.productsUsed ?? []).map((x) => stegaClean(x)),
    productLinks: (p.productRefs ?? [])
      .filter((r): r is { name: string; slug: string; categorySlug: string } => Boolean(r?.name && r?.slug && r?.categorySlug))
      .map((r) => ({ name: r.name, href: stegaClean(`/catalogue/${r.categorySlug}/${r.slug}`) })),
    tags: (p.tags ?? []).map((x) => stegaClean(x)),
    brief: p.brief,
    challenge: p.challenge,
    solution: p.solution,
    outcome: p.outcome,
    image: p.image ? stegaClean(p.image) : undefined,
    gallery: (p.gallery ?? []).filter((x): x is string => Boolean(x)).map((x) => stegaClean(x)),
    video: p.video ? stegaClean(p.video) : undefined,
    videoPoster: p.videoPoster ? stegaClean(p.videoPoster) : undefined,
  };
}

const PROJECT_FIELDS = `
  "id": _id, title, "slug": slug.current, "location": location->title,
  projectType, area, year, description, brief, challenge, solution, outcome,
  productsUsed, tags,
  "productRefs": products[]->{ "name": title, "slug": slug.current, "categorySlug": category->slug.current },
  "image": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  "video": video.asset->url,
  "videoPoster": videoPoster.asset->url
`;
const PROJECTS_QUERY = groq`*[_type == "project" && defined(slug.current)]{${PROJECT_FIELDS}}`;
const PROJECT_QUERY = groq`*[_type == "project" && slug.current == $slug][0]{${PROJECT_FIELDS}}`;
const PROJECT_SLUGS_QUERY = groq`*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`;

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

// Draft-aware list: published visitors use CDN + 60s ISR; in Draft Mode we route
// through sanityFetch so project cards get drafts + stega click-to-edit overlays.
async function sanityList(): Promise<PortfolioItem[]> {
  if (!sanityConfigured()) return [];
  try {
    if (await isDraft()) {
      const { sanityFetch } = await import("@/sanity/lib/live");
      const { data } = await sanityFetch({ query: PROJECTS_QUERY });
      return ((data as RawSanityProject[]) ?? []).map(fromSanity);
    }
    const { client } = await import("@/sanity/lib/client");
    const rows: RawSanityProject[] = await client.fetch(PROJECTS_QUERY, {}, { next: { revalidate: 60 } });
    return rows.map(fromSanity);
  } catch {
    return [];
  }
}

// Slugs only — never draft-aware, safe for generateStaticParams (plain client).
async function sanitySlugList(): Promise<string[]> {
  if (!sanityConfigured()) return [];
  try {
    const { client } = await import("@/sanity/lib/client");
    const rows = await client.fetch<{ slug: string }[]>(PROJECT_SLUGS_QUERY, {}, { next: { revalidate: 60 } });
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

/** All projects — Sanity merged over data.ts (Sanity wins on slug). */
export async function getPortfolioProjects(): Promise<PortfolioItem[]> {
  const sanity = await sanityList();
  const slugs = new Set(sanity.map((p) => p.slug));
  return [...sanity, ...dataProjects.filter((p) => !slugs.has(p.slug)).map(fromData)];
}

/** Union of Sanity + data.ts slugs, for generateStaticParams. */
export async function getPortfolioSlugs(): Promise<string[]> {
  const sanity = await sanitySlugList();
  return [...new Set([...sanity, ...dataProjects.map((p) => p.slug)])];
}

/** Single project by slug — Sanity first (draft-aware), then data.ts. */
export async function getPortfolioProject(slug: string): Promise<PortfolioItem | null> {
  if (sanityConfigured()) {
    try {
      let row: RawSanityProject | null;
      if (await isDraft()) {
        const { sanityFetch } = await import("@/sanity/lib/live");
        row = (await sanityFetch({ query: PROJECT_QUERY, params: { slug } })).data as RawSanityProject | null;
      } else {
        const { client } = await import("@/sanity/lib/client");
        row = await client.fetch(PROJECT_QUERY, { slug }, { next: { revalidate: 60 } });
      }
      if (row && row.slug) return fromSanity(row);
    } catch {
      // fall through to data.ts
    }
  }
  const p = dataProjects.find((x) => x.slug === slug);
  return p ? fromData(p) : null;
}
