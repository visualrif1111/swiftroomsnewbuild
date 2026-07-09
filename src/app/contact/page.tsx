import { SITE_URL } from "@/lib/site";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";
import { CTALink } from "@/components/forms/CTAButtons";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ContactForm from "./ContactForm";

const DEFAULT_HOURS = [
  { days: "Sunday – Thursday", value: "8:30 – 17:30" },
  { days: "Saturday", value: "10:00 – 14:00" },
  { days: "Friday", value: "Closed" },
];

const DEFAULT_QUICK_LINKS = [
  { href: "/enquire", label: "Get a Free Quote", description: "Submit your project details and we'll provide a written quotation." },
  { href: "/showroom", label: "Book a Showroom Visit", description: "See our full product range at full scale, in working condition." },
  { href: "/portfolio", label: "Browse Portfolio", description: "Completed projects across the UAE — villas, apartments, commercial." },
];

const baseMetadata: Metadata = {
  title: "Contact Swiftrooms — Dubai Showroom & Glazing Enquiries",
  description:
    "Contact Swiftrooms UAE — call, email or visit our Jebel Ali showroom to discuss your windows and doors project.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Swiftrooms | UAE",
    description:
      "Contact Swiftrooms in Dubai — call, email or visit our Jebel Ali showroom. Sunday–Thursday 8:30–17:30, Saturday 10:00–14:00.",
    url: `${SITE_URL}/contact`,
  },
};

export const generateMetadata = () => pageMetadata("/contact", baseMetadata);

export default async function ContactPage() {
  const [ps, site] = await Promise.all([getPageSettings("/contact"), getSiteSettings()]);
  const c = ps?.contact;
  const hours = c?.hours?.length ? c.hours : DEFAULT_HOURS;
  const quickLinks = c?.quickLinks?.length ? c.quickLinks : DEFAULT_QUICK_LINKS;
  const base = SITE_URL;
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
            <p className="text-label text-[#007969] mb-6">{ps?.hero?.eyebrow ?? "Get in Touch"}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              {ps?.hero?.heading ?? "Contact Swiftrooms."}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              {ps?.hero?.subheading ??
                "Call, email or visit our Jebel Ali showroom. Our team responds to all enquiries within one business day — typically within a few hours during office hours."}
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
                  <p className="text-label text-[#007969] mb-4">{c?.showroomLabel ?? "Showroom & Office"}</p>
                  <p className="text-[#6b7280] leading-relaxed">
                    {site.showroom.addressLine1}<br />
                    {site.showroom.city}, {site.showroom.country}
                  </p>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">{c?.phoneLabel ?? "Telephone"}</p>
                  <a href={`tel:${site.contact.phoneRaw}`} className="text-[#3a3a3c] hover:text-[#007969] transition-colors text-lg">
                    {site.contact.phone}
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">{c?.emailLabel ?? "Email"}</p>
                  <a href={`mailto:${site.contact.email}`} className="text-[#3a3a3c] hover:text-[#007969] transition-colors">
                    {site.contact.email}
                  </a>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">{c?.hoursLabel ?? "Business Hours"}</p>
                  <div className="space-y-1.5 text-[#6b7280]">
                    {hours.map((row, i) => (
                      <div key={i} className="flex justify-between max-w-xs">
                        <span>{row.days}</span>
                        <span>{row.value}</span>
                      </div>
                    ))}
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
            <p className="text-label text-[#007969] mb-6">{c?.quickLinksEyebrow ?? "Or explore first"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200">
              {quickLinks.map((link) => (
                <CTALink
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
                </CTALink>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
