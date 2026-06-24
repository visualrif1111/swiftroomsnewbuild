"use client";

import { useState } from "react";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { stats, type TeamMember, type TimelineEntry, type Testimonial } from "@/lib/data";
import type { Certification } from "@/lib/about";

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

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function AboutClient({
  teamMembers,
  timeline,
  testimonials,
  certifications,
}: {
  teamMembers: TeamMember[];
  timeline: TimelineEntry[];
  testimonials: Testimonial[];
  certifications: Certification[];
}) {
  const [activeYear, setActiveYear] = useState(0);
  const teamGroups = [...new Set(teamMembers.map((m) => m.group))];

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
              Vetromax, Vetro and Gulf Extrusions — four of the world&apos;s leading aluminium and glazing
              systems manufacturers.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Company Story */}
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

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <div className="bg-[#f8f9fa] border border-gray-100 p-6 sm:p-8">
                  <div className="text-3xl md:text-4xl font-bold text-[#007969] mb-2">{s.value}</div>
                  <div className="text-label text-[#6b7280]">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-14 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Our History</p>
            <h2 className="text-title text-[#1c1c1e] mb-12 max-w-xl">
              Fifteen years building the UAE&apos;s finest glazing company.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Year selector */}
            <ScrollReveal>
              <div className="flex flex-col gap-0">
                {timeline.map((entry, i) => (
                  <button
                    key={entry.year}
                    onClick={() => setActiveYear(i)}
                    className={`text-left flex items-start gap-5 py-4 border-b border-gray-200 group transition-all ${
                      activeYear === i ? "border-[#007969]" : ""
                    }`}
                  >
                    <span
                      className={`text-lg font-bold transition-colors flex-shrink-0 ${
                        activeYear === i ? "text-[#007969]" : "text-gray-300 group-hover:text-[#007969]/60"
                      }`}
                    >
                      {entry.year}
                    </span>
                    <span
                      className={`font-medium transition-colors ${
                        activeYear === i ? "text-[#1c1c1e]" : "text-[#6b7280] group-hover:text-[#3a3a3c]"
                      }`}
                    >
                      {entry.title}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Detail panel */}
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeYear}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <ScrollReveal>
                    <div className="bg-white border border-gray-100 p-8 md:p-10">
                      <p className="text-5xl font-bold text-[#007969] mb-2">
                        {timeline[activeYear].year}
                      </p>
                      <h3 className="text-xl font-semibold text-[#1c1c1e] mb-4">
                        {timeline[activeYear].title}
                      </h3>
                      <p className="text-[#6b7280] leading-relaxed">
                        {timeline[activeYear].description}
                      </p>
                    </div>
                  </ScrollReveal>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">The Team</p>
            <h2 className="text-title text-[#1c1c1e] mb-14 max-w-xl">
              The people behind every project.
            </h2>
          </ScrollReveal>

          {teamGroups.map((group) => (
            <div key={group} className="mb-14 last:mb-0">
              <ScrollReveal>
                <h3 className="text-center text-base md:text-lg font-semibold text-[#1c1c1e] mb-8">
                  {group}
                </h3>
              </ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 md:gap-10">
                {teamMembers
                  .filter((m) => m.group === group)
                  .map((member, i) => (
                    <ScrollReveal key={member.name} delay={(i % 4) * 0.06}>
                      <div className="flex flex-col items-center text-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#f0fdf4] border-2 border-[#007969]/30">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[#007969]/50">
                              {initials(member.name)}
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-[#1c1c1e] mt-4 text-sm">
                          {member.name}
                        </p>
                        <p className="text-label text-[#6b7280] mt-1">{member.role}</p>
                      </div>
                    </ScrollReveal>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
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

      {/* Certifications */}
      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Accreditations</p>
            <h2 className="text-title text-[#1c1c1e] mb-12 max-w-xl">
              Certified. Authorised. Trusted.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.name} delay={i * 0.08}>
                <div className="bg-white p-6 md:p-8 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#007969] flex-shrink-0 mt-2" />
                  <div>
                    <p className="font-semibold text-[#1c1c1e] mb-1">{cert.name}</p>
                    <p className="text-[#6b7280] text-sm">{cert.detail}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Client Voices */}
      <section className="py-14 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">Client Voices</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
              What clients say about working with us.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {testimonials.slice(0, 4).map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="bg-white p-6 md:p-8 lg:p-10 flex flex-col h-full">
                  <svg className="w-6 h-6 text-[#007969]/25 mb-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-[#3a3a3c] leading-relaxed italic flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-[#1c1c1e] text-sm">{t.author}</p>
                    <p className="text-[#6b7280] text-xs mt-0.5">{t.location}</p>
                    <span className="inline-block mt-2 text-[0.55rem] tracking-widest uppercase text-[#007969] border border-[#007969]/20 px-2 py-0.5">
                      {t.product}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-28 lg:py-40 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-white/70 mb-6">Experience it in person</p>
            <h2 className="text-title text-white mb-6 max-w-2xl mx-auto">
              Visit our Jebel Ali showroom
            </h2>
            <p className="text-white/70 max-w-lg mx-auto mb-10 leading-relaxed">
              See our full product range at full scale, meet our specification team and discuss your
              project in person.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShowroomButton className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors">
                Book a Showroom Visit
              </ShowroomButton>
              <QuoteButton className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:bg-white/10 transition-all">
                Get A Quote
              </QuoteButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
