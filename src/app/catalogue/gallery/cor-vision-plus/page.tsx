import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Cor Vision Plus Gallery",
  description:
    "Photography from completed Cor Vision Plus lift-and-slide installations across UAE villas — flush thresholds, frameless aesthetics and barrier-free indoor-outdoor living.",
  alternates: { canonical: `${SITE_URL}/catalogue/gallery/cor-vision-plus` },
  openGraph: {
    title: "Cor Vision Plus Gallery | Swiftrooms",
    description:
      "12 photographs from completed Cor Vision Plus installations across UAE villas. Flush thresholds, frameless aesthetics and barrier-free indoor-outdoor living.",
    url: `${SITE_URL}/catalogue/gallery/cor-vision-plus`,
    images: [{ url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80", alt: "Cor Vision Plus Gallery" }],
  },
};

const images = [
  { src: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80", alt: "Cor Vision Plus — Al Barari Villa", caption: "Al Barari Villa · Dubai" },
  { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — pool terrace", caption: "Emirates Hills · Pool Terrace" },
  { src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — garden elevation", caption: "Damac Hills · Garden Elevation" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — living room", caption: "Centro The Villas · Living Room" },
  { src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — Palm Jumeirah", caption: "Palm Jumeirah · Sea-View Terrace" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — close detail", caption: "Flush Threshold Detail" },
  { src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — open elevation", caption: "Arabian Ranches · Full Open Position" },
  { src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — interior view", caption: "The Springs · Interior View" },
  { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — exterior night", caption: "Emirates Hills · Evening Elevation" },
  { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — detail handle", caption: "Handle & Threshold Detail" },
  { src: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — terrace villa", caption: "JVT Townhouse · Ground Floor" },
  { src: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80", alt: "Cor Vision Plus — garden room", caption: "Glass Room Abu Dhabi" },
];

const heights = [320, 240, 400, 280, 360, 220, 300, 380, 260, 340, 280, 320];

export default function CorVisionPlusGalleryPage() {
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${base}/catalogue` },
      { "@type": "ListItem", position: 3, name: "Gallery", item: `${base}/catalogue/gallery` },
      { "@type": "ListItem", position: 4, name: "Cor Vision Plus Gallery", item: `${base}/catalogue/gallery/cor-vision-plus` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8 flex-wrap">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <Link href="/catalogue/gallery" className="hover:text-[#007969] transition-colors">Gallery</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Cor Vision Plus</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Gallery</p>
            <h1 className="text-headline text-[#1c1c1e] mb-6">
              Cor Vision Plus Gallery
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Photography from completed Cor Vision Plus installations across UAE villas — flush
              thresholds, frameless aesthetics and the barrier-free indoor-outdoor living this system
              was engineered to deliver.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="flex gap-4 mt-8">
              <Link href="/catalogue/aluminium-sliding-doors/cor-vision-plus" className="btn-brand">
                View Product Details
              </Link>
              <QuoteButton className="btn-outline">
                Enquire
              </QuoteButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Hero image — full bleed */}
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
                <span className="text-[0.6rem] tracking-widest uppercase text-white/80 bg-black/30 px-3 py-1.5">
                  {images[0].caption}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {images.slice(1).map((img, i) => (
              <ScrollReveal key={img.src} delay={(i % 5) * 0.06}>
                <div className="break-inside-avoid group relative overflow-hidden" style={{ height: `${heights[i + 1]}px` }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[0.6rem] tracking-widest uppercase text-white/90">{img.caption}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product CTA */}
      <section className="py-16 md:py-24 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-label text-white/70 mb-4">About this system</p>
              <h2 className="text-title text-white mb-4">Cor Vision Plus</h2>
              <p className="text-white/70 leading-relaxed">
                The Cor Vision Plus brings frameless aesthetics to lift-and-slide technology — with
                recessed floor tracks and flush thresholds for barrier-free, visually seamless
                indoor-outdoor living. Available through Swiftrooms as authorised Cortizo partners.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/catalogue/aluminium-sliding-doors/cor-vision-plus"
                className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors"
              >
                View Product Specifications
              </Link>
              <QuoteButton className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:bg-white/10 transition-all">
                Enquire Now
              </QuoteButton>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Other galleries */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-8">Other galleries</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {[
              { slug: "cor-vision", name: "Cor Vision Gallery", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80" },
              { slug: "4900", name: "4900 Gallery", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80" },
            ].map((g) => (
              <ScrollReveal key={g.slug}>
                <Link href={`/catalogue/gallery/${g.slug}`} className="group block bg-white overflow-hidden">
                  <div className="h-44 relative overflow-hidden">
                    <Image src={g.img} alt={g.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors">{g.name}</h3>
                    <span className="mt-2 block text-[0.65rem] tracking-widest uppercase text-[#007969]">View Gallery →</span>
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
