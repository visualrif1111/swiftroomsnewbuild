import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.swiftrooms.ae",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // SEO migration — preserve equity from legacy flat URLs (www.swiftrooms.ae)
  // by 301/308-redirecting every indexed page to its new nested route.
  // Source of truth: seo-migration/redirects.json
  async redirects() {
    return [
      { source: "/aluminium-sliding-door-cor-vision", destination: "/catalogue/aluminium-sliding-doors", permanent: true },
      { source: "/aluminium-door-cor-vision-4600-lift-and-slide", destination: "/catalogue/aluminium-sliding-doors/cor-vision-4600", permanent: true },
      { source: "/alumnium-sliding-door-cor-vision-4700-lift-and-slide", destination: "/catalogue/aluminium-sliding-doors/cor-vision-4700", permanent: true },
      { source: "/cor-vision-plus", destination: "/catalogue/gallery/cor-vision-plus", permanent: true },
      { source: "/cor-vision-gallery", destination: "/catalogue/gallery/cor-vision", permanent: true },
      { source: "/4900-gallery", destination: "/catalogue/gallery/4900", permanent: true },
      { source: "/aluminium-sliding-door-window-gulf-extrusion-al-ghurair-montana", destination: "/catalogue/aluminium-sliding-doors/gulf-extrusion-montana", permanent: true },
      { source: "/bi-fold-aluminium-profile-door-cortizo", destination: "/catalogue/aluminium-bi-folding-doors/cortizo-bifold", permanent: true },
      { source: "/aluminium-windows-cortizo-cor-70-hidden-sash", destination: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash", permanent: true },
      { source: "/aluminium-windows-cortizo-alu-steel-classic-and-modern", destination: "/catalogue/aluminium-windows/cortizo-alu-steel", permanent: true },
      { source: "/aluminium-windows-gulf-extrusion-tb600-tilt-and-turn-casement", destination: "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn", permanent: true },
      { source: "/cortizo-cor-70-door", destination: "/catalogue/aluminium-doors/cortizo-cor-70-door", permanent: true },
      { source: "/front-entrance-doors-aluminium-paneled-glass-upvc", destination: "/catalogue/aluminium-doors/front-entrance-doors", permanent: true },
      { source: "/upvc-pvcu-casement-suite-windows-doors", destination: "/catalogue/upvc/upvc-casement", permanent: true },
      { source: "/upvc-pvcu-sliding-window-door-suite", destination: "/catalogue/upvc/upvc-sliding", permanent: true },
      { source: "/curtain-wall-facade-glazing-cortizo-tp52-equity", destination: "/catalogue/curtain-wall/cortizo-tp52-equity", permanent: true },
      { source: "/curtain-wall-facade-glazing-cortizo-tp52", destination: "/catalogue/curtain-wall/cortizo-tp52", permanent: true },
      { source: "/curtain-wall-facade-gulf-extrusion-alghurair-cw-50mm", destination: "/catalogue/curtain-wall/gulf-extrusion-cw-50", permanent: true },
      { source: "/al-barari", destination: "/portfolio/al-barari", permanent: true },
      { source: "/palm-jumeirah", destination: "/portfolio/palm-jumeirah", permanent: true },
      { source: "/emirates-hills", destination: "/portfolio/emirates-hills", permanent: true },
      { source: "/the-springs", destination: "/portfolio/the-springs", permanent: true },
      { source: "/centro-the-villas", destination: "/portfolio/centro-the-villas", permanent: true },
      { source: "/brookfields---damac-hills---dubai", destination: "/portfolio/brookfields-damac-hills", permanent: true },
      { source: "/phoenix-damac-hills", destination: "/portfolio/phoenix-damac-hills", permanent: true },
      { source: "/victory-heights---sports-city", destination: "/portfolio/victory-heights", permanent: true },
      { source: "/palmara-2-arabian-ranches", destination: "/portfolio/arabian-ranches", permanent: true },
      { source: "/jumeirah-village-triangle-district-5", destination: "/portfolio/jumeirah-village-triangle", permanent: true },
      { source: "/glass-room-abu-dhabi", destination: "/portfolio/glass-room-abu-dhabi", permanent: true },
      { source: "/phileas-fogg---dubai", destination: "/portfolio/phileas-fogg", permanent: true },
      { source: "/monty-s-montgomery-golf-course", destination: "/portfolio/montys-golf-course", permanent: true },
      { source: "/promotions", destination: "/catalogue/promotions", permanent: true },
      { source: "/reviews-uae-dubai-abu-dhabi", destination: "/reviews", permanent: true },
    ];
  },
};

export default nextConfig;
