import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import StickyMobileCTA from "@/components/layout/StickyMobileCTA";

export const metadata: Metadata = {
  title: {
    default: "Swiftrooms — Performance Windows & Doors, UAE",
    template: "%s | Swiftrooms",
  },
  description:
    "Premium aluminium windows, doors, curtain wall and glazing systems for UAE residential and commercial projects. Engineered to perform. Built to outlast. Authorised Cortizo, Vetromax and Deceuninck partners.",
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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#1c1c1e] antialiased">
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
