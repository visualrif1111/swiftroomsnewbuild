import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { portfolioProjects } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const related = portfolioProjects.filter(
    (p) => p.id !== project.id && p.tags.some((t) => project.tags.includes(t))
  ).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-44 md:pb-16 lg:pt-52 lg:pb-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8">
              <Link href="/portfolio" className="hover:text-[#007969] transition-colors">Portfolio</Link>
              <span>/</span>
              <span className="text-[#6b7280] truncate max-w-[160px]">{project.name}</span>
            </nav>
          </ScrollReveal>

          {/* Mobile: stacked; Desktop: 2-col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end">
            <div>
              <ScrollReveal>
                <span className="text-label text-[#007969] mb-3 md:mb-4 block">{project.type}</span>
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4">{project.name}</h1>
                <p className="text-[#6b7280] text-base md:text-lg">{project.location}</p>
              </ScrollReveal>
            </div>

            {/* Stats — horizontal scroll on mobile */}
            <ScrollReveal delay={0.15}>
              <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:pb-0">
                {[
                  { label: "Location", value: project.location.split(",")[0] },
                  { label: "Area", value: project.area },
                  { label: "Year", value: project.year },
                ].map((detail) => (
                  <div key={detail.label} className="border-t-2 border-[#007969] pt-3 md:pt-4 flex-shrink-0 min-w-[100px] lg:min-w-0">
                    <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-1">{detail.label}</p>
                    <p className="text-[#1c1c1e] font-semibold text-sm md:text-base">{detail.value}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Main image */}
      <section className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mb-12 md:mb-20">
        <ScrollReveal>
          <div className="w-full h-[40vh] md:h-[50vh] lg:h-[65vh] flex items-center justify-center relative overflow-hidden bg-[#f0fdf4]">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg viewBox="0 0 400 300" className="w-full max-w-2xl" fill="none">
                <rect x="50" y="50" width="300" height="200" stroke="#007969" strokeWidth="1" />
                <line x1="50" y1="50" x2="350" y2="250" stroke="#007969" strokeWidth="0.5" />
                <line x1="350" y1="50" x2="50" y2="250" stroke="#007969" strokeWidth="0.5" />
                <circle cx="200" cy="150" r="60" stroke="#007969" strokeWidth="1" />
              </svg>
            </div>
            <p className="text-[#007969]/40 text-label tracking-widest">{project.name}</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Description — mobile: stacked CTA; desktop: sidebar */}
      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          {/* Mobile inline CTA */}
          <div className="lg:hidden mb-8 flex gap-3">
            <Link href="/enquire" className="flex-1 btn-brand justify-center text-xs">
              Start a Similar Project
            </Link>
            <Link
              href="/portfolio"
              className="flex-1 text-center border border-gray-200 text-[#3a3a3c] py-3 text-[0.65rem] tracking-widest uppercase hover:border-[#007969] hover:text-[#007969] transition-all"
            >
              ← Portfolio
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-4 md:mb-6">Project Overview</p>
                <p className="text-[#3a3a3c] text-base md:text-lg leading-relaxed mb-6 md:mb-8">{project.description}</p>
              </ScrollReveal>

              <div className="divider-brand mb-6 md:mb-8" />

              <ScrollReveal>
                <p className="text-label text-[#007969] mb-4 md:mb-6">Products Installed</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {project.products.map((product) => (
                    <div
                      key={product}
                      className="flex items-center gap-3 border border-gray-100 p-3 md:p-4 bg-[#f8f9fa]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007969] flex-shrink-0" />
                      <span className="text-[#3a3a3c] text-sm">{product}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <ScrollReveal delay={0.1}>
                <div className="sticky top-28">
                  <p className="text-label text-[#007969] mb-6">Project Details</p>
                  <div className="space-y-4">
                    {[
                      { label: "Project Type", value: project.type },
                      { label: "Location", value: project.location },
                      { label: "Area", value: project.area },
                      { label: "Year", value: project.year },
                    ].map((d) => (
                      <div key={d.label} className="border-b border-gray-100 pb-4">
                        <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-1">{d.label}</p>
                        <p className="text-[#3a3a3c] text-sm">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <Link href="/enquire" className="btn-brand w-full justify-center">
                      Start a Similar Project
                    </Link>
                    <Link
                      href="/portfolio"
                      className="block w-full text-center border border-gray-200 text-[#3a3a3c] py-3 text-[0.7rem] tracking-widest uppercase hover:border-[#007969] hover:text-[#007969] transition-all"
                    >
                      ← Back to Portfolio
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Tags */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mb-12 md:mb-16">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.65rem] tracking-widest uppercase text-[#6b7280] border border-gray-100 px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="py-12 md:py-20 border-t border-gray-100 bg-[#f8f9fa]">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6 md:mb-10">Related Projects</p>
            </ScrollReveal>
            {/* Mobile: horizontal scroll; Desktop: grid */}
            <div className="swipe-scroll md:grid md:grid-cols-3 md:gap-6">
              {related.map((rel, i) => (
                <ScrollReveal key={rel.id} delay={i * 0.1} className="w-[75vw] sm:w-[45vw] md:w-auto">
                  <Link
                    href={`/portfolio/${rel.slug}`}
                    className="group block border border-gray-100 hover:border-[#007969]/30 transition-all overflow-hidden bg-white active:scale-[0.98]"
                  >
                    <div className="h-32 md:h-36 w-full bg-[#f0fdf4]" />
                    <div className="p-4 md:p-5">
                      <p className="text-[#1c1c1e] font-semibold text-sm group-hover:text-[#007969] transition-colors mb-1">
                        {rel.name}
                      </p>
                      <p className="text-gray-400 text-xs">{rel.location}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
