import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free quotation for aluminium windows, doors and glazing systems from Swiftrooms UAE.",
};

export default function EnquirePage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Free Quotation</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Get a quote
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Complete the form below and a member of our team will contact you within one business
              day to discuss your project requirements and arrange a free site survey.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Form */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <form className="space-y-8">
                {/* Personal info */}
                <div>
                  <p className="text-label text-[#c4a55f] mb-6">Contact Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[0.65rem] tracking-widest uppercase text-white/40 block mb-2">First Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widest uppercase text-white/40 block mb-2">Last Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widest uppercase text-white/40 block mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Project info */}
                <div>
                  <p className="text-label text-[#c4a55f] mb-6">Project Details</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-2">Project Type</label>
                      <select className="w-full bg-[#111] border border-white/10 text-white/70 px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors">
                        <option value="">Select project type</option>
                        <option>New Build — Villa</option>
                        <option>New Build — Apartment</option>
                        <option>Renovation / Replacement</option>
                        <option>Commercial Development</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Emirates Hills, Dubai"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-3">Products of Interest</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {productCategories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="accent-[#c4a55f]"
                            />
                            <span className="text-white/40 text-xs group-hover:text-white/60 transition-colors">
                              {cat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-2">Budget Range</label>
                      <select className="w-full bg-[#111] border border-white/10 text-white/70 px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors">
                        <option value="">Prefer not to say</option>
                        <option>Under AED 50,000</option>
                        <option>AED 50,000 – 150,000</option>
                        <option>AED 150,000 – 500,000</option>
                        <option>Over AED 500,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-white/40 block mb-2">Additional Notes</label>
                      <textarea
                        rows={4}
                        placeholder="Any additional details about your project, timeline or specific requirements..."
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors resize-none placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c4a55f] text-black py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
                >
                  Submit Enquiry
                </button>
                <p className="text-white/20 text-xs text-center">
                  We respond within 1 business day. No spam, no pushy sales.
                </p>
              </form>
            </ScrollReveal>
          </div>

          {/* Side info */}
          <div>
            <ScrollReveal delay={0.15}>
              <div className="sticky top-28 space-y-8">
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">What happens next?</p>
                  <div className="space-y-4">
                    {[
                      { step: "01", text: "We review your enquiry and contact you within 1 business day" },
                      { step: "02", text: "We arrange a free technical survey at your property" },
                      { step: "03", text: "You receive a detailed written quotation with full specifications" },
                      { step: "04", text: "No obligation to proceed — but we think you will" },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <span className="text-[#c4a55f] text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</span>
                        <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <p className="text-label text-[#c4a55f] mb-4">Prefer to call?</p>
                  <a href="tel:+971000000000" className="text-white text-lg hover:text-[#c4a55f] transition-colors">
                    +971 (0) 00 000 0000
                  </a>
                  <p className="text-white/30 text-xs mt-1">Sun–Thu 9:00–18:00, Sat 10:00–15:00</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
