// Site Settings: global contact / footer / navigation / CTA config from the
// `siteSettings` singleton, with defaults matching the current design so nothing
// changes if Sanity is unavailable or a field is blank.
//
// Draft-aware (mirrors the blog): the footer + nav get stega click-to-edit
// overlays inside Presentation; published stays on CDN + 60s ISR. Values used in
// links (hrefs, tel:/mailto:, social URLs) are stegaClean'd so they never break.
import { cache } from "react";
import { groq, stegaClean } from "next-sanity";
import { draftMode } from "next/headers";

export type NavLink = { label: string; href: string };

export type SiteSettings = {
  contact: { phone: string; phoneRaw: string; email: string; whatsapp: string };
  showroom: {
    addressLine1: string;
    city: string;
    country: string;
    hours: { days: string; opens: string; closes: string }[];
  };
  footerLinks: { heading: string; links: NavLink[] }[];
  social: { platform: string; url: string }[];
  footer: {
    brandBlurb: string;
    ctaHeading: string;
    ctaSubtext: string;
    brandPartners: string[];
    bottomTagline: string;
  };
  navigation: {
    catalogueBlurb: string;
    catalogue: NavLink[];
    technicalBlurb: string;
    technical: NavLink[];
    mobile: NavLink[];
  };
  cta: { quoteLabel: string; showroomLabel: string; quoteHref: string; showroomHref: string };
};

const DEFAULTS: SiteSettings = {
  contact: { phone: "+971 505 269 149", phoneRaw: "+971505269149", email: "info@swiftrooms.ae", whatsapp: "971505269149" },
  showroom: {
    addressLine1: "Jebel Ali Industrial Area 1",
    city: "Dubai",
    country: "UAE",
    hours: [
      { days: "Sun – Thu", opens: "8:30", closes: "17:30" },
      { days: "Saturday", opens: "10:00", closes: "14:00" },
    ],
  },
  footerLinks: [
    {
      heading: "Products",
      links: [
        { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
        { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
        { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
        { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
        { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
        { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
        { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
        { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
        { label: "Insect Screens", href: "/catalogue/insect-screens" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Technical Hub", href: "/technical" },
        { label: "Blog", href: "/technical/blog" },
        { label: "Resources", href: "/technical/resources" },
        { label: "FAQ", href: "/technical/faq" },
        { label: "Gallery", href: "/catalogue/gallery" },
      ],
    },
  ],
  social: [],
  footer: {
    brandBlurb:
      "Performance windows, doors and glazing systems for UAE residential and commercial projects. Engineered to perform. Built to outlast.",
    ctaHeading: "Free quote & site visit within 24 hours",
    ctaSubtext: "No obligation. Professional survey. Written specification.",
    brandPartners: ["Cortizo", "Vetromax", "Vetro", "Gulf Extrusions"],
    bottomTagline: "Authorised partners for Cortizo · Vetromax · Vetro · Gulf Extrusions",
  },
  navigation: {
    catalogueBlurb: "Premium aluminium, uPVC and glazing systems from Europe's leading manufacturers.",
    catalogue: [
      { label: "All Products", href: "/catalogue" },
      { label: "Brands", href: "/catalogue/brands" },
      { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
      { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
      { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
      { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
      { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
      { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
      { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
      { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
      { label: "Insect Screens", href: "/catalogue/insect-screens" },
      { label: "Gallery", href: "/catalogue/gallery" },
      { label: "Promotions", href: "/catalogue/promotions" },
    ],
    technicalBlurb: "Resources, guides and expertise from first enquiry to aftercare.",
    technical: [
      { label: "Our Process", href: "/technical/process" },
      { label: "Blog & Insights", href: "/technical/blog" },
      { label: "Technical Resources", href: "/technical/resources" },
      { label: "FAQ", href: "/technical/faq" },
    ],
    mobile: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Catalogue", href: "/catalogue" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Technical", href: "/technical" },
    ],
  },
  cta: {
    quoteLabel: "Get a Quote",
    showroomLabel: "Book Showroom Visit",
    quoteHref: "/enquire",
    showroomHref: "/showroom",
  },
};

const QUERY = groq`*[_id == "siteSettings"][0]{ contact, showroom, footerLinks, social, footer, navigation, cta }`;

type RawSettings = Partial<{
  contact: Partial<SiteSettings["contact"]>;
  showroom: Partial<SiteSettings["showroom"]>;
  footerLinks: SiteSettings["footerLinks"];
  social: SiteSettings["social"];
  footer: Partial<SiteSettings["footer"]>;
  navigation: Partial<SiteSettings["navigation"]>;
  cta: Partial<SiteSettings["cta"]>;
}> | null;

const cleanLinks = (links?: NavLink[]): NavLink[] | undefined =>
  links?.length ? links.map((l) => ({ label: l.label, href: stegaClean(l.href) })) : undefined;

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return DEFAULTS;
  try {
    let d: RawSettings;
    if (await isDraft()) {
      const { sanityFetch } = await import("@/sanity/lib/live");
      d = (await sanityFetch({ query: QUERY })).data as RawSettings;
    } else {
      const { client } = await import("@/sanity/lib/client");
      d = await client.fetch<RawSettings>(QUERY, {}, { next: { revalidate: 60 } });
    }
    if (!d) return DEFAULTS;
    return {
      contact: {
        phone: d.contact?.phone || DEFAULTS.contact.phone,
        phoneRaw: stegaClean(d.contact?.phoneRaw || DEFAULTS.contact.phoneRaw),
        email: stegaClean(d.contact?.email || DEFAULTS.contact.email),
        whatsapp: stegaClean(d.contact?.whatsapp || DEFAULTS.contact.whatsapp),
      },
      showroom: {
        ...DEFAULTS.showroom,
        ...(d.showroom ?? {}),
        hours: d.showroom?.hours?.length ? d.showroom.hours : DEFAULTS.showroom.hours,
      },
      footerLinks: d.footerLinks?.length
        ? d.footerLinks.map((g) => ({ heading: g.heading, links: cleanLinks(g.links) ?? [] }))
        : DEFAULTS.footerLinks,
      social: (d.social ?? []).map((s) => ({ platform: s.platform, url: stegaClean(s.url) })),
      footer: {
        brandBlurb: d.footer?.brandBlurb || DEFAULTS.footer.brandBlurb,
        ctaHeading: d.footer?.ctaHeading || DEFAULTS.footer.ctaHeading,
        ctaSubtext: d.footer?.ctaSubtext || DEFAULTS.footer.ctaSubtext,
        brandPartners: d.footer?.brandPartners?.length ? d.footer.brandPartners : DEFAULTS.footer.brandPartners,
        bottomTagline: d.footer?.bottomTagline || DEFAULTS.footer.bottomTagline,
      },
      navigation: {
        catalogueBlurb: d.navigation?.catalogueBlurb || DEFAULTS.navigation.catalogueBlurb,
        catalogue: cleanLinks(d.navigation?.catalogue) ?? DEFAULTS.navigation.catalogue,
        technicalBlurb: d.navigation?.technicalBlurb || DEFAULTS.navigation.technicalBlurb,
        technical: cleanLinks(d.navigation?.technical) ?? DEFAULTS.navigation.technical,
        mobile: cleanLinks(d.navigation?.mobile) ?? DEFAULTS.navigation.mobile,
      },
      cta: {
        quoteLabel: d.cta?.quoteLabel || DEFAULTS.cta.quoteLabel,
        showroomLabel: d.cta?.showroomLabel || DEFAULTS.cta.showroomLabel,
        quoteHref: stegaClean(d.cta?.quoteHref || DEFAULTS.cta.quoteHref),
        showroomHref: stegaClean(d.cta?.showroomHref || DEFAULTS.cta.showroomHref),
      },
    };
  } catch {
    return DEFAULTS;
  }
});
