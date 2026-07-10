// Resources data layer: Sanity-first with a data.ts fallback.
// Maps Sanity's category labels back to the data.ts keys the client groups by.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";
import { resources as dataResources, type Resource } from "@/lib/data";

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

const LABEL_TO_KEY: Record<string, string> = {
  "Guides & Knowledge": "guides",
  "Projects & Inspiration": "projects",
  "Planning & Costs": "planning",
};

// Preserve the original order (Sanity docs have no inherent order).
const order = new Map(dataResources.map((r, i) => [r.title, i]));

type Raw = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  fileExt?: string;
};

// Pull the uploaded PDF's asset url + size + extension so the page can offer a
// direct download and auto-fill the type/size badges when left blank.
const QUERY = groq`*[_type == "resource"]{
  "id": _id, title, description, category, fileType, fileSize,
  "fileUrl": file.asset->url,
  "fileSizeBytes": file.asset->size,
  "fileExt": file.asset->extension
}`;

// "2411724" bytes -> "2.4 MB". Falls back to KB for small files.
function humanSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export const getResources = cache(async (): Promise<Resource[]> => {
  if (sanityConfigured()) {
    try {
      let rows: Raw[];
      if (await isDraft()) {
        const { sanityFetch } = await import("@/sanity/lib/live");
        rows = ((await sanityFetch({ query: QUERY })).data as Raw[]) ?? [];
      } else {
        const { client } = await import("@/sanity/lib/client");
        rows = await client.fetch(QUERY, {}, { next: { revalidate: 60 } });
      }
      if (rows?.length) {
        return rows
          .map((r): Resource => {
            const fileUrl = stegaClean(r.fileUrl ?? "") || undefined;
            const ext = stegaClean(r.fileExt ?? "");
            return {
              id: r.id,
              title: r.title,
              description: r.description ?? "",
              // category drives filtering/grouping — strip stega before the key lookup.
              category: (LABEL_TO_KEY[stegaClean(r.category ?? "")] ?? "guides") as Resource["category"],
              // Manual badge wins; otherwise derive from the uploaded asset.
              fileType: r.fileType?.trim() || (ext ? ext.toUpperCase() : ""),
              fileSize: r.fileSize?.trim() || humanSize(r.fileSizeBytes),
              fileUrl,
            };
          })
          .sort((a, b) => (order.get(a.title) ?? 999) - (order.get(b.title) ?? 999));
      }
    } catch {
      // fall through
    }
  }
  return dataResources;
});
