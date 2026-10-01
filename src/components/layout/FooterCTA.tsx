"use client";

import { usePathname } from "next/navigation";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";

// Pages that already end with their own full-width call to action, so the
// footer strip would repeat it. Mirrors swiftrooms.ae.
const HIDDEN_EXACT = new Set([
  "/",
  "/about",
  "/portfolio",
  "/technical",
  "/technical/process",
  "/technical/resources",
  "/technical/blog",
  "/technical/faq",
]);
const HIDDEN_PREFIXES = ["/brands/", "/portfolio/", "/catalogue/gallery"];
/** Product detail pages: /catalogue/<category>/<product>. */
const PRODUCT_PAGE = /^\/catalogue\/[^/]+\/[^/]+$/;

export default function FooterCTA({
  heading,
  subtext,
  quoteLabel,
  showroomLabel,
}: {
  heading: string;
  subtext: string;
  quoteLabel: string;
  showroomLabel: string;
}) {
  const pathname = usePathname();
  if (HIDDEN_EXACT.has(pathname) || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) || PRODUCT_PAGE.test(pathname)) {
    return null;
  }

  return (
    <div className="bg-[#007969]">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-heading text-xl font-bold text-white mb-1">{heading}</p>
          <p className="text-white/70 text-sm">{subtext}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <QuoteButton className="bg-white text-[#007969] font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-gray-50 transition-colors text-center">
            {quoteLabel}
          </QuoteButton>
          <ShowroomButton className="border border-white/40 text-white font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-white/10 transition-colors text-center">
            {showroomLabel}
          </ShowroomButton>
        </div>
      </div>
    </div>
  );
}
