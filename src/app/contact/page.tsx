import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Swiftrooms UAE — call, email or visit our Jebel Ali showroom to discuss your windows and doors project.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Get in Touch</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Contact
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                Swiftrooms.
              </span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact details */}
          <ScrollReveal>
            <div>
              <div className="space-y-10">
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Showroom & Office</p>
                  <p className="text-white/60 leading-relaxed">
                    Jebel Ali Industrial Area 1<br />
                    Dubai, UAE
                  </p>
                </div>
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Telephone</p>
                  <a href="tel:+971000000000" className="text-white/60 hover:text-white transition-colors text-lg">
                    +971 (0) 00 000 0000
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Email</p>
                  <a href="mailto:info@swiftrooms.ae" className="text-white/60 hover:text-white transition-colors">
                    info@swiftrooms.ae
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Business Hours</p>
                  <div className="space-y-1.5 text-white/50">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label text-white/40 block mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-label text-white/40 block mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="text-label text-white/40 block mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-label text-white/40 block mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                  placeholder="+971 50 000 0000"
                />
              </div>
              <div>
                <label className="text-label text-white/40 block mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#c4a55f] text-black py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
              >
                Send Message
              </button>
              <p className="text-white/20 text-xs text-center">
                We typically respond within 1 business day.
              </p>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
