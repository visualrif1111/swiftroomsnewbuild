# Swift Rooms — Media & Asset Audit

## Current state of the new build
- `src/lib/data.ts` image fields: **83 total**
- Pointing to **Unsplash stock**: **82**
- Pointing to real Swift Rooms photography: **0**
- ⚠️ Real project/product photography is NOT yet wired in — this is the core of Task #7.

## Available real Swift Rooms imagery (local sources)
| Source folder | Real images |
|---|---|
| `Downloads/swiftrooms-clone/*_files` (full page captures) | ~120 (56 large/photographic) |
| `Downloads/swiftrooms-final` | 42 |
| `Downloads/swiftrooms-organized` | 40 |
| `Downloads/swiftrooms-collected` | 40 |

## Gap analysis
- The legacy captures contain the **authentic project & product photography** referenced by each page,
  co-located with the HTML in matching `_files/` folders — these can be mapped 1:1 to the new
  product/project records via the page→URL inventory.
- Stock (Unsplash) slots (82) currently outnumber unique real photos available, so prioritise:
  1. Hero + homepage imagery
  2. The 13 portfolio projects with legacy pages (real project photos exist)
  3. The mapped product pages (Cor Vision, Cor 70, TB600, TP52, UPVC, etc.)
  4. Remaining net-new products → use closest real category photo, avoid stock where possible.

## Migration mechanics (recommended)
- Copy chosen assets into `public/brand/projects/<slug>/` and `public/brand/products/<slug>/`.
- Replace the `image:` Unsplash URLs in `data.ts` with the local `/brand/...` paths.
- Keep `next.config.ts` `remotePatterns` for `**.swiftrooms.ae` (allows hot-linking originals if preferred).

## ✅ OUTCOME (completed)
Strategy applied: **real photography where available, keep stock otherwise.**

- **20 real Swift Rooms photos migrated** into `public/brand/`:
  - `public/brand/products/` — 14 product heroes (Cor Vision 4600/4700/Plus, Cortizo bifold,
    Cor 70 hidden sash, TB600 tilt & turn, Cor 70 door, front entrance doors, Vetromax pivot,
    UPVC casement & sliding, TP52, TP52 Equity, GE CW-50)
  - `public/brand/categories/` — 6 category heroes (sliding doors, bi-folds, windows, doors, UPVC, curtain wall)
- `data.ts`: 20 `image:` fields repointed to local `/brand/...`; **62 remain on Unsplash**.
- The 62 stock refs are **portfolio projects** (no real project photos were saved in any local
  capture — galleries were lazy-loaded) and **net-new product lines** with no legacy photo.

> **NOTE on the "184 images" estimate:** only ~20 unique real product photos actually exist locally.
> The legacy page captures (`*_files/`) saved product imagery but **zero project photography**.
> To replace the remaining 62 stock images, a fresh export of project/showroom photos is needed.
