import Link from "next/link";
import { QuoteButton, ShowroomButton } from "@/components/forms/CTAButtons";
import { BRAND_ROUTE_ENTRIES } from "@/lib/brandRoutes";

/*
 * Contact details the live site publishes that the shared Sanity `contact`
 * object has no field for — it holds a single unlabelled phone and the
 * showroom address only. Kept here rather than added to that dataset, which
 * swiftrooms.ae also reads. Move them into siteSettings once the schema gains
 * service-phone and factory-address fields.
 */
const SERVICE_PHONE = "04 323 1625";
const SERVICE_PHONE_RAW = "+97143231625";
const FACTORY_ADDRESS_LINE1 = "Dubai Real Estate Centre Ind Park, Unit 1-B";
const FACTORY_ADDRESS_LINE2 = "Jebel Ali, Ind Area 1";

/** Display names for the brand footer column, keyed by Sanity brand slug. */
const BRAND_LABELS: Record<string, string> = {
  cortizo: "Cortizo",
  deceuninck: "Deceuninck",
  "gulf-extrusions": "Gulf Extrusions",
  reynaers: "Reynaers",
  schuco: "Sch\u00fcco",
  ultraframe: "UltraFrame",
};
import { getSiteSettings } from "@/lib/site-settings";

export default async function Footer() {
  const settings = await getSiteSettings();
  const { contact, showroom, footerLinks, footer, cta } = settings;

  return (
    <footer className="bg-[#030213] text-white">
      {/* CTA strip */}
      <div className="bg-[#007969]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading text-xl font-bold text-white mb-1">
              {footer.ctaHeading}
            </p>
            <p className="text-white/70 text-sm">{footer.ctaSubtext}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
            <QuoteButton className="bg-white text-[#007969] font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-gray-50 transition-colors text-center">
              {cta.quoteLabel}
            </QuoteButton>
            <ShowroomButton className="border border-white/40 text-white font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-white/10 transition-colors text-center">
              {cta.showroomLabel}
            </ShowroomButton>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10 mb-10 md:mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="Swiftrooms"
              className="h-10 w-auto mb-6 opacity-90"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-7">
              {footer.brandBlurb}
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="text-label text-[#007969] mb-3">Contact</p>
              <a href={`tel:${contact.phoneRaw}`} className="block text-white/50 hover:text-white transition-colors">
                Sales: {contact.phone}
              </a>
              <a href={`tel:${SERVICE_PHONE_RAW}`} className="block text-white/50 hover:text-white transition-colors">
                Service: {SERVICE_PHONE}
              </a>
              <a href={`mailto:${contact.email}`} className="block text-white/50 hover:text-white transition-colors">
                {contact.email}
              </a>
              <p className="text-white/30 mt-3">
                Showroom: {showroom.addressLine1}
                <br />
                {showroom.city}, {showroom.country}
              </p>
              <p className="text-white/30 mt-2">
                Factory: {FACTORY_ADDRESS_LINE1}
                <br />
                {FACTORY_ADDRESS_LINE2}
              </p>
            </div>
          </div>

          {/* Shop By Brand — built from the brand route map rather than the
              shared Sanity footerLinks, which swiftrooms.ae also reads. */}
          <div>
            {/* Title case, matching the live footer — the other group headings
                use the uppercase label treatment, this one does not. */}
            <p className="mb-5">
              <Link
                href="/brands"
                className="font-accent font-semibold text-[0.7rem] tracking-[0.12em] text-[#007969] hover:text-white transition-colors"
              >
                Shop By Brand
              </Link>
            </p>
            <ul className="space-y-2.5">
              {BRAND_ROUTE_ENTRIES.map(([slug, route]) => (
                <li key={slug}>
                  <Link
                    href={`/brands/${route}`}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    {BRAND_LABELS[slug] ?? slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-label text-[#007969] mb-5">{group.heading}</p>
              <ul className="space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/40 text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Hours */}
          <div>
            <p className="text-label text-[#007969] mb-5">Showroom Hours</p>
            <div className="space-y-2 text-sm text-white/40">
              {showroom.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <span>{h.days}</span>
                  <span>{h.opens} – {h.closes}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span>Friday</span>
                <span>Closed</span>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-label text-[#007969] mb-3">Brand Partners</p>
              <div className="space-y-1.5 text-sm text-white/30">
                {footer.brandPartners.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 pb-[72px] lg:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Swiftrooms. All rights reserved.
          </p>
          <p className="text-white/15 text-xs">
            {footer.bottomTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
