import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHomeSettings } from "@/lib/homepage";
import { getCategories } from "@/lib/catalogue";
import { getPortfolioProjects } from "@/lib/portfolio";
import { getArticles } from "@/lib/blog";
import { getProcessSteps, getTestimonials } from "@/lib/about";

// The root layout's "%s | Swiftrooms" title template does not apply to this
// page — a template never applies to the segment that defines it — so the
// suffix is written out here.
const TITLE = "Aluminium Doors and Windows Dubai | Swiftrooms";
const DESCRIPTION =
  "Our range of Aluminium Doors and Windows Dubai have something for every style of property, from our distinctive European designs to high-quality local profiles.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
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
    "@id": `${SITE_URL}/#business`,
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
