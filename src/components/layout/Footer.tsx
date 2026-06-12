import Link from "next/link";

const productLinks = [
  { label: "Aluminium Sliding Doors", href: "/catalogue/aluminium-sliding-doors" },
  { label: "Aluminium Bi-folding Doors", href: "/catalogue/aluminium-bi-folding-doors" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
  { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Insect Screens", href: "/catalogue/insect-screens" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Promotions", href: "/catalogue/promotions" },
  { label: "Gallery", href: "/catalogue/gallery" },
  { label: "Blog", href: "/technical/blog" },
  { label: "Resources", href: "/technical/resources" },
  { label: "FAQ", href: "/technical/faq" },
];

export default function Footer() {
  return (
    <footer className="bg-[#030213] text-white">
      {/* CTA strip */}
      <div className="bg-[#007969]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading text-xl font-bold text-white mb-1">
              Free quote &amp; site visit within 24 hours
            </p>
            <p className="text-white/70 text-sm">No obligation. Professional survey. Written specification.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
            <Link
              href="/enquire"
              className="bg-white text-[#007969] font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-gray-50 transition-colors text-center"
            >
              Get a Quote
            </Link>
            <Link
              href="/showroom"
              className="border border-white/40 text-white font-accent font-semibold text-[0.75rem] tracking-[0.12em] uppercase px-6 py-3 hover:bg-white/10 transition-colors text-center"
            >
              Visit Showroom
            </Link>
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
              Performance windows, doors and glazing systems for UAE residential and commercial
              projects. Engineered to perform. Built to outlast.
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="text-label text-[#007969] mb-3">Contact</p>
              <a href="tel:+971000000000" className="block text-white/50 hover:text-white transition-colors">
                +971 (0) 00 000 0000
              </a>
              <a href="mailto:info@swiftrooms.ae" className="block text-white/50 hover:text-white transition-colors">
                info@swiftrooms.ae
              </a>
              <p className="text-white/30 mt-3">
                Jebel Ali Industrial Area 1<br />Dubai, UAE
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-label text-[#007969] mb-5">Products</p>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-label text-[#007969] mb-5">Company</p>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-label text-[#007969] mb-5">Showroom Hours</p>
            <div className="space-y-2 text-sm text-white/40">
              <div className="flex justify-between gap-4">
                <span>Sun – Thu</span><span>9:00 – 18:00</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Saturday</span><span>10:00 – 15:00</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Friday</span><span>Closed</span>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-label text-[#007969] mb-3">Brand Partners</p>
              <div className="space-y-1.5 text-sm text-white/30">
                <p>Cortizo</p>
                <p>Vetromax</p>
                <p>Vetro</p>
                <p>Gulf Extrusions</p>
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
            Authorised partners for Cortizo · Vetromax · Vetro · Gulf Extrusions
          </p>
        </div>
      </div>
    </footer>
  );
}
