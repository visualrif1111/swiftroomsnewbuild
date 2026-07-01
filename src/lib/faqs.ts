// FAQ data layer (general FAQ page): Sanity-first with a data.ts fallback.
// Returns the general FAQs (those NOT tied to a product category); the
// product-category FAQs are rendered on category pages via the catalogue layer.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";
import { faqs as dataFaqs, type FAQ } from "@/lib/data";

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

// Normalise legacy data.ts labels → the 6 canonical categories (matches migration).
const CATEGORY_MAP: Record<string, string> = {
  Products: "Products", Installation: "Installation", Pricing: "Pricing",
  Aftercare: "Maintenance", Maintenance: "Maintenance",
  Guarantees: "Warranty", Warranties: "Warranty", Timelines: "General",
};
const norm = (c: string) => CATEGORY_MAP[c] ?? c;

// Preserve the original FAQ page order (Sanity docs have no inherent order).
const order = new Map(dataFaqs.map((f, i) => [f.question, i]));

const QUERY = groq`*[_type == "faq" && !defined(productCategory)]{ question, answer, category }`;

export const getGeneralFaqs = cache(async (): Promise<FAQ[]> => {
  if (sanityConfigured()) {
    try {
      let rows: FAQ[];
      if (await isDraft()) {
        const { sanityFetch } = await import("@/sanity/lib/live");
        rows = ((await sanityFetch({ query: QUERY })).data as FAQ[]) ?? [];
      } else {
        const { client } = await import("@/sanity/lib/client");
        rows = await client.fetch(QUERY, {}, { next: { revalidate: 60 } });
      }
      if (rows?.length) {
        // category drives filtering/grouping — strip stega before normalising;
        // question/answer keep stega for click-to-edit.
        return rows
          .map((f) => ({ question: f.question, answer: f.answer, category: norm(stegaClean(f.category)) }))
          .sort((a, b) => (order.get(a.question) ?? 999) - (order.get(b.question) ?? 999));
      }
    } catch {
      // fall through
    }
  }
  return dataFaqs.map((f) => ({ ...f, category: norm(f.category) }));
});
