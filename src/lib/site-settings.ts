// Site Settings: global contact / footer config from the `siteSettings`
// singleton, with defaults matching the current Footer so nothing changes if
// Sanity is unavailable or a field is blank.
import { cache } from "react";
import { groq } from "next-sanity";

export type SiteSettings = {
  contact: { phone: string; phoneRaw: string; email: string; whatsapp: string };
  showroom: {
    addressLine1: string;
    city: string;
    country: string;
    hours: { days: string; opens: string; closes: string }[];
  };
  footerLinks: { heading: string; links: { label: string; href: string }[] }[];
  social: { platform: string; url: string }[];
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
};

const QUERY = groq`*[_id == "siteSettings"][0]{ contact, showroom, footerLinks, social }`;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return DEFAULTS;
  try {
    const { client } = await import("@/sanity/lib/client");
    const d = await client.fetch<Partial<SiteSettings> | null>(QUERY, {}, { next: { revalidate: 60 } });
    if (!d) return DEFAULTS;
    return {
      contact: { ...DEFAULTS.contact, ...(d.contact ?? {}) },
      showroom: {
        ...DEFAULTS.showroom,
        ...(d.showroom ?? {}),
        hours: d.showroom?.hours?.length ? d.showroom.hours : DEFAULTS.showroom.hours,
      },
      footerLinks: d.footerLinks?.length ? d.footerLinks : DEFAULTS.footerLinks,
      social: d.social ?? [],
    };
  } catch {
    return DEFAULTS;
  }
});
