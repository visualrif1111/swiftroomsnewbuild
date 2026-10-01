import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { FACTORY_ADDRESS_LINE1, SERVICE_PHONE, SERVICE_PHONE_RAW } from "@/lib/contact";
import FooterCTA from "./FooterCTA";
import { SOCIAL_ICON_PATHS } from "./socialIcons";

const AREA_LINE = "Jebel Ali, Ind Area 1";

const linkClass = "block py-3 text-white/70 text-sm hover:text-white transition-colors";

/** Company links gain "Shop By Brand" after Portfolio, as on the live footer. */
function withBrandsLink(heading: string, links: { label: string; href: string }[]) {
  if (heading !== "Company" || links.some((l) => l.href === "/brands")) return links;
  const at = links.findIndex((l) => l.href === "/portfolio");
  const out = [...links];
  out.splice(at + 1, 0, { label: "Shop By Brand", href: "/brands" });
  return out;
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const { contact, showroom, footerLinks, footer, cta, social, navigation } = settings;

  return (
    <footer className="bg-[#030213] text-white">
      <FooterCTA
        heading={footer.ctaHeading}
        subtext={footer.ctaSubtext}
        quoteLabel={cta.quoteLabel}
        showroomLabel={cta.showroomLabel}
      />

      {/* Main footer */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10 mb-10 md:mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="Swiftrooms"
              width={196}
              height={40}
              className="h-10 w-auto mb-6 opacity-90"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-7">{footer.brandBlurb}</p>
            <div className="space-y-1.5 text-sm">
              <p className="text-label text-[#007969] mb-3">Contact</p>
              <a href={`tel:${contact.phoneRaw}`} className="block text-white/70 hover:text-white transition-colors">
                Sales: {contact.phone}
              </a>
              <a href={`tel:${SERVICE_PHONE_RAW}`} className="block text-white/70 hover:text-white transition-colors">
                Service: {SERVICE_PHONE}
              </a>
              <a href={`mailto:${contact.email}`} className="block text-white/70 hover:text-white transition-colors">
                {contact.email}
              </a>
              <p className="text-white/60 mt-3">
                Showroom:
                <br />
                {showroom.addressLine1}
                <br />
                {AREA_LINE}
              </p>
              <p className="text-white/60 mt-3">
                Factory:
                <br />
                {FACTORY_ADDRESS_LINE1}
                <br />
                {AREA_LINE}
              </p>
            </div>
            {social.length > 0 && (
              <div className="flex items-center gap-3 mt-6">
                {social.map((s) => {
                  const icon = SOCIAL_ICON_PATHS[s.platform.toLowerCase()];
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors"
                    >
                      {icon ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                          <path d={icon} />
                        </svg>
                      ) : (
                        <span className="font-accent text-[0.6rem] font-semibold uppercase">{s.platform.slice(0, 2)}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-label text-[#007969] mb-5">{group.heading}</p>
              <ul className="space-y-1">
                {withBrandsLink(group.heading, group.links).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Hours + brands */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-label text-[#007969] mb-5">Showroom Hours</p>
            <div className="space-y-2 text-sm text-white/70">
              {[...showroom.hours, { days: "Friday", opens: "", closes: "" }].map((h) => (
                <div key={h.days} className="grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
                  <span className="whitespace-nowrap">{h.days}</span>
                  <span className="whitespace-nowrap text-right">{h.opens ? `${h.opens} – ${h.closes}` : "Closed"}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <p className="text-label text-[#007969] mb-3">Shop By Brand</p>
              <div className="grid grid-cols-2 gap-x-4 text-sm text-white/70">
                {navigation.brands.map((b) => (
                  <Link key={b.href} href={b.href} className="block py-1 hover:text-white transition-colors">
                    {b.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 pb-[72px] lg:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-white/50 text-xs">© {new Date().getFullYear()} Swiftrooms. All rights reserved.</p>
          <p className="text-white/50 text-xs">{footer.bottomTagline}</p>
        </div>
      </div>
    </footer>
  );
}
