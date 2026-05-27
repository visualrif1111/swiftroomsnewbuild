import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Technical Resources",
  description:
    "Technical documentation, product data sheets and specification guides for Swiftrooms products.",
};

const resources = [
  {
    category: "Product Data Sheets",
    items: [
      { name: "Cortizo Cor Vision 4600 — Technical Data Sheet", type: "PDF" },
      { name: "Cortizo Cor Vision 4700 — Technical Data Sheet", type: "PDF" },
      { name: "Cortizo Cor 70 Window — Technical Data Sheet", type: "PDF" },
      { name: "Gulf Extrusion TB600 — Technical Data Sheet", type: "PDF" },
      { name: "Vetromax VF35 Facade — Technical Data Sheet", type: "PDF" },
    ],
  },
  {
    category: "Installation Guides",
    items: [
      { name: "Lift-and-Slide Door Installation Manual", type: "PDF" },
      { name: "Curtain Wall Stick System Installation Guide", type: "PDF" },
      { name: "Bi-fold Door Installation and Adjustment Guide", type: "PDF" },
      { name: "Rooflight Installation Guide", type: "PDF" },
    ],
  },
  {
    category: "Performance Certifications",
    items: [
      { name: "Cortizo CE Certification Portfolio", type: "PDF" },
      { name: "Gulf Extrusion UAE Type Approval Certificates", type: "PDF" },
      { name: "Thermal Performance Test Reports — Cor Vision Range", type: "PDF" },
    ],
  },
  {
    category: "Maintenance & Care",
    items: [
      { name: "Aluminium Window & Door Maintenance Guide", type: "PDF" },
      { name: "Seal & Gasket Inspection Checklist", type: "PDF" },
      { name: "Powder Coat & Anodised Finish Care Guide", type: "PDF" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Technical resources.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Data sheets, installation guides, performance certifications and maintenance documentation.
              Contact us to request specific documents.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 space-y-16">
          {resources.map((section, si) => (
            <ScrollReveal key={section.category} delay={si * 0.1}>
              <div>
                <p className="text-label text-[#007969] mb-6">{section.category}</p>
                <div className="space-y-0">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-4 border-b border-gray-100 group hover:bg-[#f8f9fa] px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border border-gray-200 flex items-center justify-center flex-shrink-0 bg-white">
                          <svg className="w-3.5 h-3.5 text-[#007969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-[#3a3a3c] text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[0.6rem] tracking-widests uppercase text-gray-400 border border-gray-200 px-2 py-1">
                          {item.type}
                        </span>
                        <button className="text-[0.65rem] tracking-widests uppercase text-gray-400 hover:text-[#007969] transition-colors">
                          Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-10 mt-16">
          <ScrollReveal>
            <div className="p-8 border border-[#007969]/20 bg-[#f0fdf4]">
              <p className="text-label text-[#007969] mb-3">Can&apos;t find what you need?</p>
              <p className="text-[#6b7280] mb-4">
                Contact our technical team for specific documentation, BIM objects, CAD files or
                custom specification data.
              </p>
              <a
                href="mailto:info@swiftrooms.ae"
                className="inline-flex items-center gap-2 text-[0.7rem] tracking-widests uppercase text-[#007969] hover:text-[#005a50] transition-colors"
              >
                info@swiftrooms.ae →
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
