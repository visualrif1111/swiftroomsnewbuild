// "Shop By Brand" — the /brands index, matching the live site's URL surface.
//
// This lists only brands that have a page of their own (see BRAND_ROUTES).
// The catalogue keeps its own, longer brand index at /catalogue/brands, which
// covers every brand including those without a standalone page; this page is
// the shorter entry point the live site links from its navigation.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { getBrands } from "@/lib/brands";
import { BRAND_CARDS, brandHref } from "@/lib/brandRoutes";

export const metadata: Metadata = {
  title: { absolute: "Shop By Brand | Swiftrooms" },
  description:
    "Dedicated system pages for our specialist manufacturer partners, engineered in Europe, re-specified for Gulf conditions.",
  alternates: { canonical: `${SITE_URL}/brands` },
  openGraph: {
    title: "Shop By Brand | Swiftrooms",
    description:
      "Dedicated system pages for our specialist manufacturer partners, engineered in Europe, re-specified for Gulf conditions.",
    url: `${SITE_URL}/brands`,
  },
};

export default async function ShopByBrandPage() {
  const brands = await getBrands();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop By Brand", item: `${SITE_URL}/brands` },
    ],
  };

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swiftrooms Brand Partners",
    url: `${SITE_URL}/brands`,
    numberOfItems: BRAND_CARDS.length,
    itemListElement: BRAND_CARDS.map((card, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${card.href ?? brandHref(card.slug) ?? "/brands"}`,
      item: {
        "@type": "Brand",
        name: card.name,
        description: card.strapline,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <section className="pt-32 pb-20 md:pt-44 md:pb-28 lg:pt-52">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3 md:mb-4">Brand Partners</p>
            <h1 className="text-headline text-[#1c1c1e] mb-6 max-w-2xl">Shop By Brand</h1>
            <p className="text-body-lg text-[#6b7280] max-w-2xl mb-12 md:mb-16">
              Dedicated system pages for our specialist manufacturer partners, engineered in
              Europe, re-specified for Gulf conditions.
            </p>
          </ScrollReveal>

          {/* Hairline grid, as on swiftrooms.ae; each cell also carries the brand's logo. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {BRAND_CARDS.map((card, i) => {
              const brand = brands.find((b) => b.slug === card.slug);
              return (
                <ScrollReveal key={card.slug} delay={(i % 3) * 0.08}>
                  <Link
                    href={card.href ?? brandHref(card.slug) ?? "/brands"}
                    className="group block bg-white p-6 md:p-8 h-full hover:bg-[#f0fdf4] transition-colors"
                  >
                    {brand?.logo && (
                      <div className="relative h-10 w-36 mb-5">
                        <Image
                          src={brand.logo}
                          alt={`${card.name} logo`}
                          fill
                          className="object-contain object-left"
                          sizes="144px"
                        />
                      </div>
                    )}
                    <p className="text-label text-[#007969] mb-3">Brand Partner</p>
                    <h2 className="text-xl font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors">
                      {card.name}
                    </h2>
                    <p className="text-[#6b7280] text-sm italic mb-4">{card.strapline}</p>
                    <span className="text-[0.65rem] tracking-widest uppercase text-[#007969]">View system →</span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal delay={0.2}>
            <p className="text-[#6b7280] text-sm mt-10">
              Looking for the full picture?{" "}
              <Link href="/catalogue/brands" className="text-[#007969] underline underline-offset-4">
                See every brand partner and the products we supply
              </Link>
              .
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Specify with confidence</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Not sure which system fits your project?
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Tell us what you are building and we will recommend the right system, glazing
              specification and realistic lead times for the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton className="btn-brand">Get A Quote</QuoteButton>
              <ShowroomButton className="btn-outline">Visit Showroom</ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
