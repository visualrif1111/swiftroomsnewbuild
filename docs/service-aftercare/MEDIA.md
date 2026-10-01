# Service & Aftercare — Media evidence (Phase 3)

Customers attach photos, videos and a voice note to a service request. Files
are customer data (homes, interiors, addresses, voices), so they are stored
**privately** and never get public URLs.

## Storage

| | |
|---|---|
| Provider | **Supabase Storage** — the same project as the database. No second provider: Vercel Blob would add credentials, billing and a second access model without any benefit here. |
| Bucket | `service-evidence` |
| Public | **No.** No public URLs exist for any object. |
| Access policies | **None** on `storage.objects`, so the anon/authenticated roles can't list, read, upload or delete. The only routes in are the service role (server only) and short-lived signed URLs the server issues. |
| Size limit (bucket) | 50 MB per file. This is the **Supabase Free plan's per-file ceiling**: a larger bucket limit is refused. |
| MIME allow-list (bucket) | the 18 types below; Storage refuses anything else at upload time |

The bucket is created by `supabase/migrations/0002_service_media.sql`, so its
configuration is reviewable and reproducible.

### Paths

```
service-requests/<year>/<reference>/<media-id>.<ext>
e.g. service-requests/2026/SR-2026-00046/aca473fe-f9ae-424b-9e5d-10ab46f00d3d.jpg
```

- `<media-id>` is a server-generated UUID. The customer's filename is **never**
  part of the key; it's kept only as `original_filename` metadata (control
  characters stripped, ≤ 255 chars). So there's no path traversal and no
  collisions.
- The extension comes from the validated MIME type, not the filename.
- Uploads use `x-upsert: false`, so an object can never be overwritten.

## Accepted formats and limits

| Kind | MIME types | Max size | Per request |
|---|---|---|---|
| Photo | image/jpeg, image/png, image/webp, image/heic, image/heif | 25 MB | 10 photos + videos combined |
| Video | video/mp4, video/quicktime (iPhone .MOV), video/webm, video/3gpp | **50 MB** | (shared with photos) |
| Voice note | audio/webm, audio/mp4, audio/x-m4a, audio/aac, audio/mpeg, audio/ogg, audio/wav, audio/x-wav, audio/3gpp | 25 MB | 1 |

Covers what devices produce:
- **iPhone:** HEIC or JPEG photos, MOV or MP4 video, and MP4/AAC from Safari's recorder.
- **Android:** JPEG photos and MP4/3GP video.
- **Chrome and Firefox recorders:** WebM or Ogg audio.

The pickers keep `accept="image/*"` etc. so phones show their normal camera and
gallery. Every file is checked after it's chosen.

Types are **normalised** before checking:
- codec parameters are dropped (`audio/webm;codecs=opus` → `audio/webm`);
- aliases are folded (`image/jpg` → `image/jpeg`);
- an untyped file gets its type from its extension;
- a WebM/MP4 voice note reporting `video/*` is treated as audio.

### Validation layers

Each layer independently refuses bad files:

1. **Browser** (`validateMediaFile`): rejects empty files, unsupported types and oversize files with a clear message. Rejected files are never added.
2. **API, at authorisation** (`validate-media.ts`): checks kind, normalised MIME, declared size (1 byte up to the limit), source and UUIDs. Returns 422.
3. **Storage, at upload**: the bucket's MIME allow-list and 50 MB cap.
4. **API, at verification** (`mediaStore.complete`): reads the stored object's real size and **first 64 bytes**:
   - empty → `empty_file`;
   - over the kind's limit → `file_too_large` (catches a declared-small, uploaded-big file);
   - container doesn't match the kind → `content_does_not_match_type` (catches a PDF or EXE renamed `.jpg`).

   Containers are recognised by magic bytes: JPEG, PNG, WebP and HEIF for photos; ISO-BMFF (MP4/MOV/3GP) and EBML (WebM) for video; those plus Ogg, MP3, WAV, AAC/ADTS and AMR for voice. A rejected object is **deleted** and its row marked `FAILED`.

## service_media

See [DATABASE.md](./DATABASE.md#service_media). One row per file, linked by
`service_request_id`. No URLs are stored anywhere.

## Upload authorisation: why a reference isn't enough

References are sequential (`SR-2026-00046`, `…47`), so anyone could guess
one. Knowing a reference grants **nothing**.

1. `POST /api/service-requests` returns, with the reference, an
   **upload token**: 32 random bytes (base64url). It's shown once.
2. The database stores only `SHA-256(token)`
   (`service_requests.upload_token_hash`) and an expiry
   (`upload_token_expires_at`, **6 hours**).
3. Every media endpoint needs `Authorization: Bearer <token>` **and** the
   matching reference. A wrong reference, wrong token, another request's token
   or an unknown request all get the same `401 unauthorised`, so the API can't
   be used to discover which references exist. After expiry the response is
   `401 upload_authorisation_expired`.
4. Only the browser that created the request has the token. A replayed create
   (same `Idempotency-Key`, which is a random UUID only that browser knows)
   issues a **fresh** token and the old one stops working.
5. The browser keeps the token in `sessionStorage` (this tab only, cleared when
   it closes) so a refresh can resume. It is not sent anywhere except our own
   media endpoints.

Each file then gets its own **Supabase signed upload URL**: scoped to exactly
one object path and valid for 2 hours (Supabase's fixed lifetime). The browser
PUTs the file to it directly, so files never pass through our API or Vercel
functions, whose request bodies are limited to 4.5 MB.

## Lifecycle

```
Browser                         API                                  Supabase
───────                         ───                                  ────────
submit answers ───────────────▶ POST /api/service-requests ─────────▶ create_service_request()
◀─ reference + upload token ───                                       (request + history)

for each file (2 at a time):
  POST …/media ───────────────▶ check token, validate ──────────────▶ reserve_service_media()
                                 (idempotent on clientMediaId)        row PENDING, path generated
  ◀─ media id + signed URL ─────                        ◀──────────── signed upload URL
  PUT file ──────────────────────────────────────────────────────────▶ Storage (private bucket)
  POST …/media/:id/complete ──▶ read size + first 64 bytes ──────────▶ mark UPLOADED / FAILED
  ◀─ UPLOADED (or 422 rejected)
```

### States

| Browser (`UploadState`) | Meaning | Server (`upload_status`) |
|---|---|---|
| LOCAL | chosen, not yet submitted (Evidence step) | — |
| WAITING | queued for upload | — / PENDING |
| UPLOADING | registered, bytes going to storage | PENDING |
| UPLOADED | verified in storage | UPLOADED |
| FAILED | upload or verification failed; Retry (if possible) or Remove | PENDING (network) or FAILED (rejected) |
| REMOVED | removed by the customer | row and object deleted |

## Failure and retry

The service request is created **before** any upload, so media problems can
never lose, duplicate or renumber it.

- **The confirmed reference is shown first** on the upload step, with "Your
  service request has been received", so the customer never wonders whether
  the request arrived.
- Each file uploads, fails and retries on its own. Successful uploads are never
  re-sent.
- **Retry** re-uses the file's `clientMediaId`. The server returns the same row
  and path, so a retry never creates a second record or object. If the object
  already arrived (the network dropped after upload), the PUT gets 409 and the
  client goes straight to verification.
- **Finish without them** is always available. The confirmation then says how
  many files were received and that the team may ask for the rest.
- **Double clicks and duplicate calls**: authorisation is idempotent per
  `clientMediaId` (unique in the database, with the request row locked), and
  verification is idempotent (an `UPLOADED` row is returned unchanged).
- **Refresh mid-upload**: the page reopens on the upload step for the **same**
  reference. Files already uploaded are confirmed with the server. Files still
  in progress were lost with the page (browsers can't keep them), so they're
  marked to add again, their half-finished server records are deleted, and an
  "Add photos or videos again" control re-uploads to the same request.
- **Upload window closed** (6 hours): affected files show a message that the
  team will ask for anything still needed. Nothing is retried.
- Per-request limits (10 photos/videos, 1 voice note) are enforced in the
  database with the request row locked, so concurrent uploads can't exceed them.

## Removal and cleanup

- **Remove** (any time before Finish): `DELETE …/media/:id` deletes the storage
  object, then the row. It's safe to repeat. Removing a file mid-upload cancels
  the transfer first.
- **Abandoned uploads**: rows left `PENDING` or `FAILED` (tab closed mid-upload,
  file removed before the browser learned its id) are deleted with their
  objects by
  `POST /api/service-requests/maintenance/cleanup-media?olderThanHours=24`
  (admin token). 24 h is well past the 6 h upload window. **Schedule it**
  before launch, e.g. hourly. Vercel Cron only runs on production, so use a
  production cron, or a Supabase scheduled function, once the production
  project exists.
- Deleting a service request cascades to its `service_media` rows. The objects
  must be deleted too: a staff-side delete should call `mediaStore.remove` for
  each file first.

## Private access for staff

No permanent URLs exist. Staff access goes through the server, which issues
**signed read URLs valid for 5 minutes**:

- `mediaStore.signRead(record, seconds)` (server-only).
- `GET /api/service-requests/:reference` (admin token, staff/testing) returns
  each uploaded file with `signedUrl` and `signedUrlExpiresInSeconds: 300`.

The staff dashboard (later phase) should call `signRead` per view behind real
staff authentication, never cache signed URLs, and never expose the service
role.

## Attachment counts vs media records

`service_requests.declared_media` (Phase 2) is kept as a **snapshot of what the
customer said they attached when submitting**. It is not a record of evidence.
**`service_media` rows with `upload_status = 'UPLOADED'` are authoritative.**
The difference is itself useful: declared 3, uploaded 2 means one didn't
arrive and staff should ask for it. The column comment in the database says the
same.

## Future processing (not in Phase 3)

`service_media` already has the columns later phases fill. The customer's
original object is **never modified**.

- **Voice notes**: `transcript`, `transcript_status` (`NOT_STARTED` → `QUEUED` → `PROCESSING` → `COMPLETED` / `FAILED` / `SKIPPED`).
- **Photos and video**: `width`, `height`, `duration_seconds`, `ai_analysis` (jsonb), `ai_analysis_status`.
- **Derived assets** (audio extracted from a video, selected frames, thumbnails) should go in a separate `service_media_derivatives` table (`media_id`, kind, storage_path under `…/<reference>/derived/`, metadata), written by a background worker that reads the original via a signed URL or the service role.
- Processing must run **after** upload, in the background, so AI or transcription outages can't affect the customer's submission. Status changes on the request (`SUBMITTED → AI_PROCESSED → AWAITING_REVIEW`) go through `status_history`.
- Nothing in Phase 3 sends media to any third party.
