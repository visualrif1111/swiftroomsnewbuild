import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, guides and technical advice from the Swiftrooms team on windows, doors, glazing and the UAE property market.",
};

const posts = [
  {
    slug: "choosing-aluminium-windows-dubai",
    date: "March 2025",
    category: "Buying Guide",
    title: "How to Choose Aluminium Windows for a Dubai Villa",
    excerpt:
      "With so many system options on the market, navigating the aluminium window specification process can feel overwhelming. Here we break down what matters most.",
    readTime: "6 min read",
  },
  {
    slug: "thermal-break-uae-climate",
    date: "February 2025",
    category: "Technical",
    title: "Why Thermal Break Aluminium is Essential in the UAE",
    excerpt:
      "Without thermal break technology, aluminium window frames become heat conductors in summer. We explain the physics and the performance difference you can measure.",
    readTime: "5 min read",
  },
  {
    slug: "cortizo-vs-generic-aluminium",
    date: "January 2025",
    category: "Product",
    title: "Cortizo vs Generic Aluminium Systems: A Practical Comparison",
    excerpt:
      "The price difference between a premium European system and a generic equivalent can be significant. We compare what you actually get for the additional investment.",
    readTime: "8 min read",
  },
  {
    slug: "lift-and-slide-doors-villa",
    date: "December 2024",
    category: "Product",
    title: "Lift-and-Slide Doors: Everything You Need to Know",
    excerpt:
      "The Cor Vision 4600 and 4700 are our most popular products. We explain how lift-and-slide technology works and why it outperforms standard sliding doors at any price point.",
    readTime: "7 min read",
  },
  {
    slug: "curtain-wall-residential",
    date: "November 2024",
    category: "Technical",
    title: "Curtain Wall for Residential Projects: When and Why",
    excerpt:
      "Once reserved for commercial towers, structural glazing and curtain wall systems are increasingly specified for prestige Dubai villas. Is it right for your project?",
    readTime: "6 min read",
  },
  {
    slug: "garden-rooms-uae",
    date: "October 2024",
    category: "Product",
    title: "Glass Garden Rooms: The UAE&apos;s Most Requested Addition",
    excerpt:
      "The demand for year-round outdoor living space in the UAE has driven a surge in garden room and conservatory enquiries. We explore the options and costs.",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8">
              Insights &
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                expertise.
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              Guides, product deep-dives and technical advice from the Swiftrooms team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.07}>
                <article className="bg-[#0a0a0a] p-8 hover:bg-[#111] transition-colors duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[0.6rem] tracking-widest uppercase text-[#c4a55f] border border-[#c4a55f]/30 px-2 py-1">
                      {post.category}
                    </span>
                    <span className="text-white/20 text-xs">{post.date}</span>
                  </div>
                  <h2 className="text-white font-semibold mb-3 leading-snug flex-1">
                    {post.title}
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <span className="text-white/20 text-xs">{post.readTime}</span>
                    <span className="text-[0.7rem] tracking-widest uppercase text-white/30">
                      Coming soon
                    </span>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
