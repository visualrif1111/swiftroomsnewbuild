import type { Metadata } from "next";
import FaqClient from "./FaqClient";
import { faqs } from "@/lib/data";

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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient />
    </>
  );
}
