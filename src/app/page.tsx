import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { testimonials } from "@/lib/data";
import { getHomeSettings } from "@/lib/homepage";

export const metadata: Metadata = {
  title: "Swiftrooms — Performance Windows & Doors, UAE",
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Engineered to perform. Built to outlast. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
  alternates: { canonical: "https://www.swiftrooms.ae" },
  openGraph: {
    title: "Swiftrooms — Performance Windows & Doors, UAE",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
    url: "https://www.swiftrooms.ae",
  },
};

export default async function Home() {
  const settings = await getHomeSettings();
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.swiftrooms.ae/#business",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    review: testimonials.slice(0, 4).map((t) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Person", name: t.author },
      reviewBody: t.quote,
      name: `${t.product} — ${t.location}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <HomeClient settings={settings} />
    </>
  );
}
