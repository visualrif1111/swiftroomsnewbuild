import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Swiftrooms — Dubai Showroom & Glazing Enquiries",
  description:
    "Contact Swiftrooms UAE — call, email or visit our Jebel Ali showroom to discuss your windows and doors project.",
  alternates: { canonical: "https://swiftrooms-newbuild.vercel.app/contact" },
  openGraph: {
    title: "Contact Swiftrooms | UAE",
    description:
      "Contact Swiftrooms in Dubai — call, email or visit our Jebel Ali showroom. Sunday–Thursday 8:30–17:30, Saturday 10:00–14:00.",
    url: "https://swiftrooms-newbuild.vercel.app/contact",
  },
};

export default function ContactPage() {
  const base = "https://swiftrooms-newbuild.vercel.app";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${base}/contact` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Get in Touch</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Contact Swiftrooms.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Call, email or visit our Jebel Ali showroom. Our team responds to all enquiries within
              one business day — typically within a few hours during office hours.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact details */}
          <ScrollReveal>
            <div>
              <div className="space-y-10">
                <div>
                  <p className="text-label text-[#007969] mb-4">Showroom & Office</p>
                  <p className="text-[#6b7280] leading-relaxed">
                    Jebel Ali Industrial Area 1<br />
                    Dubai, UAE
                  </p>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">Telephone</p>
                  <a href="tel:+971000000000" className="text-[#3a3a3c] hover:text-[#007969] transition-colors text-lg">
                    +971 (0) 00 000 0000
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">Email</p>
                  <a href="mailto:info@swiftrooms.ae" className="text-[#3a3a3c] hover:text-[#007969] transition-colors">
                    info@swiftrooms.ae
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">Business Hours</p>
                  <div className="space-y-1.5 text-[#6b7280]">
                    <div className="flex justify-between max-w-xs">
                      <span>Sunday – Thursday</span>
                      <span>8:30 – 17:30</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Saturday</span>
                      <span>10:00 – 14:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Friday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact form */}
          <ScrollReveal delay={0.15}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-12 md:py-16 border-t border-gray-100 bg-[#f8f9fa]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Or explore first</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200">
              {[
                {
                  href: "/enquire",
                  label: "Get a Free Quote",
                  description: "Submit your project details and we'll provide a written quotation.",
                },
                {
                  href: "/showroom",
                  label: "Book a Showroom Visit",
                  description: "See our full product range at full scale, in working condition.",
                },
                {
                  href: "/portfolio",
                  label: "Browse Portfolio",
                  description: "Completed projects across the UAE — villas, apartments, commercial.",
                },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors p-6 md:p-8"
                >
                  <p className="font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-2">
                    {link.label}
                  </p>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{link.description}</p>
                  <span className="mt-4 block text-[0.65rem] tracking-widest uppercase text-[#007969]">
                    Go →
                  </span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
