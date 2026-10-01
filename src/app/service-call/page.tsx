import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { SERVICE_PHONE, SERVICE_PHONE_RAW } from "@/lib/contact";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ServiceCallSection from "@/components/service-call/ServiceCallSection";

// Phase 1 is a UX prototype with mock submission — keep it out of search until
// the real backend is connected and the page is approved.
export const metadata: Metadata = {
  title: "Service & Aftercare",
  description:
    "Existing Swiftrooms customers can report an issue with an installed window, door, glazing or related system, with photos and video.",
  alternates: { canonical: `${SITE_URL}/service-call` },
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  { step: "01", text: "Our service team reviews your description, photos and video." },
  { step: "02", text: "We contact you to agree the next step — advice, a visit, or parts." },
  { step: "03", text: "If a visit is needed, we arrange a time that suits you." },
];

export default async function ServiceCallPage() {
  const site = await getSiteSettings();

  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Existing Customers</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">Service &amp; Aftercare</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Is something not working as it should with a window, door, glazing or related system we&apos;ve installed?
              Report it here. Photos or a short video help our service team understand the issue before we contact you.
            </p>
            <a href="#service-request" className="btn-brand mt-8 min-h-12 w-full sm:w-auto">
              Report a Service Issue
            </a>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 min-w-0">
            <ServiceCallSection phone={SERVICE_PHONE} phoneRaw={SERVICE_PHONE_RAW} />
          </div>

          <aside aria-label="About service requests">
            <div className="lg:sticky lg:top-28 space-y-8">
            <div>
              <p className="text-label text-[#007969] mb-4">What happens next?</p>
              <ol className="space-y-4">
                {NEXT_STEPS.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="text-[#007969] text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</span>
                    <p className="text-[#6b7280] text-sm leading-relaxed">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <p className="text-label text-[#007969] mb-4">Prefer to call?</p>
              <a href={`tel:${SERVICE_PHONE_RAW}`} className="text-[#1c1c1e] text-lg hover:text-[#007969] transition-colors">
                {SERVICE_PHONE}
              </a>
              <p className="text-gray-400 text-xs mt-1">Sun–Thu 8:30–17:30, Sat 10:00–14:00</p>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <p className="text-label text-[#007969] mb-4">Email</p>
              <a href={`mailto:${site.contact.email}`} className="text-[#3a3a3c] hover:text-[#007969] transition-colors break-all">
                {site.contact.email}
              </a>
            </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
