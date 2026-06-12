import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Fifteen years supplying and installing premium aluminium windows, doors and curtain wall systems across the UAE. Authorised partners for Cortizo, Vetromax, Vetro and Gulf Extrusions.",
  openGraph: {
    title: "About Swiftrooms | The UAE's Trusted Glazing Authority",
    description:
      "Fifteen years supplying and installing premium aluminium windows, doors and curtain wall systems across the UAE. Authorised partners for Cortizo, Vetromax, Vetro and Gulf Extrusions.",
    url: "https://swiftrooms-newbuild.vercel.app/about",
  },
};

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Swiftrooms",
    url: "https://swiftrooms-newbuild.vercel.app",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <AboutClient />
    </>
  );
}
