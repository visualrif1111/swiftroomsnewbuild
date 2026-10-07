"use client";

import { usePathname } from "next/navigation";

/** Renders public-site chrome (navbar, footer, CTAs) everywhere except the staff dashboard. */
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
