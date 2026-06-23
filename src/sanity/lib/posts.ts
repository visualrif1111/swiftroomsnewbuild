import { client } from "./client";
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

export async function getPosts(): Promise<SanityPost[]> {
  return client.fetch(POSTS_QUERY, {}, { next: { revalidate: 60 } });
}

export async function getPostSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(POST_SLUGS_QUERY, {}, { next: { revalidate: 60 } });
}

export async function getPost(slug: string): Promise<SanityPost | null> {
  return client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } });
}
