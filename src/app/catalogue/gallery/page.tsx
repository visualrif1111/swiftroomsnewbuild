import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widests uppercase text-gray-400 mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Gallery</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Inspiration</p>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Gallery
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Photography from completed Swiftrooms installations across Dubai, Abu Dhabi and the wider UAE.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
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
                    className="w-full relative overflow-hidden bg-[#f0fdf4]"
                    style={{ height: `${280 + (i % 3) * 80}px` }}
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

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#007969]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-[0.6rem] tracking-widests uppercase text-white/80 mb-1">
                        {project.type}
                      </p>
                      <p className="text-white font-semibold">{project.name}</p>
                      <p className="text-white/70 text-xs">{project.location}</p>
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
