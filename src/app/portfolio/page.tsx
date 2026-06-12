"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { portfolioProjects } from "@/lib/data";

// Location-based grouping per spec
const locationGroups = [
  { label: "Al Barari", slugs: ["al-barari"] },
  { label: "Palm Jumeirah", slugs: ["palm-jumeirah"] },
  { label: "Emirates Hills", slugs: ["emirates-hills"] },
  { label: "Arabian Ranches", slugs: ["arabian-ranches"] },
  { label: "Centro The Villas", slugs: ["centro-the-villas"] },
  { label: "Damac Hills", slugs: ["brookfields-damac-hills", "phoenix-damac-hills"] },
  { label: "Sports City", slugs: ["victory-heights"] },
  { label: "JVT", slugs: ["jumeirah-village-triangle"] },
  { label: "The Springs", slugs: ["the-springs"] },
  { label: "Phoenix Damac Hills", slugs: ["phoenix-damac-hills"] },
  { label: "Glass Room Abu Dhabi", slugs: ["glass-room-abu-dhabi"] },
  { label: "Monty's Golf Course", slugs: ["montys-golf-course"] },
  { label: "Phileas Fogg", slugs: ["phileas-fogg"] },
  { label: "Padel X Project", slugs: ["padel-x"] },
];

const typeTags = ["All", "Villa", "Apartment", "Townhouse", "Commercial", "Garden Room", "Hospitality"];

// Featured showcase project
const featured = portfolioProjects.find((p) => p.slug === "emirates-hills")!;

export default function PortfolioPage() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("All");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filtered = portfolioProjects.filter((p) => {
    const matchesType = activeType === "All" || p.tags.some((t) => t === activeType);
    const matchesLocation =
      !activeLocation ||
      locationGroups.find((g) => g.label === activeLocation)?.slugs.includes(p.slug);
    return matchesType && matchesLocation;
  });

  function clearFilters() {
    setActiveLocation(null);
    setActiveType("All");
  }

  const hasFilter = activeType !== "All" || activeLocation !== null;

  return (
    <>
      {/* Hero */}
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

      {/* Featured showcase */}
      {featured && (
        <section className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mb-0">
          <ScrollReveal>
            <Link
              href={`/portfolio/${featured.slug}`}
              className="group block relative w-full h-[50vh] md:h-[65vh] overflow-hidden"
            >
              {featured.image && (
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-1000"
                  priority
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Top label */}
              <div className="absolute top-6 left-6 md:top-8 md:left-8">
                <span className="text-[0.6rem] tracking-widest uppercase text-white/80 bg-white/10 border border-white/20 px-3 py-1.5">
                  Featured Project
                </span>
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] tracking-widests uppercase text-white/60 mb-2">{featured.type}</p>
                    <h2 className="text-2xl md:text-4xl font-semibold text-white mb-1">{featured.name}</h2>
                    <p className="text-white/70 text-sm md:text-base">{featured.location} · {featured.area}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[0.7rem] tracking-widests uppercase text-white border border-white/30 px-5 py-3 group-hover:bg-white group-hover:text-[#007969] transition-all flex-shrink-0">
                    View Case Study
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        </section>
      )}

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mt-6">
        <div className="divider-brand" />
      </div>

      {/* Main content: location nav + grid */}
      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* Location navigation — sidebar on desktop, hidden on mobile */}
            <div className="hidden lg:block col-span-1">
              <div className="sticky top-28">
                <p className="text-label text-[#007969] mb-4">Filter by Location</p>
                <div className="flex flex-col gap-0">
                  <button
                    onClick={() => setActiveLocation(null)}
                    className={`text-left text-sm py-2.5 border-b border-gray-100 transition-colors ${
                      activeLocation === null ? "text-[#007969] font-semibold" : "text-[#6b7280] hover:text-[#007969]"
                    }`}
                  >
                    All Locations
                  </button>
                  {locationGroups.map((loc) => {
                    const count = portfolioProjects.filter((p) =>
                      loc.slugs.includes(p.slug)
                    ).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={loc.label}
                        onClick={() => setActiveLocation(activeLocation === loc.label ? null : loc.label)}
                        className={`text-left text-sm py-2.5 border-b border-gray-100 flex items-center justify-between transition-colors ${
                          activeLocation === loc.label
                            ? "text-[#007969] font-semibold"
                            : "text-[#6b7280] hover:text-[#007969]"
                        }`}
                      >
                        <span>{loc.label}</span>
                        <span className="text-[0.6rem] text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <p className="text-label text-[#007969] mb-4">Filter by Type</p>
                  <div className="flex flex-col gap-1">
                    {typeTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveType(tag)}
                        className={`text-left text-sm py-2 transition-colors ${
                          activeType === tag
                            ? "text-[#007969] font-semibold"
                            : "text-[#6b7280] hover:text-[#007969]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilter && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 text-[0.65rem] tracking-widests uppercase text-gray-400 hover:text-[#007969] transition-colors underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Mobile filters */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {hasFilter && (
                    <span className="text-[0.65rem] uppercase tracking-widest text-[#007969] border border-[#007969] px-2.5 py-1">
                      {activeLocation ?? activeType}
                    </span>
                  )}
                  {!hasFilter && (
                    <span className="text-[0.65rem] uppercase tracking-widest text-[#6b7280]">
                      All projects
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widests text-[#3a3a3c] border border-gray-200 px-3 py-2 hover:border-[#007969] hover:text-[#007969] transition-all"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Project grid */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeType}-${activeLocation}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
                >
                  {filtered.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                    >
                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="group block overflow-hidden border border-gray-100 hover:border-[#007969]/30 transition-all duration-300 bg-white"
                      >
                        <div className="h-44 md:h-52 w-full relative overflow-hidden bg-[#f0fdf4]">
                          {project.image && (
                            <Image
                              src={project.image}
                              alt={project.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(max-width: 640px) 100vw, 50vw"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="text-[0.55rem] tracking-widests uppercase text-white bg-black/40 px-2 py-1">
                              {project.type}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <span className="text-[0.55rem] tracking-widests uppercase text-white/80">
                              {project.year}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-1.5">
                            <h2 className="text-[#1c1c1e] font-semibold text-sm md:text-base group-hover:text-[#007969] transition-colors">
                              {project.name}
                            </h2>
                            <span className="text-gray-400 text-xs ml-3 flex-shrink-0">{project.area}</span>
                          </div>
                          <p className="text-[#6b7280] text-sm mb-3">{project.location}</p>
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                            {project.brief ?? project.description}
                          </p>
                          <div className="mt-4 flex items-center gap-1 text-[0.65rem] uppercase tracking-widests text-[#007969] font-medium">
                            View Case Study
                            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">No projects match this filter.</p>
                  <button onClick={clearFilters} className="text-label text-[#007969] underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="font-semibold text-[#1c1c1e]">Filter Projects</h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#6b7280]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-label text-[#007969] mb-3">By Location</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => { setActiveLocation(null); }}
                    className={`text-[0.7rem] tracking-widests uppercase px-3 py-2 border transition-all ${
                      activeLocation === null ? "border-[#007969] bg-[#007969] text-white" : "border-gray-200 text-[#6b7280]"
                    }`}
                  >
                    All
                  </button>
                  {locationGroups
                    .filter((loc) => portfolioProjects.some((p) => loc.slugs.includes(p.slug)))
                    .map((loc) => (
                      <button
                        key={loc.label}
                        onClick={() => setActiveLocation(activeLocation === loc.label ? null : loc.label)}
                        className={`text-[0.7rem] tracking-widests uppercase px-3 py-2 border transition-all ${
                          activeLocation === loc.label ? "border-[#007969] bg-[#007969] text-white" : "border-gray-200 text-[#6b7280]"
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                </div>

                <p className="text-label text-[#007969] mb-3">By Type</p>
                <div className="flex flex-wrap gap-2">
                  {typeTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveType(tag)}
                      className={`text-[0.7rem] tracking-widests uppercase px-3 py-2 border transition-all ${
                        activeType === tag ? "border-[#007969] bg-[#007969] text-white" : "border-gray-200 text-[#6b7280]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-6 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="btn-brand w-full justify-center"
                >
                  Show {filtered.length} Projects
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-gray-100 bg-[#f8f9fa]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Start your project</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Ready to join our portfolio?
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Every project begins with a consultation. Tell us about your vision and we&apos;ll take it from there.
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
