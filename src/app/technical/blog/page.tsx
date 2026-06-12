"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { blogPosts } from "@/lib/data";

const categories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

export default function BlogPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Technical</p>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100"
            >
              {filtered.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 0.07}>
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
