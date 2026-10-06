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
| 4C | Report synthesis from text and voice (OpenAI, scr-1.1) | **APPROVED / CLOSED** (`7e91e03`) |
| 4D | Photo evidence analysis (per-photo vision, server-injected observations, scr-1.2) | **APPROVED / CLOSED** (`dba9b24`) |
| 4E | Video evidence analysis (isolated Sandbox media worker, frames + video audio, scr-1.3) | **APPROVED / CLOSED** (`379b42a`) |
| 4F | AI evaluation, reliability, safety and cost controls (eval-1, scr-1.4) | Implemented: awaiting review ([EVALUATION.md](./EVALUATION.md)) |

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

### Phase 4D

- Each supported photo (JPEG, PNG, WebP) is analysed on its own from an
  in-memory, metadata-free derivative.
- Observations are validated (`po-1`, fails closed) and injected into the
  report by the server (`scr-1.2`). Customer/photo conflicts are kept as
  `EVIDENCE_DISCREPANCY`.
- HEIC/HEIF is **SKIPPED** (no decoder, by decision).
- Exact duplicates are analysed once.
- No derivatives are stored. `sharp` is now a direct dependency.

### Phase 4E

- Untrusted video is parsed/decoded **only** in an isolated **Vercel Sandbox**
  microVM (pinned snapshot; network deny-all; non-persistent; no env, tags or
  identifiers; bytes only under a neutral name; destroyed on every path). The
  application function never runs ffmpeg; without worker configuration videos
  are SKIPPED.
- Worker build: **FFmpeg 8.1.3, LGPL-2.1-or-later** (no gpl/nonfree/version3,
  no external codec libraries) + zimg (WTFPL) — `scripts/media-worker/`.
  Snapshot built for Development verification:
  `snap_zh3HQqRCUkdFxxQXT4VClkk7UWWf` (bom1, no expiry). Not configured in any
  Vercel environment.
- Proven codecs: H.264 (MP4/MOV), HEVC incl. HLG HDR (MOV), VP8/VP9 (WebM).
  SKIPPED: AV1, ProRes and other codecs (`VIDEO_NOT_SUPPORTED`).
- ≤ 8 frames per video, deterministic (`vs-1`), de-duplicated; each analysed
  alone (`po-1` + single-frame temporal rule). No AI temporal claims; every
  analysed video gets `BEHAVIOUR_OVER_TIME`.
- Video speech → 4B transcription → `VIDEO_AUDIO` (customer-reported).
- > 180 s: PARTIALLY ANALYSED (frames across the video, speech to 03:00).
- No migration. `@vercel/sandbox` is a new direct dependency (imported lazily,
  only when a video is processed).

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
   customer media. **Phase 4E adds the media-worker region**
   (`SERVICE_AI_VIDEO_WORKER_REGION`, explicit, no default): Development
   verification used `bom1` (Mumbai; Vercel Sandbox has no UAE region). The
   snapshot exists only in the region it was built in.
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
     recordings **and photos** to customers before enabling in Production.
     Image inputs may still be retained for abuse review in rare cases, even
     under Modified Abuse Monitoring.
   - OpenAI offers **UAE regional processing** for `/v1/responses`; consider it
     in the data-residency decision (blocker 5).
8. **AI sweep not scheduled.** `POST /api/service-requests/maintenance/process-ai`
   (admin token) needs a scheduled job (e.g. every 10 min, Production cron),
   as does `cleanup-media`.
9. **Video worker (Phase 4E) before any Production AI:**
   - Legal sign-off on **H.264/HEVC patent licensing** for server-side decoding
     (the FFmpeg build's copyright licence is LGPL; patents are separate).
   - Build the worker snapshot in the Production team/region and set
     `SERVICE_AI_VIDEO_WORKER_SNAPSHOT` / `SERVICE_AI_VIDEO_WORKER_REGION` there
     (deliberately unset everywhere today). Rebuild for FFmpeg security releases
     (`scripts/media-worker/build-snapshot.mjs`; bump nothing else — the new
     snapshot id changes the worker version and cache keys).
   - Sandbox usage is billed (≈ 15–35 s of a 2-vCPU microVM per video); add
     spend monitoring with 4F cost controls.
   - Long AI runs: a request with several videos can approach the function's
     300 s default; runs resume from the per-layer caches if cut off, but
     consider `maxDuration` on the AI routes or a queue (Vercel Queues).
   - Disclose AI processing of **video and its audio** to customers.
10. **AI evaluation follow-ups (Phase 4F) before any Production AI:**
    - eval-1 is **synthetic** (drawn scenes, TTS speech). Re-run the harness on a
      small set of **consented real** service cases (photos, phone videos,
      voice notes) and compare with `tests/service-call/evals/baseline/`.
    - Decide on **image PII redaction** (design in EVALUATION.md; new
      dependency) together with OpenAI ZDR/MAM and customer disclosure.
    - Decide and, if wanted, enforce the proposed **analysis budgets**
      (e.g. ≤ 3 videos analysed per request) and set spend alerts (OpenAI
      project budget, Vercel Sandbox usage).
    - HEIC remains unsupported (many iPhone photos not analysed).

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
- **HEIC/HEIF photos (deferred from 4D):** they are SKIPPED with a notice. A
  decoder (e.g. libheif via WebAssembly, LGPL) or conversion step is a future
  media-normalisation enhancement, alongside audio segmentation and
  conversion. HEIC is real: 6 of 57 uploaded Development photos.
- **Personal data inside photos** (faces, documents, house numbers) is flagged
  (`personalInfoVisible`) but not redacted.

### Security incident log

- **2026-10-05 — Development Vercel OIDC token displayed (closed).** During
  Phase 4E verification a shell command printed the Development-scoped Vercel
  OIDC token (project `swiftrooms-newbuild`, environment `development`) in the
  local session's tool output. Not the OpenAI or Supabase keys; not committed,
  logged to any service or sent elsewhere. The token is short-lived (≈ 12 h
  from issue) and expires on its own; all temporary credential files were
  deleted and scanned afterwards. Status: closed / expiring. Lesson: print only
  presence/length checks for secrets, never `${VAR:-…}`-style expansions.

### Phase 4F

- Evaluation harness and golden set `eval-1` (106 synthetic scenarios),
  pre-registered thresholds, real Development evaluation, regression
  baseline, scorecard: [EVALUATION.md](./EVALUATION.md).
- Fixed from the findings below: urgency over-escalation (false urgent
  15% → 0% at 100% recall), product-selection mismatch separated
  (`PRODUCT_SELECTION_MISMATCH`; misfiled 80% → 0%), instruction disclosure
  rejected, spoken phone numbers/emails scrubbed, frame de-dup `vs-2`, stage
  timings recorded. No migration; no new dependency.
- Decisions left open (pre-launch): image PII redaction (design in
  EVALUATION.md — new dependency), HEIC, explicit per-request analysis
  budgets (proposed in EVALUATION.md, not enforced), `gpt-6-luna` evaluation.

### Earlier findings carried into 4F (now resolved or measured)

- **Urgency over-escalation** — fixed in 4F (calibrated v4 prompt, CONTAINED_DAMAGE,
  evidence rule for URGENT); measured.
- **CONFLICTING_CUSTOMER_INFORMATION overused for product-selection mismatch** —
  fixed in 4F (PRODUCT_SELECTION_MISMATCH); measured.
- **Cost evaluation** — measured in 4F ($0.009–0.031 per typical request);
  `gpt-6-luna` not evaluated (deferred); transcript completeness: 1/19 false flags.
- **4E (recorded, not changed):** urgency over-escalation also seen with video
  speech ("there is a crack in the glass" → URGENT `BROKEN_OR_UNSTABLE_GLASS`,
  customer-reported); visible PII in video frames is flagged, not redacted;
  near-duplicate threshold (Hamming ≤ 6) collapses slow pans/zooms to one
  frame — evaluate against real phone footage; HEIC and mixed-language
  transcription unchanged; multi-frame temporal comparison deferred.
  (4F: threshold tuned to 4 on synthetic footage; real phone footage still to be
  evaluated with consent; mixed-language loss not reproduced; HEIC unchanged.)

