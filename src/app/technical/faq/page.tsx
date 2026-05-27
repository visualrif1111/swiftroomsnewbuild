"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { faqs } from "@/lib/data";

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Frequently asked
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                questions.
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Answers to the questions we hear most often. Can&apos;t find what you&apos;re looking
              for? Contact our team directly.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 max-w-3xl">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="border-b border-white/10">
                  <button
                    className="w-full text-left py-6 flex items-start justify-between gap-4 group"
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    <span className="text-white group-hover:text-[#c4a55f] transition-colors font-medium pr-8">
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-5 h-5 border border-white/20 flex items-center justify-center transition-transform duration-300 ${
                        open === i ? "rotate-45" : ""
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
                        <p className="text-white/50 leading-relaxed pb-6">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10 bg-[#0d0d0d]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 text-center">
            <p className="text-label text-[#c4a55f] mb-4">Still have questions?</p>
            <h2 className="text-title text-white mb-6">Talk to our team</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-white text-black px-8 py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#c4a55f] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
