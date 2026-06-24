import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";
import { getPortfolioProjects } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Project Portfolio — UAE Villas, Commercial & Curtain Wall",
  description:
    "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse our portfolio of premium aluminium windows, doors and curtain wall installations.",
  alternates: { canonical: `${SITE_URL}/portfolio` },
  openGraph: {
    title: "Portfolio | Swiftrooms",
    description:
      "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse premium aluminium windows, doors and curtain wall installations.",
    url: `${SITE_URL}/portfolio`,
  },
};

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: `${base}/portfolio` },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swiftrooms Portfolio",
    description: "Completed glazing installations by Swiftrooms across the UAE.",
    url: `${base}/portfolio`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${base}/portfolio/${p.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <PortfolioClient projects={projects} />
    </>
  );
}
