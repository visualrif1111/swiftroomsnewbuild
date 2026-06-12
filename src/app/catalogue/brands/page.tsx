import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { brands, productCategories } from "@/lib/data";

const brandImages: Record<string, string> = {
  cortizo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "gulf-extrusion": "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80",
  vetro: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
  vetromax: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
};

export const metadata: Metadata = {
  title: "Brand Partners",
  description:
    "Swiftrooms is an authorised partner for Cortizo, Vetromax, Vetro and Gulf Extrusions — Europe and the UAE's leading aluminium systems manufacturers.",
  openGraph: {
    title: "Brand Partners | Swiftrooms",
    description:
      "Authorised partner for Cortizo, Vetromax, Vetro and Gulf Extrusions — Europe and the UAE's leading aluminium systems manufacturers.",
    url: "https://swiftrooms-newbuild.vercel.app/catalogue/brands",
  },
};

export default function BrandsPage() {
  const base = "https://swiftrooms-newbuild.vercel.app";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandListSchema) }} />
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widests uppercase text-gray-400 mb-8">
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

                      <div>
                        <p className="text-label text-[#007969] mb-4">Specialities</p>
                        <div className="flex flex-wrap gap-2">
                          {brand.speciality.map((s) => (
                            <span
                              key={s}
                              className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] border border-gray-200 px-3 py-1.5"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.15}>
                    <div>
                      {brandImages[brand.id] && (
                        <div className="relative h-48 md:h-64 overflow-hidden mb-8">
                          <Image
                            src={brandImages[brand.id]}
                            alt={brand.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
                                  className="text-[0.65rem] tracking-widests uppercase text-gray-400 hover:text-[#007969] transition-colors"
                                >
                                  View →
                                </Link>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="mt-8">
                        <Link
                          href="/enquire"
                          className="inline-flex items-center gap-2 text-[0.7rem] tracking-widests uppercase text-[#007969] border border-[#007969]/40 px-5 py-3 hover:bg-[#007969]/10 transition-all"
                        >
                          Enquire about {brand.name}
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
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
