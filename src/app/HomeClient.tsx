"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CortizoLogo from "@/components/logos/CortizoLogo";
import { productCategories, portfolioProjects, processSteps, blogPosts, testimonials } from "@/lib/data";

// Brand logos for the "Brands We Work With" cards.
// TODO: Vetro (Vetromax sub-brand) has no standalone logo asset — keeps the
// minimal teal mark until a logo is supplied.
const brandLogos: Record<string, { type: "svg" | "img"; src?: string }> = {
  Cortizo: { type: "svg" },
  Vetromax: { type: "img", src: "/brand/logos/vetromax-teal.png" },
  "Gulf Extrusions": { type: "img", src: "/brand/logos/gulf-extrusions-teal.png" },
};

function BrandMark({ name }: { name: string }) {
  const logo = brandLogos[name];
  if (logo?.type === "svg") {
    return <CortizoLogo className="h-6 w-auto text-[#007969]" />;
  }
  if (logo?.type === "img" && logo.src) {
    return (
      <div className="relative h-7 w-[112px]">
        <Image src={logo.src} alt={`${name} logo`} fill className="object-contain" sizes="112px" />
      </div>
    );
  }
  // Fallback (Vetro): minimal teal mark
  return (
    <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center">
      <div className="w-3 h-3 rounded-sm bg-[#007969]" />
    </div>
  );
}

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
const sortedBlogPosts = [...blogPosts].sort((a, b) => {
  const [aM, aY] = a.date.split(" ");
  const [bM, bY] = b.date.split(" ");
  return (parseInt(bY) * 100 + (MONTHS[bM] ?? 0)) - (parseInt(aY) * 100 + (MONTHS[aM] ?? 0));
});

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
  { name: "Vetromax", country: "UAE", tagline: "Frameless & ultra-slim glazing" },
  { name: "Vetro", country: "UAE", tagline: "Minimal sightlines. Maximum light." },
  { name: "Gulf Extrusions", country: "UAE", tagline: "Built for the Gulf climate" },
];

/* ── Dot indicator component ──────────────────────────────────────────────── */
function Dots({ count, active, onDotClick }: { count: number; active: number; onDotClick: (i: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            active === i ? "w-5 h-1.5 bg-[#007969]" : "w-1.5 h-1.5 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function HomeClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  /* carousel refs & active-slide state */
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const portfolioCarouselRef = useRef<HTMLDivElement>(null);
  const processCarouselRef = useRef<HTMLDivElement>(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const [activePortfolio, setActivePortfolio] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);

  const onScroll = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, setter: (i: number) => void) => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.82));
      setter(Math.max(0, idx));
    },
    []
  );

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth * 0.82, behavior: "smooth" });
  };

  /* Product carousel items */
  const productCards: Array<{
    href: string; image?: string; label: string; title: string; sub: string; isImage: boolean;
  }> = [
    {
      href: "/catalogue/aluminium-sliding-doors",
      image: "/brand/product-bifold-kitchen.png",
      label: "01",
      title: "Aluminium Sliding Doors",
      sub: "Lift-and-slide systems from Cortizo",
      isImage: true,
    },
    ...productCategories.slice(1, 5).map((cat, i) => ({
      href: `/catalogue/${cat.slug}`,
      label: String(i + 2).padStart(2, "0"),
      title: cat.name,
      sub: cat.tagline,
      isImage: false,
    })),
    {
      href: "/catalogue/garden-rooms",
      image: "/brand/product-bedroom-doors.png",
      label: "Garden Rooms",
      title: "Transform unused space into living space.",
      sub: "",
      isImage: true,
    },
  ];

  /* Portfolio carousel items */
  const portfolioCards = [
    {
      href: "/portfolio/4900-gallery",
      image: "/brand/project-skylight-restaurant.jpg",
      badge: "Commercial · Skylight",
      title: "4900 Gallery — Dubai",
      sub: "Large format glass skylight system",
      featured: true,
    },
    ...portfolioProjects.slice(0, 4).map((p) => ({
      href: `/portfolio/${p.slug}`,
      image: p.image,
      badge: p.type,
      title: p.name,
      sub: p.location,
      featured: false,
      project: p,
    })),
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[100dvh] min-h-[600px] overflow-hidden flex items-end bg-[#030a08]">
        {/* Poster image — LCP candidate, always visible */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/brand/hero-villa-dubai.png"
            alt=""
            fill
            className="object-cover opacity-70"
            priority
            sizes="100vw"
          />
        </div>
        {/* Video overlay — desktop only, loads after poster */}
        {!isTouch && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transform: "translateZ(0)" }}>
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "max(100vw, calc(100vh * 16 / 9))",
                height: "max(100vh, calc(100vw * 9 / 16))",
                transform: "translate(-50%, -50%) scale(1.25)",
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/a7Q40rrVvo4?autoplay=1&mute=1&loop=1&playlist=a7Q40rrVvo4&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
                style={{ border: "none", pointerEvents: "none" }}
                title="Swiftrooms showcase"
              />
            </div>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(3,10,8,0.95) 0%, rgba(0,80,68,0.45) 40%, rgba(0,30,25,0.30) 70%, rgba(0,0,0,0.50) 100%)",
          }}
        />
        <motion.div
          className="relative z-10 w-full max-w-screen-xl mx-auto px-5 md:px-8 pb-24 md:pb-28"
          style={isTouch ? undefined : { opacity: heroOpacity }}
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
            <span className="text-[#4dd9c0]">Windows</span>{" "}&amp; Doors
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
            <QuoteButton className="btn-brand">
              Get a Free Quote
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </QuoteButton>
            <ShowroomButton className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-accent font-semibold text-[0.8rem] tracking-[0.12em] uppercase px-6 py-3.5 hover:bg-white hover:text-[#007969] transition-all">
              Book Showroom Visit
            </ShowroomButton>
          </motion.div>
        </motion.div>
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

      {/* ── USP STRIP — desktop: grid | mobile: marquee ticker ───────────── */}
      <section className="bg-[#007969] overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block max-w-screen-xl mx-auto px-5 md:px-8 py-5">
          <div className="grid grid-cols-4 gap-3">
            {usps.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <span className="text-lg flex-shrink-0">{u.icon}</span>
                <span className="font-accent text-[0.7rem] tracking-[0.08em] uppercase font-semibold text-white/90 leading-tight">
                  {u.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: auto-scrolling marquee */}
        <div className="md:hidden py-4 overflow-hidden">
          <div className="flex usp-marquee">
            {[...usps, ...usps].map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-white flex-shrink-0 px-6">
                <span className="text-base flex-shrink-0">{u.icon}</span>
                <span className="font-accent text-[0.65rem] tracking-[0.08em] uppercase font-semibold text-white/90 leading-tight whitespace-nowrap">
                  {u.text}
                </span>
                <span className="ml-4 text-white/30">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SWIFTROOMS SOLUTION ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-14">
              <div className="flex justify-center mb-5">
                <div className="divider-brand" />
              </div>
              <p className="text-label text-[#007969] mb-3">From common problems to premium solutions</p>
              <h2 className="text-headline text-[#1c1c1e]">The Swiftrooms Solution</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScrollReveal direction="left">
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 md:p-8">
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
            <ScrollReveal direction="right">
              <div className="bg-[#007969] rounded-2xl p-6 md:p-8">
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
      <section className="py-16 md:py-24 bg-white overflow-hidden">
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
              <div className="relative h-[300px] sm:h-[340px] md:h-[420px] lg:h-[560px]">
                <div className="absolute top-0 right-0 w-[75%] h-[55%] overflow-hidden rounded-2xl shadow-2xl">
                  <Image src="/brand/hero-villa-dubai.png" alt="Modern Dubai villa with bi-fold doors" fill className="object-cover" />
                </div>
                <div className="absolute bottom-0 left-0 w-[65%] h-[50%] overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                  <Image src="/brand/product-bedroom-doors.png" alt="Bedroom with casement doors" fill className="object-cover" />
                </div>
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
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
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

          {/* ── Mobile: full-width snap carousel with peek ── */}
          <div className="md:hidden">
            <div
              ref={productCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain -mx-5 px-5 gap-4 pb-2"
              style={{ scrollPaddingLeft: "1.25rem" }}
              onScroll={() => onScroll(productCarouselRef, setActiveProduct)}
            >
              {productCards.map((card, i) =>
                card.isImage ? (
                  <Link
                    key={i}
                    href={card.href}
                    className="snap-start flex-shrink-0 w-[82vw] relative h-64 overflow-hidden rounded-2xl block active:scale-[0.98] transition-transform"
                  >
                    <Image
                      src={card.image!}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="text-label text-[#00a389] mb-1">{card.label}</p>
                      <h3 className="font-heading font-bold text-lg text-white mb-1">{card.title}</h3>
                      {card.sub && <p className="text-white/60 text-xs">{card.sub}</p>}
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={i}
                    href={card.href}
                    className="snap-start flex-shrink-0 w-[72vw] bg-white border border-gray-100 rounded-2xl p-5 block active:scale-[0.98] transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] flex items-center justify-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#007969]" />
                    </div>
                    <p className="text-label text-[#007969] mb-2">{card.label}</p>
                    <h3 className="font-heading font-semibold text-[#1c1c1e] mb-2">{card.title}</h3>
                    <p className="text-[#6b7280] text-xs leading-relaxed">{card.sub}</p>
                  </Link>
                )
              )}
            </div>
            <Dots
              count={productCards.length}
              active={activeProduct}
              onDotClick={(i) => scrollTo(productCarouselRef, i)}
            />
          </div>

          {/* ── Desktop: original grid ── */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
            <ScrollReveal className="md:col-span-2 lg:col-span-2">
              <Link href="/catalogue/aluminium-sliding-doors" className="group block relative h-72 overflow-hidden rounded-2xl card-hover">
                <Image src="/brand/product-bifold-kitchen.png" alt="Aluminium sliding doors" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                  <p className="text-label text-[#00a389] mb-1">01</p>
                  <h3 className="font-heading font-bold text-xl text-white mb-1">Aluminium Sliding Doors</h3>
                  <p className="text-white/60 text-sm">Lift-and-slide systems from Cortizo</p>
                </div>
              </Link>
            </ScrollReveal>
            {productCategories.slice(1, 5).map((cat, i) => (
              <ScrollReveal key={cat.id} delay={(i + 1) * 0.07}>
                <Link href={`/catalogue/${cat.slug}`} className="group block bg-white border border-gray-100 rounded-2xl p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] flex items-center justify-center mb-4 group-hover:bg-[#007969] transition-colors">
                    <div className="w-3 h-3 rounded-full bg-[#007969] group-hover:bg-white transition-colors" />
                  </div>
                  <p className="text-label text-[#007969] mb-2">{String(i + 2).padStart(2, "0")}</p>
                  <h3 className="font-heading font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors">{cat.name}</h3>
                  <p className="text-[#6b7280] text-xs leading-relaxed">{cat.tagline}</p>
                </Link>
              </ScrollReveal>
            ))}
            <ScrollReveal className="md:col-span-2 lg:col-span-2">
              <Link href="/catalogue/garden-rooms" className="group block relative h-56 overflow-hidden rounded-2xl card-hover">
                <Image src="/brand/product-bedroom-doors.png" alt="Garden room doors" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
      <section className="py-16 md:py-20 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <div className="flex justify-center mb-5"><div className="divider-brand" /></div>
              <p className="text-label text-[#007969] mb-2">Brands We Work With</p>
            </div>
          </ScrollReveal>

          {/* ── Mobile: 2-per-view snap carousel ── */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain -mx-5 px-5 gap-3 pb-2">
              {brands.map((brand, i) => (
                <Link
                  key={brand.name}
                  href="/catalogue/brands"
                  className="snap-start flex-shrink-0 w-[44vw] border border-gray-100 rounded-2xl p-5 text-center active:scale-[0.97] transition-transform"
                >
                  <div className="h-10 flex items-center justify-center mx-auto mb-3">
                    <BrandMark name={brand.name} />
                  </div>
                  <p className="font-heading font-bold text-[#1c1c1e] mb-1 text-sm">{brand.name}</p>
                  <p className="text-[0.6rem] tracking-wide uppercase text-[#6b7280] mb-0.5">{brand.country}</p>
                  <p className="text-[#9ca3af] text-[0.7rem] leading-tight">{brand.tagline}</p>
                </Link>
              ))}
            </div>
            <p className="text-center mt-4">
              <Link href="/catalogue/brands" className="text-label text-[#007969] hover:underline">
                View all brand partners →
              </Link>
            </p>
          </div>

          {/* ── Desktop: original grid ── */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {brands.map((brand, i) => (
              <ScrollReveal key={brand.name} delay={i * 0.08}>
                <Link href="/catalogue/brands" className="group block border border-gray-100 rounded-2xl p-6 hover:border-[#007969]/30 hover:shadow-md transition-all text-center">
                  <div className="h-10 flex items-center justify-center mx-auto mb-3 opacity-85 group-hover:opacity-100 transition-opacity">
                    <BrandMark name={brand.name} />
                  </div>
                  <p className="font-heading font-bold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-1">{brand.name}</p>
                  <p className="text-[0.65rem] tracking-wide uppercase text-[#6b7280] mb-0.5">{brand.country}</p>
                  <p className="text-[#9ca3af] text-xs">{brand.tagline}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <div className="divider-brand mb-5" />
                <p className="text-label text-[#007969] mb-3">Selected Work</p>
                <h2 className="text-headline text-[#1c1c1e]">Portfolio<br />across the UAE</h2>
              </div>
              <Link href="/portfolio" className="btn-outline self-start md:self-auto">All Projects →</Link>
            </div>
          </ScrollReveal>

          {/* ── Mobile: cinematic full-width snap carousel with counter ── */}
          <div className="md:hidden">
            <div
              ref={portfolioCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain -mx-5 px-5 gap-4 pb-2"
              style={{ scrollPaddingLeft: "1.25rem" }}
              onScroll={() => onScroll(portfolioCarouselRef, setActivePortfolio)}
            >
              {portfolioCards.map((card, i) => (
                <Link
                  key={i}
                  href={card.href}
                  className="snap-start flex-shrink-0 w-[82vw] relative h-72 overflow-hidden rounded-2xl block active:scale-[0.98] transition-transform"
                >
                  {card.image ? (
                    <Image src={card.image} alt={card.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f0fdf4]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[0.55rem] tracking-widest uppercase text-white bg-black/40 px-2 py-1">
                      {card.badge}
                    </span>
                  </div>
                  {/* Counter */}
                  <div className="absolute top-3 right-3 font-accent font-bold text-white/60 text-xs">
                    {String(i + 1).padStart(2, "0")} / {String(portfolioCards.length).padStart(2, "0")}
                  </div>
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="font-heading font-bold text-lg text-white mb-1">{card.title}</h3>
                    <p className="text-white/60 text-xs">{card.sub}</p>
                    <div className="mt-3 flex items-center gap-1 text-[0.65rem] uppercase tracking-widest text-[#4dd9c0] font-semibold">
                      View Case Study
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Dots
              count={portfolioCards.length}
              active={activePortfolio}
              onDotClick={(i) => scrollTo(portfolioCarouselRef, i)}
            />
          </div>

          {/* ── Desktop: original grid ── */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            <ScrollReveal className="col-span-2">
              <Link href="/portfolio/4900-gallery" className="group block relative h-72 overflow-hidden rounded-2xl">
                <Image src="/brand/project-skylight-restaurant.jpg" alt="Glass skylight restaurant project" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="usp-badge bg-black/40 border-white/20 text-white text-[0.6rem] mb-3 inline-flex">Commercial · Skylight</span>
                  <h3 className="font-heading font-bold text-xl text-white">4900 Gallery — Dubai</h3>
                  <p className="text-white/60 text-sm mt-1">Large format glass skylight system</p>
                </div>
              </Link>
            </ScrollReveal>
            {portfolioProjects.slice(0, 4).map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.07}>
                <Link href={`/portfolio/${project.slug}`} className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover">
                  <div className="h-40 relative overflow-hidden bg-[#f0fdf4]">
                    {project.image && <Image src={project.image} alt={project.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[0.55rem] tracking-widest uppercase text-white bg-black/40 backdrop-blur-sm px-2 py-0.5">{project.type}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading font-semibold text-[#1c1c1e] text-sm group-hover:text-[#007969] transition-colors">{project.name}</h3>
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
      <section className="py-16 md:py-20 bg-white border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
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

          {/* ── Mobile: numbered step carousel with connector lines ── */}
          <div className="md:hidden">
            <div
              ref={processCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain -mx-5 px-5 gap-0 pb-2"
              style={{ scrollPaddingLeft: "1.25rem" }}
              onScroll={() => onScroll(processCarouselRef, setActiveProcess)}
            >
              {processSteps.map((step, i) => (
                <div
                  key={step.number}
                  className="snap-start flex-shrink-0 w-[72vw] pr-4"
                >
                  <div className="relative">
                    {/* Connector to next step */}
                    {i < processSteps.length - 1 && (
                      <div className="absolute top-5 left-10 right-0 h-px bg-[#007969]/15" />
                    )}
                    <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#007969]/20 flex items-center justify-center mb-4 relative z-10">
                      <span className="font-accent font-bold text-[#007969] text-sm">{step.number}</span>
                    </div>
                    <h4 className="font-heading font-semibold text-[#1c1c1e] text-sm mb-2">{step.title}</h4>
                    <p className="text-[#6b7280] text-xs leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Step counter */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-[0.65rem] tracking-widest uppercase text-[#6b7280]">
                Step {activeProcess + 1} of {processSteps.length}
              </span>
              <div className="flex gap-1.5">
                {processSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(processCarouselRef, i)}
                    className={`rounded-full transition-all duration-300 ${
                      activeProcess === i ? "w-4 h-1.5 bg-[#007969]" : "w-1.5 h-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Desktop: original grid ── */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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

      {/* ── BLOG PREVIEW ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-label text-[#007969] mb-3">Technical Insights</p>
                <h2 className="text-title text-[#1c1c1e]">From the Swiftrooms blog.</h2>
              </div>
              <Link
                href="/technical/blog"
                className="hidden sm:flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#6b7280] hover:text-[#007969] transition-colors"
              >
                All articles
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {sortedBlogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.08}>
                <Link
                  href={`/technical/blog/${post.slug}`}
                  className="group block bg-white hover:bg-[#f8f9fa] transition-colors h-full"
                >
                  <div className="h-44 relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-3 block">
                      {post.category}
                    </span>
                    <h3 className="text-[#1c1c1e] font-semibold leading-snug group-hover:text-[#007969] transition-colors mb-3">
                      {post.title}
                    </h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <p className="text-gray-400 text-xs mt-4">{post.date} · {post.readTime}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="mt-8 sm:hidden text-center">
              <Link
                href="/technical/blog"
                className="inline-flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#007969]"
              >
                All articles →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-label text-[#007969] mb-3">Client Feedback</p>
                <h2 className="text-title text-[#1c1c1e]">What clients say.</h2>
              </div>
              <Link
                href="/portfolio"
                className="hidden sm:flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-[#6b7280] hover:text-[#007969] transition-colors"
              >
                View portfolio
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.07}>
                <div className="bg-white p-6 md:p-8 flex flex-col h-full">
                  <svg className="w-6 h-6 text-[#007969]/30 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-[#3a3a3c] leading-relaxed text-sm flex-1 italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[#1c1c1e] font-semibold text-sm">{t.author}</p>
                    <p className="text-[#6b7280] text-xs mt-0.5">{t.location}</p>
                    <span className="inline-block mt-2 text-[0.55rem] tracking-widest uppercase text-[#007969] border border-[#007969]/20 px-2 py-0.5">
                      {t.product}
                    </span>
                  </div>
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
            <h2 className="text-headline text-white mb-5 max-w-2xl mx-auto">Book Your Showroom Visit Today</h2>
            <p className="text-white/50 text-body-lg max-w-lg mx-auto mb-10">
              Experience our full product range at full scale. Free consultation, no obligation.
              Jebel Ali, Dubai — open Sunday to Thursday.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton className="btn-brand">Get a Free Quote</QuoteButton>
              <ShowroomButton className="btn-outline border-white/30 text-white hover:bg-white hover:text-[#007969]">
                Book Showroom Visit
              </ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
