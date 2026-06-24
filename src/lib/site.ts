// Single source of truth for the site's public base URL (no trailing slash).
// Override per environment with NEXT_PUBLIC_SITE_URL; defaults to the current
// Vercel production deployment. NEXT_PUBLIC_ vars are inlined at build time, so
// this resolves the same on the server and in the browser.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://swiftrooms-newbuild.vercel.app";
