"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { faqs } from "@/lib/data";

const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [open, setOpen] = useState<number | null>(0);

  const filtered =
    activeCategory === "All" ? faqs : faqs.filter((f) => f.category === activeCategory);

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    setOpen(null);
  }

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Frequently asked questions.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Answers to the questions we hear most often. Use the filters below to find your topic, or
              contact our team directly.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
            {/* Sidebar categories */}
            <div className="lg:col-span-1">
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-4">Topics</p>
                <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategory(cat)}
                      className={`text-left text-sm py-2 px-3 lg:px-0 lg:py-2.5 border lg:border-0 lg:border-b transition-all ${
                        activeCategory === cat
                          ? "text-[#007969] border-[#007969] lg:border-[#007969] font-semibold"
                          : "text-[#6b7280] border-gray-200 lg:border-gray-100 hover:text-[#007969]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="mt-8 hidden lg:block">
                  <p className="text-label text-[#007969] mb-3">Still have questions?</p>
                  <p className="text-[#6b7280] text-sm mb-4 leading-relaxed">
                    Our team is available to answer any question about your project.
                  </p>
                  <Link href="/contact" className="btn-brand text-xs">
                    Contact Us
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* FAQ list */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {filtered.map((faq, i) => (
                    <ScrollReveal key={`${activeCategory}-${i}`} delay={i * 0.04}>
                      <div className="border-b border-gray-100">
                        <button
                          className="w-full text-left py-6 flex items-start justify-between gap-4 group"
                          onClick={() => setOpen(open === i ? null : i)}
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-[0.6rem] tracking-widest uppercase text-[#007969]/60 mt-1 hidden sm:block w-20 flex-shrink-0">
                              {faq.category}
                            </span>
                            <span className="text-[#1c1c1e] group-hover:text-[#007969] transition-colors font-medium">
                              {faq.question}
                            </span>
                          </div>
                          <span
                            className={`flex-shrink-0 w-5 h-5 border border-gray-200 flex items-center justify-center transition-all duration-300 ${
                              open === i ? "rotate-45 border-[#007969]" : ""
                            }`}
                          >
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </span>
                        </button>
                        <AnimatePresence>
                          {open === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="overflow-hidden"
                            >
                              <p className="text-[#6b7280] leading-relaxed pb-6 sm:pl-24">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </ScrollReveal>
                  ))}

                  {filtered.length === 0 && (
                    <p className="text-[#6b7280] py-8">No questions in this category.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-100 bg-[#f8f9fa]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Still have questions?</p>
            <h2 className="text-title text-[#1c1c1e] mb-6">Talk to our team</h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Our specification team is available to answer any question about your project, product or budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-brand">Contact Us</Link>
              <Link href="/enquire" className="btn-outline">Get A Quote</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
