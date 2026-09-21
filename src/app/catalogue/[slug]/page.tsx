import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getCategories, getCategorySlugs } from "@/lib/catalogue";
import { getArticles } from "@/lib/blog";
import CategoryClient from "./CategoryClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

const categoryMetaTitles: Record<string, string> = {
  "aluminium-sliding-doors": "Aluminium Sliding Door Suppliers",
  "aluminium-bi-folding-doors": "Aluminium Bi Fold Doors Dubai",
  "aluminium-windows": "Aluminium Windows Dubai & Abu Dhabi",
  "aluminium-doors": "Aluminium Doors Dubai | Aluminium Doors UAE",
  "upvc": "uPVC Windows Dubai | uPVC Doors Dubai",
  "curtain-wall": "Aluminium Curtain Wall | Curtain Wall Systems",
  "garden-rooms": "Garden Rooms Dubai | Glass Conservatory Dubai",
  "insect-screens": "Retractable Insect Screens UAE — Fly Screen Systems",
  "skylights": "Skylights & Rooflights UAE — Fixed & Motorised Opening Systems",
  "aluminium-glass-doors": "Aluminium Glass Doors Dubai, UAE",
};

// Search-facing descriptions, where the on-page intro copy is not the right
// length or emphasis for a SERP snippet. Falls back to category.description.
const categoryMetaDescriptions: Record<string, string> = {
  "aluminium-bi-folding-doors":
    "Aluminium Folding Doors are the epitome of modern design and functionality, providing a seamless connection between indoor and outdoor living spaces",
  "aluminium-doors":
    "Our range of aluminium door in Dubai offers something for every style of property, from our distinctive European designs to high-quality local profiles",
  "upvc":
    "PVCu, uPVC Doors and Windows in Dubai offers a practical and energy-efficient solution for modern homes, combining durability with ease of use",
  "curtain-wall":
    "Aluminium Glass Curtain Wall by Swiftrooms offer superior aesthetics, durability, and thermal efficiency. Designed for both residential and commercial projects",
  "garden-rooms":
    "Create a modern outdoor retreat with a stylish Glass Room in Dubai. Call Swiftrooms on 04 347 4240 for professional service and quality results.",
  "aluminium-glass-doors":
    "Slim-frame aluminium glass doors by Swiftrooms built for UAE heat, sand & humidity. Hinged, pivot, sliding & bi-fold. Authorised Cortizo partner. Get a Free quote.",
  "aluminium-windows":
    "Swiftrooms LLC, specializes in providing high-quality Aluminium Windows in Dubai, outdoor glass rooms, garden rooms, premium windows, and door systems",
  "aluminium-sliding-doors":
    "Discover premium slim sliding doors by Swiftrooms, designed for style and durability. Contact our experts today for a free consultation",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const metaTitle = categoryMetaTitles[slug] ?? category.name;
  const metaDescription = categoryMetaDescriptions[slug] ?? category.description;
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: `${SITE_URL}/catalogue/${slug}` },
    openGraph: {
      title: `${metaTitle} | Swiftrooms`,
      description: metaDescription,
      url: `${SITE_URL}/catalogue/${slug}`,
      ...(category.image ? { images: [{ url: category.image, alt: category.name }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, allCategories, blogPosts] = await Promise.all([
    getCategory(slug),
    getCategories(),
    getArticles(),
  ]);
  if (!category) notFound();

  const base = SITE_URL;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${base}/catalogue` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${base}/catalogue/${slug}` },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.description,
    url: `${base}/catalogue/${slug}`,
    numberOfItems: category.products.length,
    itemListElement: category.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${base}/catalogue/${slug}/${p.slug}`,
    })),
  };

  const faqSchema = category.faqs && category.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: category.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <CategoryClient category={category} allCategories={allCategories} blogPosts={blogPosts} />
    </>
  );
}
