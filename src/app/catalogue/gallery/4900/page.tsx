import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "4900 Showroom Gallery",
  description:
    "The Swiftrooms 4900 showroom in Jebel Ali — the UAE's only space where you can experience the Cor Vision, Cor Vision Plus and TP52 curtain wall range at full scale, in working condition.",
};

const images = [
  { src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80", alt: "4900 Showroom — main entrance", caption: "4900 Showroom · Jebel Ali" },
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — Cor Vision Plus in situ", caption: "Cor Vision Plus · Live Demo Bay" },
  { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — curtain wall section", caption: "TP52 Curtain Wall · Full Height" },
  { src: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — interior layout", caption: "Showroom Floor · Overview" },
  { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — consultation space", caption: "Consultation Suite" },
  { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — hardware samples", caption: "Hardware & Finish Library" },
  { src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — glass sample wall", caption: "Glass Specification Wall" },
  { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — team meeting area", caption: "Project Review Area" },
  { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — lighting showcase", caption: "Daylighting Simulation Bay" },
  { src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — Cor Vision 4700 demo", caption: "Cor Vision 4700 · Open Demo" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — signage exterior", caption: "Exterior Signage · Jebel Ali" },
  { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — powder coat finishes", caption: "RAL Powder Coat Library" },
  { src: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — architect visit", caption: "Architect Briefing · Live Session" },
  { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — client visit", caption: "Client Walkthrough · 2024" },
  { src: "https://images.unsplash.com/photo-1519455953755-af066f52f1a6?auto=format&fit=crop&w=800&q=80", alt: "4900 Showroom — reception", caption: "Main Reception" },
];

const heights = [340, 260, 400, 280, 360, 240, 300, 380, 260, 320, 280, 360, 240, 300, 380];

export default function ShowroomGalleryPage() {
  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8 flex-wrap">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <Link href="/catalogue/gallery" className="hover:text-[#007969] transition-colors">Gallery</Link>
              <span>/</span>
              <span className="text-[#6b7280]">4900</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Showroom</p>
            <h1 className="text-headline text-[#1c1c1e] mb-6">
              4900 Gallery
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              The UAE&apos;s only space where you can experience the Cor Vision, Cor Vision Plus and TP52
              curtain wall range at full scale, in full working condition. Visit us at Jebel Ali
              to touch, open, and close every system before you specify.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="flex gap-4 mt-8 flex-wrap">
              <Link href="/showroom" className="btn-brand">
                Book a Showroom Visit
              </Link>
              <Link href="/enquire" className="btn-outline">
                Enquire
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Showroom details strip */}
      <section className="py-8 md:py-12 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Location", value: "Jebel Ali, Dubai" },
                { label: "Open", value: "Sun–Thu, 8:30–17:30" },
                { label: "Systems on display", value: "Cor Vision, Cor Vision Plus, TP52" },
                { label: "Booking", value: "Recommended — walk-ins welcome" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[0.65rem] tracking-widests uppercase text-[#007969] mb-1">{item.label}</p>
                  <p className="text-[#3a3a3c] text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Hero */}
      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="w-full h-[55vh] md:h-[70vh] relative overflow-hidden">
              <Image
                src={images[0].src}
                alt={images[0].alt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute bottom-4 left-5 md:bottom-6 md:left-8">
                <span className="text-[0.6rem] tracking-widests uppercase text-white/80 bg-black/30 px-3 py-1.5">
                  {images[0].caption}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Masonry */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {images.slice(1).map((img, i) => (
              <ScrollReveal key={img.src} delay={(i % 5) * 0.05}>
                <div
                  className="break-inside-avoid group relative overflow-hidden"
                  style={{ height: `${heights[i + 1]}px` }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[0.6rem] tracking-widests uppercase text-white/90">{img.caption}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-label text-white/70 mb-4">Experience it in person</p>
              <h2 className="text-title text-white mb-4">Visit the 4900 Showroom</h2>
              <p className="text-white/70 leading-relaxed">
                Specifications are one thing. Seeing and operating a 4-metre Cor Vision Plus panel at
                full scale is another. Book a visit and bring your architect — we&apos;ll walk you through
                every system, every hardware option, and every glass specification available.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/showroom"
                className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widests uppercase font-semibold hover:bg-gray-50 transition-colors"
              >
                Book a Visit
              </Link>
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widests uppercase hover:bg-white/10 transition-all"
              >
                Send an Enquiry
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-8">Other galleries</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {[
              { slug: "cor-vision-plus", name: "Cor Vision Plus Gallery", img: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80" },
              { slug: "cor-vision", name: "Cor Vision Gallery", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80" },
            ].map((g) => (
              <ScrollReveal key={g.slug}>
                <Link href={`/catalogue/gallery/${g.slug}`} className="group block bg-white overflow-hidden">
                  <div className="h-44 relative overflow-hidden">
                    <Image src={g.img} alt={g.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors">{g.name}</h3>
                    <span className="mt-2 block text-[0.65rem] tracking-widests uppercase text-[#007969]">View Gallery →</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
