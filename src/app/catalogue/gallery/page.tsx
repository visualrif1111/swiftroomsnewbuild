import { SITE_URL } from "@/lib/site";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";
import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getPortfolioProjects } from "@/lib/portfolio";

const baseMetadata: Metadata = {
  title: "Product Gallery — Cor Vision, Bi-Fold & Curtain Wall UAE",
  description:
    "Product photography and installation photography from Swiftrooms projects across the UAE. Cor Vision lift-and-slide, bi-folding doors, curtain wall and more at full scale.",
  alternates: { canonical: `${SITE_URL}/catalogue/gallery` },
  openGraph: {
    title: "Gallery | Swiftrooms",
    description:
      "Product photography and installation photography from Swiftrooms glazing projects across the UAE. Three dedicated product galleries.",
    url: `${SITE_URL}/catalogue/gallery`,
  },
};

export const generateMetadata = () => pageMetadata("/catalogue/gallery", baseMetadata);

const galleries = [
  {
    slug: "cor-vision-plus",
    name: "Cor Vision Plus Gallery",
    tagline: "Flush thresholds. Frameless aesthetics.",
    description:
      "Photography from completed Cor Vision Plus lift-and-slide installations across UAE villas — demonstrating the flush threshold, recessed track and barrier-free indoor-outdoor connection this system is designed to deliver.",
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
    count: 12,
  },
  {
    slug: "cor-vision",
    name: "Cor Vision Gallery",
    tagline: "Minimal sightlines. Maximum glass.",
    description:
      "The Cor Vision 4600 and 4700 lift-and-slide range installed across Emirates Hills, Palm Jumeirah, Arabian Ranches and beyond — showcasing what premium sliding door technology looks like in a real UAE villa environment.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    count: 18,
  },
  {
    slug: "4900",
    name: "4900 Gallery",
    tagline: "Full scale. Working systems.",
    description:
      "Photography from the Swiftrooms 4900 showroom gallery — the UAE's only space where clients can experience the Cor Vision, Cor Vision Plus and TP52 curtain wall range at full scale, in working condition.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    count: 9,
  },
];

export default async function GalleryPage() {
  const [portfolioProjects, ps] = await Promise.all([
    getPortfolioProjects(),
    getPageSettings("/catalogue/gallery"),
  ]);
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${base}/catalogue` },
      { "@type": "ListItem", position: 3, name: "Gallery", item: `${base}/catalogue/gallery` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Gallery</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">{ps?.hero?.eyebrow ?? "Inspiration"}</p>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              {ps?.hero?.heading ?? "Gallery"}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              {ps?.hero?.subheading ??
                "Photography from completed Swiftrooms installations and our Jebel Ali showroom. Three dedicated galleries — each focused on a specific system."}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Named gallery cards */}
      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {galleries.map((g, i) => (
              <ScrollReveal key={g.slug} delay={i * 0.1}>
                <Link
                  href={`/catalogue/gallery/${g.slug}`}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors overflow-hidden"
                >
                  <div className="h-52 md:h-64 relative overflow-hidden">
                    <Image
                      src={g.image}
                      alt={g.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 right-4">
                      <span className="text-[0.55rem] tracking-widest uppercase text-white/80">
                        {g.count} images
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <h2 className="font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors">
                      {g.name}
                    </h2>
                    <p className="text-[#007969] text-sm italic mb-3">{g.tagline}</p>
                    <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">{g.description}</p>
                    <span className="mt-5 block text-[0.65rem] tracking-widest uppercase text-[#007969]">
                      View Gallery →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* All installations masonry */}
      <section className="py-12 md:py-20 border-t border-gray-100 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">All Installations</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
              From our project archive.
            </h2>
          </ScrollReveal>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {[...portfolioProjects, ...portfolioProjects.slice(0, 6)].map((project, i) => (
              <ScrollReveal key={`${project.id}-${i}`} delay={(i % 6) * 0.05}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block break-inside-avoid"
                >
                  <div
                    className="w-full relative overflow-hidden bg-[#f0fdf4]"
                    style={{ height: `${260 + (i % 3) * 80}px` }}
                  >
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-[#007969]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5">
                      <p className="text-[0.6rem] tracking-widest uppercase text-white/80 mb-1">
                        {project.type}
                      </p>
                      <p className="text-white font-semibold text-sm">{project.name}</p>
                      <p className="text-white/70 text-xs">{project.location}</p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">See products at full scale</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Visit our Jebel Ali showroom
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShowroomButton className="btn-brand">Book a Visit</ShowroomButton>
              <QuoteButton className="btn-outline">Get A Quote</QuoteButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
