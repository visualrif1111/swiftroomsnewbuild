import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getCategories } from "@/lib/catalogue";
import PartnerBrands from "@/components/PartnerBrands";
import ProductSelector from "@/components/ProductSelector";

export const metadata: Metadata = {
  title: "Aluminium Windows, Doors & Glazing Systems — Full Product Range UAE",
  description:
    "Browse the complete Swiftrooms product range — aluminium sliding doors, bi-fold doors, curtain wall, windows, uPVC systems, skylights, garden rooms and insect screens for UAE projects.",
  alternates: { canonical: `${SITE_URL}/catalogue` },
  openGraph: {
    title: "Product Catalogue | Swiftrooms",
    description:
      "Browse the complete Swiftrooms product range — aluminium doors, windows, curtain wall, bi-fold, uPVC and more. Engineered in Europe, installed across the UAE.",
    url: `${SITE_URL}/catalogue`,
  },
};

export default async function CataloguePage() {
  const productCategories = await getCategories();
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Product Catalogue", item: `${base}/catalogue` },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swiftrooms Product Catalogue",
    description: "The complete range of premium aluminium windows, doors and glazing systems available from Swiftrooms UAE.",
    url: `${base}/catalogue`,
    numberOfItems: productCategories.length,
    itemListElement: productCategories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `${base}/catalogue/${cat.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Catalogue</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              The complete product range
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Premium aluminium windows, doors, curtain wall, bi-fold and uPVC systems.
              Engineered in Europe, installed to the highest standards across the UAE.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          {/* Quick links */}
          <ScrollReveal>
            <div className="flex gap-2 md:gap-3 mb-10 md:mb-16 overflow-x-auto overscroll-x-contain pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
              {productCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue/${cat.slug}`}
                  className="text-[0.7rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-4 py-2 hover:border-[#007969] hover:text-[#007969] transition-all whitespace-nowrap flex-shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/catalogue/brands"
                className="text-[0.7rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-4 py-2 hover:border-[#007969] hover:text-[#007969] transition-all whitespace-nowrap flex-shrink-0"
              >
                Brands
              </Link>
              <Link
                href="/catalogue/promotions"
                className="text-[0.7rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-4 py-2 hover:border-[#007969] hover:text-[#007969] transition-all whitespace-nowrap flex-shrink-0"
              >
                Promotions
              </Link>
            </div>
          </ScrollReveal>

          {/* Category grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
            {productCategories.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 0.06}>
                <Link
                  href={`/catalogue/${cat.slug}`}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors duration-300 overflow-hidden h-full"
                >
                  {cat.image && (
                    <div className="h-36 sm:h-44 relative overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                  <span className="text-label text-[#007969] mb-4 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-semibold text-[#1c1c1e] mb-3 group-hover:text-[#007969] transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-4 italic">
                    {cat.tagline}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] tracking-widest uppercase text-gray-400">
                      {cat.products.length} products
                    </span>
                    <div className="flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-gray-400 group-hover:text-[#007969] transition-colors">
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
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Guided selector */}
          <ScrollReveal>
            <div className="mt-16 md:mt-24">
              <ProductSelector categories={productCategories} />
            </div>
          </ScrollReveal>

          {/* Manufacturer partners */}
          <ScrollReveal>
            <div className="mt-16 md:mt-24 border-t border-gray-100 pt-12 md:pt-16">
              <PartnerBrands heading="Engineered with the world's leading systems" />
            </div>
          </ScrollReveal>

          {/* Extra links */}
          <div className="mt-px grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            <ScrollReveal>
              <Link
                href="/catalogue/promotions"
                className="group block bg-white p-5 sm:p-8 md:p-10 hover:bg-[#f0fdf4] transition-colors duration-300"
              >
                <span className="text-label text-[#007969] mb-4 block">Special Offers</span>
                <h2 className="text-xl font-semibold text-[#1c1c1e] mb-3 group-hover:text-[#007969] transition-colors">
                  Promotions
                </h2>
                <p className="text-gray-400 text-sm">Current offers and seasonal promotions</p>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link
                href="/catalogue/gallery"
                className="group block bg-white p-5 sm:p-8 md:p-10 hover:bg-[#f0fdf4] transition-colors duration-300"
              >
                <span className="text-label text-[#007969] mb-4 block">Inspiration</span>
                <h2 className="text-xl font-semibold text-[#1c1c1e] mb-3 group-hover:text-[#007969] transition-colors">
                  Gallery
                </h2>
                <p className="text-gray-400 text-sm">Product photography and installation photography</p>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
