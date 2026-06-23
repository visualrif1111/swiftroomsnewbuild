// Resources data layer: Sanity-first with a data.ts fallback.
// Maps Sanity's category labels back to the data.ts keys the client groups by.
import { cache } from "react";
import { groq } from "next-sanity";
import { resources as dataResources, type Resource } from "@/lib/data";

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

const LABEL_TO_KEY: Record<string, string> = {
  "Guides & Knowledge": "guides",
  "Projects & Inspiration": "projects",
  "Planning & Costs": "planning",
};

// Preserve the original order (Sanity docs have no inherent order).
const order = new Map(dataResources.map((r, i) => [r.title, i]));

type Raw = { id: string; title: string; description?: string; category?: string; fileType?: string; fileSize?: string };

const QUERY = groq`*[_type == "resource"]{ "id": _id, title, description, category, fileType, fileSize }`;

export const getResources = cache(async (): Promise<Resource[]> => {
  if (sanityConfigured()) {
    try {
      const { client } = await import("@/sanity/lib/client");
      const rows: Raw[] = await client.fetch(QUERY, {}, { next: { revalidate: 60 } });
      if (rows?.length) {
        return rows
          .map((r): Resource => ({
            id: r.id,
            title: r.title,
            description: r.description ?? "",
            category: (LABEL_TO_KEY[r.category ?? ""] ?? "guides") as Resource["category"],
            fileType: r.fileType ?? "",
            fileSize: r.fileSize ?? "",
          }))
          .sort((a, b) => (order.get(a.title) ?? 999) - (order.get(b.title) ?? 999));
      }
    } catch {
      // fall through
    }
  }
  return dataResources;
});
