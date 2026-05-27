import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return productCategories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = productCategories.find((c) => c.slug === slug);
  if (!category) return { title: "Not Found" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = productCategories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widests uppercase text-gray-400 mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">
                Catalogue
              </Link>
              <span>/</span>
              <span className="text-[#6b7280]">{category.name}</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Product Range</p>
            <h1 className="text-headline text-[#1c1c1e] mb-4 max-w-3xl">{category.name}</h1>
            <p className="text-xl text-[#6b7280] italic mb-8">
              {category.tagline}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">{category.description}</p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      {/* Products */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {category.products.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.08}>
                <div className="bg-white p-8 md:p-10 hover:bg-[#f8f9fa] transition-colors duration-300">
                  {/* Visual placeholder */}
                  <div
                    className="w-full h-48 mb-8 flex items-center justify-center relative overflow-hidden bg-[#f0fdf4]"
                  >
                    <div className="w-20 h-20 border border-[#007969]/20 rotate-45" />
                    <div className="absolute top-4 right-4">
                      <span className="text-[0.6rem] tracking-widests uppercase text-[#007969] border border-[#007969]/30 px-2 py-1 bg-white">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-[#1c1c1e] mb-3">{product.name}</h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-6">{product.description}</p>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-label text-[#007969] mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[#6b7280] text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#007969] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specs */}
                  {product.specs && (
                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-label text-[#007969] mb-3">Specifications</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-[0.65rem] tracking-wide uppercase text-gray-400 mb-1">{key}</p>
                            <p className="text-[#3a3a3c] text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <Link
                      href="/enquire"
                      className="inline-flex items-center gap-2 text-[0.7rem] tracking-widests uppercase text-[#007969] hover:text-[#005a50] transition-colors"
                    >
                      Enquire about this product
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related categories */}
      <section className="py-16 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-8">Other Product Ranges</p>
          </ScrollReveal>
          <div className="flex flex-wrap gap-3">
            {productCategories
              .filter((c) => c.id !== category.id)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue/${cat.slug}`}
                  className="text-[0.7rem] tracking-widests uppercase text-[#6b7280] border border-gray-200 px-4 py-2 hover:border-[#007969] hover:text-[#007969] transition-all"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
