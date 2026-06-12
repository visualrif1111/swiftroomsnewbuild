import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";

export const metadata: Metadata = {
  metadataBase: new URL("https://swiftrooms-newbuild.vercel.app"),
  title: {
    default: "Swiftrooms — Performance Windows & Doors, UAE",
    template: "%s | Swiftrooms",
  },
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Engineered to perform. Built to outlast. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
  keywords: [
    "aluminium windows Dubai",
    "aluminium doors UAE",
    "performance windows UAE",
    "Cortizo UAE",
    "sliding doors Dubai",
    "bi-fold doors UAE",
    "uPVC windows Dubai",
    "glazing contractor Dubai",
    "Swiftrooms",
  ],
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "Swiftrooms",
    title: "Swiftrooms — Performance Windows & Doors, UAE",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
    url: "https://swiftrooms-newbuild.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiftrooms — Performance Windows & Doors, UAE",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects.",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Swiftrooms",
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
  url: "https://swiftrooms-newbuild.vercel.app",
  telephone: "+971-4-000-0000",
  email: "info@swiftrooms.ae",
  logo: "https://swiftrooms-newbuild.vercel.app/brand/swiftrooms-logo.png",
  image: "https://swiftrooms-newbuild.vercel.app/brand/hero-villa-dubai.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jebel Ali Industrial Area 1",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 24.9942,
    longitude: 55.0614,
  },
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
  priceRange: "AED 800 – AED 5,000+ per sqm",
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "City", name: "Abu Dhabi" },
    { "@type": "City", name: "Sharjah" },
  ],
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#1c1c1e] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <StickyMobileCTA />
        </LenisProvider>
      </body>
    </html>
  );
}
