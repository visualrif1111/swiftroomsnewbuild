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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<"catalogue" | "technical" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Nav is "hero mode" (white text) only on the homepage before scrolling
  const heroMode = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMega = (menu: "catalogue" | "technical") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMegaMenu(menu);
  };
  const closeMega = () => {
    timerRef.current = setTimeout(() => setMegaMenu(null), 120);
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

          {/* Mobile burger */}
          <button
            className={`lg:hidden p-2 transition-colors ${heroMode ? "text-white" : "text-[#1c1c1e]"}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-white flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.svg" alt="Swiftrooms" className="h-8 w-auto" />
              <button className="p-2 text-[#1c1c1e]" onClick={() => setMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-0">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Catalogue", href: "/catalogue" },
                { label: "Brands", href: "/catalogue/brands" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Our Process", href: "/technical/process" },
                { label: "Blog", href: "/technical/blog" },
                { label: "FAQ", href: "/technical/faq" },
                { label: "Resources", href: "/technical/resources" },
                { label: "Contact", href: "/contact" },
                { label: "Showroom", href: "/showroom" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-heading font-semibold uppercase text-[#1c1c1e] hover:text-[#007969] py-3.5 border-b border-gray-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-5 py-5 space-y-3">
              <Link href="/enquire" className="btn-brand w-full justify-center" onClick={() => setMenuOpen(false)}>
                Get a Free Quote
              </Link>
              <Link href="/showroom" className="btn-outline w-full justify-center" onClick={() => setMenuOpen(false)}>
                Book Showroom Visit
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
