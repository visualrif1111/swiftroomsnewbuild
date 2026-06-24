import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getBrands } from "@/lib/brands";
import { getCategories } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Cortizo, Vetromax & Gulf Extrusions — Authorised Brand Partners UAE",
  description:
    "Swiftrooms is an authorised partner for Cortizo, Vetromax, Vetro and Gulf Extrusions — Europe and the UAE's leading aluminium systems manufacturers.",
  alternates: { canonical: `${SITE_URL}/catalogue/brands` },
  openGraph: {
    title: "Brand Partners | Swiftrooms",
    description:
      "Authorised partner for Cortizo, Vetromax, Vetro and Gulf Extrusions — Europe and the UAE's leading aluminium systems manufacturers.",
    url: `${SITE_URL}/catalogue/brands`,
  },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const productCategories = await getCategories();
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${base}/catalogue` },
      { "@type": "ListItem", position: 3, name: "Brand Partners", item: `${base}/catalogue/brands` },
    ],
  };
  const brandListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swiftrooms Brand Partners",
    description: "Authorised partners for Cortizo, Vetromax, Vetro and Gulf Extrusions aluminium systems.",
    url: `${base}/catalogue/brands`,
    numberOfItems: brands.length,
    itemListElement: brands.map((brand, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Brand",
        name: brand.name,
        description: brand.tagline,
        foundingLocation: { "@type": "Place", name: brand.country },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandListSchema) }} />
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Brands</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Our Brand Partners</p>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Authorised partners for the world&apos;s best.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Swiftrooms is an authorised dealer and installation partner for the UAE&apos;s most
              sought-after aluminium and glazing system brands. Each brand we carry has been
              rigorously assessed for quality, performance and suitability for Gulf climates.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 space-y-16 md:space-y-24">
          {brands.map((brand, i) => {
            const brandProducts = productCategories.flatMap((c) =>
              c.products.filter((p) => p.brand === brand.name)
            );

            return (
              <div key={brand.id} id={brand.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
                  <ScrollReveal direction={i % 2 === 0 ? "left" : "right"}>
                    <div>
                      <span className="text-label text-[#007969] mb-4 block">{brand.country}</span>
                      <h2 className="text-title text-[#1c1c1e] mb-4">{brand.name}</h2>
                      <p className="text-base sm:text-xl text-[#6b7280] italic mb-6 md:mb-8">
                        {brand.tagline}
                      </p>
                      <p className="text-[#6b7280] leading-relaxed mb-8">{brand.description}</p>

                      {brand.speciality.length > 0 && (
                        <div>
                          <p className="text-label text-[#007969] mb-4">Specialities</p>
                          <div className="flex flex-wrap gap-2">
                            {brand.speciality.map((s) => (
                              <span
                                key={s}
                                className="text-[0.65rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-3 py-1.5"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.15}>
                    <div>
                      {brand.logo && (
                        <div className="relative h-40 md:h-52 overflow-hidden mb-8 bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-8">
                          <div className="relative w-full h-full">
                            <Image
                              src={brand.logo}
                              alt={`${brand.name} logo`}
                              fill
                              className="object-contain"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                          </div>
                        </div>
                      )}
                      {brandProducts.length > 0 && (
                        <>
                          <p className="text-label text-[#007969] mb-6">Products we supply</p>
                          <div className="space-y-3">
                            {brandProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-3"
                              >
                                <div>
                                  <p className="text-[#1c1c1e] text-sm">{product.name}</p>
                                  <p className="text-gray-400 text-xs capitalize">{product.category.replace(/-/g, " ")}</p>
                                </div>
                                <Link
                                  href={`/catalogue/${product.category}`}
                                  className="text-[0.65rem] tracking-widest uppercase text-gray-400 hover:text-[#007969] transition-colors"
                                >
                                  View →
                                </Link>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="mt-8">
                        <QuoteButton className="inline-flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#007969] border border-[#007969]/40 px-5 py-3 hover:bg-[#007969]/10 transition-all">
                          Enquire about {brand.name}
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </QuoteButton>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {i < brands.length - 1 && (
                  <div className="mt-12 md:mt-20 border-b border-gray-100" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
