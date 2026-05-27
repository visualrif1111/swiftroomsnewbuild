"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories, portfolioProjects, processSteps } from "@/lib/data";

const usps = [
  { icon: "🌍", text: "European quality systems from AED 800/sqm" },
  { icon: "⏱", text: "Free quote & site visit within 24 hours" },
  { icon: "☀️", text: "Heat & dust insulation for UAE climate" },
  { icon: "🛡", text: "Professional installation with 10-year warranty" },
];

const problems = [
  { problem: "Skyrocketing AC bills", solution: "Thermally broken aluminium profiles minimise heat transfer" },
  { problem: "Excessive heat penetration", solution: "Advanced solar-control glazing reduces heat penetration" },
  { problem: "Poor air tightness & noise", solution: "Multi-point locking and triple gasket systems enhance sealing" },
  { problem: "Wasted outdoor space", solution: "Garden rooms & extensions transform space into living areas" },
];

const brands = [
  { name: "Cortizo", country: "Spain", tagline: "European precision systems" },
  { name: "Vetromax", country: "UAE", tagline: "Minimalist aluminium systems" },
  { name: "Deceuninck", country: "Belgium", tagline: "Premium uPVC systems" },
  { name: "Gulf Extrusion", country: "UAE", tagline: "Built for the Gulf climate" },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-end bg-[#030a08]">

        {/* YouTube video background — scaled to cover full viewport */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: 'max(100vw, calc(100vh * 16 / 9))',
              height: 'max(100vh, calc(100vw * 9 / 16))',
              transform: 'translate(-50%, -50%) scale(1.25)',
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/a7Q40rrVvo4?autoplay=1&mute=1&loop=1&playlist=a7Q40rrVvo4&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none', pointerEvents: 'none' }}
              title="Swiftrooms showcase"
            />
          </div>
        </div>

        {/* Gradient overlay — dark bottom for text, teal mid, dark top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(3,10,8,0.95) 0%, rgba(0,80,68,0.45) 40%, rgba(0,30,25,0.30) 70%, rgba(0,0,0,0.50) 100%)',
          }}
        />

        {/* Hero content */}
        <motion.div
          className="relative z-10 w-full max-w-screen-xl mx-auto px-5 md:px-8 pb-16 md:pb-28"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-label text-[#4dd9c0] mb-5 tracking-[0.2em]"
          >
            Dubai · Abu Dhabi · UAE — Built for the UAE Climate
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-display text-white mb-6 max-w-5xl"
          >
            Performance
            <br />
            <span className="text-[#4dd9c0]">Windows</span> &amp; Doors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-body-lg text-white/70 max-w-xl mb-10"
          >
            Engineered to perform. Built to outlast. Premium aluminium, uPVC and glazing systems
            installed across the UAE by certified specialists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/enquire" className="btn-brand">
              Get a Free Quote
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/showroom"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-accent font-semibold text-[0.8rem] tracking-[0.12em] uppercase px-6 py-3.5 hover:bg-white hover:text-[#007969] transition-all"
            >
              Book Showroom Visit
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── USP STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-[#007969]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {usps.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <span className="text-base md:text-lg flex-shrink-0">{u.icon}</span>
                <span className="font-accent text-[0.62rem] sm:text-[0.7rem] tracking-[0.08em] uppercase font-semibold text-white/90 leading-tight">
                  {u.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SWIFTROOMS SOLUTION ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="flex justify-center mb-5">
                <div className="divider-brand" />
              </div>
              <p className="text-label text-[#007969] mb-3">From common problems to premium solutions</p>
              <h2 className="text-headline text-[#1c1c1e]">The Swiftrooms Solution</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problems column */}
            <ScrollReveal direction="left">
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#1c1c1e]">Common Frustrations</h3>
                </div>
                <div className="space-y-3">
                  {problems.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors">
                      <div className="w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-[#3a3a3c] text-sm leading-relaxed">{p.problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Solutions column */}
            <ScrollReveal direction="right">
              <div className="bg-[#007969] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">Swiftrooms Advantage</h3>
                </div>
                <div className="space-y-3">
                  {problems.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="w-6 h-6 mt-0.5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white/90 text-sm leading-relaxed">{p.solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── TRANSFORM YOUR SPACE ──────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div>
                <div className="divider-brand mb-6" />
                <p className="text-label text-[#007969] mb-4">Transform Your Space</p>
                <h2 className="text-headline text-[#1c1c1e] mb-6">
                  Transform unused space
                  <br />into living space.
                </h2>
                <p className="text-body-lg text-[#6b7280] mb-8">
                  From panoramic sliding doors connecting living rooms to pools, to glass garden rooms
                  transforming unused plots — Swiftrooms turns architectural ambition into reality
                  across every UAE climate zone.
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    { title: "Panoramic Slim Sliding Systems", desc: "Ultra-slim profiles. Seamless design. Maximum light." },
                    { title: "Garden Rooms & Extensions", desc: "Transform unused space into valuable living areas." },
                    { title: "Performance Windows & Doors", desc: "Engineered to perform. Built to outlast." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#007969]" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-[#1c1c1e] text-sm mb-0.5">{item.title}</p>
                        <p className="text-[#6b7280] text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/catalogue" className="btn-brand">
                  Explore Products
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Image stack */}
              <div className="relative h-[260px] sm:h-[380px] lg:h-[560px]">
                <ScrollReveal delay={0.1}>
                  <div className="absolute top-0 right-0 w-[75%] h-[55%] overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="/brand/hero-villa-dubai.png"
                      alt="Modern Dubai villa with bi-fold doors"
                      fill
                      className="object-cover"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="absolute bottom-0 left-0 w-[65%] h-[50%] overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                    <Image
                      src="/brand/product-bedroom-doors.png"
                      alt="Bedroom with casement doors"
                      fill
                      className="object-cover"
                    />
                  </div>
                </ScrollReveal>
                {/* Accent */}
                <div className="absolute top-[50%] left-[35%] w-16 h-16 bg-[#007969] rounded-2xl flex items-center justify-center shadow-xl z-10">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRODUCTS ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <div className="divider-brand mb-5" />
                <p className="text-label text-[#007969] mb-3">Our Premium Products</p>
                <h2 className="text-headline text-[#1c1c1e]">The complete<br />product range</h2>
              </div>
              <Link href="/catalogue" className="btn-outline self-start md:self-auto">
                View All Products →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Featured card with real image */}
            <ScrollReveal className="md:col-span-2 lg:col-span-2">
              <Link href="/catalogue/aluminium-doors" className="group block relative h-72 overflow-hidden rounded-2xl card-hover">
                <Image
                  src="/brand/product-bifold-kitchen.png"
                  alt="Aluminium bi-fold doors"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                  <p className="text-label text-[#00a389] mb-1">01</p>
                  <h3 className="font-heading font-bold text-xl text-white mb-1">Aluminium Doors</h3>
                  <p className="text-white/60 text-sm">Lift-and-slide, bi-fold & entrance systems</p>
                </div>
              </Link>
            </ScrollReveal>

            {/* Product cards */}
            {productCategories.slice(1, 5).map((cat, i) => (
              <ScrollReveal key={cat.id} delay={(i + 1) * 0.07}>
                <Link
                  href={`/catalogue/${cat.slug}`}
                  className="group block bg-white border border-gray-100 rounded-2xl p-6 card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] flex items-center justify-center mb-4 group-hover:bg-[#007969] transition-colors">
                    <div className="w-3 h-3 rounded-full bg-[#007969] group-hover:bg-white transition-colors" />
                  </div>
                  <p className="text-label text-[#007969] mb-2">{String(i + 2).padStart(2, "0")}</p>
                  <h3 className="font-heading font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">{cat.tagline}</p>
                </Link>
              </ScrollReveal>
            ))}

            {/* Bedroom image card */}
            <ScrollReveal className="md:col-span-2 lg:col-span-2">
              <Link href="/catalogue/garden-rooms" className="group block relative h-56 overflow-hidden rounded-2xl card-hover">
                <Image
                  src="/brand/product-bedroom-doors.png"
                  alt="Garden room doors opening to outdoor space"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                  <p className="text-label text-[#00a389] mb-1">Garden Rooms</p>
                  <h3 className="font-heading font-bold text-lg text-white">Transform unused space into living space.</h3>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-5"><div className="divider-brand" /></div>
              <p className="text-label text-[#007969] mb-2">Brands We Work With</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.map((brand, i) => (
              <ScrollReveal key={brand.name} delay={i * 0.08}>
                <Link
                  href="/catalogue/brands"
                  className="group block border border-gray-100 rounded-2xl p-6 hover:border-[#007969]/30 hover:shadow-md transition-all text-center"
                >
                  <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#007969] transition-colors">
                    <div className="w-3 h-3 rounded-sm bg-[#007969] group-hover:bg-white transition-colors" />
                  </div>
                  <p className="font-heading font-bold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-1">
                    {brand.name}
                  </p>
                  <p className="text-[0.65rem] tracking-wide uppercase text-[#6b7280] mb-0.5">{brand.country}</p>
                  <p className="text-[#9ca3af] text-xs">{brand.tagline}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <div className="divider-brand mb-5" />
                <p className="text-label text-[#007969] mb-3">Selected Work</p>
                <h2 className="text-headline text-[#1c1c1e]">Portfolio<br />across the UAE</h2>
              </div>
              <Link href="/portfolio" className="btn-outline self-start md:self-auto">All Projects →</Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Featured skylight project using real photo */}
            <ScrollReveal className="md:col-span-2">
              <Link href="/portfolio/4900-gallery" className="group block relative h-72 overflow-hidden rounded-2xl">
                <Image
                  src="/brand/project-skylight-restaurant.jpg"
                  alt="Glass skylight restaurant project"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                  <span className="usp-badge bg-black/40 border-white/20 text-white text-[0.6rem] mb-3 inline-flex">Commercial · Skylight</span>
                  <h3 className="font-heading font-bold text-xl text-white">4900 Gallery — Dubai</h3>
                  <p className="text-white/60 text-sm mt-1">Large format glass skylight system</p>
                </div>
              </Link>
            </ScrollReveal>

            {/* Regular project cards */}
            {portfolioProjects.slice(0, 4).map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.07}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover"
                >
                  <div className="h-40 relative overflow-hidden bg-[#f0fdf4]">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[0.55rem] tracking-widest uppercase text-white bg-black/40 backdrop-blur-sm px-2 py-0.5">
                        {project.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading font-semibold text-[#1c1c1e] text-sm group-hover:text-[#007969] transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-[#9ca3af] text-xs ml-3 flex-shrink-0">{project.year}</span>
                    </div>
                    <p className="text-[#6b7280] text-xs">{project.location}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="divider-brand mb-5" />
                <p className="text-label text-[#007969] mb-3">Start Your Swiftrooms Journey</p>
                <h2 className="text-title text-[#1c1c1e]">From first call to<br />completed project</h2>
              </div>
              <Link href="/technical/process" className="text-label text-[#007969] hover:underline self-start">
                Full process detail →
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {processSteps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.07}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#007969]/20 flex items-center justify-center mb-4">
                    <span className="font-accent font-bold text-[#007969] text-sm">{step.number}</span>
                  </div>
                  <h4 className="font-heading font-semibold text-[#1c1c1e] text-sm mb-2">{step.title}</h4>
                  <p className="text-[#6b7280] text-xs leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-5 left-full w-4 h-px bg-[#007969]/20" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#030213] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="/brand/hero-villa-dubai.png" alt="" fill className="object-cover" />
        </div>
        <ScrollReveal>
          <div className="relative z-10 max-w-screen-xl mx-auto px-5 md:px-8 text-center">
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.svg" alt="Swiftrooms" className="h-10 w-auto opacity-80" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <h2 className="text-headline text-white mb-5 max-w-2xl mx-auto">
              Book Your Showroom Visit Today
            </h2>
            <p className="text-white/50 text-body-lg max-w-lg mx-auto mb-10">
              Experience our full product range at full scale. Free consultation, no obligation.
              Jebel Ali, Dubai — open Sunday to Thursday.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/enquire" className="btn-brand">
                Get a Free Quote
              </Link>
              <Link href="/showroom" className="btn-outline border-white/30 text-white hover:bg-white hover:text-[#007969]">
                Book Showroom Visit
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
