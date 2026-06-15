"use client";

import { useState } from "react";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { resources } from "@/lib/data";

const categoryLabels: Record<string, string> = {
  guides: "Guides & Knowledge",
  projects: "Projects & Inspiration",
  planning: "Planning & Costs",
};

const categoryOrder = ["guides", "projects", "planning"] as const;

const tabs = [
  { key: "all", label: "All Resources" },
  { key: "guides", label: "Guides & Knowledge" },
  { key: "projects", label: "Projects & Inspiration" },
  { key: "planning", label: "Planning & Costs" },
] as const;

type TabKey = "all" | "guides" | "projects" | "planning";

export default function ResourcesClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const filtered =
    activeTab === "all" ? resources : resources.filter((r) => r.category === activeTab);

  async function handleRequest(id: string, title: string) {
    setRequested((prev) => new Set([...prev, id]));
    try {
      await fetch("/api/resource-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: id, resourceTitle: title }),
      });
    } catch {
      // non-blocking — UI already shows "Requested ✓"
    }
  }

  const grouped = categoryOrder.reduce<Record<string, typeof resources>>(
    (acc, cat) => {
      const items = filtered.filter((r) => r.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {}
  );

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8 flex-wrap">
              <Link href="/technical" className="hover:text-[#007969] transition-colors">Technical</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Resources</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Resources &amp; downloads.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Product guides, project inspiration, planning tools and technical documentation. Request
              any document and we&apos;ll send it to you directly.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Category tabs */}
      <section className="pt-10 pb-4">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-[0.65rem] tracking-widest uppercase px-4 py-2.5 border transition-all ${
                  activeTab === tab.key
                    ? "bg-[#007969] text-white border-[#007969]"
                    : "border-gray-200 text-[#6b7280] hover:border-[#007969] hover:text-[#007969]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-14"
            >
              {Object.entries(grouped).map(([cat, items], si) => (
                <ScrollReveal key={cat} delay={si * 0.08}>
                  <div>
                    {activeTab === "all" && (
                      <p className="text-label text-[#007969] mb-6">
                        {categoryLabels[cat]}
                      </p>
                    )}
                    <div className="space-y-0">
                      {items.map((resource, i) => (
                        <div
                          key={resource.id}
                          className={`flex items-start md:items-center justify-between py-5 border-b border-gray-100 gap-4 group transition-colors hover:bg-[#f8f9fa] px-3 -mx-3 ${
                            i === 0 ? "border-t" : ""
                          }`}
                        >
                          <div className="flex items-start md:items-center gap-4">
                            {/* File icon */}
                            <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-[#007969]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[#1c1c1e] font-medium text-sm md:text-base mb-1">
                                {resource.title}
                              </p>
                              <p className="text-[#6b7280] text-xs md:text-sm leading-relaxed max-w-xl">
                                {resource.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="hidden sm:flex items-center gap-2">
                              <span className="text-[0.6rem] tracking-widest uppercase text-gray-400 border border-gray-200 px-2 py-1">
                                {resource.fileType}
                              </span>
                              <span className="text-gray-400 text-xs">{resource.fileSize}</span>
                            </div>
                            {requested.has(resource.id) ? (
                              <span className="text-[0.65rem] tracking-widest uppercase text-[#007969] font-semibold">
                                Requested ✓
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRequest(resource.id, resource.title)}
                                className="text-[0.65rem] tracking-widest uppercase border border-gray-200 px-3 py-2 text-[#6b7280] hover:border-[#007969] hover:text-[#007969] transition-all whitespace-nowrap"
                              >
                                Request
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Request panel */}
      <section className="py-10 md:py-16 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="p-8 md:p-10 border border-[#007969]/20 bg-[#f0fdf4] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-label text-[#007969] mb-2">Need something specific?</p>
                <p className="text-[#6b7280] max-w-lg">
                  Contact our technical team for product data sheets, BIM objects, CAD files, test certificates
                  or custom specification documents.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link href="/contact" className="btn-brand whitespace-nowrap">
                  Contact Technical Team
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#f8f9fa] border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Ready to specify?</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Talk to our specification team
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton className="btn-brand">Get A Quote</QuoteButton>
              <ShowroomButton className="btn-outline">Visit Showroom</ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
