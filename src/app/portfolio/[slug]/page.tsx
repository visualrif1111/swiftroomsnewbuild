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
      <section className="pt-40 pb-16 md:pt-52 md:pb-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widests uppercase text-gray-400 mb-8">
              <Link href="/portfolio" className="hover:text-[#007969] transition-colors">Portfolio</Link>
              <span>/</span>
              <span className="text-[#6b7280]">{project.name}</span>
            </nav>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <ScrollReveal>
                <span className="text-label text-[#007969] mb-4 block">{project.type}</span>
                <h1 className="text-headline text-[#1c1c1e] mb-4">{project.name}</h1>
                <p className="text-[#6b7280] text-lg">{project.location}</p>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Location", value: project.location.split(",")[0] },
                  { label: "Area", value: project.area },
                  { label: "Year", value: project.year },
                ].map((detail) => (
                  <div key={detail.label} className="border-t-2 border-[#007969] pt-4">
                    <p className="text-[0.6rem] tracking-widests uppercase text-gray-400 mb-1">{detail.label}</p>
                    <p className="text-[#1c1c1e] font-semibold">{detail.value}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Main image */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 mb-20">
        <ScrollReveal>
          <div className="w-full h-[50vh] md:h-[65vh] flex items-center justify-center relative overflow-hidden bg-[#f0fdf4]">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg viewBox="0 0 400 300" className="w-full max-w-2xl" fill="none">
                <rect x="50" y="50" width="300" height="200" stroke="#007969" strokeWidth="1" />
                <line x1="50" y1="50" x2="350" y2="250" stroke="#007969" strokeWidth="0.5" />
                <line x1="350" y1="50" x2="50" y2="250" stroke="#007969" strokeWidth="0.5" />
                <circle cx="200" cy="150" r="60" stroke="#007969" strokeWidth="1" />
              </svg>
            </div>
            <p className="text-[#007969]/40 text-label tracking-widests">{project.name}</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Description */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6">Project Overview</p>
              <p className="text-[#3a3a3c] text-lg leading-relaxed mb-8">{project.description}</p>
            </ScrollReveal>

            <div className="divider-brand mb-8" />

            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6">Products Installed</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.products.map((product) => (
                  <div
                    key={product}
                    className="flex items-center gap-3 border border-gray-100 p-4 bg-[#f8f9fa]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#007969]" />
                    <span className="text-[#3a3a3c] text-sm">{product}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div>
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
                      <p className="text-[0.6rem] tracking-widests uppercase text-gray-400 mb-1">{d.label}</p>
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
                    className="block w-full text-center border border-gray-200 text-[#3a3a3c] py-3 text-[0.7rem] tracking-widests uppercase hover:border-[#007969] hover:text-[#007969] transition-all"
                  >
                    ← Back to Portfolio
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Tags */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 mb-16">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] border border-gray-100 px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="py-20 border-t border-gray-100 bg-[#f8f9fa]">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-10">Related Projects</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <ScrollReveal key={rel.id} delay={i * 0.1}>
                  <Link
                    href={`/portfolio/${rel.slug}`}
                    className="group block border border-gray-100 hover:border-[#007969]/30 transition-all overflow-hidden bg-white"
                  >
                    <div className="h-36 w-full bg-[#f0fdf4]" />
                    <div className="p-5">
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
