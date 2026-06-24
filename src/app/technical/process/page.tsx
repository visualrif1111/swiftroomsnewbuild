import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getProcessSteps } from "@/lib/about";

export const metadata: Metadata = {
  title: "Our Installation Process — From Survey to Handover UAE",
  description:
    "How Swiftrooms works — from initial consultation and survey through manufacture, installation and aftercare. Six steps, zero surprises.",
  alternates: { canonical: `${SITE_URL}/technical/process` },
  openGraph: {
    title: "Our Process | Swiftrooms",
    description:
      "Six clear steps from first enquiry to aftercare. Understand exactly what Swiftrooms does at each stage before you commit to anything.",
    url: `${SITE_URL}/technical/process`,
  },
};

const stepDetails: Record<string, { duration: string; youDo: string; weDo: string; image: string }> = {
  "01": {
    duration: "Same day",
    youDo: "Submit your enquiry online, call us, or walk into the showroom.",
    weDo: "Review your project, respond within 24 hours with initial guidance and next steps.",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
  },
  "02": {
    duration: "Within 7 days",
    youDo: "Be available for a site visit or showroom appointment. Share your architectural drawings if available.",
    weDo: "Visit your site, take measurements, understand your vision and brief. No obligation — just expertise.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  },
  "03": {
    duration: "3–5 working days",
    youDo: "Review technical drawings, approve the specification and sign off on the contract.",
    weDo: "Produce technical drawings, product specifications and material samples. Issue formal contract and schedule manufacture.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80",
  },
  "04": {
    duration: "4–8 weeks lead time",
    youDo: "Ensure site access for the installation team. Prepare openings if structural work is underway.",
    weDo: "Manage full manufacture with certified partners. Deliver and install every system with minimal disruption to your schedule.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
  },
  "05": {
    duration: "Day of completion",
    youDo: "Walk through every installation with our project manager. Raise any snags immediately.",
    weDo: "Sign off every system against a full quality checklist. We don't leave until every door opens and closes perfectly.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  "06": {
    duration: "Ongoing",
    youDo: "Contact us any time for maintenance, advice or warranty queries.",
    weDo: "Provide annual maintenance guidance, warranty documentation and priority support for every Swiftrooms client.",
    image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80",
  },
};

export default async function ProcessPage() {
  const processSteps = await getProcessSteps();
  const base = SITE_URL;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How Swiftrooms Works: From Enquiry to Installation",
    description:
      "Six clear steps from first enquiry to aftercare — the Swiftrooms process for supplying and installing premium aluminium windows, doors and glazing systems in the UAE.",
    totalTime: "P8W",
    step: processSteps.map((step, i) => {
      const detail = stepDetails[step.number] ?? {};
      return {
        "@type": "HowToStep",
        position: i + 1,
        name: step.title,
        text: step.description,
        image: detail.image,
      };
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: `${base}/technical` },
      { "@type": "ListItem", position: 3, name: "Our Process", item: `${base}/technical/process` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-8">
              <Link href="/technical" className="hover:text-[#007969] transition-colors">Technical</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Our Process</span>
            </nav>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <div>
              <ScrollReveal delay={0.1}>
                <p className="text-label text-[#007969] mb-4">How we work</p>
                <h1 className="text-headline text-[#1c1c1e] mb-8">
                  Six steps, zero surprises.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-body-lg text-[#6b7280] max-w-xl">
                  Every Swiftrooms project follows the same disciplined process — ensuring consistent
                  quality, clear communication and a result that meets or exceeds your expectations.
                  From first enquiry to final walkthrough, you&apos;ll know exactly what happens and when.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="flex gap-4 mt-10 flex-wrap">
                  <QuoteButton className="btn-brand">Get a Quote</QuoteButton>
                  <ShowroomButton className="btn-outline">Visit Showroom</ShowroomButton>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15} direction="right">
              <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
                  alt="Swiftrooms process"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#007969]/20 to-transparent" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Process steps */}
      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="relative">
            {/* Vertical line — desktop only */}
            <div className="hidden lg:block absolute left-[2.25rem] top-8 bottom-8 w-px bg-gray-100" aria-hidden="true" />

            <div className="space-y-0">
              {processSteps.map((step, i) => {
                const detail = stepDetails[step.number];
                return (
                  <ScrollReveal key={step.number} delay={i * 0.06}>
                    <div className="grid grid-cols-1 lg:grid-cols-[5rem_1fr] gap-0">
                      {/* Step number column */}
                      <div className="flex lg:flex-col items-center gap-4 lg:gap-0 mb-4 lg:mb-0">
                        <div className="relative z-10 w-[4.5rem] h-[4.5rem] flex-shrink-0 flex items-center justify-center border border-gray-200 bg-white">
                          <span className="text-[#007969] text-sm font-bold tracking-widest">{step.number}</span>
                        </div>
                        {i < processSteps.length - 1 && (
                          <div className="lg:hidden flex-1 h-px bg-gray-100" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-12 md:pb-16 lg:pl-10 border-b border-gray-100 last:border-b-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                          <div className="md:col-span-2">
                            <div className="flex items-start gap-3 mb-3">
                              <h2 className="text-xl md:text-2xl font-semibold text-[#1c1c1e]">{step.title}</h2>
                              {detail && (
                                <span className="flex-shrink-0 mt-1 text-[0.6rem] tracking-widest uppercase text-white bg-[#007969] px-2 py-1">
                                  {detail.duration}
                                </span>
                              )}
                            </div>
                            <p className="text-[#6b7280] leading-relaxed mb-6 max-w-lg">{step.description}</p>

                            {detail && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[#f8f9fa] p-4">
                                  <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-2">You do</p>
                                  <p className="text-[#6b7280] text-sm leading-relaxed">{detail.youDo}</p>
                                </div>
                                <div className="bg-[#f0fdf4] p-4">
                                  <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-2">We do</p>
                                  <p className="text-[#6b7280] text-sm leading-relaxed">{detail.weDo}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {detail && (
                            <div className="relative h-40 md:h-full min-h-[140px] overflow-hidden">
                              <Image
                                src={detail.image}
                                alt={step.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10 md:py-14 bg-[#f8f9fa] border-t border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "500+", label: "Projects completed" },
                { value: "15+", label: "Years in UAE" },
                { value: "24h", label: "Response guarantee" },
                { value: "100%", label: "Quality sign-off" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-[#007969] mb-2">{s.value}</p>
                  <p className="text-[0.65rem] tracking-widest uppercase text-[#6b7280]">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ callout */}
      <section className="py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-label text-[#007969] mb-3">Questions about the process?</p>
                <p className="text-[#6b7280] leading-relaxed">
                  Our FAQ covers common questions about timelines, materials, installation access requirements
                  and what to expect at each stage.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/technical/faq" className="btn-brand">Read the FAQ</Link>
                <Link href="/contact" className="btn-outline">Speak to the Team</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-label text-white/70 mb-4">Ready to start?</p>
              <h2 className="text-title text-white mb-4">Begin with step one.</h2>
              <p className="text-white/70 leading-relaxed">
                The first step is a simple enquiry. Fill out the form, call us, or walk into the
                showroom in Jebel Ali. No commitment, no pressure — just an expert conversation
                about your project.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <QuoteButton className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors">
                Request a Quote
              </QuoteButton>
              <ShowroomButton className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:bg-white/10 transition-all">
                Book Showroom Visit
              </ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
