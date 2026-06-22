import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";
import { portfolioProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Project Portfolio — UAE Villas, Commercial & Curtain Wall",
  description:
    "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse our portfolio of premium aluminium windows, doors and curtain wall installations.",
  alternates: { canonical: "https://www.swiftrooms.ae/portfolio" },
  openGraph: {
    title: "Portfolio | Swiftrooms",
    description:
      "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse premium aluminium windows, doors and curtain wall installations.",
    url: "https://www.swiftrooms.ae/portfolio",
  },
};

export default function PortfolioPage() {
  const base = "https://www.swiftrooms.ae";
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
    numberOfItems: portfolioProjects.length,
    itemListElement: portfolioProjects.map((p, i) => ({
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
      <PortfolioClient />
    </>
  );
}
