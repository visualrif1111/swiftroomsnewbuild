import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { productCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free quotation for aluminium windows, doors and glazing systems from Swiftrooms UAE.",
  openGraph: {
    title: "Get a Free Quote | Swiftrooms",
    description:
      "Request a free quotation for premium aluminium windows, doors and glazing systems. We respond within 1 business day and offer a free technical site survey.",
    url: "https://swiftrooms-newbuild.vercel.app/enquire",
  },
};

export default function EnquirePage() {
  return (
    <>
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
          {/* Form */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <form className="space-y-8">
                {/* Personal info */}
                <div>
                  <p className="text-label text-[#007969] mb-6">Contact Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">First Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Last Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Project info */}
                <div>
                  <p className="text-label text-[#007969] mb-6">Project Details</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Project Type</label>
                      <select className="w-full bg-white border border-gray-200 text-[#3a3a3c] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors">
                        <option value="">Select project type</option>
                        <option>New Build — Villa</option>
                        <option>New Build — Apartment</option>
                        <option>Renovation / Replacement</option>
                        <option>Commercial Development</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Emirates Hills, Dubai"
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-3">Products of Interest</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {productCategories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="accent-[#007969]"
                            />
                            <span className="text-[#6b7280] text-xs group-hover:text-[#007969] transition-colors">
                              {cat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Budget Range</label>
                      <select className="w-full bg-white border border-gray-200 text-[#3a3a3c] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors">
                        <option value="">Prefer not to say</option>
                        <option>Under AED 50,000</option>
                        <option>AED 50,000 – 150,000</option>
                        <option>AED 150,000 – 500,000</option>
                        <option>Over AED 500,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Additional Notes</label>
                      <textarea
                        rows={4}
                        placeholder="Any additional details about your project, timeline or specific requirements..."
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors resize-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-brand w-full justify-center">
                  Submit Enquiry
                </button>
                <p className="text-gray-400 text-xs text-center">
                  We respond within 1 business day. No spam, no pushy sales.
                </p>
              </form>
            </ScrollReveal>
          </div>

          {/* Side info */}
          <div>
            <ScrollReveal delay={0.15}>
              <div className="lg:sticky lg:top-28 space-y-8">
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

                <div className="border-t border-gray-100 pt-8">
                  <p className="text-label text-[#007969] mb-4">Prefer to call?</p>
                  <a href="tel:+971000000000" className="text-[#1c1c1e] text-lg hover:text-[#007969] transition-colors">
                    +971 (0) 00 000 0000
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Sun–Thu 9:00–18:00, Sat 10:00–15:00</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
