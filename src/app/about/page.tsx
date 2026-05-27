import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Swiftrooms — 15+ years supplying and installing premium aluminium windows, doors and glazing systems across the UAE.",
};

const values = [
  {
    number: "01",
    title: "Uncompromising Quality",
    description:
      "We supply only certified systems from manufacturers with proven track records in Europe and the UAE. Every product we specify is one we stand behind unconditionally.",
  },
  {
    number: "02",
    title: "Technical Excellence",
    description:
      "Our specification and installation teams are trained by the product manufacturers themselves. No shortcuts, no approximations — only correct, engineered installations.",
  },
  {
    number: "03",
    title: "Project Partnership",
    description:
      "We work with homeowners, architects, contractors and developers from initial design stage through to handover and aftercare. Your project success is our measure.",
  },
  {
    number: "04",
    title: "UAE Expertise",
    description:
      "Fifteen years operating in the UAE means we understand the regulatory landscape, the climate demands, and the expectations of discerning UAE clients.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-44 md:pb-24 lg:pt-52 lg:pb-32">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">About Swiftrooms</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-4xl">
              The UAE&apos;s trusted authority in premium glazing.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Swiftrooms has been supplying and installing premium aluminium windows, doors and curtain
              wall systems across the UAE since 2009. We are authorised partners for Cortizo,
              Vetromax and Deceuninck — three of the world&apos;s leading aluminium and glazing
              systems manufacturers.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Story */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24">
          <ScrollReveal>
            <div>
              <p className="text-label text-[#007969] mb-6">Our Story</p>
              <div className="space-y-5 text-[#6b7280] leading-relaxed">
                <p>
                  Swiftrooms was founded with a single purpose: to bring European-grade aluminium
                  window and door systems to the UAE market, installed to European standards.
                </p>
                <p>
                  In a market where quality can vary dramatically, we built our reputation on the
                  premise that the products we supply and the way we install them should be
                  indistinguishable from the finest work in London, Madrid or Munich.
                </p>
                <p>
                  Over fifteen years we have completed more than 500 projects across Dubai, Abu
                  Dhabi, Sharjah and beyond — from intimate villa renovations to large commercial
                  curtain wall installations. Every one has been completed by our own trained teams,
                  using products we specify with confidence.
                </p>
                <p>
                  Today Swiftrooms is one of the UAE&apos;s most trusted glazing specialists, with
                  a showroom in Jebel Ali where clients can experience our full product range at
                  full scale before committing to their project.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                  alt="Luxury UAE villa with premium glazing"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="bg-[#f8f9fa] border border-gray-100 p-6 sm:p-8">
                <div className="text-4xl font-bold text-[#007969] mb-2">500+</div>
                <div className="text-label text-[#6b7280]">Projects completed</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-[#f8f9fa] border border-gray-100 p-6 sm:p-8">
                <div className="text-4xl font-bold text-[#007969] mb-2">15+</div>
                <div className="text-label text-[#6b7280]">Years in the UAE</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="bg-[#f8f9fa] border border-gray-100 p-6 sm:p-8">
                <div className="text-4xl font-bold text-[#007969] mb-2">7</div>
                <div className="text-label text-[#6b7280]">Emirates served</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">What We Stand For</p>
            <h2 className="text-title text-[#1c1c1e] mb-14 max-w-xl">
              Our values shape every project.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
            {values.map((v, i) => (
              <ScrollReveal key={v.number} delay={i * 0.1}>
                <div className="bg-white p-5 md:p-8 lg:p-10">
                  <span className="text-label text-[#007969] mb-4 block">{v.number}</span>
                  <h3 className="text-[#1c1c1e] text-xl font-semibold mb-3">{v.title}</h3>
                  <p className="text-[#6b7280] leading-relaxed">{v.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom CTA */}
      <section className="py-14 md:py-28 lg:py-40">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-6">Experience it in person</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-2xl mx-auto">
              Visit our Jebel Ali showroom
            </h2>
            <p className="text-[#6b7280] max-w-lg mx-auto mb-10 leading-relaxed">
              See our full product range at full scale, meet our specification team and discuss your
              project in person.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/showroom" className="btn-brand">
                Book a Showroom Visit
              </Link>
              <Link href="/enquire" className="btn-outline">
                Get a Quote
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
