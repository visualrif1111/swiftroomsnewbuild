import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
    title: `${project.name} — ${project.type} UAE Glazing Project`,
    description: project.description,
    alternates: { canonical: `https://swiftrooms-newbuild.vercel.app/portfolio/${project.slug}` },
    openGraph: {
      title: `${project.name} | Swiftrooms Portfolio`,
      description: project.description,
      url: `https://swiftrooms-newbuild.vercel.app/portfolio/${project.slug}`,
      images: project.image ? [{ url: project.image, alt: project.name }] : [],
    },
  };
}

const productLinks: Record<string, string> = {
  "Cor Vision 4600": "/catalogue/aluminium-sliding-doors/cor-vision-4600",
  "Cor Vision 4700": "/catalogue/aluminium-sliding-doors/cor-vision-4700",
  "Cor Vision Plus": "/catalogue/aluminium-sliding-doors/cor-vision-plus",
  "Cortizo Bi-fold": "/catalogue/aluminium-bi-folding-doors/cortizo-bifold",
  "Cortizo Casement": "/catalogue/aluminium-windows/cortizo-casement",
  "Cortizo Cor 70 Hidden Sash": "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash",
  "Gulf Extrusions TB600 Window": "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn",
  "Aluminium Sliding Windows": "/catalogue/aluminium-windows/aluminium-sliding-windows",
  "Cortizo Cor 70 Door": "/catalogue/aluminium-doors/cortizo-cor-70-door",
  "Gulf Extrusions TB600 Door": "/catalogue/aluminium-doors/gulf-extrusion-tb600-door",
  "Vetromax Pivot Door": "/catalogue/aluminium-doors/vetromax-pivot-door",
  "uPVC Casement": "/catalogue/upvc/upvc-casement",
  "Cortizo TP52": "/catalogue/curtain-wall/cortizo-tp52",
  "Cortizo TP52 Curtain Wall": "/catalogue/curtain-wall/cortizo-tp52",
  "Gulf Extrusions CW 50mm": "/catalogue/curtain-wall/gulf-extrusion-cw-50",
  "Vetromax VF35 Facade": "/catalogue/curtain-wall/vetromax-vf35",
  "Premium Garden Room": "/catalogue/garden-rooms/premium-garden-room",
  "Glass Conservatory": "/catalogue/garden-rooms/glass-conservatory",
  "Retractable Fly Screen": "/catalogue/insect-screens/retractable-fly-screen",
  "Fixed Rooflight": "/catalogue/skylights/fixed-rooflight",
  "Motorised Skylight": "/catalogue/skylights/motorised-skylight",
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const related = portfolioProjects
    .filter((p) => p.id !== project.id && p.tags.some((t) => project.tags.includes(t)))
    .slice(0, 3);

  const caseStudySections = [
    { label: "Brief", content: project.brief },
    { label: "Challenge", content: project.challenge },
    { label: "Solution", content: project.solution },
    { label: "Outcome", content: project.outcome },
  ].filter((s): s is { label: string; content: string } => Boolean(s.content));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://swiftrooms-newbuild.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Portfolio", item: "https://swiftrooms-newbuild.vercel.app/portfolio" },
      { "@type": "ListItem", position: 3, name: project.name, item: `https://swiftrooms-newbuild.vercel.app/portfolio/${project.slug}` },
    ],
  };

  const caseStudySchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    url: `https://swiftrooms-newbuild.vercel.app/portfolio/${project.slug}`,
    image: project.image ?? undefined,
    creator: { "@type": "Organization", name: "Swiftrooms", url: "https://swiftrooms-newbuild.vercel.app" },
    locationCreated: { "@type": "Place", name: project.location },
    dateCreated: project.year,
    about: project.products.map((p) => ({ "@type": "Product", name: p })),
    keywords: project.tags.join(", "),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end">
            <div>
              <ScrollReveal>
                <span className="text-label text-[#007969] mb-3 md:mb-4 block">{project.type}</span>
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4">{project.name}</h1>
                <p className="text-[#6b7280] text-base md:text-lg">{project.location}</p>
              </ScrollReveal>
            </div>

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
          <div className="w-full h-[40vh] md:h-[50vh] lg:h-[65vh] relative overflow-hidden bg-[#f0fdf4]">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#007969]/40 text-label tracking-widest">{project.name}</p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* Case study content */}
      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          {/* Mobile CTA */}
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
              {/* Project description */}
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-4 md:mb-6">Project Overview</p>
                <p className="text-[#3a3a3c] text-base md:text-lg leading-relaxed mb-10 md:mb-14">
                  {project.description}
                </p>
              </ScrollReveal>

              {/* Case study sections */}
              {caseStudySections.length > 0 && (
                <div className="space-y-0">
                  {caseStudySections.map((section, i) => (
                    <ScrollReveal key={section.label} delay={i * 0.08}>
                      <div className="border-t border-gray-100 py-8 md:py-10 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                        <div>
                          <span className="text-label text-[#007969]">{section.label}</span>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-[#6b7280] leading-relaxed">{section.content}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              <div className="divider-brand my-10 md:my-14" />

              {/* Products installed */}
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-4 md:mb-6">Products Installed</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {project.products.map((product) => {
                    const href = productLinks[product];
                    const inner = (
                      <div className="flex items-center gap-3 border border-gray-100 p-3 md:p-4 bg-[#f8f9fa] group-hover:border-[#007969] transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#007969] flex-shrink-0" />
                        <span className="text-[#3a3a3c] text-sm flex-1">{product}</span>
                        {href && (
                          <span className="text-[0.55rem] tracking-widest uppercase text-[#007969] opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                          </span>
                        )}
                      </div>
                    );
                    return href ? (
                      <Link key={product} href={href} className="group block">
                        {inner}
                      </Link>
                    ) : (
                      <div key={product}>{inner}</div>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <ScrollReveal delay={0.1}>
                <div className="sticky top-28">
                  <p className="text-label text-[#007969] mb-6">Project Details</p>
                  <div className="space-y-4 mb-8">
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

                  <div className="space-y-3">
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

                  {/* Tags */}
                  <div className="mt-8">
                    <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] border border-gray-100 px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile tags */}
      <div className="lg:hidden max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mb-12">
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
            <div className="swipe-scroll md:grid md:grid-cols-3 md:gap-6">
              {related.map((rel, i) => (
                <ScrollReveal key={rel.id} delay={i * 0.1} className="w-[75vw] sm:w-[45vw] md:w-auto">
                  <Link
                    href={`/portfolio/${rel.slug}`}
                    className="group block border border-gray-100 hover:border-[#007969]/30 transition-all overflow-hidden bg-white active:scale-[0.98]"
                  >
                    <div className="h-32 md:h-36 w-full relative overflow-hidden bg-[#f0fdf4]">
                      {rel.image && (
                        <Image
                          src={rel.image}
                          alt={rel.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 75vw, 33vw"
                        />
                      )}
                    </div>
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

      {/* Bottom CTA */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Start your project</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Ready to transform your space?
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              Every Swiftrooms project begins with a conversation. Contact our team to discuss your
              requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/enquire" className="btn-brand">Get A Quote</Link>
              <Link href="/showroom" className="btn-outline">Visit Showroom</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
