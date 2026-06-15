"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories, blogPosts } from "@/lib/data";
import { QuoteButton } from "@/components/forms/CTAButtons";

type Category = (typeof productCategories)[0];
type Product = Category["products"][0];

function ProductCard({ product, index, categoryImage }: { product: Product; index: number; categoryImage?: string }) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const heroImage = product.image ?? categoryImage;

  return (
    <ScrollReveal key={product.id} delay={index * 0.08}>
      <div className="bg-white p-5 md:p-8 lg:p-10 hover:bg-[#f8f9fa] transition-colors duration-300">
        <div className="w-full h-36 md:h-48 mb-6 md:mb-8 relative overflow-hidden bg-[#f0fdf4]">
          {heroImage ? (
            <Image src={heroImage} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 md:w-20 h-16 md:h-20 border border-[#007969]/20 rotate-45" />
            </div>
          )}
          <div className="absolute top-3 right-3 md:top-4 md:right-4">
            <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] border border-[#007969]/30 px-2 py-1 bg-white/90">
              {product.brand}
            </span>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-semibold text-[#1c1c1e] mb-3">{product.name}</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-5 md:mb-6">{product.description}</p>

        <div className="mb-4 md:mb-6">
          <button
            className="w-full flex items-center justify-between text-left md:cursor-default"
            onClick={() => setFeaturesOpen(!featuresOpen)}
          >
            <p className="text-label text-[#007969]">Key Features</p>
            <span className="md:hidden">
              <motion.svg
                animate={{ rotate: featuresOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-[#007969]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {featuresOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-3 space-y-2"
              >
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[#6b7280] text-sm">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-[#007969] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {product.specs && (
          <div className="border-t border-gray-100 pt-4 md:pt-6">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setSpecsOpen(!specsOpen)}
            >
              <p className="text-label text-[#007969]">Specifications</p>
              <motion.svg
                animate={{ rotate: specsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-[#007969]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {specsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[0.65rem] tracking-wide uppercase text-gray-400 mb-1">{key}</p>
                        <p className="text-[#3a3a3c] text-sm">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
          <Link href={`/catalogue/${product.category}/${product.slug}`} className="btn-brand text-xs sm:text-sm">
            View Product Details
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <QuoteButton className="btn-outline text-xs sm:text-sm">
            Enquire
          </QuoteButton>
        </div>
      </div>
    </ScrollReveal>
  );
}

function CompareTable({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);

  const productsWithSpecs = category.products.filter(
    (p) => p.specs && Object.keys(p.specs).length > 0
  );
  if (productsWithSpecs.length < 2) return null;

  const allKeys = Array.from(
    new Set(productsWithSpecs.flatMap((p) => Object.keys(p.specs ?? {})))
  );

  return (
    <section className="py-10 md:py-14 border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-label text-[#007969] mb-1">Side-by-side</p>
              <h2 className="text-lg md:text-xl font-semibold text-[#1c1c1e]">Compare models.</h2>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase border border-gray-200 px-4 py-2.5 text-[#6b7280] hover:border-[#007969] hover:text-[#007969] transition-all"
            >
              {open ? "Hide" : "Show"} comparison
              <motion.svg
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
          </div>
        </ScrollReveal>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto -mx-5 md:mx-0 px-5 md:px-0">
                <table className="w-full min-w-[480px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#007969]">
                      <th className="text-left py-3 pr-6 w-40 text-[0.6rem] tracking-widest uppercase text-gray-400 font-normal">
                        Specification
                      </th>
                      {productsWithSpecs.map((p) => (
                        <th
                          key={p.id}
                          className="text-left py-3 px-4 font-semibold text-[#1c1c1e] text-xs leading-snug"
                        >
                          {p.name}
                          <span className="block text-[0.55rem] tracking-widest uppercase text-[#007969] font-normal mt-0.5">
                            {p.brand}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allKeys.map((key, i) => (
                      <tr
                        key={key}
                        className={i % 2 === 0 ? "bg-white" : "bg-[#f8f9fa]"}
                      >
                        <td className="py-3 pr-6 text-[0.65rem] tracking-wide uppercase text-gray-400 align-top">
                          {key}
                        </td>
                        {productsWithSpecs.map((p) => (
                          <td
                            key={p.id}
                            className="py-3 px-4 text-[#3a3a3c] align-top"
                          >
                            {(p.specs as Record<string, string>)?.[key] ?? (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {productsWithSpecs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/catalogue/${p.category}/${p.slug}`}
                    className="btn-outline text-xs"
                  >
                    View {p.name} →
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CategoryFAQ({ category }: { category: Category }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!category.faqs || category.faqs.length === 0) return null;

  return (
    <section className="py-12 md:py-20 border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p className="text-label text-[#007969] mb-3">Common Questions</p>
            <h2 className="text-title text-[#1c1c1e] mb-10">
              Frequently asked questions.
            </h2>
          </div>
        </ScrollReveal>
        <div className="max-w-3xl space-y-0">
          {category.faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-5 text-left group"
                >
                  <span className="text-[#1c1c1e] text-sm md:text-base font-medium leading-snug group-hover:text-[#007969] transition-colors">
                    {faq.q}
                  </span>
                  <motion.svg
                    animate={{ rotate: openIdx === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 flex-shrink-0 mt-1 text-[#007969]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#6b7280] text-sm leading-relaxed pb-5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.2}>
          <div className="mt-8 max-w-3xl">
            <p className="text-[#6b7280] text-sm">
              Have a question not listed here?{" "}
              <QuoteButton className="text-[#007969] hover:underline">
                Contact our technical team →
              </QuoteButton>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function CategoryClient({ category }: { category: Category }) {
  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#6b7280]">{category.name}</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-3 md:mb-4">Product Range</p>
            <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4 max-w-3xl">{category.name}</h1>
            <p className="text-base md:text-xl text-[#6b7280] italic mb-6 md:mb-8">{category.tagline}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">{category.description}</p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {category.products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} categoryImage={category.image} />
            ))}
          </div>
        </div>
      </section>

      <CompareTable category={category} />

      <CategoryFAQ category={category} />

      {category.relatedBlogSlugs && category.relatedBlogSlugs.length > 0 && (() => {
        const relatedPosts = category.relatedBlogSlugs!
          .map((s) => blogPosts.find((p) => p.slug === s))
          .filter(Boolean) as typeof blogPosts;
        if (relatedPosts.length === 0) return null;
        return (
          <section className="py-12 md:py-20 border-t border-gray-100">
            <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
              <ScrollReveal>
                <div className="flex items-end justify-between mb-8 md:mb-12">
                  <div>
                    <p className="text-label text-[#007969] mb-3">Technical Insights</p>
                    <h2 className="text-title text-[#1c1c1e]">Further reading.</h2>
                  </div>
                  <Link href="/technical/blog" className="hidden sm:flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#6b7280] hover:text-[#007969] transition-colors">
                    All articles →
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
                {relatedPosts.map((post, i) => (
                  <ScrollReveal key={post.slug} delay={i * 0.08}>
                    <Link href={`/technical/blog/${post.slug}`} className="group block bg-white hover:bg-[#f8f9fa] transition-colors h-full">
                      {post.image && (
                        <div className="h-36 relative overflow-hidden">
                          <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                      )}
                      <div className="p-5 md:p-6">
                        <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-2 block">{post.category}</span>
                        <h3 className="font-semibold text-[#1c1c1e] text-sm leading-snug group-hover:text-[#007969] transition-colors mb-2">{post.title}</h3>
                        <p className="text-gray-400 text-xs">{post.date} · {post.readTime}</p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      <section className="py-12 md:py-16 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6 md:mb-8">Other Product Ranges</p>
          </ScrollReveal>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:flex-wrap md:overflow-x-visible md:pb-0">
            {productCategories
              .filter((c) => c.id !== category.id)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue/${cat.slug}`}
                  className="text-[0.7rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-4 py-2.5 hover:border-[#007969] hover:text-[#007969] transition-all whitespace-nowrap flex-shrink-0"
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
