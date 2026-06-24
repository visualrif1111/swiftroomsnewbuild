import type { Metadata } from "next";
import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getArticles } from "@/lib/blog";
import { getGeneralFaqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Technical Hub — Glazing Guides, Process & FAQ for UAE Projects",
  description:
    "Swiftrooms technical resources — our process, blog articles, downloadable guides, FAQ and everything you need to specify, plan and manage your glazing project in the UAE.",
  alternates: { canonical: "https://www.swiftrooms.ae/technical" },
  openGraph: {
    title: "Technical Hub | Swiftrooms",
    description:
      "Technical resources for glazing projects in the UAE — our process, expert articles, specification guides, FAQ and downloadable documents.",
    url: "https://www.swiftrooms.ae/technical",
  },
};

const buildSections = (articleCount: number, faqCount: number) => [
  {
    href: "/technical/process",
    label: "01",
    title: "Our Process",
    description:
      "Six clear steps from first enquiry to aftercare. Understand exactly what happens at each stage, what we do, and what you need to do — before you commit to anything.",
    cta: "See the process",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    stat: "6 steps",
    statLabel: "Zero surprises",
  },
  {
    href: "/technical/blog",
    label: "02",
    title: "Blog & Insights",
    description:
      "Technical articles written by our specification team — covering system selection, UAE climate performance, thermal break technology, and how to compare European vs generic aluminium.",
    cta: "Read the blog",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    stat: `${articleCount} articles`,
    statLabel: "Expert authored",
  },
  {
    href: "/technical/resources",
    label: "03",
    title: "Technical Resources",
    description:
      "Specification guides, project case studies and planning tools. Request any document and our team will send it directly — no gatekeeping, no forms to fill.",
    cta: "Browse resources",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80",
    stat: "14 documents",
    statLabel: "Free to request",
  },
  {
    href: "/technical/faq",
    label: "04",
    title: "FAQ",
    description:
      "Answers to the questions we get asked most — covering pricing, timelines, installation, product selection, maintenance, guarantees and aftercare across 8 categories.",
    cta: "Read the FAQ",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    stat: `${faqCount} questions`,
    statLabel: "8 categories",
  },
];

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
export default async function TechnicalPage() {
  const [articles, faqs] = await Promise.all([getArticles(), getGeneralFaqs()]);
  const sections = buildSections(articles.length, faqs.length);
  const recentPosts = [...articles]
    .sort((a, b) => {
      const [aM, aY] = a.date.split(" ");
      const [bM, bY] = b.date.split(" ");
      return (parseInt(bY) * 100 + (MONTHS[bM] ?? 0)) - (parseInt(aY) * 100 + (MONTHS[aM] ?? 0));
    })
    .slice(0, 3);
  const base = "https://www.swiftrooms.ae";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Technical Hub", item: `${base}/technical` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Knowledge Hub</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Everything you need to know before you buy.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Our technical hub covers the full journey — from understanding how our systems
              perform in the UAE climate, to specifying the right product, managing your
              installation and protecting your investment with aftercare.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      {/* Four section cards */}
      <section className="py-12 md:py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {sections.map((section, i) => (
              <ScrollReveal key={section.href} delay={i * 0.08}>
                <Link
                  href={section.href}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors overflow-hidden h-full"
                >
                  <div className="h-44 md:h-52 relative overflow-hidden">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-3">
                      <span className="text-[0.55rem] tracking-widest uppercase text-white bg-[#007969] px-2 py-1">
                        {section.stat}
                      </span>
                      <span className="text-[0.55rem] tracking-widest uppercase text-white/70">
                        {section.statLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 lg:p-10">
                    <span className="text-label text-[#007969] mb-3 block">{section.label}</span>
                    <h2 className="text-xl md:text-2xl font-semibold text-[#1c1c1e] mb-3 group-hover:text-[#007969] transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-[#6b7280] text-sm leading-relaxed mb-6">{section.description}</p>
                    <span className="text-[0.65rem] tracking-widest uppercase text-[#007969]">
                      {section.cta} →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recent blog posts */}
      <section className="py-12 md:py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-label text-[#007969] mb-3">Latest from the blog</p>
                <h2 className="text-title text-[#1c1c1e] max-w-md">
                  Technical articles from our team.
                </h2>
              </div>
              <Link href="/technical/blog" className="btn-outline hidden md:inline-flex">
                All articles →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {recentPosts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.08}>
                <Link
                  href={`/technical/blog/${post.slug}`}
                  className="group block bg-white hover:bg-[#f0fdf4] transition-colors h-full"
                >
                  {post.image && (
                    <div className="h-36 relative overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-5 md:p-6">
                    <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-2">{post.category}</p>
                    <h3 className="font-semibold text-[#1c1c1e] mb-2 group-hover:text-[#007969] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <span className="mt-4 block text-[0.65rem] tracking-widest uppercase text-[#007969]">
                      Read article →
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-px md:hidden">
              <Link href="/technical/blog" className="btn-outline w-full justify-center mt-4">
                All articles →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="py-12 md:py-20 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <p className="text-label text-[#007969] mb-3">Common questions</p>
                <h2 className="text-title text-[#1c1c1e] mb-4 max-w-sm">
                  Quick answers.
                </h2>
                <p className="text-[#6b7280] leading-relaxed mb-6">
                  We've answered the most common questions about working with Swiftrooms across
                  8 categories — from pricing and timelines to guarantees and aftercare.
                </p>
                <Link href="/technical/faq" className="btn-brand">Browse all FAQs</Link>
              </div>
              <div className="space-y-0 border-t border-gray-100">
                {faqs.slice(0, 5).map((faq, i) => (
                  <ScrollReveal key={faq.question} delay={i * 0.05}>
                    <div className="border-b border-gray-100 py-4">
                      <p className="text-[0.6rem] tracking-widest uppercase text-[#007969] mb-1">{faq.category}</p>
                      <p className="font-medium text-[#1c1c1e] text-sm mb-1">{faq.question}</p>
                      <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">{faq.answer}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-[#007969]">
        <ScrollReveal>
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-label text-white/70 mb-4">Ready to move from research to reality?</p>
              <h2 className="text-title text-white mb-4">Start your project today.</h2>
              <p className="text-white/70 leading-relaxed">
                Get a free quotation and site survey within 24 hours. No obligation —
                just an expert conversation about your project and a written specification
                you can use however you like.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <QuoteButton className="inline-flex items-center justify-center bg-white text-[#007969] px-8 py-4 text-[0.75rem] tracking-widest uppercase font-semibold hover:bg-gray-50 transition-colors">
                Get a Free Quote
              </QuoteButton>
              <ShowroomButton className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-[0.75rem] tracking-widest uppercase hover:bg-white/10 transition-all">
                Book Showroom Visit
              </ShowroomButton>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
