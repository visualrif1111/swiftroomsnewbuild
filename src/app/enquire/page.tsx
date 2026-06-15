import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import EnquireForm from "./EnquireForm";
import { testimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Get a Free Quote — Windows, Doors & Glazing UAE",
  description:
    "Request a free quotation for aluminium windows, doors and glazing systems from Swiftrooms UAE.",
  alternates: { canonical: "https://swiftrooms-newbuild.vercel.app/enquire" },
  openGraph: {
    title: "Get a Free Quote | Swiftrooms",
    description:
      "Request a free quotation for premium aluminium windows, doors and glazing systems. We respond within 1 business day and offer a free technical site survey.",
    url: "https://swiftrooms-newbuild.vercel.app/enquire",
  },
};

export default function EnquirePage() {
  const base = "https://swiftrooms-newbuild.vercel.app";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Get a Quote", item: `${base}/enquire` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Free Quotation</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Get a quote
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Complete the form below and a member of our team will contact you within one business
              day to discuss your project requirements and arrange a free site survey.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <EnquireForm />

          {/* Side info */}
          <div>
            <ScrollReveal delay={0.15}>
              <div className="lg:sticky lg:top-28 space-y-8">
                {/* Trust stats */}
                <div className="grid grid-cols-3 gap-4 border border-gray-100 p-5">
                  {[
                    { value: "500+", label: "Projects" },
                    { value: "15+", label: "Years UAE" },
                    { value: "24h", label: "Response" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-bold text-[#007969] mb-0.5">{s.value}</p>
                      <p className="text-[0.6rem] tracking-widest uppercase text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-label text-[#007969] mb-4">What happens next?</p>
                  <div className="space-y-4">
                    {[
                      { step: "01", text: "We review your enquiry and contact you within 1 business day" },
                      { step: "02", text: "We arrange a free technical survey at your property" },
                      { step: "03", text: "You receive a detailed written quotation with full specifications" },
                      { step: "04", text: "No obligation to proceed — but we think you will" },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <span className="text-[#007969] text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</span>
                        <p className="text-[#6b7280] text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured testimonial */}
                <div className="border-t border-gray-100 pt-8">
                  <p className="text-label text-[#007969] mb-4">What clients say</p>
                  <div className="bg-[#f8f9fa] p-5">
                    <svg className="w-5 h-5 text-[#007969]/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-[#3a3a3c] text-sm leading-relaxed italic mb-4">
                      &ldquo;{testimonials[0].quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1c1c1e] text-xs font-semibold">{testimonials[0].author}</p>
                        <p className="text-gray-400 text-[0.65rem]">{testimonials[0].location}</p>
                      </div>
                      <span className="text-[0.55rem] tracking-widest uppercase text-[#007969] border border-[#007969]/20 px-2 py-1">
                        {testimonials[0].product}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <p className="text-label text-[#007969] mb-4">Prefer to call?</p>
                  <a href="tel:+971000000000" className="text-[#1c1c1e] text-lg hover:text-[#007969] transition-colors">
                    +971 (0) 00 000 0000
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Sun–Thu 8:30–17:30, Sat 10:00–14:00</p>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <p className="text-label text-[#007969] mb-4">Or visit us</p>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    Jebel Ali Industrial Area 1, Dubai
                  </p>
                  <Link href="/showroom" className="mt-3 inline-block text-[0.65rem] tracking-widest uppercase text-[#007969]">
                    Showroom details →
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
