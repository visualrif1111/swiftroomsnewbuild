"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyMobileCTA() {
  const pathname = usePathname();
  if (pathname === "/enquire") return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] safe-bottom">
      <Link
        href="/enquire"
        className="flex-1 btn-brand justify-center py-3 text-[0.75rem]"
      >
        Get a Quote
      </Link>
      <Link
        href="/showroom"
        className="flex-1 btn-outline justify-center py-3 text-[0.75rem]"
      >
        Showroom
      </Link>
    </div>
  );
}
