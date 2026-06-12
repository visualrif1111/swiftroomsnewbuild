import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string; product: string }>;
}

export async function generateStaticParams() {
  return productCategories.flatMap((cat) =>
    cat.products.map((product) => ({
      slug: cat.slug,
      product: product.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, product: productSlug } = await params;
  const cat = productCategories.find((c) => c.slug === slug);
  const product = cat?.products.find((p) => p.slug === productSlug);
  if (!product) return { title: "Not Found" };
  return {
    title: `${product.name} — ${cat!.name}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, product: productSlug } = await params;
  const cat = productCategories.find((c) => c.slug === slug);
  if (!cat) notFound();
  const product = cat.products.find((p) => p.slug === productSlug);
  if (!product) notFound();

  const related = cat.products.filter((p) => p.id !== product.id).slice(0, 3);
  const heroImage = product.image ?? cat.image;

  return (
    <>
      {/* 1 — Hero */}
      <section className="pt-32 pb-0 md:pt-44 lg:pt-52">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8 flex-wrap">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">
                Catalogue
              </Link>
              <span>/</span>
              <Link href={`/catalogue/${cat.slug}`} className="hover:text-[#007969] transition-colors">
                {cat.name}
              </Link>
              <span>/</span>
              <span className="text-[#6b7280]">{product.name}</span>
            </nav>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end pb-12 md:pb-20">
            <div>
              <ScrollReveal>
                <span className="text-[0.65rem] tracking-widest uppercase text-[#007969] border border-[#007969]/30 px-3 py-1 inline-block mb-5">
                  {product.brand}
                </span>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="text-label text-[#007969] mb-3">{cat.name}</p>
                <h1 className="text-headline text-[#1c1c1e] mb-5">{product.name}</h1>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="text-body-lg text-[#6b7280] max-w-xl">{product.description}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link href="/enquire" className="btn-brand">
                    Enquire About This Product
                  </Link>
                  <Link href="/showroom" className="btn-outline">
                    See It In Our Showroom
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Hero spec highlights */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                  {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="bg-[#f8f9fa] p-5 md:p-6">
                      <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-2">{key}</p>
                      <p className="text-[#1c1c1e] font-semibold text-sm md:text-base">{value as string}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* Hero image */}
      {heroImage && (
        <section className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mb-0">
          <ScrollReveal>
            <div className="w-full h-[45vh] md:h-[60vh] relative overflow-hidden">
              <Image
                src={heroImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 2 — Product Introduction */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Product Introduction</p>
            <h2 className="text-title text-[#1c1c1e] mb-6">{product.name}</h2>
            <p className="text-[#6b7280] leading-relaxed text-lg">{product.description}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              <p className="text-label text-[#007969] mb-4">Why specify {product.name.split(" ")[0]}?</p>
              <p className="text-[#6b7280] leading-relaxed">
                The {product.name} represents the premium end of the {cat.name.toLowerCase()} market — a system
                designed for projects where performance, aesthetics and long-term reliability are
                non-negotiable. Every component is engineered to European standards and backed by full
                manufacturer warranty.
              </p>
              <p className="text-[#6b7280] leading-relaxed">
                As authorised {product.brand} partners, Swiftrooms supply and install this system to the
                manufacturer&apos;s exact specification — ensuring the performance credentials translate
                from the data sheet to the installed product.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3 — Technical Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="py-14 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-4">Technical Specifications</p>
              <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
                Performance data.
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
              {Object.entries(product.specs).map(([key, value], i) => (
                <ScrollReveal key={key} delay={i * 0.06}>
                  <div className="bg-white p-6 md:p-8">
                    <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-3">{key}</p>
                    <p className="text-2xl font-semibold text-[#1c1c1e]">{value as string}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <p className="text-[#6b7280] text-sm mt-6">
                Specifications shown are manufacturer-published values. Contact our technical team for project-specific performance data or independent test reports.
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 4 — Benefits */}
      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Key Features</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
              What sets it apart.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {product.features.map((feature, i) => (
              <ScrollReveal key={feature} delay={i * 0.07}>
                <div className="bg-white p-6 md:p-8 flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#007969] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#1c1c1e] font-medium">{feature}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Gallery */}
      <section className="py-14 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Gallery</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
              Installed &amp; at scale.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {[heroImage, cat.image, product.image].filter(Boolean).map((img, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={`relative overflow-hidden ${i === 0 ? "col-span-2 md:col-span-2 h-64 md:h-80" : "h-36 md:h-40"}`}>
                  <Image
                    src={img!}
                    alt={`${product.name} installation ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="mt-6">
              <Link href="/catalogue/gallery" className="btn-outline inline-flex">
                View Full Gallery
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6 — Downloads */}
      <section className="py-14 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Downloads</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">Technical documentation.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: `${product.name} — Technical Data Sheet`, type: "PDF" },
              { title: `${product.brand} Performance Certificates`, type: "PDF" },
              { title: "Installation & Maintenance Guide", type: "PDF" },
            ].map((doc, i) => (
              <ScrollReveal key={doc.title} delay={i * 0.08}>
                <Link
                  href="/technical/resources"
                  className="group flex items-center gap-4 border border-gray-100 p-5 hover:border-[#007969]/30 bg-white transition-all"
                >
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#007969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3a3a3c] text-sm font-medium group-hover:text-[#007969] transition-colors truncate">
                      {doc.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{doc.type} — Request via Resources</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#007969] flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Related Products */}
      {related.length > 0 && (
        <section className="py-14 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-8">
                Other {cat.name}
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              {related.map((rel, i) => (
                <ScrollReveal key={rel.id} delay={i * 0.08}>
                  <Link
                    href={`/catalogue/${cat.slug}/${rel.slug}`}
                    className="group block bg-white hover:bg-[#f0fdf4] transition-colors p-6 md:p-8"
                  >
                    {(rel.image ?? cat.image) && (
                      <div className="w-full h-32 relative overflow-hidden mb-5">
                        <Image
                          src={(rel.image ?? cat.image)!}
                          alt={rel.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="33vw"
                        />
                      </div>
                    )}
                    <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-2 block">{rel.brand}</span>
                    <h3 className="text-[#1c1c1e] font-semibold mb-2 group-hover:text-[#007969] transition-colors">
                      {rel.name}
                    </h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">{rel.description}</p>
                    <span className="mt-4 block text-[0.65rem] tracking-widest uppercase text-[#007969]">
                      View Product →
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <div className="mt-6">
                <Link href={`/catalogue/${cat.slug}`} className="btn-outline inline-flex">
                  View All {cat.name}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 8 — CTA */}
      <section className="py-20 md:py-32 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-white/70 mb-4">Interested in {product.name}?</p>
            <h2 className="text-title text-white mb-6 max-w-2xl mx-auto">
              Get a specification and quote
            </h2>
            <p className="text-white/70 mb-10 max-w-md mx-auto">
              Our team will assess your project requirements and provide a detailed quotation for this system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors"
              >
                Enquire Now
              </Link>
              <Link
                href="/showroom"
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:bg-white/10 transition-all"
              >
                Visit Showroom
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
