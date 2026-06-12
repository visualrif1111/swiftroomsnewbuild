import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Swiftrooms UAE — call, email or visit our Jebel Ali showroom to discuss your windows and doors project.",
  openGraph: {
    title: "Contact Swiftrooms | UAE",
    description:
      "Contact Swiftrooms in Dubai — call, email or visit our Jebel Ali showroom. Sunday–Thursday 9:00–18:00, Saturday 10:00–15:00.",
    url: "https://swiftrooms-newbuild.vercel.app/contact",
  },
};

export default function ContactPage() {
  return (
    <>
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
                      <span>9:00 – 18:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Saturday</span>
                      <span>10:00 – 15:00</span>
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
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label text-[#6b7280] block mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-label text-[#6b7280] block mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="text-label text-[#6b7280] block mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-label text-[#6b7280] block mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                  placeholder="+971 50 000 0000"
                />
              </div>
              <div>
                <label className="text-label text-[#6b7280] block mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button type="submit" className="btn-brand w-full justify-center">
                Send Message
              </button>
              <p className="text-gray-400 text-xs text-center">
                We typically respond within 1 business day.
              </p>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
