import type { Metadata } from "next";
import Image from "next/image";
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
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "thermal-break-uae-climate",
    date: "February 2025",
    category: "Technical",
    title: "Why Thermal Break Aluminium is Essential in the UAE",
    excerpt:
      "Without thermal break technology, aluminium window frames become heat conductors in summer. We explain the physics and the performance difference you can measure.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "cortizo-vs-generic-aluminium",
    date: "January 2025",
    category: "Product",
    title: "Cortizo vs Generic Aluminium Systems: A Practical Comparison",
    excerpt:
      "The price difference between a premium European system and a generic equivalent can be significant. We compare what you actually get for the additional investment.",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "lift-and-slide-doors-villa",
    date: "December 2024",
    category: "Product",
    title: "Lift-and-Slide Doors: Everything You Need to Know",
    excerpt:
      "The Cor Vision 4600 and 4700 are our most popular products. We explain how lift-and-slide technology works and why it outperforms standard sliding doors at any price point.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "curtain-wall-residential",
    date: "November 2024",
    category: "Technical",
    title: "Curtain Wall for Residential Projects: When and Why",
    excerpt:
      "Once reserved for commercial towers, structural glazing and curtain wall systems are increasingly specified for prestige Dubai villas. Is it right for your project?",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "garden-rooms-uae",
    date: "October 2024",
    category: "Product",
    title: "Glass Garden Rooms: The UAE&apos;s Most Requested Addition",
    excerpt:
      "The demand for year-round outdoor living space in the UAE has driven a surge in garden room and conservatory enquiries. We explore the options and costs.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Technical</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8">
              Insights &amp; expertise.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              Guides, product deep-dives and technical advice from the Swiftrooms team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.07}>
                <article className="bg-white hover:bg-[#f8f9fa] transition-colors duration-300 h-full flex flex-col overflow-hidden">
                  {post.image && (
                    <div className="h-36 sm:h-44 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-5 sm:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[0.6rem] tracking-widests uppercase text-[#007969] border border-[#007969]/30 px-2 py-1">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-xs">{post.date}</span>
                  </div>
                  <h2 className="text-[#1c1c1e] font-semibold mb-3 leading-snug flex-1">
                    {post.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                    <span className="text-[0.7rem] tracking-widests uppercase text-gray-400">
                      Coming soon
                    </span>
                  </div>
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
