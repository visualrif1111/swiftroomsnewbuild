// Public Sanity config. projectId + dataset are NOT secrets — they are safe to
// expose to the browser (hence the NEXT_PUBLIC_ prefix). API tokens are read
// server-side only and never live here.
//
// These are intentionally NON-throwing: if the env vars aren't set (e.g. a
// Vercel build before they're configured), the blog data layer detects the
// missing projectId and falls back to data.ts, so the build never breaks.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
