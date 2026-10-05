# Service & Aftercare — Handoff

Phase status, pre-production blockers and hardening notes for the service-call
flow. Design and behaviour: [ARCHITECTURE.md](./ARCHITECTURE.md),
[MEDIA.md](./MEDIA.md), [AI.md](./AI.md), [API.md](./API.md), [DATABASE.md](./DATABASE.md).

## Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Service Call wizard UX/UI | Complete |
| 2 | Supabase backend, real service requests, idempotent submit | Complete |
| 3 | Private media evidence uploads (Supabase Storage) | **COMPLETE / APPROVED / CLOSED** |
| 4A | AI processing foundation (runs, leases, versioned reports, validation, privacy boundary, stub provider) | **APPROVED / CLOSED** (`7574a09`) |
| 4B | Voice transcription (OpenAI) | **APPROVED / CLOSED** (`c28d7d4`) |
| 4C | Report synthesis from text and voice (OpenAI, scr-1.1) | Implemented: awaiting closure approval |
| 4D–4F | Photos, video, evaluation | Not started |

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

### Phase 4A

- Foundation only: **no real AI provider and no OpenAI calls**. The deterministic
  stub labels its output `[STUB]`.
- Migration `0003_service_ai.sql` is applied to **Development only**, verified
  (catalog, grants, RLS, Phase 1–3 schema unchanged, multi-connection
  concurrency) and test data torn down.
- `SERVICE_AI_ENABLED` is unset everywhere, so processing is off. Finalize still
  returns 202, so customers are unaffected.

### Phase 4B

- OpenAI transcription (`gpt-transcribe` by default) behind the provider
  interface.
- Audio is read server-side from the private bucket; only the audio bytes and
  model are sent.
- Transcripts are cached in `service_media_analyses`.
- No report is produced until 4C.
- **Transcripts are assistive, not authoritative.** The original recording
  remains the evidence.
- **Confirmed limitation:** English spoken after Arabic in the same recording
  was dropped by `gpt-transcribe`; no hint, prompt or alternative OpenAI model
  fixed it. Mitigation (Option A, approved): a conservative "may be
  incomplete" flag; nothing is reconstructed. See AI.md.
- `OPENAI_API_KEY` is set in **Vercel Development only**. Preview and
  Production have no key, and AI stays disabled everywhere.

### Phase 4C

- Internal Service Call Reports (schema `scr-1.1`) synthesised by OpenAI
  (`gpt-6.1-sol`, Responses API, strict schema, `store:false`) from the
  customer's text and voice transcripts only. No photo or video analysis.
- **Fails closed.** A report is stored only if it passes API, structure,
  verbatim-quote provenance, semantic, forbidden-claim and size validation.
  Otherwise there is one corrective attempt with our rule codes, then FAILED.
- Contradictions are preserved (`CONFLICTING_CUSTOMER_INFORMATION`).
  `possiblyIncomplete` stays advisory. Confidence is never HIGH.
- No customer-facing output and no change to the service request lifecycle.
  AI remains off everywhere.

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
7. **AI processing is not production-ready.**
   - Before enabling `SERVICE_AI_ENABLED` anywhere with real customer data, a
     real provider must exist (4B+), and customer disclosure and legal sign-off
     (PDPL basis, OpenAI data retention: ZDR/MAM) must be in place.
   - Never enable it in Production while the provider is the stub.
   - Apply migration 0003 to the Production project with 0001 and 0002.
   - **OpenAI data retention:** by default, API data sits in abuse-monitoring
     logs for up to 30 days. Decide on Zero Data Retention or Modified Abuse
     Monitoring (needs OpenAI approval) and disclose AI processing of voice
     recordings to customers before enabling in Production.
8. **AI sweep not scheduled.** `POST /api/service-requests/maintenance/process-ai`
   (admin token) needs a scheduled job (e.g. every 10 min, Production cron),
   as does `cleanup-media`.

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

### AI processing (Phase 4A)

- The sweep can't detect a file **removed** after processing, because a deleted
  row leaves no timestamp. A new Finish or a manual reprocess handles it.
  Consider a request-level "evidence changed at" marker later.
- The finalize worker (`after()`) claims the oldest runnable run, which may not
  be the one just queued. Fine at current volume; the sweep handles the rest.
- The forbidden-claim and safety keyword rules are deterministic and
  English-only. They complement strict schema output and human review; they
  don't replace them.
- **Future enhancement: audio segmentation and conversion (decided out of 4B).**
  - Splitting recordings at pauses before transcription would likely recover
    mixed-language content.
  - Converting Ogg/Opus, raw AAC and 3GPP would let those be transcribed.
  - Both need audio decoding (ffmpeg in a Function, a media worker, or Vercel
    Sandbox) and should be designed together, before real customer audio is
    processed.
- **Voice formats not transcribed (SKIPPED in 4B by decision):** uploaded Ogg/Opus
  (e.g. WhatsApp voice notes), raw AAC and 3GPP are accepted by Phase 3 but not
  documented by OpenAI. They are SKIPPED, not converted. The in-app recorder
  (WebM/MP4) and common uploads (m4a, mp3, wav) are covered. Options:
  - ffmpeg in a Vercel Function (static binary, larger bundle, cold start);
  - a separate media worker or Vercel Sandbox;
  - narrowing the accepted voice formats.

