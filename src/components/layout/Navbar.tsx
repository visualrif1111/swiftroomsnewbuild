"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  { label: "Process", href: "/technical/process" },
  { label: "Blog", href: "/technical/blog" },
  { label: "Resources", href: "/technical/resources" },
  { label: "FAQ", href: "/technical/faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<"catalogue" | "technical" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMega = (menu: "catalogue" | "technical") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMegaMenu(menu);
  };

  const closeMega = () => {
    timerRef.current = setTimeout(() => setMegaMenu(null), 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-white/10" : ""
        }`}
        style={{
          background: scrolled
            ? "rgba(10,10,10,0.92)"
            : "linear-gradient(to bottom, rgba(10,10,10,0.8), transparent)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <nav className="max-w-screen-xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-white font-bold text-lg tracking-widest uppercase">
              Swift<span className="text-[#c4a55f]">rooms</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8 text-[0.8rem] tracking-widest uppercase text-white/70">
            <li>
              <Link href="/" className="hover:text-white transition-colors link-underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors link-underline">
                About
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("catalogue")}
              onMouseLeave={closeMega}
            >
              <button className="hover:text-white transition-colors flex items-center gap-1">
                Catalogue
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-white transition-colors link-underline">
                Portfolio
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={() => openMega("technical")}
              onMouseLeave={closeMega}
            >
              <button className="hover:text-white transition-colors flex items-center gap-1">
                Technical
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </li>
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/showroom"
              className="text-[0.7rem] tracking-widest uppercase text-white/60 hover:text-white transition-colors"
            >
              Showroom
            </Link>
            <Link
              href="/enquire"
              className="text-[0.7rem] tracking-widest uppercase bg-[#c4a55f] text-black px-5 py-2.5 hover:bg-[#d4b87a] transition-colors"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span
                className={`block h-px bg-white transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-px bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px bg-white transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </nav>

        {/* Mega menu — Catalogue */}
        <AnimatePresence>
          {megaMenu === "catalogue" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 border-t border-white/10 mega-backdrop"
              style={{ background: "rgba(10,10,10,0.96)" }}
              onMouseEnter={() => openMega("catalogue")}
              onMouseLeave={closeMega}
            >
              <div className="max-w-screen-xl mx-auto px-10 py-10 grid grid-cols-4 gap-8">
                <div className="col-span-1">
                  <p className="text-label text-[#c4a55f] mb-4">Product Range</p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Premium aluminium, uPVC and glazing systems from Europe&apos;s leading manufacturers.
                  </p>
                  <Link
                    href="/catalogue"
                    className="mt-6 inline-flex items-center gap-2 text-[0.7rem] tracking-widest uppercase text-white/60 hover:text-white transition-colors"
                    onClick={() => setMegaMenu(null)}
                  >
                    View all products
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  {catalogueItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white hover:bg-white/5 px-3 py-2 transition-all"
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

        {/* Mega menu — Technical */}
        <AnimatePresence>
          {megaMenu === "technical" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 border-t border-white/10 mega-backdrop"
              style={{ background: "rgba(10,10,10,0.96)" }}
              onMouseEnter={() => openMega("technical")}
              onMouseLeave={closeMega}
            >
              <div className="max-w-screen-xl mx-auto px-10 py-10 grid grid-cols-4 gap-8">
                <div className="col-span-1">
                  <p className="text-label text-[#c4a55f] mb-4">Technical</p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Resources, guides and expertise to support your project from first enquiry to aftercare.
                  </p>
                </div>
                <div className="col-span-1 flex flex-col gap-2">
                  {technicalItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white hover:bg-white/5 px-3 py-2 transition-all"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <span className="text-white font-bold text-lg tracking-widest uppercase">
                  Swift<span className="text-[#c4a55f]">rooms</span>
                </span>
              </Link>
              <button className="text-white p-2" onClick={() => setMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Catalogue", href: "/catalogue" },
                { label: "Brands", href: "/catalogue/brands" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Process", href: "/technical/process" },
                { label: "Blog", href: "/technical/blog" },
                { label: "FAQ", href: "/technical/faq" },
                { label: "Resources", href: "/technical/resources" },
                { label: "Contact", href: "/contact" },
                { label: "Showroom", href: "/showroom" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xl text-white/70 hover:text-white py-3 border-b border-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-6 py-6">
              <Link
                href="/enquire"
                className="block w-full text-center bg-[#c4a55f] text-black py-4 text-[0.7rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
