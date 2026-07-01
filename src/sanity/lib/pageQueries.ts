import { groq } from "next-sanity";

// Single page by slug, with references inside blocks expanded.
export const PAGE_QUERY = groq`*[_type == "page" && slug.current == $slug && hidden != true][0]{
  _id,
  title,
  "slug": slug.current,
  seo,
  sections[]{
    ...,
    _type == "testimonialsBlock" => {
      testimonials[]->{ _id, quote, author, location, project }
    },
    _type == "faqBlock" => {
      faqs[]->{ _id, question, answer }
    },
    _type == "logosBlock" => {
      brands[]->{ _id, title, logo }
    }
  }
}`;

// All visible page slugs — for generateStaticParams.
export const PAGE_SLUGS_QUERY = groq`*[_type == "page" && defined(slug.current) && hidden != true]{ "slug": slug.current }`;
