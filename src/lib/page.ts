// Page-builder data layer. Draft-aware (mirrors the blog pattern): published
// visitors use the CDN + 60s ISR path; inside Draft Mode / Presentation we route
// through sanityFetch so drafts + stega overlays work. Slug enumeration stays on
// the plain published client so it is safe inside generateStaticParams.
import { draftMode } from "next/headers";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/lib/pageQueries";

export type PageSection = {
  _key: string;
  _type: string;
  hidden?: boolean;
  anchorId?: string;
  background?: "white" | "alt" | "dark" | "brand";
  [key: string]: unknown;
};

export type CmsPage = {
  _id: string;
  title: string;
  slug: string;
  seo?: {
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    openGraphImage?: unknown;
    noIndex?: boolean;
  };
  sections?: PageSection[];
};

const configured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export async function getPage(slug: string): Promise<CmsPage | null> {
  if (!configured()) return null;
  try {
    if (await isDraft()) {
      const { data } = await sanityFetch({ query: PAGE_QUERY, params: { slug } });
      return (data as CmsPage) ?? null;
    }
    return await client.fetch(PAGE_QUERY, { slug }, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function getPageSlugs(): Promise<string[]> {
  if (!configured()) return [];
  try {
    const rows = await client.fetch<{ slug: string }[]>(
      PAGE_SLUGS_QUERY,
      {},
      { next: { revalidate: 60 } }
    );
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}
