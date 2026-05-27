import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description:
    "Browse the complete Swiftrooms product range — aluminium doors, windows, curtain wall, bi-fold, uPVC and more.",
};

export default function CataloguePage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Catalogue</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              The complete product range
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Premium aluminium windows, doors, curtain wall, bi-fold and uPVC systems.
              Engineered in Europe, installed to the highest standards across the UAE.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          {/* Quick links */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-3 mb-16">
              {productCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue/${cat.slug}`}
                  className="text-[0.7rem] tracking-widest uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-[#c4a55f]/50 hover:text-[#c4a55f] transition-all"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/catalogue/brands"
                className="text-[0.7rem] tracking-widest uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-[#c4a55f]/50 hover:text-[#c4a55f] transition-all"
              >
                Brands
              </Link>
              <Link
                href="/catalogue/promotions"
                className="text-[0.7rem] tracking-widest uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-[#c4a55f]/50 hover:text-[#c4a55f] transition-all"
              >
                Promotions
              </Link>
            </div>
          </ScrollReveal>

          {/* Category grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {productCategories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 0.06}>
                <Link
                  href={`/catalogue/${cat.slug}`}
                  className="group block bg-[#0a0a0a] p-8 md:p-10 hover:bg-[#111] transition-colors duration-300"
                >
                  <span className="text-label text-[#c4a55f] mb-4 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-[#c4a55f] transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6 italic" style={{ fontFamily: "var(--font-dm-serif)" }}>
                    {cat.tagline}
                  </p>
                  <p className="text-white/30 text-sm leading-relaxed mb-8 line-clamp-3">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] tracking-widest uppercase text-white/20">
                      {cat.products.length} products
                    </span>
                    <div className="flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-white/30 group-hover:text-[#c4a55f] transition-colors">
                      View range
                      <svg
                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Extra links */}
          <div className="mt-px grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            <ScrollReveal>
              <Link
                href="/catalogue/promotions"
                className="group block bg-[#0a0a0a] p-8 md:p-10 hover:bg-[#111] transition-colors duration-300"
              >
                <span className="text-label text-[#c4a55f] mb-4 block">Special Offers</span>
                <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-[#c4a55f] transition-colors">
                  Promotions
                </h2>
                <p className="text-white/30 text-sm">Current offers and seasonal promotions</p>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link
                href="/catalogue/gallery"
                className="group block bg-[#0a0a0a] p-8 md:p-10 hover:bg-[#111] transition-colors duration-300"
              >
                <span className="text-label text-[#c4a55f] mb-4 block">Inspiration</span>
                <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-[#c4a55f] transition-colors">
                  Gallery
                </h2>
                <p className="text-white/30 text-sm">Product photography and installation photography</p>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
