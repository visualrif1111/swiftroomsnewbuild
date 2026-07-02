import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { getArticles } from "@/lib/blog";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";

const baseMetadata: Metadata = {
  title: "Glazing Blog — Expert Guides for UAE Windows & Doors",
  description:
    "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems from the Swiftrooms team.",
  alternates: { canonical: `${SITE_URL}/technical/blog` },
  openGraph: {
    title: "Blog & Insights | Swiftrooms",
    description:
      "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems.",
    url: `${SITE_URL}/technical/blog`,
  },
};

export const generateMetadata = () => pageMetadata("/technical/blog", baseMetadata);

export default async function BlogPage() {
  const [posts, ps] = await Promise.all([getArticles(), getPageSettings("/technical/blog")]);
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: `${base}/technical` },
      { "@type": "ListItem", position: 3, name: "Blog & Insights", item: `${base}/technical/blog` },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog & Insights | Swiftrooms",
    description: "Expert guides, product deep-dives and technical advice from the Swiftrooms team.",
    url: `${base}/technical/blog`,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${base}/technical/blog/${post.slug}`,
      description: post.excerpt,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <BlogClient posts={posts} hero={ps?.hero} />
    </>
  );
}
