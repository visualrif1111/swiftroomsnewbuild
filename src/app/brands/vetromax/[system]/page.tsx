// Vetromax system detail template — one page per system, all five prerendered.
//
// Content comes from src/lib/vetromax.ts, which records for every value whether
// it was crawled from vetromax.com or supplied by the client brief.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { vetromaxSystem, vetromaxSystems } from "@/lib/vetromax";
import {
  Downloads,
  Performance,
  SpecGrid,
  SystemNav,
  VetromaxBreadcrumb,
} from "@/components/vetromax/VetromaxParts";

interface Props {
  params: Promise<{ system: string }>;
}

export async function generateStaticParams() {
  return vetromaxSystems.map((s) => ({ system: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { system: slug } = await params;
  const system = vetromaxSystem(slug);
  if (!system) return { title: "Not Found" };
  const url = `${SITE_URL}/brands/vetromax/${system.slug}`;
  return {
    title: system.seo.title,
    description: system.seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${system.seo.title} | Swiftrooms`,
      description: system.seo.description,
      url,
    },
  };
}

export default async function VetromaxSystemPage({ params }: Props) {
  const { system: slug } = await params;
  const system = vetromaxSystem(slug);
  if (!system) notFound();

  const url = `${SITE_URL}/brands/vetromax/${system.slug}`;
  const related = system.related
    .map((s) => vetromaxSystem(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const leadContext = {
    brand: "Vetromax",
    product: system.name,
    productSlug: system.slug,
    source: "vetromax-system",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 3, name: "Vetromax", item: `${SITE_URL}/brands/vetromax` },
      { "@type": "ListItem", position: 4, name: system.name, item: url },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Vetromax ${system.name}`,
    category: system.category,
    description: system.summary,
    url,
    brand: { "@type": "Brand", name: "Vetromax" },
    ...(system.systemCode ? { model: system.systemCode } : {}),
    additionalProperty: system.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-44 md:pb-14 lg:pt-52 lg:pb-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <VetromaxBreadcrumb system={system} />
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-10 lg:gap-16 items-end">
            <div className="min-w-0">
              <ScrollReveal>
                <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
                  <span className="text-label text-[#007969]">Vetromax</span>
                  {system.systemCode && (
                    <span className="text-[0.55rem] tracking-widest uppercase text-gray-400 border border-gray-200 px-2 py-1">
                      {system.systemCode}
                    </span>
                  )}
                </div>
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4">{system.name}</h1>
                <p className="text-base sm:text-xl text-[#6b7280] mb-6">{system.category}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="text-[#6b7280] text-base md:text-lg leading-relaxed max-w-2xl">
                  {system.intro[0]}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <QuoteButton
                    className="btn-brand justify-center"
                    context={{ ...leadContext, ctaLocation: "hero" }}
                  >
                    Request a Quote
                  </QuoteButton>
                  <ShowroomButton
                    className="btn-outline justify-center"
                    context={{ ...leadContext, ctaLocation: "hero" }}
                  >
                    Visit Our Showroom
                  </ShowroomButton>
                </div>
              </ScrollReveal>
            </div>

            {/* Imagery placeholder — no approved Vetromax assets held, and the
                source images must not be hotlinked in production. */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-8">
                <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 text-center leading-relaxed">
                  {system.name} imagery
                  <br />
                  awaiting approved assets
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SystemNav systems={vetromaxSystems} activeSlug={system.slug} />

      {/* System overview */}
      {system.intro.length > 1 && (
        <section className="py-12 md:py-20">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-16">
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-3">System overview</p>
                <h2 className="text-title text-[#1c1c1e] text-balance">
                  How {system.name} works
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                {system.intro.slice(1).map((para) => (
                  <p
                    key={para.slice(0, 40)}
                    className="text-[#6b7280] leading-relaxed mb-4 last:mb-0 md:text-lg"
                  >
                    {para}
                  </p>
                ))}
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* Key features */}
      <section className="py-12 md:py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3">Features</p>
            <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">Key features</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {system.features.map((f, i) => (
              <ScrollReveal key={f.name} delay={(i % 3) * 0.06}>
                <div className="border-t-2 border-[#007969] pt-5 h-full">
                  <h3 className="font-heading font-bold text-base text-[#1c1c1e] mb-3">{f.name}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SpecGrid specs={system.specs} />

      <Performance system={system} />

      {/* Configurations */}
      {system.configurations && (
        <section className="py-12 md:py-20 border-t border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-3">Configuration</p>
              <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">
                {system.configurations.heading}
              </h2>
            </ScrollReveal>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {system.configurations.items.map((item, i) => (
                <ScrollReveal key={item} delay={(i % 3) * 0.05}>
                  <li className="flex items-start gap-3 border border-gray-100 bg-white p-4 md:p-5 h-full">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#007969]"
                      aria-hidden="true"
                    />
                    <span className="text-[#3a3a3c] text-sm leading-relaxed">{item}</span>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Downloads
        items={
          system.brochureUrl
            ? [{ name: `${system.name} brochure`, href: system.brochureUrl }]
            : []
        }
      />

      {/* Related systems */}
      {related.length > 0 && (
        <section className="py-12 md:py-20 border-t border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6 md:mb-8">Related Vetromax systems</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {related.map((r, i) => (
                <ScrollReveal key={r.slug} delay={i * 0.08}>
                  <Link
                    href={`/brands/vetromax/${r.slug}`}
                    className="group flex h-full flex-col border border-gray-100 bg-white p-5 md:p-6 hover:border-[#007969]/40 transition-all active:scale-[0.99]"
                  >
                    <h3 className="font-heading font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-1">
                      {r.name}
                    </h3>
                    <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-3">
                      {r.category}
                    </p>
                    <p className="text-[#6b7280] text-sm leading-relaxed flex-1">{r.summary}</p>
                    <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mt-5">
                      View System →
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquiry */}
      <section className="py-16 md:py-24 bg-[#f8f9fa] border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Specify with confidence</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Talk to us about {system.name}
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Send us the opening dimensions and we will confirm whether {system.name} is the
              right system, along with glazing options and lead times for the UAE.
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
