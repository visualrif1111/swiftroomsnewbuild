import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getTeamMembers, getTimeline, getTestimonials, getCertifications } from "@/lib/about";
import { getPageSettings, pageMetadata } from "@/lib/pageSettings";
import PageBuilder from "@/components/blocks/PageBuilder";

const baseMetadata: Metadata = {
  title: "About Swiftrooms — UAE Glazing Specialists Since 2009",
  description:
    "Fifteen years supplying and installing premium aluminium windows, doors and curtain wall systems across the UAE. Authorised partners for Cortizo, Vetromax, Vetro and Gulf Extrusions.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Swiftrooms | The UAE's Trusted Glazing Authority",
    description:
      "Fifteen years supplying and installing premium aluminium windows, doors and curtain wall systems across the UAE. Authorised partners for Cortizo, Vetromax, Vetro and Gulf Extrusions.",
    url: `${SITE_URL}/about`,
  },
};

export const generateMetadata = () => pageMetadata("/about", baseMetadata);

export default async function AboutPage() {
  const [teamMembers, timeline, testimonials, certifications, ps] = await Promise.all([
    getTeamMembers(),
    getTimeline(),
    getTestimonials(),
    getCertifications(),
    getPageSettings("/about"),
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#business`,
    name: "Swiftrooms",
    url: SITE_URL,
    foundingDate: "2009",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
    areaServed: [
      { "@type": "City", name: "Dubai" },
      { "@type": "City", name: "Abu Dhabi" },
      { "@type": "City", name: "Sharjah" },
    ],
    knowsAbout: [
      "Aluminium Windows",
      "Aluminium Doors",
      "Curtain Wall Systems",
      "Bi-folding Doors",
      "Lift and Slide Doors",
      "uPVC Windows",
      "Garden Rooms",
    ],
    numberOfEmployees: { "@type": "QuantitativeValue", value: 50 },
    brand: [
      { "@type": "Brand", name: "Cortizo" },
      { "@type": "Brand", name: "Vetromax" },
      { "@type": "Brand", name: "Vetro" },
      { "@type": "Brand", name: "Gulf Extrusions" },
    ],
  };

  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "About Swiftrooms", item: `${base}/about` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AboutClient
        teamMembers={teamMembers}
        timeline={timeline}
        testimonials={testimonials}
        certifications={certifications}
        hero={ps?.hero}
      />
      <PageBuilder sections={ps?.sections} />
    </>
  );
}
