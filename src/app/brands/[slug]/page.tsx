// Brand detail page — content from the `brand` documents in Sanity.
//
// URLs match the live site exactly and come from BRAND_ROUTES
// (/brands/cortizo-aluminium-systems), not from the Sanity slug. Only brands
// in that map get a page; anything else 404s, which is why Vetro and Vetromax
// resolve here the same way they do on the live site — they appear on the
// catalogue brand index but have no standalone page.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { SITE_URL } from "@/lib/site";
import { urlFor } from "@/sanity/lib/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { getBrandByRoute, getPublishedBrands } from "@/lib/brands";
import { BRAND_CARDS, BRAND_ROUTE_SLUGS, brandHref } from "@/lib/brandRoutes";
import { brandEditorialFor, brandSeo } from "@/lib/brandEditorial";
import EditorialSection from "@/components/EditorialSection";
import type { EditorialSection as EditorialSectionData } from "@/lib/homeEditorial";
import FAQAccordion from "@/components/brands/BrandFAQ";
import { getCategories } from "@/lib/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BRAND_ROUTE_SLUGS.map((slug) => ({ slug }));
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
  const brand = await getBrandByRoute(slug);
  if (!brand) return { title: "Not Found" };

  const seo = brand.seo ?? {};
  const self = `${SITE_URL}/brands/${slug}`;

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
  // The live pages' own title/description win over the Sanity `seo` object,
  // which still holds the older index-scoped set.
  const published = brandSeo[slug];
  const storedTitle = published?.title || stegaClean(seo.seoTitle) || "";
  const title: Metadata["title"] = published
    ? published.title
    : storedTitle
      ? { absolute: storedTitle }
      : `${brand.name} Aluminium Systems in Dubai`;
  const titleText = published
    ? `${published.title} | Swiftrooms`
    : storedTitle || `${brand.name} Aluminium Systems in Dubai | Swiftrooms`;

  const description =
    published?.description ||
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
  const brand = await getBrandByRoute(slug);
  if (!brand) notFound();

  const [categories, publishedBrands] = await Promise.all([
    getCategories(),
    getPublishedBrands(),
  ]);

  const editorial = brandEditorialFor(slug);
  // The live pages title themselves with the card name ("Cortizo Systems"),
  // not the bare Sanity title.
  const displayName = BRAND_CARDS.find((c) => c.slug === brand.slug)?.name ?? brand.name;
  const worksWith = editorial?.worksWith ?? [];
  const strapline = BRAND_CARDS.find((c) => c.slug === brand.slug)?.strapline;
  const allSections = editorial?.sections ?? [];
  const isClosing = (eyebrow: string) => eyebrow.toLowerCase() === "why swiftrooms";
  const mainSections = allSections.filter((sec) => !isClosing(sec.eyebrow));
  const closingSections = allSections.filter((sec) => isClosing(sec.eyebrow));

  const target = normaliseBrand(brand.name);
  const products = categories.flatMap((c) =>
    c.products
      .filter((p) => p.brand && normaliseBrand(p.brand) === target)
      .map((p) => ({ ...p, categorySlug: c.slug, categoryTitle: c.name }))
  );

  // Only brands that actually have a page, so the strip never dead-ends.
  const otherBrands = publishedBrands.filter((b) => b.slug !== brand.slug).slice(0, 4);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${SITE_URL}/catalogue` },
      { "@type": "ListItem", position: 3, name: "Brand Partners", item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 4, name: brand.name, item: `${SITE_URL}/brands/${slug}` },
    ],
  };

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: brand.description || brand.tagline || undefined,
    url: `${SITE_URL}/brands/${slug}`,
    logo: brand.logo ?? undefined,
    ...(brand.country ? { foundingLocation: { "@type": "Place", name: brand.country } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8">
              <Link href="/brands" className="hover:text-[#007969] transition-colors">Shop By Brand</Link>
              <span>/</span>
              <span className="text-[#6b7280] truncate max-w-[160px]">{brand.name}</span>
            </nav>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-center">
            <div className="min-w-0">
              <ScrollReveal>
                <p className="text-label text-[#007969] mb-3 md:mb-4">Brand Partner</p>
                <h1 className="text-headline text-[#1c1c1e] mb-3 md:mb-4 max-w-3xl">{displayName}</h1>
                {(strapline || brand.tagline) && (
                  <p className="text-base md:text-xl text-[#6b7280] italic mb-6 md:mb-8">
                    {strapline ?? brand.tagline}
                  </p>
                )}
              </ScrollReveal>
              {editorial?.intro && (
                <ScrollReveal delay={0.1}>
                  <p className="text-body-lg text-[#6b7280] max-w-2xl">{editorial.intro}</p>
                </ScrollReveal>
              )}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <QuoteButton className="btn-brand">Get a Quote</QuoteButton>
                  <ShowroomButton className="btn-outline">Book Showroom Visit</ShowroomButton>
                </div>
              </ScrollReveal>
            </div>

            {brand.logo && (
              <ScrollReveal delay={0.15}>
                <div className="relative h-32 md:h-44 bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.logo}
                      alt={`${displayName} logo`}
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

      {/* Overview + sidebar — new-build addition: the systems we supply and brand details */}
      <section className="py-12 md:py-20 border-t border-gray-100">
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
                      href="/brands"
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

      {/* Ported editorial — "Why Swiftrooms" closes the page after the FAQ, as on the live site */}
      <EditorialBlocks sections={mainSections} />

      {/* Complete the system */}
      {worksWith.length > 0 && (
        <section className="py-12 md:py-20 border-t border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-3">Complete the System</p>
              <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12 max-w-xl">Works well with</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
              {worksWith.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors duration-300 p-5 md:p-6"
                >
                  <h3 className="text-sm md:text-base font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-1">
                    {item.label}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {editorial && editorial.faqs.length > 0 && (
        <section className="py-12 md:py-20 border-t border-gray-100">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <div className="max-w-3xl">
                <p className="text-label text-[#007969] mb-3">Common Questions</p>
                <h2 className="text-title text-[#1c1c1e] mb-10">Frequently Asked Questions</h2>
              </div>
            </ScrollReveal>
            <FAQAccordion faqs={editorial.faqs} />
            <ScrollReveal delay={0.2}>
              <div className="mt-8 max-w-3xl">
                <p className="text-[#6b7280] text-sm">
                  Have a question not listed here?{" "}
                  <QuoteButton className="text-[#007969] hover:underline">Contact our technical team →</QuoteButton>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <EditorialBlocks sections={closingSections} />

      {/* Other brands — new-build addition */}
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
                    href={brandHref(other.slug) ?? "/brands"}
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

      {/* Closing CTA */}
      <section className="py-20 bg-[#030213] relative overflow-hidden">
        <ScrollReveal>
          <div className="relative z-10 max-w-screen-xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-headline text-white mb-5 max-w-2xl mx-auto">Free Quote &amp; Site Visit Within 24 Hours</h2>
            <p className="text-white/50 text-body-lg max-w-lg mx-auto mb-10">
              No obligation. Professional survey. Written specification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuoteButton className="btn-brand">Get a Quote</QuoteButton>
              <ShowroomButton className="btn-outline border-white/30 text-white hover:bg-white hover:text-[#007969]">
                Book Showroom Visit
              </ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

/** A run of editorial sections, alternating white and grey from the first. */
function EditorialBlocks({ sections }: { sections: EditorialSectionData[] }) {
  return sections.map((section, i) => (
    <EditorialSection key={section.id} section={{ ...section, tone: i % 2 === 0 ? "default" : "muted" }} />
  ));
}
