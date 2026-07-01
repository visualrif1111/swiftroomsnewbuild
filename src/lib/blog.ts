// Blog data layer: Sanity-first with a data.ts fallback.
//
// - If Sanity is configured AND returns posts, those are used.
// - data.ts posts whose slug isn't in Sanity are merged in (additive migration).
// - If Sanity is not configured or the fetch fails, everything falls back to
//   data.ts so the site (and build) never breaks.
//
// Sanity posts are normalised into the existing `BlogPost` shape so all the
// rendering code works unchanged.
import { stegaClean } from "next-sanity";
import { blogPosts, type BlogPost } from "@/lib/data";

// Article = the normalised BlogPost, plus the raw Portable Text body for
// Sanity-sourced posts (rendered richly; data.ts posts leave it undefined).
export type Article = BlogPost & { portableText?: unknown };

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

function sortByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const [aM, aY] = a.date.split(" ");
    const [bM, bY] = b.date.split(" ");
    return (parseInt(bY) * 100 + (MONTHS[bM] ?? 0)) - (parseInt(aY) * 100 + (MONTHS[aM] ?? 0));
  });
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

// Portable Text → the existing { heading?, paragraphs[] } section shape.
type PTBlock = { _type?: string; style?: string; children?: { text?: string }[] };
function portableTextToSections(blocks?: unknown): BlogPost["body"] {
  if (!Array.isArray(blocks)) return [];
  const sections: BlogPost["body"] = [];
  let current: { heading?: string; paragraphs: string[] } = { paragraphs: [] };
  for (const b of blocks as PTBlock[]) {
    if (b?._type !== "block") continue;
    const text = (b.children ?? []).map((c) => c.text ?? "").join("").trim();
    if (!text) continue;
    if (b.style && /^h[1-6]$/.test(b.style)) {
      if (current.heading || current.paragraphs.length) sections.push(current);
      current = { heading: text, paragraphs: [] };
    } else {
      current.paragraphs.push(text);
    }
  }
  if (current.heading || current.paragraphs.length) sections.push(current);
  return sections;
}

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

type RawSanityPost = {
  slug: string;
  title: string;
  category?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  mainImage?: unknown;
  body?: unknown;
  relatedProducts?: { name: string; href: string }[];
};

async function normalize(p: RawSanityPost): Promise<Article> {
  let image = "";
  if (p.mainImage) {
    try {
      const { urlFor } = await import("@/sanity/lib/image");
      image = urlFor(p.mainImage).width(1200).fit("max").url();
    } catch {
      image = "";
    }
  }
  // In Draft Mode, Sanity strings arrive stega-encoded (invisible characters
  // that power click-to-edit overlays). Strip it from any value used for
  // routing, keys, sorting or matching so links and logic never break; keep it
  // on the *displayed* rich text (title, excerpt, Portable Text body) so those
  // fields remain clickable in Visual Editing.
  return {
    slug: stegaClean(p.slug),
    date: formatDate(stegaClean(p.publishedAt)),
    category: stegaClean(p.category) ?? "Insight",
    title: p.title,
    excerpt: p.excerpt ?? "",
    readTime: stegaClean(p.readTime) ?? "",
    image,
    body: portableTextToSections(p.body),
    portableText: Array.isArray(p.body) ? p.body : undefined,
    relatedProducts: p.relatedProducts?.map((rp) => ({
      name: rp.name,
      href: stegaClean(rp.href),
    })),
  };
}

async function sanityList(): Promise<BlogPost[]> {
  if (!sanityConfigured()) return [];
  try {
    const { getPosts } = await import("@/sanity/lib/posts");
    const posts = (await getPosts()) as unknown as RawSanityPost[];
    return Promise.all(posts.map(normalize));
  } catch {
    return [];
  }
}

/** All articles — Sanity merged over data.ts (Sanity wins on slug), newest first. */
export async function getArticles(): Promise<BlogPost[]> {
  const sanity = await sanityList();
  const sanitySlugs = new Set(sanity.map((p) => p.slug));
  const merged = [...sanity, ...blogPosts.filter((p) => !sanitySlugs.has(p.slug))];
  return sortByDate(merged);
}

/** Union of Sanity + data.ts slugs, for generateStaticParams. */
export async function getArticleSlugs(): Promise<string[]> {
  const sanity = await sanityList();
  return [...new Set([...sanity.map((p) => p.slug), ...blogPosts.map((p) => p.slug)])];
}

/** Single article by slug — Sanity first, then data.ts. */
export async function getArticle(slug: string): Promise<Article | null> {
  if (sanityConfigured()) {
    try {
      const { getPost } = await import("@/sanity/lib/posts");
      const p = (await getPost(slug)) as unknown as RawSanityPost | null;
      if (p && p.slug) return normalize(p);
    } catch {
      // fall through to data.ts
    }
  }
  return blogPosts.find((p) => p.slug === slug) ?? null;
}
