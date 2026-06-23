// Portfolio data layer: Sanity-first with a data.ts fallback (mirrors blog.ts).
//
// - Sanity project docs (Phase 1) are normalised into a flat PortfolioItem.
// - Sanity is merged over data.ts (Sanity wins on slug); data.ts-only projects
//   (the net-new ones not migrated) are kept.
// - If Sanity isn't configured or a fetch fails, everything falls back to
//   data.ts so the build/site never breaks.
import { groq } from "next-sanity";
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
  tags?: string[];
  image?: string | null;
  gallery?: (string | null)[];
  video?: string | null;
  videoPoster?: string | null;
};

function fromSanity(p: RawSanityProject): PortfolioItem {
  return {
    id: p.id,
    name: p.title,
    slug: p.slug,
    location: p.location ?? "",
    area: p.area ?? "",
    year: p.year ?? "",
    type: p.projectType ?? "",
    description: p.description ?? "",
    products: p.productsUsed ?? [],
    tags: p.tags ?? [],
    brief: p.brief,
    challenge: p.challenge,
    solution: p.solution,
    outcome: p.outcome,
    image: p.image ?? undefined,
    gallery: (p.gallery ?? []).filter((x): x is string => Boolean(x)),
    video: p.video ?? undefined,
    videoPoster: p.videoPoster ?? undefined,
  };
}

const PROJECT_FIELDS = `
  "id": _id, title, "slug": slug.current, "location": location->title,
  projectType, area, year, description, brief, challenge, solution, outcome,
  productsUsed, tags,
  "image": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  "video": video.asset->url,
  "videoPoster": videoPoster.asset->url
`;
const PROJECTS_QUERY = groq`*[_type == "project" && defined(slug.current)]{${PROJECT_FIELDS}}`;
const PROJECT_QUERY = groq`*[_type == "project" && slug.current == $slug][0]{${PROJECT_FIELDS}}`;

async function sanityList(): Promise<PortfolioItem[]> {
  if (!sanityConfigured()) return [];
  try {
    const { client } = await import("@/sanity/lib/client");
    const rows: RawSanityProject[] = await client.fetch(PROJECTS_QUERY, {}, { next: { revalidate: 60 } });
    return rows.map(fromSanity);
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
  const sanity = await sanityList();
  return [...new Set([...sanity.map((p) => p.slug), ...dataProjects.map((p) => p.slug)])];
}

/** Single project by slug — Sanity first, then data.ts. */
export async function getPortfolioProject(slug: string): Promise<PortfolioItem | null> {
  if (sanityConfigured()) {
    try {
      const { client } = await import("@/sanity/lib/client");
      const row: RawSanityProject | null = await client.fetch(PROJECT_QUERY, { slug }, { next: { revalidate: 60 } });
      if (row && row.slug) return fromSanity(row);
    } catch {
      // fall through to data.ts
    }
  }
  const p = dataProjects.find((x) => x.slug === slug);
  return p ? fromData(p) : null;
}
