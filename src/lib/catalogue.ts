// Catalogue data layer: Sanity-first with a data.ts fallback.
//
// In data.ts, products are nested inside categories and FAQs live on the
// category; in Sanity they're separate documents (product → category ref,
// faq → productCategory ref). This layer reconstructs the nested
// ProductCategory/Product shape the pages already use, preserving the curated
// order from data.ts, and falls back to data.ts if Sanity is unavailable.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";
import { productCategories as dataCategories, type ProductCategory, type Product } from "@/lib/data";

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

// ── Curated order + fields data.ts has but Sanity doesn't (relatedBlogSlugs) ──
const catOrder = new Map(dataCategories.map((c, i) => [c.slug, i]));
const prodOrder = new Map<string, number>();
const relatedBlogByCat = new Map<string, string[] | undefined>();
dataCategories.forEach((c) => {
  relatedBlogByCat.set(c.slug, c.relatedBlogSlugs);
  c.products.forEach((p, i) => prodOrder.set(`${c.slug}/${p.slug}`, i));
});

type RawCat = { id: string; title: string; slug: string; tagline?: string; overview?: string; image?: string | null };
type RawProd = {
  id: string; title: string; slug: string; categorySlug?: string; brand?: string;
  description?: string; benefits?: string[]; specs?: { label?: string; value?: string }[]; image?: string | null;
};
type RawFaq = { question: string; answer: string; catSlug?: string };

const CATS_QUERY = groq`*[_type == "productCategory"]{ "id": _id, title, "slug": slug.current, tagline, overview, "image": heroImage.asset->url }`;
const PRODS_QUERY = groq`*[_type == "product"]{ "id": _id, title, "slug": slug.current, "categorySlug": category->slug.current, brand, description, benefits, "specs": specifications[]{label, value}, "image": heroImage.asset->url }`;
const FAQS_QUERY = groq`*[_type == "faq" && defined(productCategory)]{ question, answer, "catSlug": productCategory->slug.current }`;

function toProduct(p: RawProd, categorySlug: string): Product {
  const specs: Record<string, string> = {};
  for (const s of p.specs ?? []) if (s.label) specs[s.label] = s.value ?? "";
  return {
    id: p.id,
    name: p.title,
    slug: p.slug,
    brand: p.brand ?? "",
    category: categorySlug,
    description: p.description ?? "",
    features: p.benefits ?? [],
    specs,
    image: p.image ?? undefined,
  };
}

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

// Fetch + reconstruct nested categories. `draft` selects the source: sanityFetch
// (drafts + stega click-to-edit overlays) in Draft Mode, else the CDN + 60s ISR
// client. Slugs / image URLs are stega-stripped before reconstruction because
// they drive matching, ordering, keys and hrefs; displayed prose keeps stega.
async function fetchCategories(draft: boolean): Promise<ProductCategory[]> {
  if (!sanityConfigured()) return [];
  try {
    let cats: RawCat[];
    let prods: RawProd[];
    let faqs: RawFaq[];
    if (draft) {
      const { sanityFetch } = await import("@/sanity/lib/live");
      [cats, prods, faqs] = await Promise.all([
        sanityFetch({ query: CATS_QUERY }).then((r) => (r.data as RawCat[]) ?? []),
        sanityFetch({ query: PRODS_QUERY }).then((r) => (r.data as RawProd[]) ?? []),
        sanityFetch({ query: FAQS_QUERY }).then((r) => (r.data as RawFaq[]) ?? []),
      ]);
    } else {
      const { client } = await import("@/sanity/lib/client");
      const opt = { next: { revalidate: 60 } } as const;
      [cats, prods, faqs] = await Promise.all([
        client.fetch<RawCat[]>(CATS_QUERY, {}, opt),
        client.fetch<RawProd[]>(PRODS_QUERY, {}, opt),
        client.fetch<RawFaq[]>(FAQS_QUERY, {}, opt),
      ]);
    }
    if (!cats?.length) return [];

    cats = cats.map((c) => ({ ...c, slug: stegaClean(c.slug), image: c.image ? stegaClean(c.image) : c.image }));
    prods = prods.map((p) => ({
      ...p,
      slug: stegaClean(p.slug),
      categorySlug: p.categorySlug ? stegaClean(p.categorySlug) : p.categorySlug,
      image: p.image ? stegaClean(p.image) : p.image,
    }));
    faqs = faqs.map((f) => ({ ...f, catSlug: f.catSlug ? stegaClean(f.catSlug) : f.catSlug }));

    const result: ProductCategory[] = cats.map((c) => {
      const products = prods
        .filter((p) => p.categorySlug === c.slug)
        .map((p) => toProduct(p, c.slug))
        .sort((a, b) => (prodOrder.get(`${c.slug}/${a.slug}`) ?? 999) - (prodOrder.get(`${c.slug}/${b.slug}`) ?? 999));
      const catFaqs = faqs.filter((f) => f.catSlug === c.slug).map((f) => ({ q: f.question, a: f.answer }));
      return {
        id: c.id,
        name: c.title,
        slug: c.slug,
        tagline: c.tagline ?? "",
        description: c.overview ?? "",
        image: c.image ?? undefined,
        products,
        relatedBlogSlugs: relatedBlogByCat.get(c.slug),
        faqs: catFaqs.length ? catFaqs : undefined,
      };
    });
    return result.sort((a, b) => (catOrder.get(a.slug) ?? 999) - (catOrder.get(b.slug) ?? 999));
  } catch {
    return [];
  }
}

function mergeWithData(sanity: ProductCategory[]): ProductCategory[] {
  if (!sanity.length) return dataCategories;
  const slugs = new Set(sanity.map((c) => c.slug));
  const merged = [...sanity, ...dataCategories.filter((c) => !slugs.has(c.slug))];
  return merged.sort((a, b) => (catOrder.get(a.slug) ?? 999) - (catOrder.get(b.slug) ?? 999));
}

/** All categories (with nested products + faqs) — Sanity first (draft-aware), else data.ts. */
export const getCategories = cache(async (): Promise<ProductCategory[]> => {
  return mergeWithData(await fetchCategories(await isDraft()));
});

// Non-draft merged categories — safe for generateStaticParams (never touches draftMode).
async function publishedMerged(): Promise<ProductCategory[]> {
  return mergeWithData(await fetchCategories(false));
}

export async function getCategory(slug: string): Promise<ProductCategory | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getProduct(categorySlug: string, productSlug: string) {
  const category = await getCategory(categorySlug);
  const product = category?.products.find((p) => p.slug === productSlug);
  return category && product ? { category, product } : null;
}

export async function getCategorySlugs(): Promise<string[]> {
  return (await publishedMerged()).map((c) => c.slug);
}

export async function getProductParams(): Promise<{ slug: string; product: string }[]> {
  const cats = await publishedMerged();
  return cats.flatMap((c) => c.products.map((p) => ({ slug: c.slug, product: p.slug })));
}
