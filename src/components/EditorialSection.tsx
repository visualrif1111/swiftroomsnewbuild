// Renders one long-form editorial block: eyebrow, heading and body copy on the
// left, a short list of takeaways as check-marked cards on the right.
//
// Deliberately generic — the homepage, category pages and brand pages share
// it, matching the single treatment swiftrooms.ae uses for this content.
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { EditorialSection as Section } from "@/lib/homeEditorial";

export default function EditorialSection({ section }: { section: Section }) {
  const { id, eyebrow, heading, level, body, points, tone = "default" } = section;
  // The tag follows the page outline (h2 → h6 as the page progresses); the
  // visual size stays constant so late sections don't shrink away.
  const Heading = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <section
      id={id}
      className={`py-16 md:py-24 scroll-mt-24 border-t border-gray-100 ${tone === "muted" ? "bg-[#f8f9fa]" : "bg-white"}`}
    >
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-4">{eyebrow}</p>
            <Heading className="text-title text-[#1c1c1e] mb-6 max-w-xl">{heading}</Heading>
            <div className="space-y-4 text-[#6b7280] leading-relaxed">
              {body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>

          {points.length > 0 && (
            <ScrollReveal delay={0.1}>
              <ul className="space-y-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-4 bg-[#f8f9fa] p-5 rounded-xl">
                    <span
                      className="w-7 h-7 rounded-full bg-[#007969] flex items-center justify-center flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="text-[#1c1c1e] text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
