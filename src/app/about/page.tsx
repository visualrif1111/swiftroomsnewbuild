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
  return <AboutClient />;
}
