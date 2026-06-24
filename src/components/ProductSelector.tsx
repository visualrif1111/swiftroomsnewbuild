"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import type { ProductCategory } from "@/lib/data";

// "Which System Is Right For You?" — guided selector. Users self-qualify in a
// few taps and receive a recommended Swiftrooms system + conversion CTAs.
type Answers = {
  property?: "villa" | "apartment" | "commercial";
  opening?: "s" | "m" | "xl";
  priority?: "views" | "width" | "balanced";
  thermal?: "high" | "standard";
  budget?: "premium" | "mid" | "value";
};

const questions = [
  {
    key: "property" as const,
    label: "What type of property?",
    options: [
      { value: "villa", label: "Villa" },
      { value: "apartment", label: "Apartment" },
      { value: "commercial", label: "Commercial" },
    ],
  },
  {
    key: "opening" as const,
    label: "Your largest opening?",
    options: [
      { value: "s", label: "Up to 3m" },
      { value: "m", label: "3 – 5m" },
      { value: "xl", label: "Over 5m" },
    ],
  },
  {
    key: "priority" as const,
    label: "What matters most?",
    options: [
      { value: "views", label: "Maximum glass & views" },
      { value: "width", label: "Maximum opening width" },
      { value: "balanced", label: "A balance of both" },
    ],
  },
  {
    key: "thermal" as const,
    label: "Thermal performance?",
    options: [
      { value: "high", label: "Critical — AC efficiency" },
      { value: "standard", label: "Standard is fine" },
    ],
  },
  {
    key: "budget" as const,
    label: "Budget tier?",
    options: [
      { value: "premium", label: "Premium / flagship" },
      { value: "mid", label: "Mid-range" },
      { value: "value", label: "Best value" },
    ],
  },
];

function recommend(a: Answers): string {
  if (a.priority === "width") return "cortizo-bifold";
  if (a.budget === "value") return "gulf-extrusion-montana";
  if (a.opening === "xl" || a.budget === "premium") return "cor-vision-4700";
  if (a.priority === "views" && a.thermal === "high") return "cor-vision-plus";
  return "cor-vision-4600";
}

function findProduct(slug: string, categories: ProductCategory[]) {
  for (const cat of categories) {
    const p = cat.products.find((x) => x.slug === slug);
    if (p) return { product: p, categorySlug: cat.slug };
  }
  return null;
}

export default function ProductSelector({ categories }: { categories: ProductCategory[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= questions.length;

  const choose = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  };
  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const result = done ? findProduct(recommend(answers), categories) : null;

  return (
    <div className="bg-[#f8f9fa] border border-gray-100">
      <div className="p-6 md:p-10 lg:p-14">
        <p className="text-label text-[#007969] mb-3">Guided Selector</p>
        <h2 className="text-title text-[#1c1c1e] mb-2">Which system is right for you?</h2>
        <p className="text-[#6b7280] text-sm md:text-base mb-8 max-w-lg">
          Answer a few quick questions and we&apos;ll point you to the Swiftrooms system that fits
          your project — no obligation.
        </p>

        {/* Progress */}
        {!done && (
          <div className="flex gap-1.5 mb-8" aria-hidden>
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[#007969]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-[0.7rem] tracking-widest uppercase text-gray-400 mb-2">
                Step {step + 1} of {questions.length}
              </p>
              <p className="text-lg md:text-xl font-semibold text-[#1c1c1e] mb-6">
                {questions[step].label}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => choose(questions[step].key, opt.value)}
                    className="text-left border border-gray-200 bg-white px-5 py-4 text-[#3a3a3c] hover:border-[#007969] hover:text-[#007969] hover:bg-[#f0fdf4] transition-all"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="mt-6 text-[0.7rem] tracking-widest uppercase text-gray-400 hover:text-[#007969] transition-colors"
                >
                  ← Back
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[0.7rem] tracking-widest uppercase text-gray-400 mb-2">
                Our recommendation
              </p>
              {result && (
                <div className="bg-white border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {result.product.image && (
                      <div className="relative h-48 md:h-full min-h-[180px]">
                        <Image
                          src={result.product.image}
                          alt={result.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-6 md:p-8">
                      <p className="text-label text-[#007969] mb-2">{result.product.brand}</p>
                      <h3 className="text-xl font-semibold text-[#1c1c1e] mb-3">
                        {result.product.name}
                      </h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed mb-6 line-clamp-4">
                        {result.product.description}
                      </p>
                      <div className="flex flex-col gap-3">
                        <Link
                          href={`/catalogue/${result.categorySlug}/${result.product.slug}`}
                          className="btn-brand justify-center"
                        >
                          View {result.product.name}
                        </Link>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <QuoteButton className="btn-outline justify-center">Get A Quote</QuoteButton>
                          <ShowroomButton className="btn-outline justify-center">
                            See It In Showroom
                          </ShowroomButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={reset}
                className="mt-6 text-[0.7rem] tracking-widest uppercase text-gray-400 hover:text-[#007969] transition-colors"
              >
                ↻ Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
