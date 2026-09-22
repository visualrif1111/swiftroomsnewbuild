// Vetromax brand landing page.
//
// Sits alongside /brands/[slug] rather than inside it: the other brands are one
// page each, while Vetromax has a sub-tree of five system pages, so it needs a
// static segment of its own. A static route wins over the dynamic sibling, and
// `vetromax` is deliberately absent from BRAND_ROUTES so the two cannot clash.
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { vetromaxBrand, vetromaxSystems } from "@/lib/vetromax";
import {
  ComparisonTable,
  Downloads,
  SystemNav,
  VetromaxBreadcrumb,
} from "@/components/vetromax/VetromaxParts";

const TITLE = "Vetromax Minimalist Aluminium Systems";
const DESCRIPTION =
  "Vetromax minimalist aluminium systems supplied and installed in the UAE by Swiftrooms — Vetro Façade curtain wall, Casement, Slide, Pivot and Guillotine.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/brands/vetromax` },
  openGraph: {
    title: `${TITLE} | Swiftrooms`,
    description: DESCRIPTION,
    url: `${SITE_URL}/brands/vetromax`,
  },
};

export default function VetromaxPage() {
  const leadContext = { brand: "Vetromax", source: "vetromax-brand" };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 3, name: "Vetromax", item: `${SITE_URL}/brands/vetromax` },
    ],
  };

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: "Vetromax",
    description: vetromaxBrand.intro,
    url: `${SITE_URL}/brands/vetromax`,
  };

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Vetromax systems",
    numberOfItems: vetromaxSystems.length,
    itemListElement: vetromaxSystems.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/brands/vetromax/${s.slug}`,
      name: s.name,
    })),
  };

  const downloads = vetromaxSystems
    .filter((s) => s.brochureUrl)
    .map((s) => ({ name: `${s.name} brochure`, href: s.brochureUrl as string }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-44 md:pb-16 lg:pt-52 lg:pb-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <VetromaxBreadcrumb />
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-10 lg:gap-16 items-end">
            <div className="min-w-0">
              <ScrollReveal>
                <span className="text-label text-[#007969] mb-3 md:mb-4 block">Brand Partner</span>
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4">Vetromax</h1>
                <p className="text-base sm:text-xl text-[#6b7280] mb-6">
                  {vetromaxBrand.strapline}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="text-[#6b7280] text-base md:text-lg leading-relaxed max-w-2xl">
                  {vetromaxBrand.intro}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link href="#systems" className="btn-brand justify-center">
                    Explore Systems
                  </Link>
                  <QuoteButton
                    className="btn-outline justify-center"
                    context={{ ...leadContext, ctaLocation: "hero" }}
                  >
                    Request a Quote
                  </QuoteButton>
                </div>
              </ScrollReveal>
            </div>

            {/* Imagery placeholder — see the implementation report: Swiftrooms
                holds no approved Vetromax photography, and the source images
                must not be hotlinked in production. */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-8">
                <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 text-center leading-relaxed">
                  Vetromax imagery
                  <br />
                  awaiting approved assets
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SystemNav systems={vetromaxSystems} />

      {/* Product systems */}
      <section id="systems" className="py-12 md:py-20 scroll-mt-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3">The range</p>
            <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">Five systems, one platform</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {vetromaxSystems.map((s, i) => (
              <ScrollReveal key={s.slug} delay={(i % 2) * 0.08}>
                <Link
                  href={`/brands/vetromax/${s.slug}`}
                  className="group flex h-full flex-col border border-gray-100 bg-white hover:border-[#007969]/40 transition-all active:scale-[0.99]"
                >
                  <div className="h-40 md:h-48 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-center p-8">
                    <p className="text-[0.55rem] tracking-widest uppercase text-gray-400 text-center">
                      {s.name} imagery
                      <br />
                      awaiting approved assets
                    </p>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-heading font-bold text-xl text-[#1c1c1e] group-hover:text-[#007969] transition-colors">
                        {s.name}
                      </h3>
                      {s.systemCode && (
                        <span className="text-[0.55rem] tracking-widest uppercase text-gray-400 border border-gray-200 px-2 py-1 flex-shrink-0">
                          {s.systemCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-4">
                      {s.category}
                    </p>
                    <p className="text-[#6b7280] text-sm leading-relaxed flex-1">{s.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.specs.slice(0, 3).map((spec) => (
                        <li
                          key={spec.label}
                          className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-2.5 py-1.5"
                        >
                          {spec.label}: {spec.value}
                        </li>
                      ))}
                    </ul>
                    <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mt-6">
                      View System →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Vetromax */}
      <section className="py-12 md:py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3">Why Vetromax</p>
            <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">
              What the range is good at
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {vetromaxBrand.why.map((w, i) => (
              <ScrollReveal key={w.name} delay={i * 0.08}>
                <div className="border-t-2 border-[#007969] pt-5">
                  <h3 className="font-heading font-bold text-lg text-[#1c1c1e] mb-3">{w.name}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{w.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural applications */}
      <section className="py-12 md:py-20 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3">Applications</p>
            <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">Where these systems go</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {vetromaxBrand.applications.map((a, i) => (
              <ScrollReveal key={a.name} delay={i * 0.08}>
                <div className="border border-gray-100 bg-white p-6 h-full">
                  <h3 className="font-heading font-semibold text-[#1c1c1e] mb-2">{a.name}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{a.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ComparisonTable systems={vetromaxSystems} />

      <Downloads items={downloads} />

      {/* Enquiry */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Specify with confidence</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Talk to us about Vetromax
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Tell us the opening and we will recommend the right system, the glazing
              specification and realistic lead times for the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton
                className="btn-brand"
                context={{ ...leadContext, ctaLocation: "final-cta" }}
              >
                Request a Quote
              </QuoteButton>
              <ShowroomButton
                className="btn-outline"
                context={{ ...leadContext, ctaLocation: "final-cta" }}
              >
                Visit Our Showroom
              </ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
