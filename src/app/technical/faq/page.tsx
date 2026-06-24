import type { Metadata } from "next";
import FaqClient from "./FaqClient";
import { getGeneralFaqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Glazing FAQ — Windows, Doors & Aluminium Systems UAE",
  description:
    "Answers to the most common questions about premium aluminium windows, doors and glazing systems in the UAE. Get clear, expert answers from the Swiftrooms team.",
  alternates: { canonical: "https://swiftrooms-newbuild.vercel.app/technical/faq" },
  openGraph: {
    title: "FAQ | Swiftrooms",
    description:
      "Answers to the most common questions about premium aluminium windows, doors and glazing systems in the UAE.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/faq",
  },
};

export default async function FaqPage() {
  const faqs = await getGeneralFaqs();
  const base = "https://swiftrooms-newbuild.vercel.app";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: `${base}/technical` },
      { "@type": "ListItem", position: 3, name: "FAQ", item: `${base}/technical/faq` },
    ],
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient faqs={faqs} />
    </>
  );
}
