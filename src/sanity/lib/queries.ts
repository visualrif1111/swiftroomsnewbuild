import { groq } from "next-sanity";

// All published posts, newest first — list/index view.
export const POSTS_QUERY = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  readTime,
  publishedAt,
  mainImage
}`;

// All slugs — for generateStaticParams.
export const POST_SLUGS_QUERY = groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;

// Single post by slug — detail view.
export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  readTime,
  publishedAt,
  mainImage,
  body,
  relatedProducts
}`;
