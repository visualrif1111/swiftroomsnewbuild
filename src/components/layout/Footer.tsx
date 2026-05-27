import Link from "next/link";

const productLinks = [
  { label: "Aluminium Doors", href: "/catalogue/aluminium-doors" },
  { label: "Aluminium Windows", href: "/catalogue/aluminium-windows" },
  { label: "Curtain Wall & Facade", href: "/catalogue/curtain-wall" },
  { label: "Bi-fold Doors", href: "/catalogue/bi-fold" },
  { label: "uPVC Windows & Doors", href: "/catalogue/upvc" },
  { label: "Garden Rooms", href: "/catalogue/garden-rooms" },
  { label: "Skylights & Rooflights", href: "/catalogue/skylights" },
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

const contactLinks = [
  { label: "Get a Quote", href: "/enquire" },
  { label: "Showroom Visit", href: "/showroom" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-20">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-white font-bold text-xl tracking-widest uppercase">
                Swift<span className="text-[#c4a55f]">rooms</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-8">
              Premium aluminium windows, doors and glazing systems for UAE residential and commercial projects.
              Authorised partners for Cortizo, Gulf Extrusion and Vetromax.
            </p>
            <div className="space-y-2">
              <p className="text-label text-[#c4a55f]">Showroom</p>
              <p className="text-white/50 text-sm">
                Jebel Ali Industrial Area 1<br />
                Dubai, UAE
              </p>
              <a
                href="tel:+971000000000"
                className="block text-white/50 text-sm hover:text-white transition-colors mt-3"
              >
                +971 (0) 00 000 0000
              </a>
              <a
                href="mailto:info@swiftrooms.ae"
                className="block text-white/50 text-sm hover:text-white transition-colors"
              >
                info@swiftrooms.ae
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-label text-[#c4a55f] mb-5">Products</p>
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
            <p className="text-label text-[#c4a55f] mb-5">Company</p>
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

          {/* Contact */}
          <div>
            <p className="text-label text-[#c4a55f] mb-5">Contact</p>
            <ul className="space-y-2.5">
              {contactLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="text-label text-[#c4a55f] mb-4">Business Hours</p>
              <p className="text-white/40 text-sm">Sun – Thu: 9:00 – 18:00</p>
              <p className="text-white/40 text-sm">Sat: 10:00 – 15:00</p>
            </div>
          </div>
        </div>

        {/* Rule */}
        <div className="rule-gold mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Swiftrooms. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Authorised partners for Cortizo · Gulf Extrusion · Vetromax
          </p>
        </div>
      </div>
    </footer>
  );
}
