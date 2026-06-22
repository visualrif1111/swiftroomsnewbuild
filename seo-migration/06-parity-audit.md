# Swift Rooms — Full SEO Parity Audit

**Legacy:** `https://www.swiftrooms.ae/` · **New build:** `https://swiftrooms-newbuild.vercel.app/`
Source of truth: both live `sitemap.xml` files (fetched June 2026).

---

## SEO PARITY SCORE: **88 / 100**  ·  Launch-safety (no URL lost to 404): **100%**

| # | Dimension | Weight | Score | Notes |
|---|---|---|---|---|
| 1 | URL preservation (redirects, no 404) | 25% | **100%** | 210/210 legacy URLs 301/308 to a live page |
| 2 | Product pages | 10% | **100%** | 25/25 legacy products map to existing new pages |
| 3 | Project pages | 10% | **100%** | 15/15 legacy projects mapped (+9 net-new) |
| 4 | Category / range pages | 5% | **100%** | all 9 product categories present |
| 5 | Metadata (title/desc/canonical/OG) | 10% | **100%** | dynamic metadata on every new route |
| 6 | H1 structure | 5% | **100%** | every new page renders a single H1 |
| 7 | Schema / structured data | 10% | **100%** | breadcrumb + product + review + FAQ + article (≥ legacy) |
| 8 | Internal linking | 10% | **85%** | global nav + related products/blogs; redirected blog topics not individually linked |
| 9 | Blog content depth | 15% | **30%** | only 21 of 146 legacy articles recreated; rest topical-redirect |
| | **Weighted total** | | **88%** | |

> **Verdict:** the new build is **launch-safe today** — no ranking URL is lost (every legacy URL
> 301s to a live, topically-relevant page). The remaining 12 points are almost entirely **blog
> content depth**: 125 long-tail legacy articles are redirected rather than rebuilt.

---

## 1. Existing URL inventory (legacy)
**211 indexed URLs:** 1 home · 9 category/range · 25 product · 15 project + gallery · ~10 utility
(about, contact, enquire, showroom, reviews, resources, faqs, blog, projects, product-range) ·
**146 blog articles.** Full list: `01-url-inventory.md` + this file's redirect map.

## 2. New URL inventory (new build)
**98 URLs:** 1 home · 9 categories · 28 products · 24 portfolio · core pages (about, contact,
enquire, showroom, reviews) · technical hub (blog, faq, process, resources) · **21 blog articles.**
Generated from `src/app/sitemap.ts`.

## 3. Missing pages
No **structural** page is missing — every legacy product, project, category and utility page has a
live equivalent (see redirect map). The only "missing" surface is **blog articles** (§8).
Legacy utility pages with no 1:1 equal are folded sensibly: `/projects`→`/portfolio`,
`/product-range`→`/catalogue`, `/resources`→`/technical/resources`, `/faqs`→`/technical/faq`.

## 4. Missing metadata
**None at the page level.** Every new route exports dynamic `title`, `description`,
`alternates.canonical` (now on `www.swiftrooms.ae`) and Open Graph tags. Note: redirected legacy
URLs no longer carry their *own* unique meta — they inherit the redirect target's. For the 125
non-recreated blog posts this means their specific title/description equity consolidates into the
cluster target rather than being preserved verbatim.

## 5. Missing H1 structures
**None.** Every new page renders exactly one `<h1>`. Product/category/project/blog templates each
emit a contextual H1 from data. (Legacy had several project pages with an *empty* H1 — the new
build is an improvement here.)

## 6. Missing internal links
Largely present: global nav links Home → all major sections; category pages link to child products;
products link to related products + related blog posts; blog posts link back to products. **Gap:**
the 125 redirected legacy blog topics are not individually surfaced in navigation, so the long-tail
internal-link graph is thinner than legacy. **Action:** as articles are rebuilt (§8), add them to
`relatedBlogSlugs` and category "Guides" lists to avoid orphans.

## 7. Missing schema
**None missing — arguably richer than legacy.** New build emits: Organization, LocalBusiness,
BreadcrumbList, Product, ItemList, Review + AggregateRating (new `/reviews`), FAQPage, and Article
(blog). Recommend adding `Article` schema with `datePublished` to every rebuilt blog post (§8).

## 8. Missing blog content  ← **the headline gap**
Legacy **146 articles** vs new **21**. All 146 legacy URLs 301 to the closest topical article or
category hub (no 404s), distributed as:

| Redirect target (new) | Legacy articles absorbed |
|---|---|
| `/technical/blog/glass-specification-guide-uae` | 22 |
| `/technical/blog/lift-and-slide-doors-villa` | 19 |
| `/technical/blog/choosing-glazing-contractor-dubai` | 18 |
| `/technical/blog/choosing-aluminium-windows-dubai` | 17 |
| `/technical/blog/curtain-wall-glazing-uae-guide` | 13 |
| `/technical/blog/garden-rooms-uae` | 13 |
| `/technical/blog/bi-fold-vs-lift-and-slide-uae` | 13 |
| `/technical/blog/pivot-doors-uae` | 10 |
| `/technical/blog/upvc-vs-aluminium-windows-uae` | 9 |
| `/technical/blog/aluminium-window-finishes-uae` | 4 |
| others (maintenance, skylights, cortizo, hub) | 8 |

Redirects preserve *domain* authority and avoid 404s, but **125 ranking long-tail pages are
consolidated, not reproduced** — their individual keyword rankings will largely transfer to the
cluster target or decay. **To reach true 100% content parity, rebuild the highest-traffic legacy
articles under their *own* new slugs** (ideally keeping the legacy slug) and remove that URL from
the redirect map. Priority list below (§Recommendations).

## 9. Missing project pages
**None.** All 15 legacy projects map to live `/portfolio/*` pages; the new build adds 9 more
(Jumeirah Islands, Saadiyat, Al Majaz, Al Hamra, Dubai Hills, Meydan, Creek Harbour, Padel X, etc.).

## 10. Missing product pages
**None.** All 25 legacy product URLs (incl. alternate slugs like `/aluminium-sliding-door-cor-vision-plus`
and `/aluminium-sliding-door-window-cortizo-4900`) map to live product or gallery pages. The new
build adds products the legacy site lacked (Vetro Casement, Aluminium Sliding Windows, GE TB600 Door, etc.).

---

## Redirect map
**210 permanent (308) redirects** now live in `next.config.ts` (64 structural + 146 blog).
Machine-readable: `seo-migration/redirects.json`. Verified end-to-end (308 → 200). Slugs are
preserved where the new architecture allowed; where the nested structure required a change, the
closest semantic URL was chosen.

---

## Recommendations — expand SEO beyond the current site

**A. Recover blog equity (highest priority).** Rebuild the top ~30 legacy articles by traffic/links
under their own slugs (keep the legacy slug verbatim where possible), then drop them from the
redirect map. Start with the high-intent commercial queries the legacy site ranked for:
"aluminium door price UAE", "cortizo cor 70 windows", "upvc vs aluminium UAE",
"50mm vs 35mm curtain wall", "best bifold doors UAE", "low-e glass Dubai".

**B. Programmatic topic hubs.** Convert the 14 cluster targets into proper hub pages that list and
link their child guides — turns the consolidation into a deliberate, crawlable silo instead of a
redirect dumping ground.

**C. Add `Article` schema + author/date** to every blog post; add `FAQPage` to category pages (some
already have FAQs in data — expose them as schema everywhere).

**D. Net-new SEO surface to outrank legacy:**
- Location landing pages (Dubai / Abu Dhabi / Sharjah / RAK) tied to portfolio projects.
- Product comparison pages (Cor Vision vs Schüco, Cortizo vs Gulf Extrusion) — legacy already
  ranked for these; expand them.
- A "brands" silo (Cortizo, Vetromax, Gulf Extrusion, Deceuninck) with manufacturer authority pages.

**E. Technical hygiene:** submit the new `sitemap.xml` in Search Console at launch, keep the legacy
sitemap available briefly so Google recrawls and processes the 301s, and monitor Coverage for any
legacy URL not in the redirect map.

**F. Internal-link depth:** ensure every rebuilt article is referenced from at least one category
and one related product to rebuild the long-tail link graph that drove legacy rankings.
