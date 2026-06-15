"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { blogPosts } from "@/lib/data";

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

function sortedByDate(posts: typeof blogPosts) {
  return [...posts].sort((a, b) => {
    const [aMonth, aYear] = a.date.split(" ");
    const [bMonth, bYear] = b.date.split(" ");
    const aVal = parseInt(aYear) * 100 + (MONTHS[aMonth] ?? 0);
    const bVal = parseInt(bYear) * 100 + (MONTHS[bMonth] ?? 0);
    return bVal - aVal;
  });
}

const sorted = sortedByDate(blogPosts);
const categories = ["All", ...Array.from(new Set(sorted.map((p) => p.category)))];

export default function BlogClient() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? sorted : sorted.filter((p) => p.category === active);

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8 flex-wrap">
              <Link href="/technical" className="hover:text-[#007969] transition-colors">Technical</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Blog &amp; Insights</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Insights &amp; expertise.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Guides, product deep-dives and technical advice from the Swiftrooms team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Category filter */}
      <section className="pt-10 pb-4">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-[0.65rem] tracking-widest uppercase px-4 py-2.5 border transition-all ${
                  active === cat
                    ? "bg-[#007969] text-white border-[#007969]"
                    : "border-gray-200 text-[#6b7280] hover:border-[#007969] hover:text-[#007969]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Featured first post */}
              {filtered.length > 0 && (
                <ScrollReveal>
                  <Link
                    href={`/technical/blog/${filtered[0].slug}`}
                    className="group mb-px flex flex-col md:flex-row bg-white hover:bg-[#f8f9fa] transition-colors duration-300 overflow-hidden border-b border-gray-100"
                  >
                    <div className="w-full md:w-1/2 h-56 md:h-80 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={filtered[0].image}
                        alt={filtered[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-7 md:p-10 lg:p-14 flex flex-col justify-center flex-1">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] border border-[#007969]/30 px-2 py-1">
                          {filtered[0].category}
                        </span>
                        <span className="text-gray-400 text-xs">{filtered[0].date}</span>
                        <span className="text-[0.55rem] tracking-widest uppercase text-white bg-[#007969] px-2 py-1">
                          Latest
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#1c1c1e] mb-4 leading-snug group-hover:text-[#007969] transition-colors max-w-lg">
                        {filtered[0].title}
                      </h2>
                      <p className="text-[#6b7280] leading-relaxed mb-8 max-w-md line-clamp-3">
                        {filtered[0].excerpt}
                      </p>
                      <div className="flex items-center gap-6">
                        <span className="text-[0.65rem] tracking-widest uppercase text-[#007969]">
                          Read article →
                        </span>
                        <span className="text-gray-400 text-xs">{filtered[0].readTime}</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              )}

              {/* Remaining posts grid */}
              {filtered.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 mt-px">
                  {filtered.slice(1).map((post, i) => (
                    <ScrollReveal key={post.slug} delay={i * 0.06}>
                      <Link
                        href={`/technical/blog/${post.slug}`}
                        className="group block bg-white hover:bg-[#f8f9fa] transition-colors duration-300 h-full flex flex-col overflow-hidden"
                      >
                        <div className="h-36 sm:h-44 relative overflow-hidden flex-shrink-0">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-5 sm:p-8 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-5">
                            <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] border border-[#007969]/30 px-2 py-1">
                              {post.category}
                            </span>
                            <span className="text-gray-400 text-xs">{post.date}</span>
                          </div>
                          <h2 className="text-[#1c1c1e] font-semibold mb-3 leading-snug flex-1 group-hover:text-[#007969] transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-[#6b7280] text-sm leading-relaxed mb-6 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <span className="text-gray-400 text-xs">{post.readTime}</span>
                            <span className="text-[0.65rem] tracking-widest uppercase text-[#007969] group-hover:underline">
                              Read article →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <p className="text-[#6b7280] py-12 text-center">No articles in this category yet.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-gray-100 bg-[#f8f9fa]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Need project advice?</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Talk to our specification team
            </h2>
            <p className="text-[#6b7280] mb-10 max-w-md mx-auto">
              Every project is different. Our team provides expert guidance tailored to your specific requirements — no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/enquire" className="btn-brand">Get A Quote</Link>
              <Link href="/showroom" className="btn-outline">Visit Showroom</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
