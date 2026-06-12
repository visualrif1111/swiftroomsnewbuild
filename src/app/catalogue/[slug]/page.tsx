import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productCategories } from "@/lib/data";
import CategoryClient from "./CategoryClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return productCategories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = productCategories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = productCategories.find((c) => c.slug === slug);
  if (!category) notFound();

  return <CategoryClient category={category} />;
}
