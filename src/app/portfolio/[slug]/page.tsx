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
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-white/30 mb-8">
              <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
              <span>/</span>
              <span className="text-white/60">{project.name}</span>
            </nav>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <ScrollReveal>
                <span className="text-label text-[#c4a55f] mb-4 block">{project.type}</span>
                <h1 className="text-headline text-white mb-4">{project.name}</h1>
                <p className="text-white/40 text-lg">{project.location}</p>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Location", value: project.location.split(",")[0] },
                  { label: "Area", value: project.area },
                  { label: "Year", value: project.year },
                ].map((detail) => (
                  <div key={detail.label} className="border-t border-white/10 pt-4">
                    <p className="text-[0.6rem] tracking-widest uppercase text-white/30 mb-1">{detail.label}</p>
                    <p className="text-white font-semibold">{detail.value}</p>
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
          <div
            className="w-full h-[50vh] md:h-[65vh] flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, hsl(0, 0%, 10%) 0%, hsl(0, 0%, 6%) 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg viewBox="0 0 400 300" className="w-full max-w-2xl" fill="none">
                <rect x="50" y="50" width="300" height="200" stroke="white" strokeWidth="1" />
                <line x1="50" y1="50" x2="350" y2="250" stroke="white" strokeWidth="0.5" />
                <line x1="350" y1="50" x2="50" y2="250" stroke="white" strokeWidth="0.5" />
                <circle cx="200" cy="150" r="60" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            <p className="text-white/20 text-label tracking-widest">{project.name}</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Description */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ScrollReveal>
              <p className="text-label text-[#c4a55f] mb-6">Project Overview</p>
              <p className="text-white/60 text-lg leading-relaxed mb-8">{project.description}</p>
            </ScrollReveal>

            <div className="rule-gold mb-8" />

            <ScrollReveal>
              <p className="text-label text-[#c4a55f] mb-6">Products Installed</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.products.map((product) => (
                  <div
                    key={product}
                    className="flex items-center gap-3 border border-white/10 p-4"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c4a55f]" />
                    <span className="text-white/60 text-sm">{product}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div>
            <ScrollReveal delay={0.1}>
              <div className="sticky top-28">
                <p className="text-label text-[#c4a55f] mb-6">Project Details</p>
                <div className="space-y-4">
                  {[
                    { label: "Project Type", value: project.type },
                    { label: "Location", value: project.location },
                    { label: "Area", value: project.area },
                    { label: "Year", value: project.year },
                  ].map((d) => (
                    <div key={d.label} className="border-b border-white/10 pb-4">
                      <p className="text-[0.6rem] tracking-widest uppercase text-white/30 mb-1">{d.label}</p>
                      <p className="text-white/60 text-sm">{d.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                    href="/enquire"
                    className="block w-full text-center bg-[#c4a55f] text-black py-3 text-[0.7rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
                  >
                    Start a Similar Project
                  </Link>
                  <Link
                    href="/portfolio"
                    className="block w-full text-center border border-white/20 text-white py-3 text-[0.7rem] tracking-widest uppercase hover:bg-white/5 transition-all"
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
              className="text-[0.65rem] tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="py-20 border-t border-white/10 bg-[#0d0d0d]">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <ScrollReveal>
              <p className="text-label text-[#c4a55f] mb-10">Related Projects</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <ScrollReveal key={rel.id} delay={i * 0.1}>
                  <Link
                    href={`/portfolio/${rel.slug}`}
                    className="group block border border-white/10 hover:border-white/30 transition-all overflow-hidden"
                  >
                    <div
                      className="h-36 w-full"
                      style={{
                        background: `linear-gradient(135deg, hsl(${i * 40}, 8%, 13%) 0%, hsl(${i * 40 + 20}, 6%, 9%) 100%)`,
                      }}
                    />
                    <div className="p-5">
                      <p className="text-white font-semibold text-sm group-hover:text-[#c4a55f] transition-colors mb-1">
                        {rel.name}
                      </p>
                      <p className="text-white/30 text-xs">{rel.location}</p>
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
