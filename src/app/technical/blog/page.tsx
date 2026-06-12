import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { blogPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems from the Swiftrooms team.",
  openGraph: {
    title: "Blog & Insights | Swiftrooms",
    description:
      "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/blog",
  },
};

export default function BlogPage() {
  const base = "https://swiftrooms-newbuild.vercel.app";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog & Insights | Swiftrooms",
    description: "Expert guides, product deep-dives and technical advice from the Swiftrooms team.",
    url: `${base}/technical/blog`,
    numberOfItems: blogPosts.length,
    itemListElement: blogPosts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${base}/technical/blog/${post.slug}`,
      description: post.excerpt,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <BlogClient />
    </>
  );
}
