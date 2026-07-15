"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const catalogueItems = [
  { label: "All Products", href: "/catalogue" },
  { label: "Brands", href: "/catalogue/brands" },
  { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
  { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
  { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
  { label: "Insect Screens", href: "/catalogue/insect-screens" },
  { label: "Gallery", href: "/catalogue/gallery" },
  { label: "Promotions", href: "/catalogue/promotions" },
];

const technicalItems = [
  { label: "Our Process", href: "/technical/process" },
  { label: "Blog & Insights", href: "/technical/blog" },
  { label: "Technical Resources", href: "/technical/resources" },
  { label: "FAQ", href: "/technical/faq" },
];

const mobileNavItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Technical", href: "/technical" },
];

type NavLink = { label: string; href: string };
type NavData = {
  catalogue?: NavLink[];
  technical?: NavLink[];
  mobile?: NavLink[];
  catalogueBlurb?: string;
  technicalBlurb?: string;
};

export default function Navbar({ nav, quoteLabel }: { nav?: NavData; quoteLabel?: string } = {}) {
  // Sanity-driven menus with the hardcoded arrays as defaults, so the header is
  // byte-identical when Site Settings is blank.
  const catalogue = nav?.catalogue?.length ? nav.catalogue : catalogueItems;
  const technical = nav?.technical?.length ? nav.technical : technicalItems;
  const mobile = nav?.mobile?.length ? nav.mobile : mobileNavItems;
  const catalogueBlurb =
    nav?.catalogueBlurb || "Premium aluminium, uPVC and glazing systems from Europe's leading manufacturers.";
  const technicalBlurb = nav?.technicalBlurb || "Resources, guides and expertise from first enquiry to aftercare.";
  const quoteCta = quoteLabel || "Get a Quote";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<"catalogue" | "technical" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const heroMode = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape key — closes the mobile menu and any open desktop mega menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMegaMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Scroll lock via the shared ref-counted helper so the menu and the form
  // drawers never clobber each other's body styles (see lib/scroll-lock).
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  const openMega = (menu: "catalogue" | "technical") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMegaMenu(menu);
  };
  const closeMega = () => {
    timerRef.current = setTimeout(() => setMegaMenu(null), 120);
  };

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-screen-xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="Swiftrooms"
              className="h-9 w-auto transition-all duration-300"
              style={heroMode ? { filter: "brightness(0) invert(1)" } : {}}
            />
          </Link>

          {/* ── Desktop nav ── */}
          <ul
            className={`hidden lg:flex items-center gap-7 font-accent text-[1rem] tracking-[0.12em] uppercase font-semibold transition-colors duration-300 ${
              heroMode ? "text-white" : "text-[#3a3a3c]"
            }`}
          >
            <li>
              <Link href="/" className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}>
                About
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("catalogue")}
              onMouseLeave={closeMega}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={megaMenu === "catalogue"}
                aria-controls="mega-catalogue"
                onClick={() => setMegaMenu(megaMenu === "catalogue" ? null : "catalogue")}
                onFocus={() => openMega("catalogue")}
                className={`uppercase transition-colors flex items-center gap-1 ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Catalogue
                <svg className={`w-3 h-3 ${heroMode ? "opacity-60" : "opacity-40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
            <li>
              <Link href="/portfolio" className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}>
                Portfolio
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("technical")}
              onMouseLeave={closeMega}
            >
              <Link
                href="/technical"
                aria-haspopup="true"
                aria-expanded={megaMenu === "technical"}
                aria-controls="mega-technical"
                onFocus={() => openMega("technical")}
                className={`uppercase transition-colors flex items-center gap-1 ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Technical
                <svg className={`w-3 h-3 ${heroMode ? "opacity-60" : "opacity-40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </li>
          </ul>

          {/* ── Desktop CTAs ── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/showroom"
              className={`font-accent text-[1rem] tracking-[0.12em] uppercase font-semibold transition-colors px-3 py-2 ${
                heroMode ? "text-white hover:text-white/70" : "text-[#3a3a3c] hover:text-[#007969]"
              }`}
            >
              Showroom
            </Link>
            <QuoteButton
              className={`font-accent font-semibold text-[1rem] tracking-[0.12em] uppercase px-5 py-2.5 transition-all ${
                heroMode
                  ? "border border-white/50 text-white hover:bg-white hover:text-[#007969]"
                  : "btn-brand"
              }`}
            >
              {quoteCta}
            </QuoteButton>
          </div>

          {/* ── Mobile burger — minimal thin lines ── */}
          <button
            className={`lg:hidden p-2 -mr-1 transition-colors ${heroMode ? "text-white" : "text-[#1c1c1e]"}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className={`block h-px bg-current transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[6px]" : ""
                }`}
              />
              <span
                className={`block h-px bg-current transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-px bg-current transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                }`}
              />
            </div>
          </button>
        </nav>

        {/* ── Mega — Catalogue ── */}
        <AnimatePresence>
          {megaMenu === "catalogue" && (
            <motion.div
              id="mega-catalogue"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 bg-white border-t border-b border-gray-100 shadow-xl"
              onMouseEnter={() => openMega("catalogue")}
              onMouseLeave={closeMega}
            >
              <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
                <div>
                  <div className="divider-brand mb-4" />
                  <p className="text-label text-[#007969] mb-3">Product Range</p>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    {catalogueBlurb}
                  </p>
                  <Link
                    href="/catalogue"
                    className="mt-5 inline-flex items-center gap-1.5 text-label text-[#007969] hover:gap-3 transition-all"
                    onClick={() => setMegaMenu(null)}
                  >
                    View all →
                  </Link>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-1">
                  {catalogue.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="text-sm text-[#3a3a3c] hover:text-[#007969] hover:bg-[#f0fdf4] px-3 py-2 rounded transition-all"
                      onClick={() => setMegaMenu(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mega — Technical ── */}
        <AnimatePresence>
          {megaMenu === "technical" && (
            <motion.div
              id="mega-technical"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 bg-white border-t border-b border-gray-100 shadow-xl"
              onMouseEnter={() => openMega("technical")}
              onMouseLeave={closeMega}
            >
              <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
                <div>
                  <div className="divider-brand mb-4" />
                  <p className="text-label text-[#007969] mb-3">Technical Hub</p>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    {technicalBlurb}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {technical.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-[#3a3a3c] hover:text-[#007969] hover:bg-[#f0fdf4] px-3 py-2 rounded transition-all"
                      onClick={() => setMegaMenu(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE FULL-SCREEN OVERLAY ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-[#0f0f0f] flex flex-col lg:hidden overflow-hidden"
          >
            {/* Header row — logo + close */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 h-16">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo.svg"
                  alt="Swiftrooms"
                  className="h-8 w-auto"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Hairline divider */}
            <div className="h-px bg-white/[0.07] mx-6 flex-shrink-0" />

            {/* Nav links — vertically centred */}
            <nav className="flex-1 flex flex-col justify-center px-6" aria-label="Mobile navigation">
              {mobile.map((item, i) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 + i * 0.07,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`group flex items-baseline gap-4 py-[1.1rem] border-b border-white/[0.07] font-heading text-[2rem] leading-none font-normal tracking-[-0.02em] transition-colors duration-200 ${
                        isActive ? "text-white" : "text-white/35 hover:text-white"
                      }`}
                    >
                      <span className={`font-accent text-[0.6rem] tracking-[0.2em] uppercase transition-colors duration-200 ${
                        isActive ? "text-[#007969]" : "text-white/20 group-hover:text-white/40"
                      }`}>
                        0{i + 1}
                      </span>
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* CTA buttons */}
            <div
              className="flex-shrink-0 px-6 pt-6 space-y-3"
              style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuoteButton
                  className="w-full flex items-center justify-center bg-white text-[#0f0f0f] py-[1.05rem] font-accent text-[0.7rem] tracking-widest uppercase font-semibold hover:bg-white/90 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Get a Free Quote
                </QuoteButton>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.51, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ShowroomButton
                  className="w-full flex items-center justify-center border border-white/[0.18] text-white/80 py-[1.05rem] font-accent text-[0.7rem] tracking-widest uppercase font-semibold hover:border-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Book Showroom Visit
                </ShowroomButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
