import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { brands, productCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Brand Partners",
  description:
    "Swiftrooms is an authorised partner for Cortizo, Gulf Extrusion, Al Ghurair and Vetromax — Europe and the UAE's leading aluminium systems manufacturers.",
};

export default function BrandsPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-white/30 mb-8">
              <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-white/60">Brands</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#c4a55f] mb-4">Our Brand Partners</p>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Authorised partners for
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                the world&apos;s best.
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Swiftrooms is an authorised dealer and installation partner for the UAE&apos;s most
              sought-after aluminium and glazing system brands. Each brand we carry has been
              rigorously assessed for quality, performance and suitability for Gulf climates.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 space-y-24">
          {brands.map((brand, i) => {
            const brandProducts = productCategories.flatMap((c) =>
              c.products.filter((p) => p.brand === brand.name)
            );

            return (
              <div key={brand.id} id={brand.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                  <ScrollReveal direction={i % 2 === 0 ? "left" : "right"}>
                    <div>
                      <span className="text-label text-[#c4a55f] mb-4 block">{brand.country}</span>
                      <h2 className="text-title text-white mb-4">{brand.name}</h2>
                      <p
                        className="text-xl text-white/30 italic mb-8"
                        style={{ fontFamily: "var(--font-dm-serif)" }}
                      >
                        {brand.tagline}
                      </p>
                      <p className="text-white/50 leading-relaxed mb-8">{brand.description}</p>

                      <div>
                        <p className="text-label text-[#c4a55f] mb-4">Specialities</p>
                        <div className="flex flex-wrap gap-2">
                          {brand.speciality.map((s) => (
                            <span
                              key={s}
                              className="text-[0.65rem] tracking-widest uppercase text-white/40 border border-white/10 px-3 py-1.5"
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
                      {brandProducts.length > 0 && (
                        <>
                          <p className="text-label text-[#c4a55f] mb-6">Products we supply</p>
                          <div className="space-y-3">
                            {brandProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between border-b border-white/10 pb-3"
                              >
                                <div>
                                  <p className="text-white text-sm">{product.name}</p>
                                  <p className="text-white/30 text-xs capitalize">{product.category.replace(/-/g, " ")}</p>
                                </div>
                                <Link
                                  href={`/catalogue/${product.category}`}
                                  className="text-[0.65rem] tracking-widest uppercase text-white/30 hover:text-[#c4a55f] transition-colors"
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
                          className="inline-flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#c4a55f] border border-[#c4a55f]/40 px-5 py-3 hover:bg-[#c4a55f]/10 transition-all"
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
                  <div className="mt-20 rule-gold" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
