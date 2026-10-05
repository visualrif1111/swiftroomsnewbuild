# Service & Aftercare — AI processing (Phase 4)

Turns a submitted service request and its evidence into a structured
**Service Call Report** for the service team to review. AI assists staff; it
is never the technical authority, and nothing it produces is shown to the
customer.

> **Status:**
> - **Phase 4A:** foundation (queue, leases, versioned reports, validation, privacy boundary).
> - **Phase 4B:** voice transcription with OpenAI.
> - **Phase 4C:** report synthesis from the customer's text and voice
>   transcripts (OpenAI Responses API, strict schema).
> - **Phase 4D:** photo evidence analysis. One photo per vision call; validated
>   observations are injected into the report by the server (`scr-1.2`).
> - **Phase 4E:** video evidence analysis. Untrusted video is decoded only in
>   an isolated Vercel Sandbox media worker; bounded, deterministic frame
>   sampling; one frame per vision call; video speech transcribed as
>   customer-reported `VIDEO_AUDIO`; no temporal claims (`scr-1.3`).
>
> HEIC/HEIF photos are skipped (no decoder). Reports are internal: nothing is
> shown to customers.
> AI is **off in every deployed environment** (`SERVICE_AI_ENABLED` unset).
> The deterministic stub remains for tests and local work.

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
   per media, cached by input hash:  VOICE → transcript · PHOTO → observations
                                     VIDEO → media worker (Sandbox) → frame observations + VIDEO_AUDIO transcript
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
| API | `POST /v1/audio/transcriptions`, `multipart/form-data`, `response_format=json` (returns `text`, detected `languages[]`, `usage`). Called with `fetch`: one endpoint, explicit 90 s timeout, no hidden retries (the run queue retries). Report synthesis (4C) uses `fetch` too: one Responses call per attempt, with no SDK dependency. |
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

### Run outcome in 4B (historical)

In 4B the OpenAI provider offered transcription only. Runs ended `FAILED` with
`report_stage_not_available` and no report. Since 4C (pipeline `4c.1`, report
prompt `openai-report-1`), such requests qualify again. Their cached
transcripts are reused, not redone.

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

## Report synthesis (Phase 4C)

```
transcripts (cached) + description + selections
  └─ no usable text?  → run ends insufficient_text_for_report (no model call)
  └─ buildServiceAiInput()  (allow-list + scrubbing; photos/videos listed as "not analysed")
       └─ POST /v1/responses  (strict JSON schema scr-1.1, store:false, reasoning low, ≤ 12k output tokens)
            └─ validate: API → structure → provenance → semantics → safety → size
                 ├─ fail → ONE corrective attempt carrying only our rule codes → fail → FAILED (no report)
                 └─ pass → server envelope (coverage, transcripts, safety flags, evidence notices) → report vN
```

| | |
|---|---|
| Input | **Only** the customer's (scrubbed) description, product selections, "other" product, existing-customer flag, and completed transcripts with their advisory flags. Photos and videos appear only as labels marked `analysedInThisPhase: false`. **No media bytes, contact details, references, tokens, paths or URLs.** |
| API | `POST https://api.openai.com/v1/responses` with `text.format = {type: "json_schema", name: "service_call_report_scr_1_1", schema, strict: true}`, `store: false`, `reasoning.effort` (default `low`), `max_output_tokens: 12000`, and a static `prompt_cache_key` (`service-report-openai-report-1`). No `user`, `metadata` or `safety_identifier`. |
| Model | `gpt-6.1-sol` by default (`SERVICE_AI_MODEL_REPORT`). `gpt-6-luna` is to be evaluated in 4F. Reasoning effort: `SERVICE_AI_REPORT_REASONING` (`none`/`low`/`medium`/`high`; Sol doesn't support `none`). |
| Instructions | `ai/prompts/report-v1.ts`, version **`openai-report-1`**. Each report records the model, `reportPromptVersion` and `reportPromptHash` (SHA-256 of instructions plus schema) in `models`. |
| Schema | `ai/report-json-schema.ts` (strict mode: all properties required, no extras), kept in step with the validator by a parity test |
| Prompt versions | **Split per capability**: transcribe `openai-transcribe-1` (part of the transcript cache key), report `openai-report-1` (the run's `prompt_version`). Changing the report prompt never invalidates cached transcripts. |

### Provenance rules (validated, not just requested)

- **Customer statements need a verbatim `quote`** (≤ 200 characters) that
  occurs in the source the model was given: the scrubbed description or that
  transcript.
  - Matching ignores only case, spacing, typographic quote and dash styles,
    edge punctuation, and Arabic diacritics, tatweel and alef forms.
  - A missing, empty, invented or misattributed quote is rejected.
  - `text` is an English rendering for staff; `quote` keeps the original
    language.
- **Voice transcripts are customer-reported**, never observations. In 4C
  `mediaObservations` must be empty, and any `MEDIA_OBSERVED` basis is
  rejected.
- **Contradictions are preserved, not resolved.** Both statements are kept, plus
  an unknown with topic **`CONFLICTING_CUSTOMER_INFORMATION`** (new in scr-1.1).
- **`possiblyIncomplete` is advisory, never proof:**
  - the transcript is shown with its flag;
  - the server adds an evidence notice: "may be incomplete (advisory signal,
    not proof) … listen to the original recording";
  - a statement citing that transcript requires at least one unknown beyond the
    mandatory three;
  - nothing is reconstructed or inferred.
- **Confidence is never HIGH in 4C**, because reports rest on customer
  statements alone.

### Failure behaviour (fails closed)

| Situation | Result |
|---|---|
| Schema, provenance, semantic, safety or size failure; malformed JSON; output cut off at the token cap | **One** corrective attempt with our rule codes only, then `FAILED` (`invalid_output` / `incomplete_output`), **no report stored** |
| Refusal or content filter | `FAILED` (`model_refusal` / `content_filtered`), not retried |
| 429, 5xx, timeout, network | Run requeued (backoff, up to 3 attempts). Cached transcripts are reused. |
| 401/403, quota, unknown model | Run-wide error, requeued, then `FAILED` |
| 400 (request or schema rejected) | `FAILED` (`provider_request_rejected`), not retried (configuration problem) |
| No usable text (empty description and no usable transcript) | No model call; run ends `insufficient_text_for_report` |

### Evidence notices (server-owned, scr-1.1)

`evidenceNotices[]` carries fixed wording, never AI text:
- `TRANSCRIPT_MAY_BE_INCOMPLETE`;
- `NO_SPEECH_DETECTED`;
- `NOT_ANALYSED`: a photo or video in 4C, or audio that couldn't be transcribed.

A request with photos or video is therefore **PARTIAL** in 4C.

## Photo analysis (Phase 4D)

```
per PHOTO (cached per input hash; ONE photo per vision call):
  original bytes (service role, server-side) → sha256 → exact duplicate in this request? → SKIPPED (PHOTO_DUPLICATE)
  → normalise in memory (server/image-normaliser.ts, sharp):
      HEIC/HEIF (by type or content) → SKIPPED image_format_not_supported   (no decoder, by decision)
      corrupt → FAILED image_unreadable    header > 100 MP → FAILED image_too_large_to_process
      EXIF orientation applied → sRGB → fit ≤ 1536 px → flatten on white → fresh JPEG q82, NO metadata
      near-uniform pixels → SKIPPED image_blank
  → POST /v1/responses: observe-v1 instructions + {"photo":"Photo n","productCategoriesSelectedByCustomer":[…]} + input_image (data URL, detail "high")
       strict json_schema "photo_observation_po_1", store:false, low reasoning, ≤ 3,000 output tokens
  → validate po-1 → fail → ONE corrective attempt (rule codes only) → fail → FAILED invalid_observation
  → service_media_analyses COMPLETED { schema:"po-1", photo, observations, cannotDetermine, derivative:{width,height,bytes,sha256,normaliser}, sourceSha256 }
report synthesis: server injects the validated observations as content.mediaObservations (ob-1…, evidence = that photo);
  the report model receives them as structured data only (never the photograph) and may only reference their ids.
```

| | |
|---|---|
| Sent to the vision model | One in-memory **derivative** (JPEG, ≤ 1536 px on the long edge, no EXIF/GPS/XMP/IPTC/ICC), a neutral label ("Photo 2") and the selected product categories. **Never** the original file, its file name, the customer's description, contact details, references, media ids, storage paths or URLs. |
| Derivatives | **Memory only.** Never stored. The analysis records width, height, bytes, SHA-256 and normaliser version (`img-1`), plus the original's SHA-256, so the derivative can be rebuilt exactly. The **original private upload remains the authoritative evidence.** |
| Model | `gpt-6.1-sol` by default (`SERVICE_AI_MODEL_VISION`). Reasoning effort is shared with synthesis (`SERVICE_AI_REPORT_REASONING`, default `low`). |
| Versions | Observe prompt `openai-observe-1` (`ai/prompts/observe-v1.ts`). The per-photo cache key covers media id, verified size, `IMAGE_OBSERVATIONS`, provider, vision model and **`openai-observe-1/img-1`** (prompt plus normaliser version). Each report records `observePromptVersion` and `observePromptHash`. Report prompt `openai-report-2`, pipeline `4d.1`. |
| Formats | **Analysed:** JPEG, PNG, WebP. **SKIPPED:** HEIC/HEIF, recognised by MIME type or by content (`ftyp` brand), never converted (future media-normalisation enhancement). |
| Dependency | `sharp` (direct dependency since 4D; already used by Next.js). It is traced into the AI route bundles. |

### Photo observation `po-1`

The vision model returns:
- `photo.quality` (`CLEAR` / `LIMITED` / `UNUSABLE`) and `photo.qualityIssues[]`;
- `photo.relevance` (`RELEVANT` / `UNCLEAR` / `NOT_RELEVANT`);
- `photo.visibleProductTypes[]`;
- `photo.visibleTextPresent` and `photo.personalInfoVisible` (flags only);
- `observations[]` (at most 8): `type`, `observation` (≤ 300 chars), `certainty`, `location`;
- `cannotDetermine[]` (at most 5).

**There are no media ids or labels in it.** The server attaches the identity
of the one photo in the call, so an observation can't be attributed to
another photo.

Validation is deterministic and fails closed:
- **Structure:** strict shape and closed vocabularies.
- **Shared forbidden-claim rules**, plus **causation** ("caused by", "due to",
  "because of", …).
- **Photo-only conclusion rule:** any mention of warranty; a failed, defective
  or faulty component named as such; repair or replacement needed; an
  installation or manufacturing fault; customer-caused damage; wear and tear.
- **Hedging** required unless certainty is CLEAR.
- **No transcribed text:** quoted runs of 15 or more characters are rejected,
  so text inside an image stays data.
- **No descriptions of people.**
- An UNUSABLE or NOT_RELEVANT photo can only carry `NOTHING_NOTABLE_VISIBLE`.
- Size limits.

Refusal, content filter or a 400 from the provider on a photo: **that photo**
FAILS and the report continues. Timeouts, 429 and 5xx requeue the run;
completed photos stay cached.

### Report integration (`scr-1.2`)

- `content.mediaObservations` is **written by the server** from validated
  `po-1` results, as `"<location>: <observation>"`. The model's own
  `mediaObservations` must be `[]` (schema `maxItems: 0`); anything else is
  rejected (`must_be_server_provided`).
- References to observations (`basedOnRefs`, urgency `refs`) must resolve to
  injected ids.
- Customer statements still need verbatim quotes from the description or
  transcripts, so a **photo observation can never become a customer
  statement**.
- Customer versus photo conflicts keep both, plus **`EVIDENCE_DISCREPANCY`**
  (new). `CONFLICTING_CUSTOMER_INFORMATION` stays for customer versus customer.
- New server-owned `photoAssessments[]`: quality, issues, relevance, visible
  product types, text and PII flags, `cannotDetermine`.
- New notices: `PHOTO_LIMITED_QUALITY`, `PHOTO_NOT_RELEVANT`,
  `PHOTO_DUPLICATE`, `PHOTO_BLANK` (plus `NOT_ANALYSED`).
- Confidence is still ≤ MEDIUM. (In 4D a request with video was PARTIAL; 4E analyses video.)
- A request first reported in 4C (text only) qualifies for an automatic new
  version under 4D versions (within 72 h and the run cap), or a manual
  reprocess. The 4C report stays immutable.

### Residual risks (photos)

- Visual hallucination can't be eliminated deterministically. It is mitigated
  by one photo per call, hedging and certainty rules, the no-cause and
  no-diagnosis rules, the LIKELY limits, the confidence cap and human review.
- **Personal data inside photos** (faces, documents, house numbers) is only
  flagged, not redacted.
- Image inputs can be retained by OpenAI for abuse review in rare cases, even
  under Modified Abuse Monitoring (HANDOFF.md).

## Video analysis (Phase 4E)

Architecture decisions V1–V7 (approved): untrusted video is parsed and decoded
**only** in an isolated **Vercel Sandbox** microVM, never in the application
function (which holds the OpenAI and Supabase credentials). If the worker is
not configured, videos are SKIPPED as before — there is no fallback to ffmpeg
in the function.

```
per VIDEO (three independent caches, see below):
  private original (service role) ──bytes only──▶ Sandbox microVM  (server/video-processor.ts)
      created per video from the pinned snapshot · network "deny-all" · persistent:false · no env · no tags
      · explicit region · hard VM timeout (180 s) · per-command kill timeout · input at /tmp/mw/input
      ffprobe (-show_entries: codecs, size, duration, colour transfer; never tags)
      → assessProbe(): container mov|matroska, video codec h264|hevc|vp8|vp9|mpeg4|h263 — by STREAM,
        never by extension or declared MIME; else SKIPPED (video_codec_not_supported, …)
      → scene pass (≤ 180 s videos) → chooseTimestamps() (vs-1) → one PNG per instant
        (autorotated; HDR PQ/HLG tone-mapped to SDR; -map_metadata -1; bitexact)
      → audio: first track, ≤ 180 s, mono 16 kHz AAC .m4a, no metadata/chapters
  ◀── frames + audio (memory only) ── sandbox.stop() + delete() in finally (success, failure, timeout)
  frames → 4D normaliser (img-1: ≤1536 px JPEG, no metadata) → blank → BLANK · perceptual hash → near-duplicate → DUPLICATE
  each remaining frame (≤ 8) → ONE vision call: observe-frame-v1 + {"frame":"Video n @ mm:ss.s",…} + input_image
      → validateFrameObservation(): po-1 rules + the single-frame temporal rule → 1 corrective attempt → else that frame FAILS
  audio → 4B transcription (gpt-transcribe, verbatim, completeness flag) → transcript kind VIDEO_AUDIO
report synthesis (scr-1.3): server injects frame observations (evidence {videoId, "Video n @ mm:ss.s", frameAtSeconds});
  the report model receives structured observations, transcripts and coverage only — never a video, frame or audio.
```

### The media worker

| | |
|---|---|
| Build | **FFmpeg 8.1.3** (source PGP-verified, key `FCF986EA15E6E293A5644F10B4322F04D67658D8`; SHA-256 pinned) + **zimg 3.0.6** (WTFPL, for HDR tone-mapping). `scripts/media-worker/build-ffmpeg.sh` configures `--disable-everything --disable-autodetect --disable-network` and enables only: demuxers `mov`, `matroska`; decoders `h264 hevc vp8 vp9 mpeg4 h263 aac mp3 mp3float opus vorbis amrnb amrwb alac pcm_*`; encoders `png aac wrapped_avframe`; muxers `image2 mp4 ipod null`; protocols `file pipe` only; the filters used. **No `--enable-gpl`, `--enable-nonfree` or `--enable-version3`**: `ffmpeg -L` reports **LGPL-2.1-or-later**. No external codec libraries (no x264/x265/libvpx/libaom/dav1d). |
| Image | A **Vercel Sandbox snapshot** built by `scripts/media-worker/build-snapshot.mjs` in a separate build VM (network only for `apt`; no customer data), then the toolchain is purged and the default user's sudo removed before snapshotting. The snapshot never expires. Base: Vercel's Ubuntu image (its own OS components are aggregated, not linked into FFmpeg). |
| Configuration | `SERVICE_AI_VIDEO_WORKER_SNAPSHOT` (`snap_…`) **and** `SERVICE_AI_VIDEO_WORKER_REGION` (explicit — the SDK's `iad1` default is never used by omission). Missing → `video_processing_not_available`; malformed → same, logged. Authentication: the project's Vercel OIDC token (automatic on Vercel; `VERCEL_OIDC_TOKEN` locally). |
| Isolation | Per video: fresh non-persistent microVM, `networkPolicy: "deny-all"`, **no environment variables, tags or name** passed, unprivileged user without sudo, bytes written under a neutral name. Verified on the real worker: no app secrets in its environment, no identifiers on its disk, TCP (internet and metadata endpoint) blocked, DNS unavailable, ffmpeg has no network protocols. |
| Termination | `stop()` + `delete()` in `finally` on every path. VM `timeout` 180 s is the platform backstop. The SDK **silently starts a fresh session** if a call reaches a VM the platform already stopped; that VM has none of our files, so the processor records `onResume`, refuses further steps near or after the deadline, and fails the step as `video_processing_timeout` (retryable) — never as "unreadable". |
| Version | `WORKER_PROTOCOL_VERSION` `mw-1` + snapshot id = `processor.version`, part of every video cache key. Rebuilding the worker (new snapshot) re-analyses videos on their next run. |

### Formats (proven on the pinned build)

| Source | Result |
|---|---|
| MP4 / MOV with **H.264** (Android, WhatsApp, iPhone "Most Compatible") | Analysed |
| MOV with **HEVC** (iPhone "High Efficiency"), including **HLG/PQ HDR** (tone-mapped) | Analysed — LGPL decoder; HEVC/H.264 patent licensing is a legal sign-off item (HANDOFF) |
| WebM **VP8 / VP9** (+ Opus) — in-app recorder | Analysed |
| 3GPP (MPEG-4 Part 2 / H.263, AMR audio) | Analysed if the probe accepts it (in the build; not separately exercised) |
| **AV1**, ProRes, MJPEG, DNxHD, anything else | **SKIPPED** `video_codec_not_supported` (`VIDEO_NOT_SUPPORTED` notice) |
| Containers other than MOV/MP4/3GP/Matroska/WebM | SKIPPED `video_container_not_supported` |
| No video stream / cover art only | SKIPPED `video_no_video_stream` |
| Zero duration · unreadable/corrupt · > 8K | SKIPPED `video_empty` · FAILED `video_unreadable` · SKIPPED `video_resolution_not_supported` |
| Audio in an unsupported codec | Frames analysed; `VIDEO_NO_AUDIO` |

### Frame sampling (`vs-1`, deterministic)

1. Scene-change candidates (`select='gt(scene,0.30)'` on a 320-px decode), **only for
   videos ≤ 180 s**; at most 4, spaced ≥ 0.75 s, highest score first. A failed
   scene pass is recorded (`sceneDetection: "FAILED"`) and the grid alone is used.
2. Fixed grid over the **video track**: `n = clamp(ceil(d/3 s), 3, 8)` slice centres.
3. Merged (scene first), dropping instants < 0.75 s from a kept one; capped at
   **8** by dropping the grid instants nearest a neighbour.
4. Each instant decoded (`-ss` accurate seek, `-copyts`); its real presentation
   time (showinfo) minus the container start, rounded to 0.1 s, is the frame's
   timestamp.
5. Normalised (img-1); **blank** frames dropped; **near-duplicates** (64-bit
   difference hash, Hamming ≤ 6, or the same decoded frame) dropped.

Same bytes + worker build + `vs-1` ⇒ same instants and decisions. At most **8
vision calls per video** (plus at most one corrective attempt each).

### Single-frame (temporal) rule — V3

A frame is one instant. Frame observations are rejected (never softened) if
they state movement, operation (opens/closes, slides, won't lock…), sticking,
catching, jamming, sequence (before/after, starts/stops), frequency
(repeatedly, intermittently, always…), progression (getting worse), active
leakage (leaking, dripping, water entering) or whole-video behaviour
(throughout, "the video shows", across all frames). Product names containing
such words (sliding door, door stop, window catch, door jamb) and visible
states ("appears open") are allowed. In the report:
- every analysed video gets a server-written **`BEHAVIOUR_OVER_TIME`** unknown;
- issue categories about operation, noise, draughts or motors, and urgency
  indicators for active water entry, loss of function, securing the property
  or blocked access, **can't rest on frame observations alone**
  (`behaviour_over_time_from_frames_only`);
- whole-video wording in the AI's own text is rejected (`whole_video_claim`).
The multi-frame temporal-comparison model is deferred (not in 4E).

### Video speech — V5

The extracted audio goes through the unchanged 4B transcription path. It is
**customer-reported**: statements cite it as `VIDEO_AUDIO` with that video's
media id and a verbatim quote; it is never an observation. Completeness
(`possiblyIncomplete`), `NO_SPEECH_DETECTED`, languages and the mixed-language
limitation apply exactly as for voice notes.

### Long videos — V7

Over **180 s**, a video is **PARTIALLY ANALYSED**: the same ≤ 8 frames are
spread across the whole video track (no scene pass), speech is transcribed for
the first 180 s only, the report is `PARTIAL`, and it carries
`VIDEO_LONG_SAMPLED_SPARSELY`, a fixed-wording `analysedPortion`
("PARTIALLY ANALYSED: Video 1 lasts 05:12.0, beyond the 03:00.0 analysis
threshold. 8 still frames (at …) analysed individually; speech transcribed
from 00:00.0 to 03:00.0. Movement and behaviour over time were not
assessed.") and an `OTHER` unknown for everything outside it. Nothing is
truncated silently; the original video stays the authoritative evidence.

### Caches (independent)

| Layer | Row (`service_media_analyses`, on the video's media id) | Key covers |
|---|---|---|
| Preprocessing | `VIDEO_OBSERVATIONS` — `vp-1`: probe summary, sampling decisions, per-frame outcome + derivative SHA-256 + hash, audio status. **No pixels or audio.** SKIPPED/FAILED (deterministic) outcomes are cached too. | media id, verified size, worker version (`mw-1:<snapshot>`), `vs-1/img-1` |
| Frame observations | `IMAGE_OBSERVATIONS`, one per frame — `po-1` + `frame {at,label}` + derivative | …, vision model, `openai-observe-frame-1/img-1`, instant + derivative SHA-256 |
| Video speech | `TRANSCRIPT` | …, transcribe model, `openai-transcribe-1/va-1/<worker version>` |
| Report | `service_ai_reports` (immutable versions) | — |

Repeated finalize: nothing runs. Manual reprocess with unchanged video: **no
Sandbox, no vision, no transcription** — synthesis only. A transient failure on
one frame requeues the run; the retry re-extracts **only** the missing frames
(plan reused, not re-probed). Changed bytes (new size) miss every layer.
Transient worker failures are never cached.

### Report integration (`scr-1.3`)

Additive to `scr-1.2`: frame observations in `mediaObservations` (evidence
`{mediaId: video, label: "Video n @ mm:ss.s", frameAtSeconds}`; photos keep
`frameAtSeconds: null`); `BEHAVIOUR_OVER_TIME`; server-owned
`videoAssessments[]` (container, codec, duration, `partiallyAnalysed`,
`analysedPortion`, sampling counts, per-frame outcome/quality/relevance, audio
status and transcribed span, text/PII flags, `cannotDetermine`); notices
`VIDEO_NOT_SUPPORTED`, `VIDEO_LIMITED_QUALITY`, `VIDEO_NO_AUDIO`,
`VIDEO_LONG_SAMPLED_SPARSELY`, `VIDEO_FRAMES_DEDUPLICATED`. Validation rejects a
video observation whose timestamp isn't one of **that video's** analysed
instants, whose label doesn't match, a photo with `frameAtSeconds`, a video
without it, and any model-written evidence (`must_be_server_provided`). Report
prompt `openai-report-3`, pipeline `4e.1`. Evidence durations for video are the
probed ones.

### Residual risks (video)

- Behaviour over time is **deliberately not established**; staff must watch
  the original video for anything about operation.
- Visual hallucination per frame: mitigated as for photos.
- Faces/documents/plates in frames are flagged (`personalInfoVisible`), not
  redacted (4F/pre-launch).
- Worker cost and latency: one microVM per video (≈ 15–35 s each in
  verification). Runs are resumable through the caches if a function times out.

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
| `server/openai-provider.ts` | OpenAI transcription (4B), synthesis (4C), photo observation (4D), video-frame observation (4E) |
| `ai/video-sampling.ts` | Probe assessment (codec by stream), deterministic `vs-1` sampling, timestamps/labels (4E) |
| `ai/frame-observation.ts` | Single-frame temporal rule on top of `po-1` (4E) |
| `ai/prompts/observe-frame-v1.ts` | Video-frame instructions `openai-observe-frame-1` (4E) |
| `ai/prompts/report-v3.ts` | Report instructions `openai-report-3` (4E) |
| `server/video-processor.ts` | Media worker: Vercel Sandbox implementation, shared ffmpeg/ffprobe command lines, local implementation for tests (4E) |
| `server/image-normaliser.ts` | Photo/frame derivative (img-1) and perceptual hash (4D/4E) |
| `scripts/media-worker/` | Pinned worker build (`build-ffmpeg.sh`) and snapshot builder (`build-snapshot.mjs`) — operator tools, not app code |
| `ai/run-store.ts` | Storage interface the pipeline depends on |
| `ai/pipeline.ts` | Processes one claimed run |
| `server/ai-config.ts` | `SERVICE_AI_ENABLED`, limits, fail-closed provider and video-worker selection (server-only) |
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

## Service Call Report (`scr-1.3`)

Stored as `service_ai_reports.ai_report`. It has two layers:

**Server-owned** (the AI never writes these):
- `schemaVersion` and `serviceReference`;
- `processing.status` and `processing.mediaCoverage[]`;
- `mediaSummary`;
- `transcripts[]` (machine-generated, shown with the original recording);
- `safetyFlags[]`: a deterministic keyword net over the customer's own words, independent of the AI;
- `evidenceNotices[]` (scr-1.1): fixed-wording notices about the evidence;
- `photoAssessments[]` (scr-1.2): per analysed photo;
- `videoAssessments[]` (scr-1.3): per analysed video — what was, and wasn't, analysed;
- `content.mediaObservations` (scr-1.2+): written by the server from validated photo and video-frame analysis.

Version, provider, models, prompt/pipeline versions, fingerprint and timestamps are columns.

**AI-owned `content`** (validated):

| Field | Notes |
|---|---|
| `issueSummary` | ≤ 400 chars, attributed ("Customer reports…") |
| `customerReported` | `statements[]` (`text`, verbatim `quote` (scr-1.1), source: DESCRIPTION / VOICE_NOTE / VIDEO_AUDIO), `reportedSymptoms[]` (must cite statements), `reportedOnset`, `locationInProperty` |
| `mediaObservations[]` | evidence `{mediaId, label, frameAtSeconds}`, hedged `observation`, `type`, `certainty` CLEAR/PROBABLE/UNCERTAIN |
| `unknownsRequiringInspection[]` | WARRANTY, COST and REPAIR_METHOD are **always** present (added by the server); BEHAVIOUR_OVER_TIME for every analysed video (scr-1.3). `CONFLICTING_CUSTOMER_INFORMATION` (scr-1.1) and `EVIDENCE_DISCREPANCY` (scr-1.2) record disagreements. |
| `affectedProducts[]` | product id plus basis (customer-selected, customer-described or media-observed) |
| `potentialIssueCategories[]` | likelihood POSSIBLE/LIKELY only. There is no "confirmed". |
| `urgency` | LOW / NORMAL / HIGH / URGENT, `indicators[]` with basis and evidence references, `reason` |
| `inspection`, `recommendedNextStep`, `moreInformationNeeded[]` | |
| `confidence` | LOW / MEDIUM / HIGH plus reason (no fake numeric precision). Never HIGH in 4C. |
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
   - definitive diagnoses;
   - liability or responsibility, and eligibility or approval (added in 4C).

   Customer statements are attributed and exempt. Unknowns may *discuss* warranty and replacement, but may not commit to them.

4. **Provenance** (4C): verbatim quotes. **Phase rules** (4C): no observations or `MEDIA_OBSERVED` without visual analysis; confidence ≤ MEDIUM; an extra unknown when citing a possibly-incomplete transcript. **Size**: serialised content ≤ 30,000 characters.

An invalid output gets one corrective retry (with our rule codes only). If it fails again, the run is `FAILED` with internal validation codes in `error_detail` (no customer text), and **nothing is stored as a report**.

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
| `ai-report-json-schema.test.mjs` | Strict-schema compliance and parity with the validator; fixtures conform |
| `ai-synthesis-validation.test.mjs` | Quote provenance, normalisation, text-only phase rules, confidence cap, advisory transcript uncertainty, contradictions, liability/eligibility claims, size |
| `ai-openai-synthesis.test.mjs` | Responses request (exact fields, strict schema, `store:false`, no PII), corrective message carries rule codes only, parsing (refusal, content filter, incomplete, non-JSON), error mapping, configurable model |
| `ai-image-normaliser.test.mjs` | Real `sharp`: EXIF/GPS/ICC removal (byte-level), orientation, 1536 px bound, sRGB and alpha, HEIC skip (type and content), corrupt, decompression bomb, blank |
| `ai-photo-observation.test.mjs` | `po-1` strict schema (no media-id field), hedging, diagnosis, causation, repair, warranty and fault rules, no transcribed text, no people, unusable/irrelevant consistency, sizes |
| `ai-photo-pipeline.test.mjs` | End-to-end 4D matrix (30 cases): attribution, one image per call, contradiction (`EVIDENCE_DISCREPANCY`), ambiguous, irrelevant, blank/corrupt/HEIC/bomb (no call), downscale and orientation, no EXIF in what is sent, visible text and PII flags, duplicates, image prompt injection, report can't invent/alter/misattribute observations, no image in report calls, provider failures, cache and reprocess, v2 after a 4C v1, lifecycle, PII, kill switch |
| `ai-synthesis-pipeline.test.mjs` | End-to-end 4C matrix over real SQL: text, voice, text and voice, possibly incomplete, contradiction, vague, urgent, failed audio, no text, multilingual, prompt injection, hallucination, forbidden claims, refusal/incomplete/non-JSON, timeouts and 429/5xx, 401/400, idempotency, reprocess, 4B upgrade, prompt-version split, lifecycle, PII |
| `ai-transcription-pipeline.test.mjs` | Transcription through the pipeline and real SQL: caching, repeated finalize, reprocess reuse, retry vs permanent, SKIPPED formats, run-wide errors, no PII sent, request untouched, kill switch, fail-closed |
| `ai-video-sampling.test.mjs` | Probe assessment by stream (MP4/MOV/WebM, H.264/HEVC/VP8/VP9; ProRes/AV1/unknown skipped; forged container; cover art; zero/unreadable/oversized; audio and HDR), video-track duration, grid, deterministic merge/cap of 8, scene spacing, 180-s boundary, timestamp format, hash distance |
| `ai-frame-observation.test.mjs` | Single-frame temporal rule: every category rejected (movement, operation, sticking, sequence, frequency, progression, leakage, whole-video); product names and visible states allowed; po-1 rules still apply |
| `ai-video-worker.test.mjs` | Sandbox processor with the SDK faked at the boundary: exact create params (deny-all, non-persistent, explicit region, pinned snapshot, no env/tags/name), bytes-only upload under a neutral name, no secrets/identifiers/URLs anywhere, destroyed on success/failure/timeout/upload failure, silent-resume and deadline guards, no fallback, command lines (no network, metadata stripped, bounded), log parsers, fail-closed configuration |
| `ai-video-local.test.mjs` | The worker's exact command lines with a **local ffmpeg test tool** (real decoding): H.264 MP4/MOV, HEVC MOV, VP8/VP9 WebM, ProRes/AV1 skipped, forged extension, corrupt/truncated, display rotation, HLG tone-mapping, scene cut, audio absent/silent/bounded, container metadata absent from frames and audio, temp files removed. Skipped with a stated reason when the tool is absent (see below). |
| `ai-video-report-validation.test.mjs` | `scr-1.3` provenance: wrong media/video/instant, label mismatch, cross-video attribution, photo with a timestamp, video without one; VIDEO_AUDIO only from that video's transcript; behaviour over time from frames only; whole-video claims; BEHAVIOUR_OVER_TIME mandatory; partial-analysis unknown |
| `ai-video-pipeline.test.mjs` | End-to-end 4E matrix (26 cases) over real SQL: exact frame attribution, one frame per call with frame instructions, no media in report calls, temporal claim rejected, model can't create evidence, near-duplicate/blank dropping, ≤ 8 frames, unsupported codec cached, no/unsupported audio, silence, 180-s boundary and partial wording, photo + video, two videos, contradictions, visible and spoken prompt injection, caches (finalize, reprocess = synthesis only, changed bytes), partial-frame retry, worker unavailable/timeout, blank-only video, immutability and lifecycle, kill switch / not configured, real local decoding with metadata check, quality/PII/mixed-language/incomplete speech, run-wide 401, failed scene pass, video-track sampling |

**Local ffmpeg test tool (V6).** `ai-video-local` and test 22 of
`ai-video-pipeline` decode real fixtures with a static ffmpeg **outside the
repo** (default `~/.cache/swiftrooms-test-tools/ffmpeg-6.1.1/`, or
`SERVICE_TEST_FFMPEG_DIR`). It is a GPL/nonfree test-only build (eugeneware
`ffmpeg-static` b6.1.1 release binaries) that is never installed as a
dependency, never shipped and never distributed; fixtures are generated at test
time. The production worker is the separate LGPL build above.

Multi-connection concurrency (`SKIP LOCKED`, simultaneous enqueue/claim) was
verified against the Development database. PGlite has one connection.

## Next phases

- **4B** ✅ voice transcription.
- **4C** ✅ report synthesis (text and voice).
- **4D** ✅ photo analysis (HEIC deferred).
- **4E** ✅ video (isolated Sandbox worker, frames plus audio).
- **4F**: evaluation set, cost controls and reliability.

See the approved Phase 4 design for details.
