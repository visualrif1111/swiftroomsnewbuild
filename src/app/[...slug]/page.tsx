// CMS-driven catch-all route for page-builder pages (landing pages, legal
// pages, thank-you pages, and any custom page an editor creates in Sanity).
//
// Existing routes (/, /about, /catalogue/*, /portfolio/*, /technical/* …) are
// more specific and always take precedence — this only handles paths that no
// other route matches. Unknown paths call notFound() so genuine 404s still 404.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { getPage, getPageSlugs } from "@/lib/page";
import PageBuilder from "@/components/blocks/PageBuilder";
import { urlFor } from "@/sanity/lib/image";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const page = await getPage(path);
  if (!page) return { title: "Not Found" };
  const seo = page.seo ?? {};
  const canonical = seo.canonicalUrl || `${SITE_URL}/${path}`;
  let ogImage: string | undefined;
  try {
    if (seo.openGraphImage) ogImage = urlFor(seo.openGraphImage as never).width(1200).url();
  } catch {
    ogImage = undefined;
  }
  return {
    title: seo.seoTitle || page.title,
    description: seo.seoDescription,
    alternates: { canonical },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.seoTitle || page.title,
      description: seo.seoDescription,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();
  return <PageBuilder sections={page.sections} />;
}
