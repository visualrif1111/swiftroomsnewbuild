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
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-white/30 mb-8">
              <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-white/60">Promotions</span>
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-label text-[#c4a55f] mb-4">Special Offers</p>
            <h1 className="text-headline text-white mb-8">
              Current
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                promotions.
              </span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, i) => (
              <ScrollReveal key={promo.id} delay={i * 0.1}>
                <div className="border border-white/10 hover:border-[#c4a55f]/40 transition-all duration-300 p-8 flex flex-col h-full">
                  <span className="text-[0.6rem] tracking-widest uppercase text-[#c4a55f] border border-[#c4a55f]/30 px-2 py-1 self-start mb-6">
                    {promo.badge}
                  </span>
                  <h2 className="text-white text-xl font-semibold mb-4">{promo.title}</h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">
                    {promo.description}
                  </p>
                  <div className="border-t border-white/10 pt-6 flex items-center justify-between">
                    <span className="text-[0.65rem] tracking-widest uppercase text-[#c4a55f]">
                      {promo.value}
                    </span>
                    <Link
                      href={promo.href}
                      className="text-[0.7rem] tracking-widest uppercase text-white/60 hover:text-white transition-colors flex items-center gap-1"
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
            <div className="mt-20 p-8 md:p-12 border border-[#c4a55f]/20 bg-[#c4a55f]/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Trade & Developer Pricing</p>
                  <h2 className="text-title text-white mb-4">
                    Working on a larger project?
                  </h2>
                  <p className="text-white/40 leading-relaxed">
                    We offer competitive trade pricing for developers, contractors and interior designers
                    with ongoing project requirements. Contact us to discuss trade account terms.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/enquire"
                    className="inline-flex items-center justify-center gap-3 bg-[#c4a55f] text-black px-8 py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
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
