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
  "aluminium-sliding-doors": "Aluminium Lift-and-Slide Doors UAE — Cor Vision 4600, 4700 & Plus",
  "aluminium-bi-folding-doors": "Aluminium Bi-Folding Doors UAE — Cortizo Bi-fold Systems",
  "aluminium-windows": "Thermally Broken Aluminium Windows UAE — Cortizo, Vetro & Gulf Extrusions",
  "aluminium-doors": "Aluminium Doors UAE — Front Entrance, Pivot & TB600 Systems",
  "upvc": "uPVC Windows & Doors UAE — Casement & Sliding Systems",
  "curtain-wall": "Curtain Wall Systems UAE — Cortizo TP52, Equity & Vetromax VF35",
  "garden-rooms": "Glass Garden Rooms & Conservatories UAE",
  "insect-screens": "Retractable Insect Screens UAE — Fly Screen Systems",
  "skylights": "Skylights & Rooflights UAE — Fixed & Motorised Opening Systems",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const metaTitle = categoryMetaTitles[slug] ?? category.name;
  return {
    title: metaTitle,
    description: category.description,
    alternates: { canonical: `https://swiftrooms-newbuild.vercel.app/catalogue/${slug}` },
    openGraph: {
      title: `${metaTitle} | Swiftrooms`,
      description: category.description,
      url: `https://swiftrooms-newbuild.vercel.app/catalogue/${slug}`,
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

  const base = "https://swiftrooms-newbuild.vercel.app";
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
