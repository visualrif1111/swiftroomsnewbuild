import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";
import { resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Technical Resources",
  description:
    "Product guides, project inspiration, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly from our team.",
  openGraph: {
    title: "Technical Resources | Swiftrooms",
    description:
      "Product guides, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/resources",
  },
};

export default function ResourcesPage() {
  const base = "https://swiftrooms-newbuild.vercel.app";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Technical Resources | Swiftrooms",
    description: "Product guides, planning tools and technical documentation for Swiftrooms glazing systems.",
    url: `${base}/technical/resources`,
    numberOfItems: resources.length,
    itemListElement: resources.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.title,
      description: r.description,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <ResourcesClient />
    </>
  );
}
