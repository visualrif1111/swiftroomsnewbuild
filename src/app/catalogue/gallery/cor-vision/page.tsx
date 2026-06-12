import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Cor Vision Gallery",
  description:
    "Photography from completed Cor Vision 4600 and 4700 lift-and-slide installations across UAE villas — minimal sightlines, maximum glass area.",
  openGraph: {
    title: "Cor Vision Gallery | Swiftrooms",
    description:
      "18 photographs from completed Cor Vision 4600 and 4700 lift-and-slide installations across UAE villas. Minimal sightlines, maximum glass.",
    url: "https://swiftrooms-newbuild.vercel.app/catalogue/gallery/cor-vision",
    images: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80", alt: "Cor Vision Gallery" }],
  },
};

const images = [
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80", alt: "Cor Vision 4700 — Emirates Hills", caption: "Emirates Hills · Cor Vision 4700" },
  { src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision 4700 — pool elevation", caption: "Damac Hills · Pool Elevation" },
  { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision 4700 — luxury villa", caption: "Emirates Hills · Full Elevation" },
  { src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision 4600 — villa terrace", caption: "Arabian Ranches · Cor Vision 4600" },
  { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — garden elevation", caption: "Al Barari · Garden Elevation" },
  { src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — sightline detail", caption: "24mm Sightline Detail" },
  { src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — Palm Jumeirah", caption: "Palm Jumeirah · Sea Facing" },
  { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision 4600 — JVT townhouse", caption: "JVT Townhouse · Ground Floor" },
  { src: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — handle close", caption: "Hardware & Handle Detail" },
  { src: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — open position", caption: "Victory Heights · Open Position" },
  { src: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — roller detail", caption: "Precision Roller Mechanism" },
  { src: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — night view", caption: "Cor Vision 4700 · Night Elevation" },
  { src: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — interior elevation", caption: "Interior Side Profile" },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — Damac Hills open", caption: "Phoenix Damac Hills · Open" },
  { src: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — corner detail", caption: "Corner Junction Detail" },
  { src: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — external view", caption: "The Springs · External View" },
  { src: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — glazing detail", caption: "Triple Glazing Option" },
  { src: "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision — wide span", caption: "Centro The Villas · Wide Span" },
];

const heights = [300, 380, 260, 340, 220, 300, 360, 280, 400, 240, 320, 280, 360, 240, 300, 380, 260, 340];

export default function CorVisionGalleryPage() {
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
              <span className="text-[#6b7280]">Cor Vision</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Gallery</p>
            <h1 className="text-headline text-[#1c1c1e] mb-6">
              Cor Vision Gallery
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Photography from completed Cor Vision 4600 and 4700 installations across UAE villas.
              Minimal sightlines. Maximum glass area. The lift-and-slide system that defines the
              Swiftrooms product range.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="flex gap-4 mt-8 flex-wrap">
              <Link href="/catalogue/aluminium-sliding-doors/cor-vision-4700" className="btn-brand">
                Cor Vision 4700 Details
              </Link>
              <Link href="/catalogue/aluminium-sliding-doors/cor-vision-4600" className="btn-outline">
                Cor Vision 4600 Details
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

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
              <p className="text-label text-white/70 mb-4">The Cor Vision range</p>
              <h2 className="text-title text-white mb-4">4600 &amp; 4700</h2>
              <p className="text-white/70 leading-relaxed">
                The Cor Vision range is Cortizo&apos;s flagship lift-and-slide system — available in two
                configurations for different panel sizes and structural requirements. Both are available
                through Swiftrooms as authorised Cortizo partners across the UAE.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/catalogue/aluminium-sliding-doors"
                className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widests uppercase font-semibold hover:bg-gray-50 transition-colors"
              >
                View Sliding Door Range
              </Link>
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widests uppercase hover:bg-white/10 transition-all"
              >
                Enquire Now
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
              { slug: "4900", name: "4900 Gallery", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80" },
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
