import { draftMode } from "next/headers";
import { client } from "./client";
import { sanityFetch } from "./live";
import { POSTS_QUERY, POST_QUERY, POST_SLUGS_QUERY } from "./queries";

export type SanityPost = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  mainImage?: unknown;
  body?: unknown;
  relatedProducts?: { name: string; href: string }[];
};

// True only when Next.js Draft Mode is active (i.e. inside Presentation/preview).
// Guarded so it never throws in contexts where cookies are unavailable.
async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

// Published visitors keep the existing CDN + 60s ISR path unchanged. In Draft
// Mode we route through `sanityFetch`, which serves drafts with stega encoding
// and participates in live revalidation.
export async function getPosts(): Promise<SanityPost[]> {
  if (await isDraft()) {
    const { data } = await sanityFetch({ query: POSTS_QUERY });
    return data as SanityPost[];
  }
  return client.fetch(POSTS_QUERY, {}, { next: { revalidate: 60 } });
}

export async function getPost(slug: string): Promise<SanityPost | null> {
  if (await isDraft()) {
    const { data } = await sanityFetch({ query: POST_QUERY, params: { slug } });
    return data as SanityPost | null;
  }
  return client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } });
}

// Never draft-aware: this runs inside generateStaticParams where the Draft Mode
// cookie APIs are not available. Always reads published slugs.
export async function getPostSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(POST_SLUGS_QUERY, {}, { next: { revalidate: 60 } });
}
