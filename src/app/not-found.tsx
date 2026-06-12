import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="max-w-lg text-center">
        <p className="text-[0.65rem] tracking-widest uppercase text-[#007969] mb-6">404</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1c1c1e] mb-4 leading-tight">
          Page not found.
        </h1>
        <p className="text-[#6b7280] leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try the links below to find what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/" className="btn-brand justify-center">
            Back to Home
          </Link>
          <Link href="/catalogue" className="btn-outline justify-center">
            Browse Products
          </Link>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-[0.65rem] tracking-widest uppercase text-gray-400 mb-5">Quick links</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Portfolio", href: "/portfolio" },
              { label: "About", href: "/about" },
              { label: "Showroom", href: "/showroom" },
              { label: "Blog", href: "/technical/blog" },
              { label: "FAQ", href: "/technical/faq" },
              { label: "Enquire", href: "/enquire" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.7rem] tracking-widest uppercase text-[#6b7280] border border-gray-200 px-4 py-2 hover:border-[#007969] hover:text-[#007969] transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
