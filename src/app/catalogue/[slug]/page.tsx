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
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-white/30 mb-8">
              <Link href="/catalogue" className="hover:text-white transition-colors">
                Catalogue
              </Link>
              <span>/</span>
              <span className="text-white/60">{category.name}</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#c4a55f] mb-4">Product Range</p>
            <h1 className="text-headline text-white mb-4 max-w-3xl">{category.name}</h1>
            <p
              className="text-2xl text-white/30 italic mb-8"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              {category.tagline}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">{category.description}</p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      {/* Products */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {category.products.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.08}>
                <div className="bg-[#0a0a0a] p-8 md:p-10 hover:bg-[#111] transition-colors duration-300">
                  {/* Placeholder visual */}
                  <div
                    className="w-full h-48 mb-8 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 50}, 8%, 12%) 0%, hsl(${i * 50 + 30}, 6%, 8%) 100%)`,
                    }}
                  >
                    <div className="w-20 h-20 border border-white/10 rotate-45" />
                    <div className="absolute top-4 right-4">
                      <span className="text-[0.6rem] tracking-widest uppercase text-white/20 border border-white/10 px-2 py-1">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-3">{product.name}</h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">{product.description}</p>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-label text-[#c4a55f] mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-white/40 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#c4a55f] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specs */}
                  {product.specs && (
                    <div className="border-t border-white/10 pt-6">
                      <p className="text-label text-[#c4a55f] mb-3">Specifications</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-[0.65rem] tracking-wide uppercase text-white/20 mb-1">{key}</p>
                            <p className="text-white/60 text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <Link
                      href="/enquire"
                      className="inline-flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#c4a55f] hover:text-white transition-colors"
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
      <section className="py-16 bg-[#0d0d0d] border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-8">Other Product Ranges</p>
          </ScrollReveal>
          <div className="flex flex-wrap gap-3">
            {productCategories
              .filter((c) => c.id !== category.id)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue/${cat.slug}`}
                  className="text-[0.7rem] tracking-widest uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-[#c4a55f]/50 hover:text-[#c4a55f] transition-all"
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
