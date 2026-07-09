import { SITE_URL } from "@/lib/site";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";
import { getSiteSettings } from "@/lib/site-settings";
import PageBuilder from "@/components/blocks/PageBuilder";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { stegaClean } from "next-sanity";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ShowroomBookingForm from "./ShowroomBookingForm";

const baseMetadata: Metadata = {
  title: "Showroom — Jebel Ali, Dubai",
  description:
    "Visit the Swiftrooms 4900 showroom in Jebel Ali, Dubai. The UAE's only space where you can experience Cortizo Cor Vision, Cor Vision Plus and TP52 curtain wall at full scale, in working condition.",
  alternates: { canonical: `${SITE_URL}/showroom` },
  openGraph: {
    title: "4900 Showroom, Jebel Ali | Swiftrooms",
    description:
      "Visit the Swiftrooms showroom in Jebel Ali, Dubai. Experience Cortizo Cor Vision, Cor Vision Plus, TP52 curtain wall and more at full scale in working condition. Open by appointment.",
    url: `${SITE_URL}/showroom`,
  },
};

export const generateMetadata = () => pageMetadata("/showroom", baseMetadata);

const displays = [
  {
    name: "Cortizo Cor Vision 4700",
    type: "Lift & Slide — Full Width",
    description: "4.2m × 2.4m working display. Open and operate our largest lift-and-slide configuration.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/aluminium-sliding-doors/cor-vision-4700",
  },
  {
    name: "Cortizo Cor Vision Plus",
    type: "Flush Threshold Display",
    description: "Floor-level threshold detail shown at full scale. Experience the barrier-free transition.",
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/aluminium-sliding-doors/cor-vision-plus",
  },
  {
    name: "Cortizo Cor 70",
    type: "Hidden Sash Windows",
    description: "Multiple casement configurations on display. Tilt-and-turn and fixed light variants.",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/aluminium-windows",
  },
  {
    name: "Cortizo Bi-fold Door",
    type: "4-Leaf Demonstration",
    description: "Full-width bi-fold door in working condition — fold and stack to understand the mechanism.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/aluminium-bi-folding-doors",
  },
  {
    name: "Cortizo TP52 Curtain Wall",
    type: "Structural Panel Section",
    description: "Full-height structural glazing section with exposed pressure-plate detail.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/curtain-wall",
  },
  {
    name: "Gulf Extrusions TB600",
    type: "Tilt & Turn Window & Door",
    description: "Side-by-side tilt-and-turn window and door — the UAE's most specified thermal break system.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    link: "/catalogue/aluminium-windows",
  },
];

const visitSteps = [
  { num: "01", text: "Book your appointment via the form below or by phone — we confirm within 24 hours." },
  { num: "02", text: "Arrive at Jebel Ali Industrial Area 1 — full address sent on confirmation." },
  { num: "03", text: "One of our technical specialists will walk you through every system on display." },
  { num: "04", text: "Leave with a written specification and budgetary estimate if your project is ready." },
];

const DEFAULT_HOURS = [
  { days: "Sunday – Thursday", value: "8:30 – 17:30" },
  { days: "Saturday", value: "10:00 – 14:00" },
  { days: "Friday", value: "Closed" },
];

const DEFAULT_ALSO_LIST = [
  "uPVC Casement and Sliding — side-by-side comparison",
  "Full finish library — powder coat, anodised and RAL samples",
  "Hardware library — all standard and optional hardware ranges",
];

export default async function ShowroomPage() {
  const [ps, site] = await Promise.all([getPageSettings("/showroom"), getSiteSettings()]);
  const sr = ps?.showroom;
  const displayCards = sr?.displays?.length ? sr.displays : displays;
  const steps = sr?.visitSteps?.length ? sr.visitSteps : visitSteps;
  const hours = sr?.hours?.length ? sr.hours : DEFAULT_HOURS;
  const alsoList = sr?.alsoList?.length ? sr.alsoList : DEFAULT_ALSO_LIST;
  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Visit Showroom", item: `${base}/showroom` },
    ],
  };
  const showroomSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Swiftrooms 4900 Showroom",
    description:
      "The UAE's only showroom featuring full-scale working displays of Cortizo Cor Vision, Cor Vision Plus, TP52 curtain wall and Gulf Extrusions TB600. Open by appointment.",
    url: `${SITE_URL}/showroom`,
    telephone: "+971-4-000-0000",
    email: "info@swiftrooms.ae",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jebel Ali Industrial Area 1",
      addressLocality: "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    geo: { "@type": "GeoCoordinates", latitude: 24.9942, longitude: 55.0614 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:30",
        closes: "17:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
    amenityFeature: displayCards.map((d) => ({
      "@type": "LocationFeatureSpecification",
      name: stegaClean(d.name),
      value: stegaClean(d.type),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(showroomSchema) }} />
      {/* Hero */}
      <section className="pt-32 pb-0 md:pt-44 lg:pt-52">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">{ps?.hero?.eyebrow ?? "Experience in person"}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            <div>
              <ScrollReveal delay={0.1}>
                <h1 className="text-headline text-[#1c1c1e] mb-6 max-w-xl">
                  {ps?.hero?.heading ?? "The 4900 Showroom, Jebel Ali."}
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-body-lg text-[#6b7280]">
                  {ps?.hero?.subheading ??
                    "The only way to truly understand a window or door system is to operate it yourself. Our Jebel Ali showroom features full-scale working displays of every major system we carry — open by appointment, no obligation."}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="flex gap-4 mt-8 flex-wrap">
                  <a href="#book" className="btn-brand">{sr?.bookLabel ?? "Book a Visit"}</a>
                  <Link href="/catalogue/gallery/4900" className="btn-outline">{sr?.galleryLabel ?? "See Gallery"}</Link>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15} direction="right">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-48 md:h-56 relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                    alt="4900 Showroom interior"
                    fill
                    className="object-cover"
                    sizes="25vw"
                    priority
                  />
                </div>
                <div className="h-48 md:h-56 relative overflow-hidden mt-6">
                  <Image
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
                    alt="Showroom display systems"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Full-bleed hero image */}
      <section className="mt-10 md:mt-16">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="w-full h-[45vh] md:h-[60vh] relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80"
                alt="4900 Showroom Jebel Ali — full width view"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10">
                <p className="text-[0.6rem] tracking-widest uppercase text-white/80">{sr?.fullBleedCaption ?? "4900 Showroom · Jebel Ali Industrial Area 1, Dubai"}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 mt-10">
        <div className="divider-brand" />
      </div>

      {/* What's on display */}
      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-3">{sr?.displaysEyebrow ?? "What's on display"}</p>
            <h2 className="text-title text-[#1c1c1e] mb-10 max-w-xl">
              {sr?.displaysHeading ?? "Seven full-scale working systems."}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
            {displayCards.map((display, i) => (
              <ScrollReveal key={display.name} delay={i * 0.07}>
                <Link href={display.link} className="group block bg-white hover:bg-[#f0fdf4] transition-colors overflow-hidden">
                  <div className="h-40 relative overflow-hidden">
                    <Image
                      src={display.image}
                      alt={display.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="text-[0.55rem] tracking-widest uppercase text-white/80">{display.type}</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors">{display.name}</h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed">{display.description}</p>
                    <span className="mt-4 block text-[0.65rem] tracking-widest uppercase text-[#007969]">View Product →</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}

            {/* Libraries card */}
            <ScrollReveal delay={0.42}>
              <div className="bg-[#f8f9fa] p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-label text-[#007969] mb-4">{sr?.librariesLabel ?? "Finish & Hardware Libraries"}</p>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-6">
                    {sr?.librariesBody ??
                      "Browse our complete finish library — powder coat and anodised RAL samples, plus every standard and optional hardware range across all product categories."}
                  </p>
                </div>
                <Link href="/enquire" className="btn-brand self-start">
                  {sr?.librariesButtonLabel ?? "Book to Browse"}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What to expect + location */}
      <section className="py-16 md:py-24 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Visit steps */}
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">{sr?.visitEyebrow ?? "What to expect on your visit"}</p>
            <div className="space-y-6">
              {steps.map((vs, i) => (
                <div key={i} className="flex gap-5">
                  <span className="text-[#007969] text-xs font-bold flex-shrink-0 mt-0.5 w-6">{vs.num}</span>
                  <p className="text-[#6b7280] leading-relaxed text-sm">{vs.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-gray-200 pt-8">
              <p className="text-label text-[#007969] mb-4">{sr?.alsoLabel ?? "Also on display"}</p>
              <ul className="space-y-2">
                {alsoList.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[#6b7280] text-sm">
                    <div className="w-1 h-1 rounded-full bg-[#007969] flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Location & hours */}
          <ScrollReveal delay={0.15}>
            <div className="space-y-8">
              <div>
                <p className="text-label text-[#007969] mb-4">{sr?.locationLabel ?? "Location"}</p>
                <p className="text-[#3a3a3c] leading-relaxed">
                  {site.showroom.addressLine1}<br />
                  {site.showroom.city}, {site.showroom.country}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {sr?.locationNote ?? "Full address and directions sent on appointment confirmation."}
                </p>
              </div>

              <div>
                <p className="text-label text-[#007969] mb-4">{sr?.hoursLabel ?? "Opening Hours"}</p>
                <div className="space-y-2 text-[#6b7280] text-sm">
                  {hours.map((row, i) => (
                    <div key={i} className="flex justify-between max-w-xs">
                      <span>{row.days}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-label text-[#007969] mb-4">{sr?.callLabel ?? "Call us"}</p>
                <a href={`tel:${site.contact.phoneRaw}`} className="text-[#1c1c1e] text-lg hover:text-[#007969] transition-colors">
                  {site.contact.phone}
                </a>
                <p className="text-gray-400 text-xs mt-1">{sr?.callNote ?? "Sun–Thu 8:30–17:30, Sat 10:00–14:00"}</p>
              </div>

              {/* Booking form */}
              <div id="book" className="border-t border-gray-200 pt-8">
                <p className="text-label text-[#007969] mb-6">{sr?.bookFormLabel ?? "Book a Visit"}</p>
                <ShowroomBookingForm />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery link */}
      <section className="py-12 md:py-16 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-label text-[#007969] mb-3">{sr?.galleryEyebrow ?? "Can't visit in person?"}</p>
                <p className="text-[#6b7280] leading-relaxed">
                  {sr?.galleryBody ??
                    "Browse photography from our showroom and completed installations — product images, detail shots and project case studies all available in our galleries."}
                </p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link href="/catalogue/gallery/4900" className="btn-brand">{sr?.galleryViewLabel ?? "View Showroom Gallery"}</Link>
                <Link href="/portfolio" className="btn-outline">{sr?.galleryProjectsLabel ?? "See Completed Projects"}</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <PageBuilder sections={ps?.sections} />
    </>
  );
}
