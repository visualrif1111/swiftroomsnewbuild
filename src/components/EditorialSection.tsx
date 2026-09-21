// Renders one long-form editorial block: eyebrow, heading, body copy and a
// short list of takeaways.
//
// Deliberately generic — the homepage uses it today, and the category pages
// carry the same shape of content on the live site, so they can reuse this
// rather than growing their own variant.
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { EditorialSection as Section } from "@/lib/homeEditorial";

const HEADING_CLASS: Record<Section["level"], string> = {
  // Visual weight follows the page's own hierarchy rather than the tag, so a
  // late h6 still reads as a section heading instead of shrinking away.
  2: "text-headline",
  3: "text-headline",
  4: "text-title",
  5: "text-title",
  6: "text-title",
};

export default function EditorialSection({ section }: { section: Section }) {
  const { id, eyebrow, heading, level, body, points, tone = "default" } = section;
  const Heading = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <section
      id={id}
      className={`py-14 md:py-20 scroll-mt-24 ${tone === "muted" ? "bg-[#f8f9fa]" : "bg-white"}`}
    >
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-16">
          <div className="min-w-0">
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-3">{eyebrow}</p>
              <Heading className={`${HEADING_CLASS[level]} text-[#1c1c1e] text-balance`}>
                {heading}
              </Heading>
            </ScrollReveal>
          </div>

          <div className="min-w-0">
            <ScrollReveal delay={0.1}>
              {body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-[#6b7280] leading-relaxed mb-4 last:mb-0 md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </ScrollReveal>

            {points.length > 0 && (
              <ScrollReveal delay={0.18}>
                <ul className="mt-7 space-y-3 border-t border-gray-100 pt-7">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-[#3a3a3c] text-sm md:text-base">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#007969]"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
