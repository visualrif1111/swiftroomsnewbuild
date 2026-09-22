"use client";

// Accordion for the brand pages' FAQ block.
//
// Mirrors the interaction and styling of the catalogue category FAQ, which is
// a local component inside CategoryClient rather than a shared one. Extracted
// here so the brand pages match without duplicating that file's internals.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

type Faq = { q: string; a: string };

export default function BrandFAQ({ faqs }: { faqs: Faq[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (faqs.length === 0) return null;

  return (
    <div className="max-w-3xl space-y-0">
      {faqs.map((faq, i) => (
        <ScrollReveal key={faq.q} delay={i * 0.05}>
          <div className="border-b border-gray-100">
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              aria-expanded={openIdx === i}
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
                aria-hidden="true"
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
                  <p className="text-[#6b7280] text-sm leading-relaxed pb-5">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
