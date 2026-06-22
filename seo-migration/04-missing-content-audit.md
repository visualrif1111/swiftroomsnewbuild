# Swift Rooms — Missing Content Audit

> ✅ **RESOLVED (Task #6):** all three pages below are now built — Cortizo Alu-Steel & Gulf Extrusion Montana products added to `data.ts`, and `/reviews` created. Their legacy URLs now 301 directly to the new deep URLs.

Pages that exist on the legacy site but have **no direct equivalent** in the new build yet.
Until built, their legacy URLs 301 to the closest parent (see `03-redirect-plan.md`).

| Legacy URL | Legacy H1 / Purpose | Action Required | Interim 301 Target |
|---|---|---|---|
| `/aluminium-windows-cortizo-alu-steel-classic-and-modern` | "Alu-Steel – Classic and Modern" (product) | Add **Cortizo Alu-Steel** product to `data.ts` under `aluminium-windows` → `/catalogue/aluminium-windows/cortizo-alu-steel` | `/catalogue/aluminium-windows` |
| `/aluminium-sliding-door-window-gulf-extrusion-al-ghurair-montana` | "Montana Aluminium Sliding Door" (product) | Add **Gulf Extrusion Montana** product to `data.ts` under `aluminium-sliding-doors` → `/catalogue/aluminium-sliding-doors/gulf-extrusion-montana` | `/catalogue/aluminium-sliding-doors` |
| `/reviews-uae-dubai-abu-dhabi` | "Exceptional results…" (testimonials/reviews) | Build **/reviews** page reusing existing testimonials data | `/about` |

> After these pages are built (Task #6), update `seo-migration/redirects.json` + `next.config.ts`
> so the three legacy URLs point to their exact new deep URLs instead of parent fallbacks.

## New pages in the build with NO legacy equivalent (net-new SEO surface)
These are additive and require fresh metadata + internal links:
- `/technical/blog` + `/technical/blog/[slug]` (blog system — legacy site had none captured)
- `/technical/faq`, `/technical/process`, `/technical/resources`
- `/catalogue/brands`
- New portfolio projects: `padel-x`, `jumeirah-islands-villa`, `saadiyat-island-villa`, `al-majaz-waterfront-villa`, `al-hamra-villa-rak`, `dubai-hills-villa`, `meydan-townhouse`, `creek-harbour-villa`
- New product lines: `cortizo-cor-70-industrial`, `cortizo-casement`, `vetro-casement`, `gulf-extrusion-tb600-door`, `vetromax-pivot-door`, `vetromax-vf35`, `glass-conservatory`, `retractable-fly-screen`, `fixed-rooflight`, `motorised-skylight`
