"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { portfolioProjects } from "@/lib/data";

const allTags = ["All", "Villa", "Apartment", "Townhouse", "Commercial", "Garden Room", "Curtain Wall", "Cortizo", "Gulf Extrusion"];

export default function PortfolioPage() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered =
    activeTag === "All"
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.tags.includes(activeTag));

  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Selected Work</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
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

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          {/* Filter tags */}
          <div className="flex gap-2 md:gap-3 mb-10 md:mb-12 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[0.7rem] tracking-widests uppercase px-4 py-2 border transition-all duration-200 ${
                  activeTag === tag
                    ? "border-[#007969] text-white bg-[#007969]"
                    : "border-gray-200 text-[#6b7280] hover:border-[#007969] hover:text-[#007969]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="group block overflow-hidden border border-gray-100 hover:border-[#007969]/30 transition-all duration-300 bg-white"
                  >
                    {/* Visual */}
                    <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-[#f0fdf4]">
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
                        <span className="text-[0.55rem] tracking-widests uppercase text-white bg-black/40 backdrop-blur-sm px-2 py-1">
                          {project.type}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="text-[0.55rem] tracking-widests uppercase text-white/80">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-[#1c1c1e] font-semibold group-hover:text-[#007969] transition-colors">
                          {project.name}
                        </h2>
                        <span className="text-gray-400 text-xs ml-4 flex-shrink-0">{project.area}</span>
                      </div>
                      <p className="text-[#6b7280] text-sm mb-3">{project.location}</p>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[0.55rem] tracking-wide uppercase text-[#6b7280] border border-gray-100 px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">No projects match this filter.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
