import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { CTAFormProvider } from "@/components/forms/CTAFormProvider";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/brand/hero-villa-dubai.png`,
        width: 1200,
        height: 630,
        alt: "Swiftrooms — Premium Glazing Systems, UAE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiftrooms — Performance Windows & Doors, UAE",
    description:
      "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects.",
    images: [`${SITE_URL}/brand/hero-villa-dubai.png`],
  },
};

const BASE = SITE_URL;

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE}/#business`,
  name: "Swiftrooms",
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Authorised Cortizo, Vetromax, Vetro and Gulf Extrusions partners.",
  url: BASE,
  telephone: "+971-4-000-0000",
  email: "info@swiftrooms.ae",
  logo: `${BASE}/brand/swiftrooms-logo.png`,
  image: `${BASE}/brand/hero-villa-dubai.png`,
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
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+971-4-000-0000",
    contactType: "sales",
    areaServed: "AE",
    availableLanguage: ["English", "Arabic"],
  },
  priceRange: "AED 800 – AED 5,000+ per sqm",
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "City", name: "Abu Dhabi" },
    { "@type": "City", name: "Sharjah" },
    { "@type": "City", name: "Ras Al Khaimah" },
    { "@type": "AdministrativeArea", name: "United Arab Emirates" },
  ],
  sameAs: [],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  name: "Swiftrooms",
  url: BASE,
  publisher: { "@id": `${BASE}/#business` },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading isEnabled keeps every route STATIC/ISR for normal visitors and only
  // switches to dynamic rendering when the Draft Mode cookie is present, so
  // Visual Editing + live updates load exclusively inside Presentation/preview.
  const { isEnabled: isDraft } = await draftMode();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className="bg-white text-[#1c1c1e] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <CTAFormProvider>
          <LenisProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <StickyMobileCTA />
            <WhatsAppFloat />
          </LenisProvider>
        </CTAFormProvider>
        {/* Visual Editing overlays + live preview — only mounted in Draft Mode
            (inside the Presentation tool). No effect on the published site. */}
        {isDraft && (
          <>
            <VisualEditing />
            <SanityLive />
          </>
        )}
      </body>
    </html>
  );
}
