# Service & Aftercare — AI processing (Phase 4)

Turns a submitted service request and its evidence into a structured
**Service Call Report** for the service team to review. AI assists staff; it
is never the technical authority, and nothing it produces is shown to the
customer.

> **Status:**
> - **Phase 4A:** foundation (queue, leases, versioned reports, validation, privacy boundary).
> - **Phase 4B:** voice transcription with OpenAI.
>
> **No Service Call Report is generated with the real provider yet.** Report
> synthesis arrives in 4C, and photo/video analysis in 4D/4E. AI is **off in
> every deployed environment** (`SERVICE_AI_ENABLED` unset). The deterministic
> stub remains for tests and local work.

## Pipeline

```
request saved (Phase 2) ─▶ evidence uploaded (Phase 3) ─▶ trigger
   triggers: POST …/finalize (customer Finish) · sweep (maintenance endpoint) · manual reprocess (admin)
        │
        ▼
enqueue_service_ai_run()      idempotent; one active run per request
        │
claim_service_ai_runs()       lease per worker; SKIP LOCKED; expired leases recovered
        │
processRun()  (ai/pipeline.ts)
   per media, cached by input hash:  VOICE → transcript · PHOTO → observations · VIDEO → skipped until 4E
   buildServiceAiInput()  → privacy boundary (no contact details, references, tokens, URLs)
   provider.synthesiseReport() → validateReportContent()  (schema + semantics + forbidden claims), 1 retry
        │
complete_service_ai_run()     report version n+1; previous version superseded (never overwritten)
   or fail_service_ai_run()   retryable → QUEUED with backoff; otherwise FAILED (no report)
```

AI processing **never** reads or writes `service_requests.status` or
`status_history`. Its state lives in `service_ai_runs`.

## Voice transcription (Phase 4B)

```
private voice file (service-evidence) ──service role, server-side──▶ bytes
   └─ format check (no transcoding) ─▶ POST https://api.openai.com/v1/audio/transcriptions
        └─ validated transcript ─▶ service_media_analyses (kind TRANSCRIPT, cached)
             └─ available to report synthesis (4C)
```

| | |
|---|---|
| Provider | `server/openai-provider.ts`, behind `ServiceAiProvider`. Selected only with `SERVICE_AI_PROVIDER=openai` and `OPENAI_API_KEY`. |
| API | `POST /v1/audio/transcriptions`, `multipart/form-data`, `response_format=json` (returns `text`, detected `languages[]`, `usage`). Called with `fetch`: one endpoint, explicit 90 s timeout, no hidden retries (the run queue retries). The OpenAI SDK will be reassessed for 4C structured output. |
| Default model | **`gpt-transcribe`**: OpenAI's recommended model for "transcribing recorded speech in its original language" (docs checked 2026-10-05; $0.0045/min). Override with `SERVICE_AI_MODEL_TRANSCRIBE` (for example `gpt-4o-transcribe` or `gpt-4o-mini-transcribe`). The model is recorded on every cached transcript and run. |
| Sent | The audio bytes as `voice-note.<ext>`, `model`, `response_format`. **Nothing else**: no prompt, keywords, language hints, customer details, reference, original file name or URL. |
| Not sent | Photos and videos (skipped), the description, any request metadata |
| Size limit | 25 MB (OpenAI's documented limit, the same as our voice-note limit) |

### Formats

OpenAI documents mp3, mp4, mpeg, mpga, m4a, wav and webm.

| Our MIME type | Handling |
|---|---|
| `audio/webm` (Chrome/Firefox/Edge recorder), `audio/mp4` / `audio/x-m4a` (Safari recorder, iPhone voice memos), `audio/mpeg`, `audio/wav` / `audio/x-wav` | sent as-is, with no transcoding |
| `audio/ogg` (e.g. WhatsApp voice notes), `audio/aac` (raw ADTS), `audio/3gpp` | **SKIPPED** (`audio_format_not_supported`): not documented by OpenAI, so not guessed at. The original audio stays available to staff, and the report (4C) will show the file as not transcribed. |

Converting ogg, aac and 3gpp needs a transcoder (ffmpeg in the function, or a
separate media service). **Not in 4B, by decision.** It is recorded as a future
enhancement together with pause-based segmentation (HANDOFF.md).

### Transcript content and languages

- The transcript is stored **verbatim**. Only control characters are removed
  and surrounding whitespace is trimmed. It is never summarised, translated,
  diagnosed or "corrected".
- **No language hint is sent.** The model auto-detects, which keeps
  mixed-language speech (for example Arabic and English) in its original
  languages. Detected languages are stored: `language` holds the primary one,
  and `result.languages` holds all of them.
- OpenAI's transcription docs list language-code formats but no per-language
  quality figures.
- **Verified in Development** (synthetic text-to-speech, 2026-10-05):
  - English: verbatim.
  - Arabic: exact.
  - Hindi: one small word variation.
  - English then Arabic in one recording: both kept.
  - Silence: empty, flagged.
- **Not verified:** Urdu (no test voice available) and real human recordings.
- No speech recognised: the transcript is `COMPLETED` with empty text and
  `result.noSpeechDetected = true`. The emptiness is preserved, never filled in.
- The API returns no confidence score for `gpt-transcribe`. The report stage
  (4C) must treat transcripts as machine-generated customer statements.

### ⚠️ Confirmed limitation: mixed-language speech can lose content

With `gpt-transcribe`, a recording with **Arabic followed by English** came
back with **only the Arabic**. The English sentence was silently dropped, and
the response reported only `["ar"]`.
- English followed by Arabic was transcribed fully.
- These did not help: language hints (`ar`,`en`, two parameter spellings), a
  neutral prompt, or `gpt-4o-transcribe`.
- `whisper-1` kept the English but romanised the Arabic and misheard a word,
  so it isn't faithful either.

The test audio was synthetic text-to-speech, so real speakers may differ, but
the risk is real for customers who switch languages.

Therefore:

- **The original recording is the authoritative evidence.** It is never
  modified or replaced, and staff can always play it (signed read URL, admin).
- **A transcript is assistive, not authoritative.** It may be incomplete or
  contain recognition errors.
- **"May be incomplete" flag** (`ai/transcript-quality.ts`), stored in
  `result.completeness`:
  - `possiblyIncomplete`, `signals`, `assessed`, `durationSeconds`, `charsPerSecond`.
  - Signals:
    - `no_speech_detected`;
    - `low_text_for_duration`: fewer than **5** non-space characters per
      second on recordings of at least **3 s**.
  - Duration comes from the provider's usage (seconds), else the browser's
    recorded duration. If neither is known, the flag is `assessed: false`.
  - Calibrated on the Development samples: complete transcripts measured
    7.1–13.6 chars/s, and the truncated one 3.4–3.5. It is provisional, to be
    tuned in 4F.
  - Slow or hesitant speech can also trigger it.
  - The flag says only that the transcript *may* be incomplete. It never
    claims content is missing, and nothing is reconstructed, inferred or
    merged from other models.
  - It is carried to the report stage as `possiblyIncomplete` on each
    transcript (and in the server-owned `transcripts[]` of a report).
- **Recommended future fix (not in 4B):** split recordings at pauses and
  transcribe each part. That needs audio decoding, the same infrastructure as
  format conversion (below), so the two should be decided together.

### Caching and idempotency

- The cache key is `input_hash` = media id + verified size + `TRANSCRIPT` +
  provider + model + prompt version (`openai-transcribe-1`).
- An unchanged file is **transcribed once**. Repeated finalize, manual
  reprocess and later report runs all reuse it (`usage.cacheHits`).
- Changing the model or request parameters gives a new key, so a new
  transcript is made and the old row is kept.
- A `COMPLETED` row is never overwritten. `FAILED`/`SKIPPED` rows can be
  replaced by a later attempt.
- Not implemented: an explicit "refresh transcripts" switch on reprocess.
  Changing model or version is the refresh path.

### Failure handling

All of these stay inside AI processing. The service request, its status and
its history are never touched, and customers never see provider errors.

| Situation | Code | Effect |
|---|---|---|
| timeout, network error | `provider_timeout`, `provider_network_error` | retryable: run requeued (backoff, up to 3 attempts); last attempt → file `FAILED` |
| 429 rate limit | `provider_rate_limited` | retryable, same as above |
| 5xx | `provider_unavailable` | retryable, same as above |
| malformed response | `provider_malformed_response` | retryable; never cached as a transcript |
| 400/415/422 (corrupt or unsupported content) | `audio_unreadable` | file `FAILED`, not retried |
| 413 or over 25 MB, empty file | `audio_exceeds_provider_limit`, `audio_empty` | file `FAILED`, not retried |
| undocumented format | `audio_format_not_supported` | file `SKIPPED`, no call |
| 401/403, quota exhausted, unknown model | `provider_auth_failed`, `provider_quota_exceeded`, `provider_model_not_found` | **whole run** requeued (not the file's fault), then `FAILED` |

Provider error messages are discarded. Only these codes are stored.

### Run outcome in 4B

The OpenAI provider offers transcription only. After preparing evidence, the
run ends with status `FAILED` and `error_code = report_stage_not_available`.
`error_detail` lists each file's outcome, and **no report is created**.
Automatic triggers won't repeat it (same inputs and versions). When 4C ships
with new pipeline and prompt versions, requests are processed again and the
cached transcripts are reused.

### Provider selection (fails closed)

| `SERVICE_AI_ENABLED` | `SERVICE_AI_PROVIDER` | Result |
|---|---|---|
| unset/false | any | disabled: nothing queued |
| true | unset | **not configured**: nothing queued or claimed |
| true | `openai`, no `OPENAI_API_KEY` | **not configured** |
| true | `openai` + key | OpenAI transcription |
| true | `stub` | stub, **refused when `VERCEL_ENV=production`** |
| true | anything else | not configured |

"Not configured" affects AI processing only. Finalize still returns 202,
reprocess returns `409 ai_not_configured`, the sweep reports
`configured: false`, and the reason is logged without secrets.

### Data retention (OpenAI)

- By default, OpenAI keeps API inputs and outputs in abuse-monitoring logs for
  up to 30 days.
- Zero Data Retention or Modified Abuse Monitoring need OpenAI's approval.
- Customer voice recordings must not be sent in Production until this, and the
  customer disclosure, are decided (HANDOFF.md).

## Code

| Path | Role |
|---|---|
| `src/lib/service-call/ai/report-schema.ts` | Report schema `scr-1`: types, closed vocabularies, limits |
| `ai/report-validation.ts` | Structural + semantic validation; mandatory unknowns |
| `ai/safety.ts` | Forbidden-claim scanner; safety keyword net over customer text |
| `ai/fingerprint.ts` | Input fingerprint; per-media input hash |
| `ai/input-builder.ts` | The privacy boundary: the only place deciding what a model may see |
| `ai/provider.ts` | `ServiceAiProvider` interface (transcribe, observe, synthesiseReport) |
| `ai/transcript-quality.ts` | Conservative "transcript may be incomplete" heuristic |
| `ai/stub-provider.ts` | Deterministic stub (tests and local work; refused in Production) |
| `server/openai-provider.ts` | OpenAI transcription (4B); observation and synthesis not offered yet |
| `ai/run-store.ts` | Storage interface the pipeline depends on |
| `ai/pipeline.ts` | Processes one claimed run |
| `server/ai-config.ts` | `SERVICE_AI_ENABLED`, limits, fail-closed provider selection (server-only) |
| `server/ai-store.ts` | Supabase implementation of the store (server-only) |
| `server/ai-worker.ts` | `enqueueAiProcessing`, `runAiWorker`, `sweepAi` (server-only) |
| `supabase/migrations/0003_service_ai.sql` | Tables, functions, triggers, RLS |

`ai/` has no vendor imports (no Next.js, Supabase or OpenAI), in line with the
portability rule in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Processing states

| Level | States |
|---|---|
| Request (derived) | `NOT_STARTED` (no runs) or the latest run's status |
| Run (`service_ai_run_status`) | `QUEUED` → `PROCESSING` → `COMPLETED` / `PARTIAL` / `FAILED` (`CANCELLED` reserved for operators) |
| Per media (`service_media_processing_status`, from 0002) | `COMPLETED` / `FAILED` / `SKIPPED` in `service_media_analyses` |
| Report review (`service_ai_review_status`) | `AWAITING_REVIEW` → `APPROVED` / `EDITED` / `REJECTED` (no UI yet) |

- **COMPLETED**: every uploaded file was used.
- **PARTIAL**: a report exists, but some evidence couldn't be processed. `processing.mediaCoverage` in the report says which file and why. In 4A every video is `SKIPPED` (`video_processing_not_available`).
- **FAILED**: no report. Causes: attempts exhausted, invalid output twice, request missing, or a lease expired with no attempts left.

## Runs, leases and idempotency

All rules are enforced in SQL, so they hold for any number of workers.

- **One active run per request.** A partial unique index allows only one
  `QUEUED`/`PROCESSING` run.
- **Enqueue** (`enqueue_service_ai_run`) locks the request row and returns one of:
  - `created`;
  - `active_run_exists`;
  - `already_processed` / `already_failed`: an automatic trigger with the same fingerprint and versions as a finished run;
  - `auto_run_limit_reached`: 3 automatic runs per request.
- **MANUAL** always creates a new run (unless one is active). This is intentional reprocessing.
- **Claim** (`claim_service_ai_runs`) takes `QUEUED` runs that are due, plus
  `PROCESSING` runs whose lease has expired. It uses `FOR UPDATE SKIP LOCKED`, so
  concurrent workers never share a run. Each claim is an attempt (3 maximum). An
  expired run with no attempts left becomes `FAILED` (`lease_expired`).
- **Lease** is 300 s, renewed before and after every step. Only the lease owner
  can complete or fail a run. A worker that lost its lease stops and writes nothing.
- **Fail** (`fail_service_ai_run`): a retryable error with attempts left goes
  back to `QUEUED` with a 2-minute × attempts backoff; anything else becomes `FAILED`.
  - Provider outages on one file are retried with the whole run.
  - On the last attempt, the file is reported as not processed instead (the report is `PARTIAL`).

### Input fingerprint

SHA-256 over canonical JSON. It includes:
- the problem description (trimmed, NFC);
- the product categories (deduplicated and sorted);
- the "other" product and the existing-customer flag;
- for each **UPLOADED** file: id, type, MIME type and verified size, sorted by id.

It excludes timestamps, statuses, tokens, the reference and contact details. Identical inputs therefore always give the same fingerprint, while any change to what processing reads gives a new one.

Per-file results are cached in `service_media_analyses` under an **input hash**:
media id, verified size, step, provider, model and prompt version.
- Reprocessing reuses them, so an unchanged file is transcribed or analysed once.
- A `COMPLETED` entry is never overwritten.

## Triggers

| Trigger | When | Notes |
|---|---|---|
| `POST /api/service-requests/:reference/finalize` | The wizard calls it, fire-and-forget, on **Finish** (or straight after submit when there are no files) | Upload token required. Always `202 { received: true }`. Work runs after the response via `after()`. |
| `POST /api/service-requests/maintenance/process-ai` | Manual for now. **No cron is configured.** | Admin token. Discovers settled requests (below), queues them, recovers expired leases, then processes up to 3 runs. |
| `POST /api/service-requests/:reference/ai/reprocess` | Staff/testing | Admin token. New MANUAL run, which produces a new report version. |

The sweep (`find_service_requests_for_ai`) only picks up requests that are:
- created within the last **72 hours** (no backfill when AI is first enabled);
- not processed since their last evidence change;
- **settled**: either the upload window has closed, or nothing is `PENDING` and nothing has changed for **30 minutes**.

Known gap: a file *removed* after processing doesn't change any row's timestamp, so the sweep won't notice it. A new Finish (finalize) or a manual reprocess does.

## Kill switch: `SERVICE_AI_ENABLED`

Server-only. Only `true`, `1`, `yes` or `on` (case-insensitive) enables processing. Unset, empty, `false` or anything else disables it, and there is no `NEXT_PUBLIC_` equivalent.

When disabled:
- `finalize` still answers `202 { received: true }`, so customer completion never depends on AI;
- nothing is queued, claimed or processed;
- the sweep returns `{ enabled: false }`;
- reprocess returns `409 ai_disabled`;
- service requests and media uploads are unaffected.

It is **unset in every environment** today. Production must stay disabled until the launch decisions in [HANDOFF.md](./HANDOFF.md) are made.

## Service Call Report (`scr-1`)

Stored as `service_ai_reports.ai_report`. It has two layers:

**Server-owned** (the AI never writes these):
- `schemaVersion` and `serviceReference`;
- `processing.status` and `processing.mediaCoverage[]`;
- `mediaSummary`;
- `transcripts[]` (machine-generated, shown with the original recording);
- `safetyFlags[]`: a deterministic keyword net over the customer's own words, independent of the AI.

Version, provider, models, prompt/pipeline versions, fingerprint and timestamps are columns.

**AI-owned `content`** (validated):

| Field | Notes |
|---|---|
| `issueSummary` | ≤ 400 chars, attributed ("Customer reports…") |
| `customerReported` | `statements[]` (source: DESCRIPTION / VOICE_NOTE / VIDEO_AUDIO), `reportedSymptoms[]` (must cite statements), `reportedOnset`, `locationInProperty` |
| `mediaObservations[]` | evidence `{mediaId, label, frameAtSeconds}`, hedged `observation`, `type`, `certainty` CLEAR/PROBABLE/UNCERTAIN |
| `unknownsRequiringInspection[]` | WARRANTY, COST and REPAIR_METHOD are **always** present (added by the server) |
| `affectedProducts[]` | product id plus basis (customer-selected, customer-described or media-observed) |
| `potentialIssueCategories[]` | likelihood POSSIBLE/LIKELY only. There is no "confirmed". |
| `urgency` | LOW / NORMAL / HIGH / URGENT, `indicators[]` with basis and evidence references, `reason` |
| `inspection`, `recommendedNextStep`, `moreInformationNeeded[]` | |
| `confidence` | LOW / MEDIUM / HIGH plus reason (no fake numeric precision) |
| `limitations[]` | |

### Validation (every report, before storage)

1. **Structure.** Exact keys (no extras), closed enums, types, lengths.
2. **Semantics:**
   - every reference resolves;
   - observations cite an *analysed photo or video*, never a voice note or customer text;
   - video observations carry a timestamp within the video;
   - observations that aren't CLEAR must be hedged ("appears", "apparent", …);
   - LIKELY can't rest only on UNCERTAIN observations;
   - symptoms must cite customer statements;
   - HIGH/URGENT need indicators with evidence, and URGENT needs an urgent-class indicator;
   - **LOW is rejected when the safety keyword net fired**.
3. **Forbidden claims** in text the AI writes in its own voice:
   - prices or quotes;
   - repair commitments or guarantees;
   - warranty confirmation;
   - appointment commitments;
   - measurements;
   - definitive diagnoses.

   Customer statements are attributed and exempt. Unknowns may *discuss* warranty and replacement, but may not commit to them.

An invalid output gets one retry. If it fails again, the run is `FAILED` with internal validation codes in `error_detail` (no customer text), and **nothing is stored as a report**.

The keyword rules are one layer, not a guarantee. They catch the common phrasings and will miss unusual wording. Strict schema output (4B+) and mandatory human review are the other layers.

## Privacy boundary

`buildServiceAiInput()` builds every provider input from an allow-list.

| Sent | Never sent |
|---|---|
| problem description, product categories, "other" product, existing-customer flag, transcripts, neutral labels ("Photo 1"), media bytes (4B+) | name, email, mobile, address/location, project reference, service reference, upload token, storage paths, signed or public URLs |

Free text (the description and transcripts) is also scrubbed:
- email addresses → `[email removed]`;
- phone-like numbers (7+ digits) → `[number removed]`;
- the customer's own known details (name and name parts, email, address, project reference) → `[personal detail removed]`.

Media is read server-side with the service role (`readMedia`). It is never exposed as a URL to a provider, the browser or analytics.

## Admin read

`GET /api/service-requests/:reference/ai` (admin token, 404 otherwise; an upload token gets 404 too) returns:
- `aiEnabled`;
- `aiStatus`;
- `latestReportVersion`;
- every run (attempts, errors, usage, versions; lease owners omitted);
- every report version, with review fields;
- `aiProvider` (`{id, models}` or `{id: null, problem}`, never a key);
- `mediaAnalyses` (cached per-file results, including transcripts, with provider, model, language and error code).

Staff and testing only. It will be replaced by the staff dashboard with real authentication.

## Human review (data model only)

`service_ai_reports` keeps the AI output (`ai_report`, **immutable** by trigger) separate from:
- `reviewed_report`;
- `review_status`;
- `reviewed_by`;
- `reviewed_at`;
- `review_notes`.

A check constraint requires a reviewer and timestamp for APPROVED, EDITED or REJECTED, and a `reviewed_report` for EDITED. Reports can't be deleted except by deleting the service request (cascade).

There are no review endpoints yet: "reviewer" needs real staff identities, which arrive with the dashboard phase.

## Testing

`npm test` runs these suites. All are deterministic, with no network and no AI.

| Suite | Covers |
|---|---|
| `ai-db.test.mjs` | Migrations 0001–0003 in **PGlite** (real Postgres, in-process): schema, RLS, grants, additivity versus 0002, enqueue idempotency, auto-run cap, leases and expiry, fencing, backoff, versioning, immutability, cascade, discovery, cache rules, request lifecycle untouched |
| `ai-pipeline.test.mjs` | Worker → pipeline → stub over the real SQL: COMPLETED, PARTIAL, retry/requeue, invalid and forbidden output, lost lease, cache reuse on reprocess, PII never reaching the provider, kill switch, sweep |
| `ai-report-validation.test.mjs` | Schema and safety rules with fixtures |
| `ai-fingerprint.test.mjs` | Stability and sensitivity |
| `ai-input-builder.test.mjs` | PII exclusion and scrubbing |
| `ai-openai-transcribe.test.mjs` | OpenAI provider with HTTP mocked: exact request fields (audio, model, format only), formats and skips, error mapping, malformed responses, verbatim transcripts and languages, fail-closed selection |
| `ai-transcript-quality.test.mjs` | Completeness flag, calibrated on the real Development samples; never claims missing content |
| `ai-transcription-pipeline.test.mjs` | Transcription through the pipeline and real SQL: caching, repeated finalize, reprocess reuse, retry vs permanent, SKIPPED formats, run-wide errors, no PII sent, request untouched, kill switch, fail-closed |

Multi-connection concurrency (`SKIP LOCKED`, simultaneous enqueue/claim) was
verified against the Development database. PGlite has one connection.

## Next phases

- **4B** ✅ voice transcription.
- **4C**: report synthesis with strict JSON schema output.
- **4D**: photos (HEIC, EXIF stripping, observations).
- **4E**: video (frames plus audio).
- **4F**: evaluation set, cost controls and reliability.

See the approved Phase 4 design for details.
