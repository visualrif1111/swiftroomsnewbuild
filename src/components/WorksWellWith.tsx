import Link from "next/link";
import Image from "next/image";
import { productCategories } from "@/lib/data";

// "Works Well With" — ecosystem cross-sell. Maps each category to the
// complementary Swiftrooms systems that are commonly specified alongside it,
// improving product discovery and average project value.
const complementaryMap: Record<string, string[]> = {
  "aluminium-sliding-doors": ["insect-screens", "skylights", "garden-rooms", "aluminium-windows"],
  "aluminium-bi-folding-doors": ["insect-screens", "aluminium-windows", "garden-rooms"],
  "aluminium-windows": ["insect-screens", "skylights", "aluminium-doors"],
  "aluminium-doors": ["aluminium-windows", "curtain-wall", "skylights"],
  "upvc": ["insect-screens", "aluminium-windows"],
  "curtain-wall": ["aluminium-windows", "skylights"],
  "garden-rooms": ["aluminium-sliding-doors", "skylights", "insect-screens"],
  "insect-screens": ["aluminium-sliding-doors", "aluminium-windows"],
  "skylights": ["garden-rooms", "curtain-wall"],
};

export default function WorksWellWith({ categorySlug }: { categorySlug: string }) {
  const slugs = complementaryMap[categorySlug] ?? [];
  const items = slugs
    .map((s) => productCategories.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  if (items.length === 0) return null;

  return (
    <section className="py-12 md:py-20 border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <p className="text-label text-[#007969] mb-3">Complete the System</p>
        <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12 max-w-xl">Works well with</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogue/${cat.slug}`}
              className="group block bg-white hover:bg-[#f0fdf4] transition-colors duration-300"
            >
              {cat.image && (
                <div className="relative h-28 sm:h-36 overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              )}
              <div className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-semibold text-[#1c1c1e] group-hover:text-[#007969] transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
