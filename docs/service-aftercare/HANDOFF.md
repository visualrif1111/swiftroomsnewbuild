# Service & Aftercare — Handoff

Phase status, pre-production blockers and hardening notes for the service-call
flow. Design and behaviour: [ARCHITECTURE.md](./ARCHITECTURE.md),
[MEDIA.md](./MEDIA.md), [API.md](./API.md), [DATABASE.md](./DATABASE.md).

## Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Service Call wizard UX/UI | Complete |
| 2 | Supabase backend, real service requests, idempotent submit | Complete |
| 3 | Private media evidence uploads (Supabase Storage) | **COMPLETE / APPROVED / CLOSED** |

### Phase 3

**STATUS: COMPLETE / APPROVED / CLOSED**

- Initial implementation: `406475c`
- Final Phase 3 implementation commits:
  - `86fc43a`: plain-language media rejections and refresh re-add recovery
  - `d938771`: handle empty uploaded media objects (0-byte upload → `empty_file`, no 500)
- Final verified protected Preview:
  https://swiftrooms-newbuild-coitdofl7-visualrif.vercel.app
- Verified against the Development Supabase project and the private
  `service-evidence` bucket with controlled, clearly labelled test data. All
  test records and objects were removed afterwards.
- Not run: upload-token expiry (would need a 6-hour wait or a database edit) and
  real-iPhone testing (mobile was verified in emulation).

## ⛔ Pre-production blockers

Do not link `/service-call` publicly until these are resolved.

1. **Rate limiting / bot protection not implemented** on
   `POST /api/service-requests` and the media endpoints
   (`/api/service-requests/*/media*`). Add Vercel Firewall rate-limit rules
   and/or Turnstile on submit.
2. **Abandoned-upload cleanup not scheduled.** Schedule
   `POST /api/service-requests/maintenance/cleanup-media` (admin token), e.g.
   hourly, once a production project exists. Never run it with
   `olderThanHours=0`: it acts on the whole database.
3. **Video uploads capped at 50 MB** by the Supabase Free plan per-file limit.
   Long phone videos exceed it: consider a paid plan plus resumable uploads, and
   raise the bucket limit and `MEDIA_LIMITS.maxVideoBytes` together.
4. **No production Supabase database/storage.** Production deliberately has no
   Supabase variables. Create a separate project and apply migrations 0001 and
   0002 (0002 creates the private bucket).
5. **Production data-residency/region decision required.** The dev database is
   in US-East (`iad1`, same region as the functions). Decide before storing real
   customer media.
6. **Full-project lint has two pre-existing errors** in
   `scripts/migrate-site-settings-to-sanity.ts` (`no-explicit-any`, lines 85
   and 87). They are unrelated to Service & Aftercare; `eslint src tests` is clean.

## Hardening notes (not blocking)

### Stale content when a rejected file is retried on the same path

- Supabase Storage may briefly serve **stale content** when a rejected media
  file is retried **immediately** with the same `clientMediaId`, and so the same
  storage path. The server deletes the rejected object and resets the row to
  `PENDING`, but the verification read can still return the previous
  (rejected) bytes.
- The replacement file can therefore be rejected against the previously cached
  content (seen as `content_does_not_match_type` on a genuine JPEG). The same
  retry made minutes later succeeds.
- **Not reachable by customers through the current flow:** the UI does not
  offer Retry for rejected files (they're marked not retryable, and the customer
  removes the file or chooses another, which gets a new id and path).
- **Interrupted-upload Retry works correctly** (verified: network failure
  mid-upload → Retry → `UPLOADED`, no duplicate row).
- Logged for future hardening. The Phase 3 implementation is intentionally
  unchanged. Possible approaches: give each retry attempt a fresh storage path,
  or add a cache-busting parameter to the verification read.

### Testing note

`SERVICE_REQUESTS_ADMIN_TOKEN` is a Sensitive variable in the Preview
environment, so `vercel env pull` returns it empty. The Development value is
the same, so testers should use that.
