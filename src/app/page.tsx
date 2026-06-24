import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHomeSettings } from "@/lib/homepage";
import { getCategories } from "@/lib/catalogue";
import { getPortfolioProjects } from "@/lib/portfolio";
import { getArticles } from "@/lib/blog";
import { getProcessSteps, getTestimonials } from "@/lib/about";

export const metadata: Metadata = {
  title: "Swiftrooms — Performance Windows & Doors, UAE",
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Engineered to perform. Built to outlast. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
  alternates: { canonical: "https://swiftrooms-newbuild.vercel.app" },
  openGraph: {
    title: "Swiftrooms — Performance Windows & Doors, UAE",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
    url: "https://swiftrooms-newbuild.vercel.app",
  },
};

export default async function Home() {
  const [settings, productCategories, portfolioProjects, blogPosts, processSteps, testimonials] =
    await Promise.all([
      getHomeSettings(),
      getCategories(),
      getPortfolioProjects(),
      getArticles(),
      getProcessSteps(),
      getTestimonials(),
    ]);
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://swiftrooms-newbuild.vercel.app/#business",
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
      <HomeClient
        settings={settings}
        productCategories={productCategories}
        portfolioProjects={portfolioProjects}
        blogPosts={blogPosts}
        processSteps={processSteps}
        testimonials={testimonials}
      />
    </>
  );
}
