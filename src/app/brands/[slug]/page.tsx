// Brand detail page — one page per `brand` document in Sanity.
//
// Canonical URLs are keyed on the Sanity slug (/brands/cortizo). The longer
// SEO-style paths that were previously indexed (/brands/cortizo-aluminium-
// systems) permanently redirect here from next.config.ts — Next emits 308
// rather than 301, which search engines treat the same — so there is exactly
// one indexable URL per brand.
//
// /brands itself stays the existing catalogue index at /catalogue/brands — this
// route only adds the per-brand detail pages that were missing.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { SITE_URL } from "@/lib/site";
import { urlFor } from "@/sanity/lib/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { getBrand, getBrands, getBrandSlugs } from "@/lib/brands";
import { getCategories } from "@/lib/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Products carry their manufacturer as a free-text `brand` string rather than a
 * reference, and the data contains at least one singular/plural mismatch
 * ("Gulf Extrusion" vs "Gulf Extrusions"). Compare loosely so a typo does not
 * silently empty a brand's product list.
 */
const normaliseBrand = (value: string) =>
  value.toLowerCase().replace(/[^a-z]/g, "").replace(/s$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Not Found" };

  const seo = brand.seo ?? {};
  const self = `${SITE_URL}/brands/${brand.slug}`;

  // Every brand document currently stores canonicalUrl = <site>/catalogue/brands.
  // That was authored when a brand had no page of its own and only appeared on
  // the index. Honouring it now would point all eight of these pages at one URL
  // and have them dropped as duplicates — so a stored canonical is only used
  // when it is NOT that legacy index value.
  const storedCanonical = stegaClean(seo.canonicalUrl) || "";
  const canonical =
    storedCanonical && !/\/catalogue\/brands\/?$/.test(storedCanonical)
      ? storedCanonical
      : self;

  // The root layout applies a "%s | Swiftrooms" template. Stored SEO titles
  // already end in "| Swiftrooms UAE", so they are set as absolute to avoid
  // "… | Swiftrooms UAE | Swiftrooms"; generated titles keep the template.
  const storedTitle = stegaClean(seo.seoTitle) || "";
  const title: Metadata["title"] = storedTitle
    ? { absolute: storedTitle }
    : `${brand.name} Aluminium Systems in Dubai`;
  const titleText = storedTitle || `${brand.name} Aluminium Systems in Dubai | Swiftrooms`;

  const description =
    stegaClean(seo.seoDescription) ||
    brand.tagline ||
    `Swiftrooms supplies and installs ${brand.name} systems across the UAE.`;

  let ogImage: string | undefined;
  try {
    if (seo.openGraphImage) ogImage = urlFor(seo.openGraphImage as never).width(1200).url();
  } catch {
    ogImage = undefined;
  }
  ogImage ??= brand.gallery[0] ?? brand.logo;

  return {
    title,
    description,
    alternates: { canonical },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: titleText,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: `${brand.name} — Swiftrooms` }] : [],
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const [categories, allBrands] = await Promise.all([getCategories(), getBrands()]);

  const target = normaliseBrand(brand.name);
  const products = categories.flatMap((c) =>
    c.products
      .filter((p) => p.brand && normaliseBrand(p.brand) === target)
      .map((p) => ({ ...p, categorySlug: c.slug, categoryTitle: c.name }))
  );

  const otherBrands = allBrands.filter((b) => b.slug !== brand.slug).slice(0, 4);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${SITE_URL}/catalogue` },
      { "@type": "ListItem", position: 3, name: "Brand Partners", item: `${SITE_URL}/catalogue/brands` },
      { "@type": "ListItem", position: 4, name: brand.name, item: `${SITE_URL}/brands/${brand.slug}` },
    ],
  };

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: brand.description || brand.tagline || undefined,
    url: `${SITE_URL}/brands/${brand.slug}`,
    logo: brand.logo ?? undefined,
    ...(brand.country ? { foundingLocation: { "@type": "Place", name: brand.country } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-44 md:pb-16 lg:pt-52 lg:pb-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8">
              <Link href="/catalogue" className="hover:text-[#007969] transition-colors">Catalogue</Link>
              <span>/</span>
              <Link href="/catalogue/brands" className="hover:text-[#007969] transition-colors">Brands</Link>
              <span>/</span>
              <span className="text-[#6b7280] truncate max-w-[160px]">{brand.name}</span>
            </nav>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-center">
            <div className="min-w-0">
              <ScrollReveal>
                {brand.country && (
                  <span className="text-label text-[#007969] mb-3 md:mb-4 block">{brand.country}</span>
                )}
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4">{brand.name}</h1>
                {brand.tagline && (
                  <p className="text-base sm:text-xl text-[#6b7280] italic">{brand.tagline}</p>
                )}
              </ScrollReveal>
            </div>

            {brand.logo && (
              <ScrollReveal delay={0.15}>
                <div className="relative h-32 md:h-44 bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Overview + sidebar */}
      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-2 min-w-0">
              {brand.description && (
                <ScrollReveal>
                  <p className="text-label text-[#007969] mb-4 md:mb-6">About {brand.name}</p>
                  <p className="text-[#3a3a3c] text-base md:text-lg leading-relaxed mb-10 md:mb-14">
                    {brand.description}
                  </p>
                </ScrollReveal>
              )}

              {brand.speciality.length > 0 && (
                <ScrollReveal>
                  <p className="text-label text-[#007969] mb-4 md:mb-6">Specialities</p>
                  <div className="flex flex-wrap gap-2 mb-10 md:mb-14">
                    {brand.speciality.map((s) => (
                      <span
                        key={s}
                        className="text-[0.65rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-3 py-1.5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {products.length > 0 ? (
                <ScrollReveal>
                  <p className="text-label text-[#007969] mb-4 md:mb-6">
                    {brand.name} systems we supply
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {products.map((product) => (
                      <Link
                        key={`${product.categorySlug}/${product.slug}`}
                        href={`/catalogue/${product.categorySlug}/${product.slug}`}
                        className="group block"
                      >
                        <div className="flex items-center gap-3 border border-gray-100 p-3 md:p-4 bg-[#f8f9fa] group-hover:border-[#007969] transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#007969] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#3a3a3c] text-sm truncate">{product.name}</p>
                            <p className="text-gray-400 text-xs truncate">{product.categoryTitle}</p>
                          </div>
                          <span className="text-[0.55rem] tracking-widest uppercase text-[#007969] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            View →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal>
                  <p className="text-label text-[#007969] mb-4 md:mb-6">
                    {brand.name} systems we supply
                  </p>
                  <p className="text-[#6b7280] leading-relaxed">
                    We supply {brand.name} systems to order. Talk to us about the specification you
                    need and we will confirm availability and lead times for your project.
                  </p>
                </ScrollReveal>
              )}
            </div>

            {/* Sidebar */}
            <div className="min-w-0">
              <ScrollReveal delay={0.1}>
                <div className="lg:sticky lg:top-28">
                  <p className="text-label text-[#007969] mb-6">Brand details</p>
                  <div className="space-y-4 mb-8">
                    {[
                      { label: "Manufacturer", value: brand.name },
                      { label: "Origin", value: brand.country },
                      {
                        label: "Systems supplied",
                        value: products.length > 0 ? String(products.length) : "On request",
                      },
                    ]
                      .filter((d) => Boolean(d.value))
                      .map((d) => (
                        <div key={d.label} className="border-b border-gray-100 pb-4">
                          <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-1">
                            {d.label}
                          </p>
                          <p className="text-[#3a3a3c] text-sm">{d.value}</p>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-3">
                    <QuoteButton className="btn-brand w-full justify-center">
                      Enquire about {brand.name}
                    </QuoteButton>
                    <ShowroomButton className="btn-outline w-full justify-center">
                      See it in the showroom
                    </ShowroomButton>
                    <Link
                      href="/catalogue/brands"
                      className="block w-full text-center border border-gray-200 text-[#3a3a3c] py-3 text-[0.7rem] tracking-widest uppercase hover:border-[#007969] hover:text-[#007969] transition-all"
                    >
                      ← All brand partners
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {brand.gallery.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 pb-12 md:pb-20">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6 md:mb-8">{brand.name} in place</p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {brand.gallery.map((src, i) => (
              <ScrollReveal key={src} delay={(i % 3) * 0.06}>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0fdf4] group">
                  <Image
                    src={src}
                    alt={`${brand.name} systems installed by Swiftrooms, image ${i + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Other brands */}
      {otherBrands.length > 0 && (
        <section className="py-12 md:py-20 border-t border-gray-100 bg-[#f8f9fa]">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6 md:mb-10">Other brand partners</p>
            </ScrollReveal>
            <div className="swipe-scroll md:grid md:grid-cols-4 md:gap-6">
              {otherBrands.map((other, i) => (
                <ScrollReveal key={other.slug} delay={i * 0.08} className="w-[60vw] sm:w-[40vw] md:w-auto">
                  <Link
                    href={`/brands/${other.slug}`}
                    className="group block border border-gray-100 hover:border-[#007969]/30 transition-all bg-white p-5 md:p-6 h-full active:scale-[0.98]"
                  >
                    <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-2">
                      {other.country}
                    </p>
                    <p className="text-[#1c1c1e] font-semibold text-sm group-hover:text-[#007969] transition-colors mb-1">
                      {other.name}
                    </p>
                    {other.tagline && (
                      <p className="text-gray-400 text-xs line-clamp-2">{other.tagline}</p>
                    )}
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 text-center">
            <p className="text-label text-[#007969] mb-4">Specify with confidence</p>
            <h2 className="text-title text-[#1c1c1e] mb-6 max-w-xl mx-auto">
              Talk to us about {brand.name}
            </h2>
            <p className="text-[#6b7280] max-w-md mx-auto mb-10">
              We will confirm the right system for your project, the glazing specification and
              realistic lead times for the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton className="btn-brand">Get A Quote</QuoteButton>
              <ShowroomButton className="btn-outline">Visit Showroom</ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
