import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { blogPosts } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://swiftrooms-newbuild.vercel.app/technical/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `https://swiftrooms-newbuild.vercel.app/technical/blog/${post.slug}`,
      images: post.image ? [{ url: post.image, alt: post.title }] : [],
      publishedTime: post.date,
      authors: ["Swiftrooms"],
      section: post.category,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const allOther = blogPosts.filter(
    (p) => p.slug !== slug && !related.find((r) => r.slug === p.slug)
  );
  const relatedPosts = [...related, ...allOther].slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Swiftrooms",
      url: "https://swiftrooms-newbuild.vercel.app",
      "@id": "https://swiftrooms-newbuild.vercel.app/#business",
    },
    publisher: {
      "@type": "Organization",
      name: "Swiftrooms",
      url: "https://swiftrooms-newbuild.vercel.app",
      "@id": "https://swiftrooms-newbuild.vercel.app/#business",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://swiftrooms-newbuild.vercel.app/technical/blog/${post.slug}`,
    },
    keywords: post.category,
    articleSection: post.category,
    inLanguage: "en-AE",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://swiftrooms-newbuild.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: "https://swiftrooms-newbuild.vercel.app/technical" },
      { "@type": "ListItem", position: 3, name: "Blog & Insights", item: "https://swiftrooms-newbuild.vercel.app/technical/blog" },
      { "@type": "ListItem", position: 4, name: post.title, item: `https://swiftrooms-newbuild.vercel.app/technical/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="pt-32 pb-0 md:pt-44 lg:pt-52">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <nav className="flex items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8">
              <Link href="/technical/blog" className="hover:text-[#007969] transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-[#6b7280] truncate max-w-[200px]">{post.category}</span>
            </nav>
          </ScrollReveal>

          <div className="max-w-3xl">
            <ScrollReveal>
              <span className="text-[0.65rem] tracking-widest uppercase text-[#007969] border border-[#007969]/30 px-3 py-1 inline-block mb-6">
                {post.category}
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="text-headline text-[#1c1c1e] mb-6 leading-tight">{post.title}</h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-body-lg text-[#6b7280] mb-8">{post.excerpt}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="flex items-center gap-6 text-[0.65rem] tracking-widest uppercase text-gray-400">
                <span>{post.date}</span>
                <span className="w-px h-4 bg-gray-200" />
                <span>{post.readTime}</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section className="mt-10 md:mt-16 max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <div className="w-full h-[40vh] md:h-[55vh] relative overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Article body */}
      <section className="py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
            {/* Article content */}
            <div className="lg:col-span-2">
              {post.body.map((section, i) => (
                <ScrollReveal key={i} delay={i * 0.06}>
                  <div className="mb-10 md:mb-14">
                    {section.heading && (
                      <h2 className="text-xl md:text-2xl font-semibold text-[#1c1c1e] mb-5">
                        {section.heading}
                      </h2>
                    )}
                    {section.paragraphs.map((para, j) => (
                      <p key={j} className="text-[#6b7280] leading-relaxed mb-4 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </ScrollReveal>
              ))}

              {/* Inline CTA */}
              <ScrollReveal>
                <div className="border-t border-gray-100 pt-10 mt-10">
                  <p className="text-label text-[#007969] mb-4">Ready to discuss your project?</p>
                  <p className="text-[#6b7280] mb-6 max-w-md">
                    Talk to our specification team — no obligation, just expert advice tailored to your project.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <QuoteButton className="btn-brand">
                      Get A Quote
                    </QuoteButton>
                    <ShowroomButton className="btn-outline">
                      Visit Showroom
                    </ShowroomButton>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-28 space-y-8">
                {/* Post meta */}
                <div className="border border-gray-100 p-6">
                  <p className="text-label text-[#007969] mb-4">Article Details</p>
                  <div className="space-y-3">
                    {[
                      { label: "Category", value: post.category },
                      { label: "Published", value: post.date },
                      { label: "Read time", value: post.readTime },
                    ].map((d) => (
                      <div key={d.label} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <p className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-1">{d.label}</p>
                        <p className="text-[#3a3a3c] text-sm">{d.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar CTA */}
                <div className="bg-[#007969] p-6">
                  <p className="text-white/80 text-[0.65rem] tracking-widest uppercase mb-3">
                    Speak to an expert
                  </p>
                  <p className="text-white font-semibold mb-5 leading-snug">
                    Get a free specification consultation
                  </p>
                  <QuoteButton className="block w-full text-center bg-white text-[#007969] py-3 text-[0.7rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors">
                    Enquire Now
                  </QuoteButton>
                </div>

                {/* Related products */}
                <div>
                  <p className="text-label text-[#007969] mb-4">
                    {post.relatedProducts && post.relatedProducts.length > 0 ? "Featured Products" : "Browse Products"}
                  </p>
                  {post.relatedProducts && post.relatedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {post.relatedProducts.map((rp) => (
                        <Link
                          key={rp.href}
                          href={rp.href}
                          className="flex items-center justify-between border border-gray-100 p-4 hover:border-[#007969]/30 group transition-all"
                        >
                          <span className="text-sm text-[#3a3a3c] group-hover:text-[#007969] transition-colors leading-snug">
                            {rp.name}
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-[#007969] transition-colors flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                      <Link
                        href="/catalogue"
                        className="block text-[0.65rem] tracking-widest uppercase text-[#007969] pt-2 hover:underline"
                      >
                        View all products →
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/catalogue"
                      className="flex items-center justify-between border border-gray-100 p-4 hover:border-[#007969]/30 group transition-all"
                    >
                      <span className="text-sm text-[#3a3a3c] group-hover:text-[#007969] transition-colors">
                        View full product range
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-[#007969] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 border-t border-gray-100 bg-[#f8f9fa]">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-8 md:mb-12">More from the blog</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              {relatedPosts.map((rel, i) => (
                <ScrollReveal key={rel.slug} delay={i * 0.08}>
                  <Link
                    href={`/technical/blog/${rel.slug}`}
                    className="group block bg-white hover:bg-[#f8f9fa] transition-colors h-full"
                  >
                    <div className="h-36 relative overflow-hidden">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-3 block">
                        {rel.category}
                      </span>
                      <h3 className="text-[#1c1c1e] font-semibold leading-snug group-hover:text-[#007969] transition-colors mb-2">
                        {rel.title}
                      </h3>
                      <p className="text-gray-400 text-xs">{rel.date}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
