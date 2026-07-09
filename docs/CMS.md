# Swiftrooms Visual CMS — Architecture & Team Guide

This document describes how content is managed in the Swiftrooms website via
Sanity, including the visual page-builder, editable content types, the visual
editing workflow, onboarding, permissions and publishing.

---

## 1. Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │                 SANITY CONTENT LAKE          │
                    │  documents: page, post, project, product,    │
                    │  productCategory, brand, faq, resource,      │
                    │  testimonial, teamMember, timelineEntry,     │
                    │  processStep, certification, location,       │
                    │  homepage (singleton), siteSettings (single) │
                    └───────────────┬──────────────┬──────────────┘
                                    │              │
             read (published, CDN)  │              │  read (drafts, token)
                                    │              │
        ┌───────────────────────────▼───┐   ┌──────▼──────────────────────────┐
        │  Next.js frontend (App Router) │   │  Sanity Studio  /studio         │
        │  - server components fetch     │   │  - Structure (grouped nav)      │
        │    via client.fetch / sanity   │   │  - Presentation (Live Preview)  │
        │    Fetch (draft-aware)         │◄──┤  - Vision (GROQ)                │
        │  - PageBuilder renders blocks  │   │  Presentation loads the real    │
        │  - ISR (revalidate 60s)        │   │  frontend in an iframe with     │
        └───────────────┬────────────────┘   │  Draft Mode + click-to-edit     │
                         │                     └─────────────────────────────────┘
             published   │  draft (cookie via /api/draft-mode/enable)
                         ▼
                 Visitors (fast, cached, SEO-clean, no stega)
```

Key mechanisms:

- **`src/sanity/lib/client.ts`** — published read client (CDN, `stega.studioUrl`
  set but encoding OFF for published output).
- **`src/sanity/lib/live.ts`** — `defineLive({ client, serverToken })`. In Draft
  Mode, `sanityFetch` serves drafts + stega overlays. `serverToken` only — the
  read token is **never** sent to the browser.
- **Draft Mode routes** — `GET /api/draft-mode/enable` (validated by Sanity's
  signed preview-url-secret) and `/api/draft-mode/disable`.
- **Data layers** (`src/lib/*.ts`) — Sanity-first with `data.ts` fallback so the
  site never breaks if Sanity is unavailable. Slug enumeration
  (`generateStaticParams`) uses the plain published client (never Draft Mode).
- **Page builder** — `page` documents hold a reorderable `sections[]` array of
  block objects, rendered by `src/components/blocks/PageBuilder.tsx` at any URL
  via the catch-all route `src/app/[...slug]/page.tsx`.

Performance is preserved: pages stay **Static / SSG with 60s ISR**; Draft Mode
only switches to dynamic rendering when the preview cookie is present.

---

## 2. Editable content types

**Page builder**
- `page` — modular pages (landing, legal, thank-you, custom 404 content, and the
  migration target for existing pages). Composed of reorderable **blocks**:
  Hero, Rich text, Image, Gallery, Video, Statistics, Feature grid, Testimonials,
  Brand logos, FAQ, Call-to-action. Each block supports **hide**, **anchor id**
  and **background** controls.
- `pageSettings` — **Landing Pages**: one document per hard-coded route (About,
  Contact, Showroom, Enquire, Reviews, Catalogue, Technical, and their index
  sub-pages). These pages are composed from many collections, so they have no
  single owning document; `pageSettings` holds their editable **hero**, their
  **Page content** (section labels, list content and CTA copy — only the block
  for that route is shown), optional appended **sections** (the same 11 blocks),
  and **SEO**. Every field is optional: **blank keeps the page's built-in copy**,
  so nothing changes until an editor fills a field in. Seeding one doc per route
  also gives the Presentation tool a main document to resolve (removing the
  "Missing a main document" notice). Contact details (phone/email/address) are
  single-sourced from `siteSettings`, not duplicated here.

**Content**
- `post` — blog posts (title, slug, category, excerpt, cover image, Portable Text
  body, related products, SEO).
- `project` — portfolio projects (hero, gallery, location, products used,
  challenge/solution/outcome, SEO).
- `productCategory` — product ranges.
- `product` — individual products (hero, gallery, specs, benefits, downloads,
  category ref, SEO).
- `brand` — manufacturer partners (logo, tagline, description).

**Support**
- `faq` — reusable Q&A (category-tagged; general + product-category specific).
- `resource` — downloadable guides / brochures / specs.

**About & Company**
- `testimonial`, `teamMember`, `timelineEntry`, `processStep`, `certification`,
  `location`.

**Site management (singletons)**
- `homepage` — homepage hero + CTA content.
- `siteSettings` — contact, showroom, footer links, social.

Reusable objects: `seo`, `button`, and the 11 block types.

---

## 3. Global settings

Managed under **Site Management** in the Studio:

- **Homepage** (`homepage` singleton) — hero eyebrow/heading/subheading/CTAs,
  hero video id, bottom CTA.
- **Site Settings** (`siteSettings` singleton) — company info, contact
  (phone/email), showroom address + hours, footer link groups, social links.
- **Landing Pages** (`pageSettings`) — per-route hero, Page content chrome,
  appended sections and SEO for the composed pages (see §2). Edit under
  **Content → Landing Pages**, or click any headline/label on the page inside
  **Live Preview**. Run `scripts/migrate-page-settings-to-sanity.ts` once to seed
  the (blank) documents.

These feed the global Navbar/Footer, homepage and the individual landing pages.
(Announcement bar, mega-menu-as-data and design-system tokens are candidates for
the next phase — see §8.)

---

## 4. Visual editing workflow

1. Open **`/studio`** and sign in.
2. Click **Live Preview** (Presentation) in the top toolbar.
3. Pick a document (or navigate the site inside the preview iframe).
4. The real frontend loads with **Draft Mode** on. Editable text shows
   **click-to-edit** overlays (powered by stega).
5. Click a headline / paragraph → edit in the side pane → see it update.
6. For pages, use the **Sections** array to **add / duplicate / drag-reorder /
   hide / remove** sections.
7. When happy, **Publish**.

The published site never shows overlay characters — stega is only active inside
Draft Mode, so SEO/metadata/JSON-LD stay clean.

---

## 5. Team onboarding guide

**For a new editor:**
1. Ask an Administrator to invite you at **manage.sanity.io** (project:
   `Swiftrooms`).
2. Go to `https://swiftrooms-newbuild.vercel.app/studio` and sign in.
3. Use the left nav groups: **Content**, **Support**, **About & Company**,
   **Site Management**.
4. To edit a page visually, open **Live Preview**.
5. Every field has help text, character limits and validation — follow the
   guidance shown under each field.
6. Changes are **drafts** until you click **Publish**. Drafts are safe — they
   never appear on the live site until published.

**Editing a page (page builder):**
- Open **Content → Pages (Builder)** → pick or create a page.
- Set the **URL path** (slug). The page appears at that path automatically.
- Add sections with the **＋ Add item** control; drag the handle to reorder.
- Use each section's **Hide** toggle to stage content without deleting it.
- Preview via **Live Preview**, then **Publish**.

---

## 6. Permissions guide

Roles are managed in **manage.sanity.io → Members / Roles** (not in code).

- **Free plan**: two built-in roles — **Administrator** and **Editor**.
- **Growth / Enterprise plan**: **custom roles** (e.g. Marketing, Content
  Editor, Sales, Viewer) with per-document-type and per-field restrictions, plus
  content-release and scheduling controls.

Recommended role mapping once on a paid plan:
| Role | Access |
|------|--------|
| Administrator | Everything, incl. Site Settings & structure |
| Marketing | Pages, Blog, Testimonials, Resources, SEO |
| Content Editor | Pages, Blog, FAQs, Products, Portfolio |
| Sales | Read + comment; edit enquiry-related copy |
| Viewer | Read-only / preview |

Until a paid plan is enabled, use **Editor** for all content team members and
**Administrator** for leads.

---

## 7. Publishing workflow

- **Draft → Publish**: every change is a draft until published. Preview drafts
  via Live Preview.
- **Revision history / rollback**: built into Sanity — open a document's history
  (clock icon) to review and restore any past version. No setup required.
- **Scheduled publishing**: available via the Sanity **Scheduled Publishing**
  feature/plugin (plan-dependent) — schedule a document to go live at a set time.
- **Approvals**: multi-step approval requires the Sanity **Workflow** plugin or
  Content Releases (plan-dependent).
- **Revalidation**: published changes appear on the live site within ~60s (ISR).
  Live Preview reflects drafts instantly.

---

## 8. Future scalability recommendations

Delivered now: the page-builder foundation (11 blocks, catch-all route, visual
editing) + all existing content types editable at field level.

Recommended next phases (each is additive and low-risk):

1. **Migrate existing pages to the builder** — convert Homepage, About, Contact,
   Showroom, Technical hub into `page` documents section-by-section, verifying
   design + Core Web Vitals on each. (Deliberately not done automatically to
   protect the current hand-crafted design.)
2. **Global components as data** — announcement bar, mega-menu items, footer
   columns, trust bar, cookie banner as `siteSettings`/`navigation` documents.
3. **Design-system CMS** — a `theme` singleton for colours, typography scale,
   button styles, spacing and radii, mapped to CSS variables in `globals.css`.
4. **Media library** — adopt Sanity Media plugin / asset metadata (folders, alt
   text enforcement, usage tracking, focal points already supported via hotspot).
5. **More blocks** — pricing tables, comparison, steps/process, form embeds,
   maps, related-content, split-image-text.
6. **Image click-to-edit** — add `createDataAttribute` overlays for image and
   list fields (text already covered by stega).
7. **Roles + scheduling + approvals** — enable on a Growth/Enterprise Sanity plan
   (see §6, §7).
8. **Forms as data** — model form titles/fields/success messages as documents.

---

## Environment variables

| Var | Purpose | Exposure |
|-----|---------|----------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project | public (safe) |
| `NEXT_PUBLIC_SANITY_DATASET` | dataset | public (safe) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API version | public (safe) |
| `NEXT_PUBLIC_SITE_URL` | canonical base URL | public (safe) |
| `SANITY_API_READ_TOKEN` | server-side reads incl. drafts + preview-secret validation | **server only** |
| `SANITY_API_WRITE_TOKEN` | migration scripts only | **local/CI only** |

No secret is ever shipped to the browser. Draft preview is secured by Sanity's
signed preview-url-secret validated with the read token.
