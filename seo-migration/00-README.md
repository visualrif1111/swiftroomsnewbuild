# Swift Rooms — SEO Migration Package

Audit + migration plan to rebuild on the new architecture while preserving legacy SEO equity.
**Strategy B:** keep the new nested URL structure; 301/308-redirect every legacy flat URL to its new route.

| Doc | Purpose | STEP |
|---|---|---|
| `01-url-inventory.md` | All 34 legacy indexed URLs + title/H1/meta | 1, 10 |
| `02-seo-mapping.md` | Old → New mapping, redirect flag, SEO status | 2, 10 |
| `03-redirect-plan.md` | 33 × 301/308 redirects (implemented) | 1, 10 |
| `04-missing-content-audit.md` | Pages to build (Alu-Steel, Montana, Reviews) + net-new pages | 10 |
| `05-asset-audit.md` | Real photography inventory vs current stock usage | 6, 10 |
| `06-parity-audit.md` | Full live-vs-live SEO parity audit + **88/100 score** + expansion plan | — |
| `redirects.json` | Machine-readable redirect source of truth → `next.config.ts` (210 rules) | — |

## Status
- [x] STEP 1 URL audit · STEP 2 mapping · STEP 3 redirect plan
- [x] metadataBase → production domain (Task #4)
- [x] **210** × 301/308 redirects live in `next.config.ts`, verified (covers all 146 blog URLs)
- [x] Build 3 missing pages: Alu-Steel, Montana, Reviews (Task #6)
- [x] Migrate real imagery where available (Task #7)
- [x] Full SEO parity audit vs live legacy site — **88/100**, launch-safe (no 404s)
- [ ] Recover blog content depth: rebuild top ~30 legacy articles (drives score 88 → ~100)
