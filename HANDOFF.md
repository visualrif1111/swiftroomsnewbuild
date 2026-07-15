# Swift Rooms — Pre-Launch Developer Handoff

Context: a full pre-launch audit (UX, responsive, security, performance, SEO,
a11y, forms, lead-gen) was completed. The launch-blocking, no-decision fixes are
already committed. This file tracks the items that need a **developer decision or
infrastructure setup** before or shortly after launch.

---

## 🔴 Blocker 1 — Lead persistence (leads can be silently lost)

**Problem.** Every form (`/api/enquire`, `/api/showroom-booking`,
`/api/resource-request`) delivers a lead only by:
1. a WhatsApp message via CallMeBot (`notifyWhatsApp` in each `route.ts`), and
2. a `console.log`.

There is **no durable, queryable store**. If `CALLMEBOT_API_KEY` is unset the
notify silently returns (`route.ts:6-7`) and the lead exists only in server logs.
No database, email, CRM, or Sanity write anywhere.

**Options (pick one):**
- **Sanity documents (recommended).** Add a `lead` document type and write each
  submission from the route with a write client. Leads become visible/manageable
  in Studio. Requires putting a **write-scoped Sanity token in Vercel** (today
  only a read token is in Vercel; `SANITY_API_WRITE_TOKEN` is documented as
  local/CI-only in `.env.example`). Add validation before writing (see Blocker 5).
- **Email via Resend.** Send each lead to a monitored inbox. Adds a
  `RESEND_API_KEY` env var + dependency.
- **Existing CRM / Sheet.** If there's a HubSpot/Zoho/Google Sheet, POST there.

**Acceptance:** a submission survives a CallMeBot outage and is retrievable later.

---

## 🔴 Blocker 2 — File uploads are discarded

**Problem.** The quote/enquire forms present a file picker, but only the file
**names** are sent (`LeadTypeform.tsx:216`, `FreeQuoteForm.tsx:275`). The actual
PDFs/drawings are dropped. Customers believe they attached plans; they didn't.

**Options (pick one):**
- **Relabel now (fastest, no infra).** Change the copy to "We'll request drawings
  after reviewing your enquiry" and remove the attach control. Ships today.
- **Wire real upload.** Upload to **Sanity assets** (coherent if leads go to
  Sanity) or **Vercel Blob** (`BLOB_READ_WRITE_TOKEN` + an upload endpoint), then
  reference the URLs on the lead. Add server-side type/size limits.

Also note: client-side file validation is inconsistent — `LeadTypeform` caps
type + 10 MB + 5 files; `FreeQuoteForm` only sets `accept`. Align these when
wiring uploads.

---

## 🟠 High-priority follow-ups (recommended before launch)

### 3. Set `NEXT_PUBLIC_SITE_URL` in Vercel production
`src/lib/site.ts:6` falls back to the Vercel preview domain when the env var is
unset. That makes **every canonical, OG URL, sitemap entry and JSON-LD `@id`**
resolve to `swiftrooms-newbuild.vercel.app` → wrong canonicals / duplicate
content. Set `NEXT_PUBLIC_SITE_URL=https://<real-domain>` (no trailing slash) in
the Production (and Preview) environment at domain cutover.

### 4. Server-side validation + spam protection on lead endpoints
None of the API routes validate input — `req.json()` is trusted verbatim — and
there is **no honeypot, rate limit, captcha, or body-size cap** anywhere. The
endpoints are public and infinitely submittable (WhatsApp/log flooding + DoS).
Add: zod validation, a honeypot field, and an IP rate limit (e.g. Upstash) or
Cloudflare Turnstile on `/api/enquire` at minimum. Cap request body size.

### 5. Content-Security-Policy
A conservative header set (X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, HSTS, Permissions-Policy) is now in `next.config.ts`. A **CSP is
deliberately not set** — it must be authored and tested against the YouTube hero
embed (`www.youtube.com`), Sanity Studio + `cdn.sanity.io`, framer-motion inline
styles, and inline JSON-LD `<script>` before enabling, or it will break
rendering. Add `Content-Security-Policy-Report-Only` first, verify no violations,
then promote.

### 6. Stop logging full PII
Each route does `console.log("[SWIFTROOMS ...]", { ...body })` — names, phones,
emails, addresses land in Vercel logs indefinitely (`enquire/route.ts:42` etc.).
Redact or drop when Blocker 1's real sink lands.

### 7. `.env.local` hygiene
`SANITY_API_WRITE_TOKEN` sits in the app's `.env.local` though only the blog
migration script uses it. Keep it out of the app runtime env.

---

## 🟡 Quality backlog (fast-follow, non-blocking)

- **Delete `/api/contact/route.ts`** — orphaned, unauthenticated, nothing posts
  to it (the `/contact` page uses `LeadTypeform` → `/api/enquire`).
- **Performance:** hero YouTube iframe forces 4K (`vq=hd2160` → `hd720` +
  idle-defer); migrate fonts from CSS `@import` to `next/font/google`; convert
  the 2.4 MB PNG hero + multi-MB product PNGs to WebP/AVIF; compress the 11–12 MB
  portfolio videos; add missing `sizes` to `fill` images; remove dead `gsap` +
  `@gsap/react` deps; slice homepage data server-side; adopt `LazyMotion`.
- **Accessibility:** add focus trap + focus restore to the CTA drawer modal
  (`CTAFormProvider.tsx`) and mobile menu overlay (`Navbar.tsx`); associate form
  labels via `htmlFor`/`id` in the drawer forms; announce form errors with
  `role="alert"`; add a skip-to-content link; pause control + `prefers-reduced-
  motion` gate on the USP marquee; raise low-contrast helper/placeholder text.
- **Responsive:** reuse the Navbar `position:fixed` scroll-lock for the CTA modal
  (iOS rubber-band); standardise the mobile/desktop split on one breakpoint
  (content flips at `md`, chrome at `lg` → inconsistent 768–1023 band).
- **PortableText:** scheme-validate CMS link `href`s (`PortableTextBody.tsx`) to
  block `javascript:`/`data:` (stored-XSS if an editor account is compromised).

---

## ✅ Already fixed and shipped to `main`

- LocalBusiness JSON-LD now uses the real contact (+971 50 526 9149,
  info@swiftrooms.ae) instead of a placeholder; Organization logo points to an
  existing asset (`/brand/logo-color.png`). — `layout.tsx`, `showroom/page.tsx`
- Catalogue mega menu opens on click/tap + keyboard focus (was hover-only);
  Technical dropdown opens on focus; both expose ARIA; Escape closes any open
  mega. — `Navbar.tsx`
- Baseline security headers on every route. — `next.config.ts`
- Global keyboard focus-visible ring; iOS input-zoom fix (form controls ≥16px on
  mobile). — `globals.css`
