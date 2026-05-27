"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { portfolioProjects } from "@/lib/data";

const allTags = ["All", "Villa", "Apartment", "Townhouse", "Commercial", "Garden Room", "Curtain Wall", "Cortizo", "Gulf Extrusion"];

export default function PortfolioPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const filtered =
    activeTag === "All"
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.tags.includes(activeTag));

  const handleTagSelect = (tag: string) => {
    setActiveTag(tag);
    setFilterDrawerOpen(false);
  };

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4 md:mb-6">Selected Work</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-5 md:mb-8 max-w-3xl">
              Portfolio across the UAE.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              {portfolioProjects.length} completed projects spanning Dubai, Abu Dhabi and the wider UAE.
              From intimate villa renovations to large commercial installations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">

          {/* Filter — desktop horizontal scroll, mobile drawer trigger */}
          <div className="mb-8 md:mb-12">
            {/* Mobile: filter button + active tag */}
            <div className="flex items-center justify-between md:hidden mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] uppercase tracking-widest text-[#6b7280]">Filter:</span>
                <span className="text-[0.7rem] uppercase tracking-widest text-[#007969] font-semibold border border-[#007969] px-2.5 py-1">
                  {activeTag}
                </span>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-[#3a3a3c] border border-gray-200 px-3 py-2 hover:border-[#007969] hover:text-[#007969] transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                All Filters
              </button>
            </div>

            {/* Desktop: horizontal tag row */}
            <div className="hidden md:flex gap-2 md:gap-3 overflow-x-auto pb-2 md:flex-wrap scrollbar-hide">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-[0.7rem] tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
                    activeTag === tag
                      ? "border-[#007969] text-white bg-[#007969]"
                      : "border-gray-200 text-[#6b7280] hover:border-[#007969] hover:text-[#007969]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {filtered.map((project, i) => {
                const cardInner = (
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="group block overflow-hidden border border-gray-100 hover:border-[#007969]/30 transition-all duration-300 bg-white active:scale-[0.98]"
                  >
                    {/* Visual */}
                    <div className="h-48 sm:h-44 md:h-52 w-full relative overflow-hidden bg-[#f0fdf4]">
                      {project.image && (
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[0.55rem] tracking-widest uppercase text-white bg-black/40 px-2 py-1">
                          {project.type}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="text-[0.55rem] tracking-widest uppercase text-white/80">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-[#1c1c1e] font-semibold text-sm md:text-base group-hover:text-[#007969] transition-colors">
                          {project.name}
                        </h2>
                        <span className="text-gray-400 text-xs ml-4 flex-shrink-0">{project.area}</span>
                      </div>
                      <p className="text-[#6b7280] text-sm mb-3">{project.location}</p>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[0.55rem] tracking-wide uppercase text-[#6b7280] border border-gray-100 px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Mobile: View Case Study CTA */}
                      <div className="mt-4 sm:hidden flex items-center gap-1 text-[0.7rem] uppercase tracking-widest text-[#007969] font-semibold">
                        View Case Study
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
                return isTouch ? (
                  <div key={project.id}>{cardInner}</div>
                ) : (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                  >
                    {cardInner}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">No projects match this filter.</p>
              <button
                onClick={() => setActiveTag("All")}
                className="mt-4 text-label text-[#007969] underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── MOBILE FILTER DRAWER ──────────────────────────────────────────── */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:hidden safe-bottom"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                <h3 className="font-heading font-semibold text-[#1c1c1e]">Filter Projects</h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#6b7280]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-4 flex flex-wrap gap-2.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`text-[0.7rem] tracking-widest uppercase px-4 py-2.5 border transition-all ${
                      activeTag === tag
                        ? "border-[#007969] text-white bg-[#007969]"
                        : "border-gray-200 text-[#6b7280]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="px-5 pb-6 pt-2">
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="btn-brand w-full justify-center"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
