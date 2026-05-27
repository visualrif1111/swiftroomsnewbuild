"use client";

import { useState } from "react";
import Link from "next/link";
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
            <p className="text-label text-[#c4a55f] mb-6">Selected Work</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Portfolio
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                across the UAE.
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              {portfolioProjects.length} completed projects spanning Dubai, Abu Dhabi and the wider UAE.
              From intimate villa renovations to large commercial installations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          {/* Filter tags */}
          <div className="flex flex-wrap gap-3 mb-12">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[0.7rem] tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
                  activeTag === tag
                    ? "border-[#c4a55f] text-[#c4a55f] bg-[#c4a55f]/10"
                    : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    className="group block overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    {/* Visual */}
                    <div
                      className="h-52 w-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(${120 + i * 30}deg, hsl(${i * 20}, 10%, 14%) 0%, hsl(${i * 20 + 30}, 7%, 9%) 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 border border-white/10 rotate-45 group-hover:rotate-[60deg] transition-transform duration-700" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="text-[0.55rem] tracking-widest uppercase text-white/30 bg-black/50 px-2 py-1">
                          {project.type}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="text-[0.55rem] tracking-widest uppercase text-white/20">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-white font-semibold group-hover:text-[#c4a55f] transition-colors">
                          {project.name}
                        </h2>
                        <span className="text-white/20 text-xs ml-4 flex-shrink-0">{project.area}</span>
                      </div>
                      <p className="text-white/40 text-sm mb-3">{project.location}</p>
                      <p className="text-white/25 text-xs leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[0.55rem] tracking-wide uppercase text-white/20 border border-white/10 px-2 py-0.5"
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
              <p className="text-white/30">No projects match this filter.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
