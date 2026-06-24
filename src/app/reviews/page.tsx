import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { CTALink } from "@/components/forms/CTAButtons";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getTestimonials } from "@/lib/about";

export const metadata: Metadata = {
  title: "Reviews | Swift Rooms UAE — Client Testimonials Dubai & Abu Dhabi",
  description:
    "Read what Swift Rooms clients across Dubai, Abu Dhabi and the wider UAE say about our premium aluminium windows, doors and glazing systems — exceptional results and a commitment to excellence.",
  alternates: { canonical: `${SITE_URL}/reviews` },
  openGraph: {
    title: "Reviews | Swift Rooms UAE",
    description:
      "Client testimonials on Swift Rooms premium aluminium windows, doors and glazing systems across the UAE.",
    url: `${SITE_URL}/reviews`,
  },
};

export default async function ReviewsPage() {
  const testimonials = await getTestimonials();
  const base = SITE_URL;

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Swift Rooms",
    url: base,
    review: testimonials.map((t) => ({
      "@type": "Review",
      reviewBody: t.quote,
      author: { "@type": "Person", name: t.author },
      itemReviewed: { "@type": "Product", name: t.product },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: testimonials.length,
      bestRating: "5",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${base}/reviews` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8">
              <Link href="/" className="hover:text-[#007969] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Reviews</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Client Testimonials</p>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Exceptional results and a commitment to excellence
            </h1>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              From Emirates Hills to Al Barari, architects, developers and homeowners across the UAE
              trust Swift Rooms for premium glazing engineered to perform in the Gulf climate.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={`${t.author}-${i}`} delay={(i % 2) * 0.1}>
                <figure className="border border-gray-100 hover:border-[#007969]/40 transition-all duration-300 flex flex-col h-full bg-white p-8 md:p-10">
                  <div className="text-[#007969] text-4xl leading-none mb-4" aria-hidden>&ldquo;</div>
                  <blockquote className="text-[#1c1c1e] text-lg leading-relaxed mb-8 flex-1">
                    {t.quote}
                  </blockquote>
                  <figcaption className="border-t border-gray-100 pt-6">
                    <p className="text-[#1c1c1e] font-semibold">{t.author}</p>
                    <p className="text-[#6b7280] text-sm">{t.location}</p>
                    <p className="text-[0.65rem] tracking-widest uppercase text-[#007969] mt-2">
                      {t.product} · {t.project}
                    </p>
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-20 p-8 md:p-12 bg-[#007969]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-label text-white/70 mb-4">Start Your Project</p>
                  <h2 className="text-title text-white mb-4">
                    Join our list of satisfied clients
                  </h2>
                  <p className="text-white/70 leading-relaxed">
                    Tell us about your project and our technical team will specify the right glazing
                    system for your villa, apartment or commercial development.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <CTALink
                    href="/enquire"
                    className="inline-flex items-center justify-center gap-3 bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Get a Free Quote
                  </CTALink>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
