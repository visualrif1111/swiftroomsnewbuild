import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Current promotions and seasonal offers from Swiftrooms UAE.",
};

const promotions = [
  {
    id: "summer-2025",
    badge: "Limited Time",
    title: "Summer 2025 Installation Offer",
    description:
      "Free technical survey and complimentary hardware upgrade on any full villa window and door package booked before 31 August 2025.",
    value: "Worth AED 2,500",
    cta: "Enquire Now",
    href: "/enquire",
  },
  {
    id: "bifold-promo",
    badge: "Product Promotion",
    title: "Cortizo Bi-fold Door Introductory Rate",
    description:
      "Special introductory pricing on Cortizo bi-fold door systems. Full manufacture and installation to European standard. Available on select configurations.",
    value: "Contact for pricing",
    cta: "Get a Quote",
    href: "/enquire",
  },
  {
    id: "showroom-visit",
    badge: "Showroom Offer",
    title: "Free Showroom Consultation",
    description:
      "Book a showroom visit and receive a free written specification and budgetary estimate for your project — whether you are ready to proceed or just exploring options.",
    value: "No obligation",
    cta: "Book Showroom",
    href: "/showroom",
  },
];

export default function PromotionsPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widests uppercase text-gray-400 mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#6b7280]">Promotions</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#007969] mb-4">Special Offers</p>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Current promotions
            </h1>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, i) => (
              <ScrollReveal key={promo.id} delay={i * 0.1}>
                <div className="border border-gray-100 hover:border-[#007969]/40 transition-all duration-300 p-8 flex flex-col h-full bg-white">
                  <span className="text-[0.6rem] tracking-widests uppercase text-[#007969] border border-[#007969]/30 px-2 py-1 self-start mb-6">
                    {promo.badge}
                  </span>
                  <h2 className="text-[#1c1c1e] text-xl font-semibold mb-4">{promo.title}</h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-6 flex-1">
                    {promo.description}
                  </p>
                  <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                    <span className="text-[0.65rem] tracking-widests uppercase text-[#007969]">
                      {promo.value}
                    </span>
                    <Link
                      href={promo.href}
                      className="text-[0.7rem] tracking-widests uppercase text-[#6b7280] hover:text-[#007969] transition-colors flex items-center gap-1"
                    >
                      {promo.cta}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-20 p-8 md:p-12 bg-[#007969]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-label text--white/80 text-white/70 mb-4">Trade & Developer Pricing</p>
                  <h2 className="text-title text-white mb-4">
                    Working on a larger project?
                  </h2>
                  <p className="text-white/70 leading-relaxed">
                    We offer competitive trade pricing for developers, contractors and interior designers
                    with ongoing project requirements. Contact us to discuss trade account terms.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/enquire"
                    className="inline-flex items-center justify-center gap-3 bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widests uppercase font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Discuss Trade Pricing
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
