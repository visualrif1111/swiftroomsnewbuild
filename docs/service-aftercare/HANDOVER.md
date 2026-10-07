# Service & Aftercare — Technical Handover (for Syspree Digital)

What Swift Rooms' Service & Aftercare system is made of, how its parts talk to
each other, what each depends on, and what would change if Production moves
from Vercel to UAE Host. Secrets are never included here — names only.

Companion documents: [ARCHITECTURE.md](./ARCHITECTURE.md) ·
[API.md](./API.md) · [DATABASE.md](./DATABASE.md) · [MEDIA.md](./MEDIA.md) ·
[AI.md](./AI.md) · [DASHBOARD.md](./DASHBOARD.md) ·
[ENVIRONMENT.md](./ENVIRONMENT.md) · [EVALUATION.md](./EVALUATION.md) ·
[HANDOFF.md](./HANDOFF.md) (status, blockers, launch decisions).

## 0. Current state in one paragraph

Built on the live stack (Next.js 16 App Router, React 19, TypeScript, Tailwind
v4) as a separate feature set: a customer **Service Call** wizard
(`/service-call`), a JSON **API** (`/api/service-requests/*`), private **media
evidence** uploads, **AI triage** (transcripts, photo/video observations,
structured report — off everywhere), and the staff **dashboard** (`/admin`).
Data lives in **PostgreSQL** (Supabase in Development) and private media in
**Supabase Storage** (Development). **Production** today has none of this
connected: the API answers 503, `/admin` answers 404, AI is disabled. Nothing
touches LeadOptimizer/GoHighLevel, Sanity content or the existing site
enquiry flows.

---

## A. Service case data structure

Database: [DATABASE.md](./DATABASE.md) (migrations `supabase/migrations/0001…0004`).
TypeScript sources: `src/lib/service-call/types.ts`, `api-contract.ts`,
`server/store.ts`, `server/media-store.ts`, `ai/run-store.ts`,
`ai/report-schema.ts`, `src/lib/service-dashboard/types.ts`.

### Service request (`service_requests`)

```ts
interface ServiceRequest {
  id: string;                    // uuid
  reference: string;             // "SR-2026-00042" (per-year counter)
  customerId: string;            // → customers.id
  // Snapshot of what the customer submitted:
  customerName: string; mobileCountryCode: string; mobileNational: string; mobileE164: string;
  email: string; location: string; existingCustomer: boolean | null; projectReference: string | null;
  productCategories: ("window" | "sliding-door" | "bi-fold-door" | "entrance-door" | "glass" | "hardware"
                      | "motorised-system" | "curtain-wall" | "other")[];
  otherProduct: string | null;
  problemDescription: string;
  declaredMedia: { photos: number; videos: number; voiceNote: boolean };
  status: "SUBMITTED" | "AWAITING_REVIEW" | "MORE_INFORMATION_REQUIRED" | "INSPECTION_REQUIRED"
        | "SCHEDULED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "AI_PROCESSED" /* reserved, unused */;
  channel: "website/service-call";
  idempotencyKey: string;        // one per submit attempt
  createdAt: string; updatedAt: string;   // ISO 8601
}
```

### Customer (`customers`)

```ts
interface Customer { id: string; fullName: string; email: string; mobileE164: string; location: string | null; createdAt: string; updatedAt: string }
```
Matched on email + mobile when the same person submits again.

### Media (`service_media`)

```ts
interface Media {
  id: string; serviceRequestId: string; clientMediaId: string;   // browser-generated, idempotent registration
  mediaType: "PHOTO" | "VIDEO" | "VOICE";
  mimeType: string; fileExtension: string; originalFilename: string | null;
  source: "camera" | "upload" | "recording" | null;
  declaredSize: number; fileSize: number | null; durationSeconds: number | null;
  storagePath: string;           // "service-requests/2026/SR-2026-00042/<id>.<ext>" in the private bucket
  uploadStatus: "PENDING" | "UPLOADED" | "FAILED";
  failureReason: "empty_file" | "file_too_large" | "content_does_not_match_type" | null;
  uploadedAt: string | null; createdAt: string;
}
```

### Status history (`status_history`, append-only)

```ts
interface StatusHistoryEntry {
  id: number;
  serviceRequestId: string;
  fromStatus: Status | null;     // null = the initial SUBMITTED row
  toStatus: Status;
  changedAt: string;             // database time
  changedBy: string;             // "customer" | "system" | "staff:<staff_members.id>"
  actorStaffId: string | null;   // Phase 5
  actorRole: "STAFF" | "ADMIN" | null;   // role at the time of the change
  note: string | null;           // internal; 3–2,000 chars; required where the matrix says so
}
```

### Staff (`staff_members`, Phase 5)

```ts
interface StaffMember { id: string; authUserId: string /* auth provider user id */; displayName: string; role: "STAFF" | "ADMIN"; active: boolean; deactivatedAt: string | null }
```

### AI run (`service_ai_runs`)

```ts
interface AiRun {
  id: string; serviceRequestId: string; runNumber: number;
  trigger: "FINALIZE" | "SWEEP" | "MANUAL";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED";
  inputFingerprint: string;      // sha-256 of inputs
  pipelineVersion: string; promptVersion: string; schemaVersion: string;
  provider: string | null; models: Record<string, string>;
  leaseOwner: string | null; leaseExpiresAt: string | null;   // worker lease
  attempts: number; maxAttempts: number; nextAttemptAt: string;
  startedAt: string | null; finishedAt: string | null;
  errorCode: string | null; errorDetail: object | null;      // codes only, never customer content
  usage: Record<string, number>; requestedBy: string;
}
```
Dashboard "AI state": no run → NOT_STARTED; QUEUED/PROCESSING → PROCESSING;
COMPLETED; PARTIAL; FAILED/CANCELLED → FAILED. **AI never changes the service status.**

### AI report (`service_ai_reports`, versioned, content immutable)

```ts
interface AiReportRow {
  id: string; serviceRequestId: string; runId: string; version: number;   // 1, 2, … per request
  schemaVersion: "scr-1.4"; processingStatus: "COMPLETED" | "PARTIAL";
  provider: string; models: Record<string, string>; promptVersion: string; pipelineVersion: string; inputFingerprint: string;
  aiReport: ServiceCallReport;   // immutable
  generatedAt: string;
  reviewStatus: "AWAITING_REVIEW" | "APPROVED" | "EDITED" | "REJECTED";
  reviewedReport: StaffEdit | null; reviewedBy: string | null; reviewedAt: string | null; reviewNotes: string | null;
  supersededAt: string | null; supersededBy: string | null;               // newer version exists
}

interface ServiceCallReport {           // full definition: src/lib/service-call/ai/report-schema.ts
  schemaVersion: "scr-1.4"; serviceReference: string;
  processing: { status: "COMPLETED" | "PARTIAL"; mediaCoverage: { mediaId; label; type; outcome: "ANALYSED" | "SKIPPED" | "FAILED"; reasonCode }[] };
  mediaSummary: { photos; videos; voiceNotes };
  transcripts: { mediaId; label; kind: "VOICE_NOTE" | "VIDEO_AUDIO"; language; text; machineGenerated: true; noSpeechDetected; possiblyIncomplete }[];
  safetyFlags: { indicator; matchedIn: "DESCRIPTION" | "TRANSCRIPT" }[];   // deterministic keyword net
  evidenceNotices: { mediaId; label; code; message }[];
  photoAssessments: { mediaId; label; quality; relevance; … }[];
  videoAssessments: { mediaId; label; durationSeconds; partiallyAnalysed; analysedPortion; frames: { atSeconds; outcome; quality; relevance }[]; audio; … }[];
  content: {
    issueSummary: string;
    customerReported: { statements: { id; text; quote; source: { type: "DESCRIPTION" | "VOICE_NOTE" | "VIDEO_AUDIO"; mediaId } }[]; reportedSymptoms; reportedOnset; locationInProperty };
    mediaObservations: { id; evidence: { mediaId; label; frameAtSeconds: number | null }; observation; type; certainty: "CLEAR" | "PROBABLE" | "UNCERTAIN"; relatesToSymptomRefs }[];
    unknownsRequiringInspection: { topic; question; whyUnknown }[];   // always WARRANTY, COST, REPAIR_METHOD
    affectedProducts; potentialIssueCategories: { category; likelihood: "POSSIBLE" | "LIKELY"; basedOnRefs }[];
    urgency: { level: "LOW" | "NORMAL" | "HIGH" | "URGENT"; indicators; reason };
    inspection: { recommended; reason }; recommendedNextStep; moreInformationNeeded: string[];
    confidence: { overall: "LOW" | "MEDIUM" /* never HIGH */; reason }; limitations: string[];
  };
}
```

### Media analysis (`service_media_analyses`, per-file cache)

```ts
interface MediaAnalysis {
  mediaId: string; kind: "TRANSCRIPT" | "IMAGE_OBSERVATIONS" | "VIDEO_OBSERVATIONS";
  inputHash: string; status: "COMPLETED" | "FAILED" | "SKIPPED";
  provider: string; model: string; promptVersion: string;
  result: object | null;          // po-1 photo observation, vp-1 video plan, transcript completeness…
  transcriptText: string | null; language: string | null; errorCode: string | null;
  usage: object; runId: string | null; createdAt: string;
}
```

### Staff review (`service_ai_report_reviews`, append-only, Phase 5)

```ts
interface ReportReview {
  id: string; reportId: string;
  reviewStatus: "APPROVED" | "EDITED" | "REJECTED";
  reviewerStaffId: string; reviewerRole: "STAFF" | "ADMIN";
  notes: string | null;           // required for REJECTED and for replacing a review
  editedReport: StaffEdit | null; // EDITED only
  createdAt: string;
  supersededAt: string | null; supersededBy: string | null;   // replaced by a later review (admin)
}
interface StaffEdit { schema: "staff-edit-1"; issueSummary: string; urgency: { level: "LOW" | "NORMAL" | "HIGH" | "URGENT"; reason: string }; corrections: string }
```
The latest review is mirrored onto the report row (`review_status`,
`reviewed_report`, `reviewed_by`, …) for quick reads.

---

## B. API contract

JSON in/out; every response `Cache-Control: no-store`, `X-Robots-Tag: noindex`.
Full request/response bodies: [API.md](./API.md).

| method | route | auth | request | success | errors | env |
|---|---|---|---|---|---|---|
| POST | `/api/service-requests` | public (rate: idempotency key) | `Idempotency-Key` header + request JSON (≤16 KB) | 201 new / 200 replay: `{ id, reference, status, submittedAt, replayed, upload: { token, expiresAt } }` | 400 `missing_idempotency_key`/`invalid_json`, 413, 415, 422 `validation_failed` (+`fields`), 503 `not_configured`, 500 | DB |
| POST | `/api/service-requests/:ref/media` | upload token (Bearer, 6 h, per request) | `{ clientMediaId, kind, mimeType, size, fileName, source, durationSeconds }` | 200 `{ media, upload: { url, method: "PUT", headers, expiresInSeconds: 7200 } }` | 401 `unauthorised`/`upload_authorisation_expired`, 409 `media_limit_reached`, 422 | DB, storage |
| PUT | *(signed storage URL from above)* | the signed URL | raw file bytes | 200 | storage errors | storage |
| POST | `/api/service-requests/:ref/media/:id/complete` | upload token | — | 200 `{ media }` UPLOADED | 409 `not_uploaded`, 422 `media_rejected` (+`failureReason`), 404 | DB, storage |
| DELETE | `/api/service-requests/:ref/media/:id` | upload token | — | 204 (idempotent) | 401 | DB, storage |
| GET | `/api/service-requests/:ref/media` | upload token | — | 200 `{ media: MediaSummary[] }` (no URLs) | 401 | DB |
| POST | `/api/service-requests/:ref/finalize` | upload token | — | 202 `{ received: true }` (always; no AI content) | 401 | DB (AI vars if enabled) |
| GET | `/api/service-requests/:ref` | `SERVICE_REQUESTS_ADMIN_TOKEN` (testing; superseded by the dashboard) | — | 200 request + customer + history + media with 300 s signed URLs | 404 (disabled/wrong token) | DB, storage, admin token |
| GET | `/api/service-requests/:ref/ai` | admin token | — | 200 runs, reports, analyses, provider/worker status | 404 | DB, AI vars |
| POST | `/api/service-requests/:ref/ai/reprocess` | admin token | — | 202 created / 200 active run | 404, 409 `ai_disabled`/`ai_not_configured` | DB, AI vars |
| POST | `/api/service-requests/maintenance/process-ai` | admin token | — | 200 `{ enabled, enqueued, results }` | 404 | DB, AI vars, video worker |
| POST | `/api/service-requests/maintenance/cleanup-media` | admin token | `{ olderThanHours? }` | 200 `{ removed }` | 404 | DB, storage |
| GET | `/admin/service/:ref/media/:id` | staff session (MFA) | — | 302 → 300 s signed URL | 401 `not_authorised`, 404, 503 | DB, storage, auth |
| POST (server action) | `changeStatusAction` on `/admin/service/:ref` | staff session | form: `reference`, `expectedFrom`, `to`, `note` | `{ ok: true, message }` | `{ ok: false, message, stale? }` — not_authorised, transition_not_allowed, note_required, note_invalid, status_changed (stale), not_found | DB, auth |
| POST (server action) | `reviewReportAction` on `/admin/service/:ref` | staff session (replacing a review: admin) | form: `reference`, `reportId`, `expectedStatus`, `decision`, `notes`, `edit*` | `{ ok: true, message }` | not_authorised, note_required, edited_report_invalid, review_changed / report_superseded (stale), not_found | DB, auth |
| POST (server actions) | `requestCode`, `verifyCode`, `startEnrolment`, `verifyAuthenticator`, `signOut` on `/admin/sign-in` | public → first factor → MFA | form fields | redirect / step state | generic messages only (no account enumeration) | auth, DB |

Server actions are Next.js POST endpoints with build-specific ids; they are not a
stable public API. Integrations should use the JSON API (or a future staff API).

---

## C. Environment variables

Never commit values. "Sensitive" = must never reach a browser or a log.

| name | purpose | server/client | required in | sensitive | provider |
|---|---|---|---|---|---|
| `SUPABASE_URL` | Postgres REST + Storage + Auth base URL | server | any env with the feature | no | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | database/storage access (bypasses RLS) | server | any env with the feature | **yes** | Supabase |
| `SUPABASE_SECRET_KEY` | alternative to the above (new key format) | server | optional | **yes** | Supabase |
| `SUPABASE_ANON_KEY` | staff Auth calls, server-side only (grants no data access) | server | dashboard envs | low (public by design, still kept server-side) | Supabase Auth |
| `SUPABASE_PUBLISHABLE_KEY` | alternative to the anon key | server | optional | low | Supabase Auth |
| `SERVICE_REQUESTS_ADMIN_TOKEN` | enables admin/testing JSON endpoints | server | optional (unset = disabled) | **yes** | — |
| `SERVICE_AI_ENABLED` | AI kill switch | server | optional (unset = off) | no | — |
| `SERVICE_AI_PROVIDER` | `openai` / `stub` | server | when AI on | no | — |
| `OPENAI_API_KEY` | transcription, vision, report synthesis | server | when AI on (`openai`) | **yes** | OpenAI |
| `SERVICE_AI_MODEL_TRANSCRIBE` / `_REPORT` / `_VISION` | model overrides | server | optional | no | OpenAI |
| `SERVICE_AI_REPORT_REASONING` | reasoning effort | server | optional | no | OpenAI |
| `SERVICE_AI_VIDEO_WORKER_SNAPSHOT` | Phase 4E video worker image | server | for video analysis | no | **Vercel Sandbox** |
| `SERVICE_AI_VIDEO_WORKER_REGION` | worker region | server | for video analysis | no | **Vercel Sandbox** |
| `VERCEL_OIDC_TOKEN` | authenticates the Sandbox SDK | server (injected by Vercel) | for video analysis | **yes** | **Vercel** |
| `VERCEL_ENV` | refuses the `stub` AI provider in production | server (injected) | — | no | Vercel (absent elsewhere = treated as non-production) |
| `NEXT_PUBLIC_SERVICE_CALL_CLIENT` | `mock` = wizard with no backend (UI testing) | **client** | optional | no | — |
| `NODE_ENV` | Secure cookie flag | server | (set by Next.js) | no | — |
| `POSTGRES_URL_NON_POOLING` | applying migrations by hand | ops only | — | **yes** | Postgres |

Variables injected by the Supabase/Vercel integration that the code does not
read: `NEXT_PUBLIC_SUPABASE_*`, `POSTGRES_*` (except migrations), `SUPABASE_JWT_SECRET`.
Details per phase: [ENVIRONMENT.md](./ENVIRONMENT.md).

---

## D. UI component map

### Customer Service Call (`/service-call`, Tailwind)

| component | file | role |
|---|---|---|
| `ServiceCallSection` / `ServiceCallWizard` | `src/components/service-call/` | page section; 5-step wizard, draft persistence, submit, upload orchestration |
| steps | `steps/CustomerDetailsStep`, `ProductSelectionStep`, `ProblemStep`, `EvidenceStep`, `ReviewStep`, `UploadStep`, `ConfirmationStep` | one per step |
| `MediaUploader`, `MediaPreviewCard`, `MediaActionButton`, `VoiceRecorder`, `useMediaUploads` | same folder | evidence capture/upload with progress and recovery |
| `ProgressIndicator`, `ServiceSummary`, `fields`, `icons` | same folder | shared UI |
| client boundary | `src/lib/service-call/client.ts` → `http-client.ts` / `mock-client.ts` | the only thing the UI calls; no component imports a backend |

### Staff dashboard (`/admin`)

Presentation is in `src/components/service-dashboard/`; it imports **no**
provider, database, storage or auth code (a test enforces this). Server actions
are passed in as props. Styling is one scoped stylesheet with design tokens
(`src/app/admin/admin.css`, every rule under `.sd`): no dependency on the public
site's components or Tailwind configuration, so the folder can be lifted as-is
(or its tokens translated to Tailwind utilities if preferred).

| area | component | file |
|---|---|---|
| shell | `TopBar` (brand, staff name/role, sign-out action prop) | `TopBar.tsx` |
| sign-in | `SignInForm` (email → code), `MfaForm` (enrol QR / verify) | `SignInForm.tsx`, `MfaForm.tsx` |
| inbox | page + `Pill`, `EvidenceCounts` | `src/app/admin/service/page.tsx`, `bits.tsx` |
| request detail | `CustomerRequest`, `History` | `detail.tsx` |
| evidence | `Evidence` (+ client `PhotoThumb` preview dialog, `VideoWithFrames` seekable frames) | `detail.tsx`, `client.tsx` |
| AI report | `AiReportView`, `AiStateNotice`, `Versions` | `detail.tsx` |
| status management | `StatusForm` (client; options come from the database matrix) | `client.tsx` |
| AI review | `ReviewForm` (client; approve / edit / reject / admin replace) | `client.tsx` |
| domain helpers | labels, inbox query, formatting, types | `src/lib/service-dashboard/{labels,inbox-query,format,types}.ts` |

---

## E. External services

| service | used for | status | classification |
|---|---|---|---|
| **PostgreSQL (Supabase Postgres)** | all service data | Development (+ Preview) only | **required**; standard Postgres → replaceable host |
| **Supabase Auth** | staff sign-in (email code + TOTP) | Development/Preview | **required for the dashboard**; replaceable behind `StaffAuthProvider` |
| **Supabase Storage** | private evidence files (signed upload/read URLs) | Development/Preview | **required for media**; replaceable (S3-compatible) behind the media store / `EvidenceAccess` |
| **PostgREST (Supabase REST API)** | how the server talks to Postgres today | Development/Preview | provider-specific but replaceable (any Postgres driver) |
| **OpenAI** | transcription, photo/frame observation, report synthesis | Development verification only; off in Preview/Production | optional (AI off = everything else works); provider-specific but replaceable (`provider.ts` interface) |
| **Vercel Sandbox** | Phase 4E video worker (ffmpeg frames + audio) | Development verification only | optional; **provider-locked**; needs replacement off Vercel |
| **Vercel (hosting, Deployment Protection, OIDC)** | hosting today; Preview protection | live | replaceable for the app; Sandbox and OIDC tie video analysis to it |
| **Sanity** | site CMS (existing) | existing live dependency | not used by Service & Aftercare |
| **LeadOptimizer / GoHighLevel / LeadConnector** | existing live CRM, forms, media | existing live dependency | **not integrated** by Service & Aftercare (see H) |

---

## F. Portability matrix

| component | classification | migration note |
|---|---|---|
| Next.js app (wizard, API routes, dashboard, `proxy.ts`) | **STANDARD / PORTABLE** | Runs on any Node.js 20+ host with `next start`. No Edge runtime, no Vercel-only APIs in this code. |
| Postgres schema (tables, enums, constraints, PL/pgSQL functions, triggers, RLS) | **STANDARD / PORTABLE** | Plain PostgreSQL 13+. Supabase-specific bits are listed below. |
| Grants to `anon`, `authenticated`, `service_role` | PROVIDER-SPECIFIC BUT REPLACEABLE | These are Supabase role names. On other Postgres: create one application role, grant it `EXECUTE` on the functions and table privileges, drop the `anon`/`authenticated` revokes. |
| Bucket creation in 0002 (`storage.buckets`) | PROVIDER-SPECIFIC BUT REPLACEABLE | Supabase Storage table. Skip on other hosts; create a private bucket in the replacement store. |
| Data access via PostgREST (`server/supabase.ts`, stores, `data.ts`, `staff-store.ts`) | PROVIDER-SPECIFIC BUT REPLACEABLE | Every query is one table read/write or one SQL function call. Replace `supabaseFetch`/`supabaseJson` with a Postgres driver (`pg`) in those modules; SQL functions are unchanged. |
| Private media (Supabase Storage signed URLs) | PROVIDER-SPECIFIC BUT REPLACEABLE | Behind `mediaStore` (upload/complete/sign/delete) and `EvidenceAccess` (dashboard read). R2/S3/UAE Host: implement presigned PUT + presigned GET (or stream through the app). The UI only ever calls application routes. |
| Staff auth (Supabase Auth + `@supabase/ssr`) | PROVIDER-SPECIFIC BUT REPLACEABLE | Behind `StaffAuthProvider` (`auth/provider.ts`); only `supabase-auth.ts` and `supabase-proxy.ts` import Supabase. `staff_members.auth_user_id` has no foreign key to Supabase's `auth.users`. A replacement must provide: server-verified identity, httpOnly cookies, email one-time code, TOTP, server-side revocation. |
| OpenAI | PROVIDER-SPECIFIC BUT REPLACEABLE | Behind `ServiceAiProvider` (`src/lib/service-call/ai/provider.ts`); calls go from the server to `api.openai.com` over HTTPS, which works from any host with outbound access. Data-residency is a business decision (HANDOFF). |
| Background AI processing | STANDARD / PORTABLE | Queue is in Postgres (leases, retries). Triggered by `after()` on finalize and by `POST …/maintenance/process-ai`. Any scheduler (cron, systemd timer, UAE Host scheduler) can call that endpoint with the admin token. **No Vercel Cron is configured.** |
| Phase 4E video worker (Vercel Sandbox) | **PROVIDER-LOCKED** | Needs a replacement worker: anything that can run ffmpeg/ffprobe in isolation on an uploaded file and return frames + audio (a container, a worker VM, a queue consumer). Implement the `VideoProcessor` interface (`src/lib/service-call/ai/provider.ts`; today’s implementation is `server/video-processor.ts`). Without a worker, videos are SKIPPED by AI but still stored and viewable by staff. |
| Vercel Deployment Protection / OIDC trusted header | PROVIDER-LOCKED (ops only) | Only protects Previews; the app does not depend on it. Use the host's own access controls for staging. |
| `after()` (Next.js) | STANDARD / PORTABLE | Part of Next.js; runs after the response on any Node host. |

---

## G. UAE Host portability assessment

Not a migration plan — no change is being made now. What moves as-is and what needs work if Production leaves Vercel:

| area | moves unchanged? | what's needed |
|---|---|---|
| **Next.js application** | **Yes.** `next build && next start` (Node 20+, 24 recommended). | A process manager, TLS and a reverse proxy that preserves `Host`. API bodies are small (≤16 KB): media goes directly to storage via signed URLs. Set the same env vars. `Secure` cookies need HTTPS. |
| **Postgres** | **Schema yes**, Supabase extras no. | Managed Postgres 13+ (UAE region if required). Apply 0001–0004 minus the Supabase-specific grants/bucket lines (F). Replace the PostgREST client with a driver (contained change). Or keep Supabase Postgres (hosted region choice) — the app works unchanged. |
| **Authentication** | Yes **if Supabase Auth is kept** (it is a hosted service; works from any host). | To leave Supabase Auth: implement `StaffAuthProvider` for the chosen provider. Configure SMTP + a code-bearing email template either way. |
| **Private media storage** | Yes if Supabase Storage is kept. | For R2/S3/UAE Host storage: implement the media store's presign/verify/delete and `EvidenceAccess`. The live LeadOptimizer media limit (~4 MB/file) is too small for video and long voice notes, so it isn't a candidate. Keep the bucket private; serve only short-lived URLs. |
| **OpenAI integration** | **Yes** (outbound HTTPS from the server). | Egress to `api.openai.com`; key in the host's secret store. Decide data residency before enabling. |
| **Background processing** | **Yes.** | Long-running functions aren't required: processing runs in `after()` and in the sweep endpoint. On a long-lived Node server, `after()` simply continues after the response. Make sure the host doesn't kill work right after responding (a persistent `next start` is fine). |
| **Phase 4E video worker** | **No.** | Replace Vercel Sandbox with an isolated ffmpeg worker (container/VM). Interface already defined (`VideoProcessor` in `ai/provider.ts`); everything else in 4E (sampling, dedup, frame analysis, validation) is host-independent code. Until replaced: videos are SKIPPED by AI, still stored and viewable. |
| **Scheduled AI processing** | Nothing to move (none configured). | When AI launches: any scheduler calling `POST /api/service-requests/maintenance/process-ai` (and `…/cleanup-media` daily) with the admin token. |
| **Staff dashboard** | **Yes.** | Same as the app + auth decision above. |

**Vercel-specific dependencies remaining:** Vercel Sandbox (+ `VERCEL_OIDC_TOKEN`) for the
Phase 4E video worker; `VERCEL_ENV` as a production guard for the stub AI provider
(absent elsewhere — set an equivalent if needed); Deployment Protection for Previews
(ops only). Nothing in Phase 5 adds any.

**Supabase-specific dependencies remaining:** Supabase Auth (behind `StaffAuthProvider`);
Supabase Storage (behind the media store and `EvidenceAccess`); PostgREST as the DB client;
the `anon`/`authenticated`/`service_role` grant names and the bucket row in the migrations.
The data model itself is plain PostgreSQL.

---

## H. LeadOptimizer integration boundary

Phase 5 chooses the **Swift Rooms staff dashboard** as the primary service tool;
LeadOptimizer is not modified or called. To synchronise later without
duplicating logic:

- **Source of truth:** service cases stay in Postgres (`service_requests` +
  history). LeadOptimizer would receive a *projection*: contact (name, email,
  mobile), reference, product, status, a dashboard deep link
  (`/admin/service/<reference>`) — never AI content or private media.
- **Where to hook:** server-side only, after a committed change —
  request creation (`create_service_request` path in `server/store.ts`) and
  status changes (`changeRequestStatus` in `src/lib/service-dashboard/data.ts`).
  Best as an outbox table processed by the same kind of sweep as AI runs, so a
  CRM outage never blocks a customer or a staff action.
- **Inbound** (CRM → service case) should go through a new authenticated API,
  not the server actions.
- **Media:** stays in private storage; LeadOptimizer's ~4 MB attachment limit
  makes it unsuitable as the evidence store.
