import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { portfolioProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Product photography and installation photography from Swiftrooms projects across the UAE.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-white/30 mb-8">
              <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-white/60">Gallery</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#c4a55f] mb-4">Inspiration</p>
            <h1 className="text-headline text-white mb-8">
              Gallery
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Photography from completed Swiftrooms installations across Dubai, Abu Dhabi and the wider UAE.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          {/* Masonry-style grid using CSS columns */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {[...portfolioProjects, ...portfolioProjects.slice(0, 7)].map((project, i) => (
              <ScrollReveal key={`${project.id}-${i}`} delay={(i % 6) * 0.06}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block break-inside-avoid"
                >
                  <div
                    className="w-full relative overflow-hidden"
                    style={{
                      height: `${280 + (i % 3) * 80}px`,
                      background: `linear-gradient(${135 + i * 20}deg, hsl(${i * 25}, 10%, 12%) 0%, hsl(${i * 25 + 40}, 6%, 8%) 100%)`,
                    }}
                  >
                    {/* Decorative geometric element */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <div
                        className="border border-white/20"
                        style={{
                          width: `${60 + (i % 4) * 20}px`,
                          height: `${60 + (i % 4) * 20}px`,
                          transform: `rotate(${i * 15}deg)`,
                        }}
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-[0.6rem] tracking-widest uppercase text-[#c4a55f] mb-1">
                        {project.type}
                      </p>
                      <p className="text-white font-semibold">{project.name}</p>
                      <p className="text-white/50 text-xs">{project.location}</p>
                    </div>
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
