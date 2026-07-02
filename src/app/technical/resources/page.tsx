import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";
import { getResources } from "@/lib/resources";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";

const baseMetadata: Metadata = {
  title: "Glazing Technical Resources — Guides, Specifications & Downloads UAE",
  description:
    "Product guides, project inspiration, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly from our team.",
  alternates: { canonical: `${SITE_URL}/technical/resources` },
  openGraph: {
    title: "Technical Resources | Swiftrooms",
    description:
      "Product guides, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly.",
    url: `${SITE_URL}/technical/resources`,
  },
};

export const generateMetadata = () => pageMetadata("/technical/resources", baseMetadata);

export default async function ResourcesPage() {
  const [resources, ps] = await Promise.all([
    getResources(),
    getPageSettings("/technical/resources"),
  ]);
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: `${base}/technical` },
      { "@type": "ListItem", position: 3, name: "Technical Resources", item: `${base}/technical/resources` },
    ],
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <ResourcesClient resources={resources} hero={ps?.hero} />
    </>
  );
}
