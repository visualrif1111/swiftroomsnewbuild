import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about premium aluminium windows, doors and glazing systems in the UAE. Get clear, expert answers from the Swiftrooms team.",
  openGraph: {
    title: "FAQ | Swiftrooms",
    description:
      "Answers to the most common questions about premium aluminium windows, doors and glazing systems in the UAE.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/faq",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
