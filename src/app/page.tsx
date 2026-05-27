"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories, portfolioProjects, brands, stats, processSteps } from "@/lib/data";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-end">
        {/* Background */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY }}
        >
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse at 60% 40%, rgba(196,165,95,0.08) 0%, transparent 60%), linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
            }}
          />
          {/* Geometric lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <line x1="720" y1="0" x2="720" y2="900" stroke="white" strokeWidth="1" />
            <line x1="0" y1="450" x2="1440" y2="450" stroke="white" strokeWidth="1" />
            <rect x="360" y="225" width="720" height="450" stroke="white" strokeWidth="1" />
            <line x1="0" y1="0" x2="1440" y2="900" stroke="white" strokeWidth="1" />
            <line x1="1440" y1="0" x2="0" y2="900" stroke="white" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-10 pb-20 md:pb-28"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-label text-[#c4a55f] mb-6"
          >
            Dubai · Abu Dhabi · UAE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-display text-white font-bold mb-8 max-w-5xl"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Premium Glazing.
            <br />
            <span className="text-white/40 font-light italic" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Architectural precision.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-body-lg text-white/50 max-w-xl mb-10"
          >
            Swiftrooms supplies and installs premium aluminium windows, doors and curtain wall systems across the UAE.
            Authorised partners for Cortizo, Gulf Extrusion and Vetromax.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#c4a55f] transition-colors duration-300"
            >
              Explore Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:border-white/50 hover:bg-white/5 transition-all duration-300"
            >
              View Portfolio
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-label text-white/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 py-12">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <div className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-label text-white/40">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT CATEGORIES ────────────────────────────────────────────── */}
      <section className="py-28 md:py-40">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <p className="text-label text-[#c4a55f] mb-4">Product Range</p>
                <h2 className="text-headline text-white">
                  The complete
                  <br />
                  <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                    glazing ecosystem.
                  </span>
                </h2>
              </div>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 text-[0.75rem] tracking-widest uppercase text-white/40 hover:text-white transition-colors self-start md:self-auto"
              >
                All products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {productCategories.slice(0, 6).map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 0.07}>
                <Link
                  href={`/catalogue/${cat.slug}`}
                  className="group block bg-[#0a0a0a] p-8 hover:bg-[#111] transition-colors duration-300 h-full"
                >
                  <div className="mb-auto">
                    <span className="text-label text-[#c4a55f] mb-4 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                      {cat.tagline}
                    </p>
                    <p className="text-white/30 text-sm leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-white/30 group-hover:text-[#c4a55f] transition-colors">
                    View range
                    <svg
                      className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-white/10 bg-[#0d0d0d]">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] text-center mb-12">Our Brand Partners</p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand, i) => (
              <ScrollReveal key={brand.id} delay={i * 0.1}>
                <Link
                  href={`/catalogue/brands#${brand.id}`}
                  className="group block border border-white/10 p-6 hover:border-[#c4a55f]/40 transition-colors duration-300"
                >
                  <div className="text-white/20 text-[0.6rem] tracking-widest uppercase mb-3">
                    {brand.country}
                  </div>
                  <div className="text-white text-lg font-semibold mb-2 group-hover:text-[#c4a55f] transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-white/30 text-xs leading-relaxed">
                    {brand.tagline}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO PREVIEW ─────────────────────────────────────────────── */}
      <section className="py-28 md:py-40">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <p className="text-label text-[#c4a55f] mb-4">Selected Projects</p>
                <h2 className="text-headline text-white">
                  Portfolio
                  <br />
                  <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                    across the UAE.
                  </span>
                </h2>
              </div>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-[0.75rem] tracking-widest uppercase text-white/40 hover:text-white transition-colors self-start md:self-auto"
              >
                All projects
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioProjects.slice(0, 6).map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.08}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
                >
                  {/* Placeholder image area */}
                  <div
                    className="h-48 w-full overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 40}, 10%, 15%) 0%, hsl(${i * 40 + 20}, 8%, 10%) 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border border-white/10 rotate-45" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="text-[0.6rem] tracking-widest uppercase text-white/30 bg-black/50 px-2 py-1">
                        {project.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold group-hover:text-[#c4a55f] transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-white/30 text-xs">{project.year}</span>
                    </div>
                    <p className="text-white/40 text-sm mb-3">{project.location}</p>
                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[0.6rem] tracking-wide uppercase text-white/20 border border-white/10 px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS STRIP ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0d0d0d] border-y border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-label text-[#c4a55f] mb-4">How We Work</p>
                <h2 className="text-title text-white">
                  From first call
                  <br />
                  <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                    to completed project.
                  </span>
                </h2>
              </div>
              <Link
                href="/technical/process"
                className="text-[0.75rem] tracking-widest uppercase text-white/40 hover:text-white transition-colors self-start md:self-auto"
              >
                Full process →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {processSteps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.08}>
                <div className="relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-4 right-0 w-full h-px bg-white/10 translate-x-1/2" />
                  )}
                  <span className="text-label text-[#c4a55f] mb-3 block">{step.number}</span>
                  <h4 className="text-white font-medium text-sm mb-2">{step.title}</h4>
                  <p className="text-white/30 text-xs leading-relaxed">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(196,165,95,0.06) 0%, transparent 70%)",
            }}
          />
        </div>
        <ScrollReveal>
          <div className="relative max-w-screen-xl mx-auto px-6 md:px-10 text-center">
            <p className="text-label text-[#c4a55f] mb-6">Ready to begin?</p>
            <h2 className="text-headline text-white mb-6 max-w-3xl mx-auto">
              Start your project
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                with a conversation.
              </span>
            </h2>
            <p className="text-white/40 text-body-lg max-w-xl mx-auto mb-12">
              Contact our team for a no-obligation consultation, site visit and quotation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center gap-3 bg-[#c4a55f] text-black px-10 py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors duration-300"
              >
                Get a Quote
              </Link>
              <Link
                href="/showroom"
                className="inline-flex items-center justify-center gap-3 border border-white/20 text-white px-10 py-4 text-[0.75rem] tracking-widest uppercase hover:border-white/50 hover:bg-white/5 transition-all duration-300"
              >
                Book Showroom Visit
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
