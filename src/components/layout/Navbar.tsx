"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const catalogueItems = [
  { label: "All Products", href: "/catalogue" },
  { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
  { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "Aluminium Glass Doors", href: "/catalogue/aluminium-glass-doors" },
  { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
  { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
  { label: "Insect Screens", href: "/catalogue/insect-screens" },
  { label: "Gallery", href: "/catalogue/gallery" },
];

const technicalItems = [
  { label: "Our Process", href: "/technical/process" },
  { label: "Blog & Insights", href: "/technical/blog" },
  { label: "Technical Resources", href: "/technical/resources" },
  { label: "FAQ", href: "/technical/faq" },
];

const brandItems = [
  { label: "Schüco", href: "/brands/schuco-aluminium-windows" },
  { label: "Reynaers", href: "/brands/reynaers-aluminium-systems" },
  { label: "Cortizo", href: "/brands/cortizo-aluminium-systems" },
  { label: "Gulf Extrusions", href: "/brands/gulf-extrusions-aluminium-systems" },
  { label: "Deceuninck", href: "/brands/deceuninck-upvc-windows-doors" },
  { label: "UltraFrame", href: "/brands/ultraframe-roof-systems" },
  { label: "Vetromax", href: "/brands/vetromax" },
];

// Fallback only — src/lib/site-settings.ts DEFAULTS.navigation.mobile is what
// actually renders. Kept in sync so the two cannot disagree.
const mobileNavItems = [
  { label: "About Us", href: "/about" },
  { label: "Product Range", href: "/catalogue" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Technical", href: "/technical" },
  { label: "Promotions", href: "/catalogue/promotions" },
  { label: "Shop By Brand", href: "/brands" },
];

type NavLink = { label: string; href: string };
type NavData = {
  catalogue?: NavLink[];
  technical?: NavLink[];
  brands?: NavLink[];
  mobile?: NavLink[];
  catalogueBlurb?: string;
  technicalBlurb?: string;
  brandsBlurb?: string;
};

type MegaId = "catalogue" | "technical" | "brands";

export default function Navbar({ nav, quoteLabel }: { nav?: NavData; quoteLabel?: string } = {}) {
  // Sanity-driven menus with the hardcoded arrays as defaults, so the header is
  // byte-identical when Site Settings is blank.
  const catalogue = nav?.catalogue?.length ? nav.catalogue : catalogueItems;
  const technical = nav?.technical?.length ? nav.technical : technicalItems;
  const brands = nav?.brands?.length ? nav.brands : brandItems;
  const mobile = nav?.mobile?.length ? nav.mobile : mobileNavItems;
  const catalogueBlurb =
    nav?.catalogueBlurb || "Premium aluminium, uPVC and glazing systems from Europe's leading manufacturers.";
  const technicalBlurb = nav?.technicalBlurb || "Resources, guides and expertise from first enquiry to aftercare.";
  const brandsBlurb = nav?.brandsBlurb || "Dedicated system pages for our specialist manufacturer partners.";
  const quoteCta = quoteLabel || "Get a Quote";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<MegaId | null>(null);
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

  const openMega = (menu: MegaId) => {
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
        {/* Legibility scrim behind the transparent header over the homepage hero. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none transition-opacity duration-400 bg-gradient-to-b from-black/65 via-black/30 to-transparent ${
            heroMode ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav className="relative z-10 max-w-screen-xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="Swiftrooms"
              width={176}
              height={36}
              className="h-9 w-auto transition-all duration-300"
              style={heroMode ? { filter: "brightness(0) invert(1)" } : {}}
            />
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-6 min-w-0">
          <ul
            className={`flex items-center gap-5 whitespace-nowrap font-accent text-[0.95rem] tracking-[0.08em] uppercase font-semibold transition-colors duration-300 ${
              heroMode ? "text-white" : "text-[#3a3a3c]"
            }`}
          >
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
                Product Range
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
            <li>
              <Link href="/catalogue/promotions" className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}>
                Promotions
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("brands")}
              onMouseLeave={closeMega}
            >
              <Link
                href="/brands"
                aria-haspopup="true"
                aria-expanded={megaMenu === "brands"}
                aria-controls="mega-brands"
                onFocus={() => openMega("brands")}
                className={`uppercase transition-colors flex items-center gap-1 ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Shop By Brand
                <svg className={`w-3 h-3 ${heroMode ? "opacity-60" : "opacity-40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/showroom" className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}>
                Showroom
              </Link>
            </li>
          </ul>
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden xl:flex items-center">
            <QuoteButton
              className={`font-accent font-semibold text-[0.95rem] tracking-[0.08em] uppercase px-4 py-2.5 transition-all ${
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
            className={`xl:hidden min-w-11 min-h-11 -mr-2 flex items-center justify-center transition-colors ${heroMode ? "text-white" : "text-[#1c1c1e]"}`}
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

        <MegaMenu
          id="catalogue"
          open={megaMenu === "catalogue"}
          title="Product Range"
          blurb={catalogueBlurb}
          viewAllHref="/catalogue"
          links={catalogue}
          onEnter={() => openMega("catalogue")}
          onLeave={closeMega}
          onNavigate={() => setMegaMenu(null)}
        />
        <MegaMenu
          id="technical"
          open={megaMenu === "technical"}
          title="Technical Hub"
          blurb={technicalBlurb}
          links={technical}
          onEnter={() => openMega("technical")}
          onLeave={closeMega}
          onNavigate={() => setMegaMenu(null)}
        />
        <MegaMenu
          id="brands"
          open={megaMenu === "brands"}
          title="Shop By Brand"
          blurb={brandsBlurb}
          viewAllHref="/brands"
          links={brands}
          onEnter={() => openMega("brands")}
          onLeave={closeMega}
          onNavigate={() => setMegaMenu(null)}
        />
      </header>

      {/* ── MOBILE FULL-SCREEN OVERLAY ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-[#0f0f0f] flex flex-col xl:hidden overflow-hidden"
          >
            {/* Header row — logo + close */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 h-16">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo.svg"
                  alt="Swiftrooms"
                  width={157}
                  height={32}
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

/** Full-width dropdown panel under the header: intro column + link grid. */
function MegaMenu({
  id,
  open,
  title,
  blurb,
  viewAllHref,
  links,
  onEnter,
  onLeave,
  onNavigate,
}: {
  id: MegaId;
  open: boolean;
  title: string;
  blurb: string;
  /** When set, shows a "View all" link and lays links out in a 3-column grid. */
  viewAllHref?: string;
  links: NavLink[];
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}) {
  const linkClass = "text-sm text-[#3a3a3c] hover:text-[#007969] hover:bg-[#f0fdf4] px-3 py-2 rounded transition-all";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={`mega-${id}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 bg-white border-t border-b border-gray-100 shadow-xl"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
            <div>
              <div className="divider-brand mb-4" />
              <p className="text-label text-[#007969] mb-3">{title}</p>
              <p className="text-[#6b7280] text-sm leading-relaxed">{blurb}</p>
              {viewAllHref && (
                <Link
                  href={viewAllHref}
                  className="mt-5 inline-flex items-center gap-1.5 text-label text-[#007969] hover:gap-3 transition-all"
                  onClick={onNavigate}
                >
                  View all →
                </Link>
              )}
            </div>
            <div className={viewAllHref ? "col-span-3 grid grid-cols-3 gap-1" : "flex flex-col gap-1"}>
              {links.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`${linkClass} ${item.label === "All Products" ? "font-bold text-[#007969]" : ""}`}
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
