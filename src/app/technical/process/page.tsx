import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { processSteps } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How Swiftrooms works — from initial consultation and survey through manufacture, installation and aftercare.",
};

export default function ProcessPage() {
  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Our process, from first call to completion.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Every Swiftrooms project follows the same disciplined process — ensuring consistent
              quality, clear communication and a result that meets or exceeds your expectations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="space-y-0">
            {processSteps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.08}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-b border-gray-100">
                  <div className="flex items-start gap-6">
                    <span className="text-label text-[#007969] text-2xl font-bold mt-1">{step.number}</span>
                  </div>
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold text-[#1c1c1e] mb-4">{step.title}</h2>
                    <p className="text-[#6b7280] leading-relaxed max-w-lg">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-white/70 mb-4">Ready to start?</p>
            <h2 className="text-title text-white mb-6">Begin with a consultation</h2>
            <p className="text-white/70 mb-10 max-w-md mx-auto">
              Step one is a simple conversation. Contact us today to arrange your free initial consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widests uppercase font-semibold hover:bg-gray-50 transition-colors"
              >
                Enquire Now
              </Link>
              <Link
                href="/showroom"
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widests uppercase hover:bg-white/10 transition-all"
              >
                Visit Showroom
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
