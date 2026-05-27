"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const catalogueItems = [
  { label: "All Products", href: "/catalogue" },
  { label: "Brands", href: "/catalogue/brands" },
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
  { label: "Bi-fold Doors", href: "/catalogue/bi-fold" },
  { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
  { label: "Insect Screens", href: "/catalogue/insect-screens" },
  { label: "Promotions", href: "/catalogue/promotions" },
  { label: "Gallery", href: "/catalogue/gallery" },
];

const technicalItems = [
  { label: "Our Process", href: "/technical/process" },
  { label: "Blog & Insights", href: "/technical/blog" },
  { label: "Technical Resources", href: "/technical/resources" },
  { label: "FAQ", href: "/technical/faq" },
];

const productRangeItems = [
  { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-doors" },
  { label: "Aluminium Bi-folding Doors", href: "/catalogue/bi-fold" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "UPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Curtain Wall / Facade Glazing System", href: "/catalogue/curtain-wall" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Insect Screens", href: "/catalogue/insect-screens" },
  { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
];

const portfolioMobileItems = [
  { label: "All Projects", href: "/portfolio" },
  { label: "Villa Projects", href: "/portfolio" },
  { label: "Commercial Projects", href: "/portfolio" },
  { label: "Garden Rooms", href: "/portfolio" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<"catalogue" | "technical" | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [openSubAccordion, setOpenSubAccordion] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const heroMode = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenAccordion(null);
    setOpenSubAccordion(null);
  }, [pathname]);

  // Lock body scroll when menu open — position:fixed approach works on Chrome Android
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const savedTop = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (savedTop) {
        window.scrollTo(0, parseInt(savedTop) * -1);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  const openMega = (menu: "catalogue" | "technical") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMegaMenu(menu);
  };
  const closeMega = () => {
    timerRef.current = setTimeout(() => setMegaMenu(null), 120);
  };

  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? null : name);
    setOpenSubAccordion(null);
  };

  const toggleSubAccordion = (name: string) => {
    setOpenSubAccordion(openSubAccordion === name ? null : name);
  };

  return (
    <>
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

          {/* Desktop nav */}
          <ul
            className={`hidden lg:flex items-center gap-7 font-accent text-[1rem] tracking-[0.12em] uppercase font-semibold transition-colors duration-300 ${
              heroMode ? "text-white" : "text-[#3a3a3c]"
            }`}
          >
            <li>
              <Link
                href="/"
                className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                About
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("catalogue")}
              onMouseLeave={closeMega}
            >
              <button
                className={`uppercase transition-colors flex items-center gap-1 ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Catalogue
                <svg className={`w-3 h-3 ${heroMode ? "opacity-60" : "opacity-40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
            <li>
              <Link
                href="/portfolio"
                className={`transition-colors ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Portfolio
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("technical")}
              onMouseLeave={closeMega}
            >
              <button
                className={`uppercase transition-colors flex items-center gap-1 ${heroMode ? "hover:text-white/70" : "hover:text-[#007969]"}`}
              >
                Technical
                <svg className={`w-3 h-3 ${heroMode ? "opacity-60" : "opacity-40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
          </ul>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/showroom"
              className={`font-accent text-[1rem] tracking-[0.12em] uppercase font-semibold transition-colors px-3 py-2 ${
                heroMode ? "text-white hover:text-white/70" : "text-[#3a3a3c] hover:text-[#007969]"
              }`}
            >
              Showroom
            </Link>
            <Link
              href="/enquire"
              className={`font-accent font-semibold text-[1rem] tracking-[0.12em] uppercase px-5 py-2.5 transition-all ${
                heroMode
                  ? "border border-white/50 text-white hover:bg-white hover:text-[#007969]"
                  : "btn-brand"
              }`}
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile / Tablet burger */}
          <button
            className={`lg:hidden p-2 transition-colors ${heroMode ? "text-white" : "text-[#1c1c1e]"}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <div className="w-6 flex flex-col gap-[5px]">
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </nav>

        {/* Mega — Catalogue */}
        <AnimatePresence>
          {megaMenu === "catalogue" && (
            <motion.div
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
                    Premium aluminium, uPVC and glazing systems from Europe&apos;s leading manufacturers.
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
                  {catalogueItems.map((item) => (
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

        {/* Mega — Technical */}
        <AnimatePresence>
          {megaMenu === "technical" && (
            <motion.div
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
                    Resources, guides and expertise from first enquiry to aftercare.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {technicalItems.map((item) => (
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

      {/* ── MOBILE / TABLET FULL-SCREEN MENU ──────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col lg:hidden shadow-2xl"
            >
              {/* Menu header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 flex-shrink-0">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo.svg" alt="Swiftrooms" className="h-8 w-auto" />
                </Link>
                <button
                  className="w-10 h-10 flex items-center justify-center text-[#1c1c1e] hover:text-[#007969] transition-colors"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable nav */}
              <nav className="flex-1 overflow-y-auto">
                {/* Home */}
                <Link
                  href="/"
                  className="mobile-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>

                {/* About */}
                <Link
                  href="/about"
                  className="mobile-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  About Us
                </Link>

                {/* Catalogue accordion */}
                <div>
                  <button
                    className="mobile-nav-item w-full flex items-center justify-between"
                    onClick={() => toggleAccordion("catalogue")}
                    aria-expanded={openAccordion === "catalogue"}
                  >
                    <span>Catalogue</span>
                    <motion.svg
                      animate={{ rotate: openAccordion === "catalogue" ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-4 h-4 text-[#007969] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "catalogue" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden bg-[#f8f9fa]"
                      >
                        {/* Brands */}
                        <Link
                          href="/catalogue/brands"
                          className="mobile-sub-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          Brands
                        </Link>

                        {/* Product Range nested accordion */}
                        <div>
                          <button
                            className="mobile-sub-item w-full flex items-center justify-between"
                            onClick={() => toggleSubAccordion("productRange")}
                            aria-expanded={openSubAccordion === "productRange"}
                          >
                            <span>Product Range</span>
                            <motion.svg
                              animate={{ rotate: openSubAccordion === "productRange" ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="w-3.5 h-3.5 text-[#007969] flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                          </button>
                          <AnimatePresence>
                            {openSubAccordion === "productRange" && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden bg-white"
                              >
                                {productRangeItems.map((item) => (
                                  <Link
                                    key={item.href + item.label}
                                    href={item.href}
                                    className="mobile-deep-item"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-[#007969] flex-shrink-0 mt-2" />
                                    {item.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Promotions */}
                        <Link
                          href="/catalogue/promotions"
                          className="mobile-sub-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          Promotions
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Portfolio accordion */}
                <div>
                  <button
                    className="mobile-nav-item w-full flex items-center justify-between"
                    onClick={() => toggleAccordion("portfolio")}
                    aria-expanded={openAccordion === "portfolio"}
                  >
                    <span>Portfolio</span>
                    <motion.svg
                      animate={{ rotate: openAccordion === "portfolio" ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-4 h-4 text-[#007969] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "portfolio" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden bg-[#f8f9fa]"
                      >
                        {portfolioMobileItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="mobile-sub-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Technical accordion */}
                <div>
                  <button
                    className="mobile-nav-item w-full flex items-center justify-between"
                    onClick={() => toggleAccordion("technical")}
                    aria-expanded={openAccordion === "technical"}
                  >
                    <span>Technical</span>
                    <motion.svg
                      animate={{ rotate: openAccordion === "technical" ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-4 h-4 text-[#007969] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "technical" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden bg-[#f8f9fa]"
                      >
                        {technicalItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="mobile-sub-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Showroom */}
                <Link
                  href="/showroom"
                  className="mobile-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Visit Showroom
                </Link>
              </nav>

              {/* Bottom CTA */}
              <div className="flex-shrink-0 px-5 py-5 border-t border-gray-100 space-y-3 bg-white">
                <Link
                  href="/enquire"
                  className="btn-brand w-full justify-center text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Get a Quote
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/showroom"
                  className="btn-outline w-full justify-center text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Book Showroom Visit
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
