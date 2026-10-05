# Service & Aftercare — Architecture

Existing customers report a problem with an installed window, door, glazing or
related system at `/service-call`. Each report becomes a **service request** in
an operational database, with a unique reference (`SR-YYYY-XXXXX`) shown to the
customer.

Service requests are **aftercare cases, not sales leads**. They never go to the
sales pipeline (CallMeBot WhatsApp, LeadOptimizer/CRM) that `/api/enquire`
and the other lead forms use.

## Layers

```
/service-call page (Next.js server component, noindex)
  └─ ServiceCallWizard            src/components/service-call/      UI only
       └─ getServiceRequestClient()  src/lib/service-call/client.ts   picks the client
            ├─ httpServiceRequestClient   http-client.ts   POST /api/service-requests
            └─ mockServiceRequestClient   mock-client.ts   UI work without a backend
                 ↓  HTTP + JSON (contract: api-contract.ts, API.md)
POST /api/service-requests       src/app/api/service-requests/route.ts
  ├─ validateCreatePayload()     src/lib/service-call/server/validate.ts
  └─ getServiceRequestStore()    src/lib/service-call/server/store.ts
       ↓  HTTPS (Supabase REST / PostgREST, service-role key)
Supabase Postgres
  └─ create_service_request()    supabase/migrations/0001_service_requests.sql
       customers · service_requests · status_history · service_reference_counters
```

Rules that keep this portable (Syspree will re-implement it on swiftrooms.ae):

- **Components never touch the backend.** They call `getServiceRequestClient()`.
  Swapping the backend means writing a new `ServiceRequestClient` (see
  `src/lib/service-call/types.ts`), not editing components.
- **The HTTP contract is plain JSON** (`api-contract.ts`, documented in
  [API.md](./API.md)). Any stack can implement the endpoint.
- **The database does the critical work in one transaction**
  (`create_service_request`): customer upsert, reference allocation, request
  insert and the first status-history row. A different API layer only has to
  validate and call that function.
- **Domain types have no vendor types** (`types.ts`): no Next.js, Vercel,
  Sanity or Supabase imports.

Sanity remains the website CMS. It does not store service requests.

## Submission flow (answers)

1. The customer completes five steps (details → product → problem → evidence →
   review). The browser validates each step with `validation.ts`.
2. On **Submit**, the wizard:
   - blocks a second submit while one is in flight (double clicks);
   - reuses the attempt's **idempotency key** if the answers are unchanged, or
     issues a new one if they were edited;
   - saves the key with the draft in `sessionStorage`, so a refresh mid-submit
     retries with the same key.
3. `httpServiceRequestClient` POSTs the answers (no media) with an
   `Idempotency-Key` header, waiting up to 30 s.
4. The API validates again (authoritative), then calls
   `create_service_request(payload, key)`.
5. The database returns the request. A repeated key returns the **original**
   request (`replayed: true`, HTTP 200) instead of creating another.
6. Only when the API confirms does the wizard clear the draft and show the
   confirmation with the reference. On any failure the customer stays on the
   review step with their answers intact and a specific message (see
   [API.md § Errors](./API.md#errors)).

## Media (Phase 3)

Full detail: [MEDIA.md](./MEDIA.md).

```
create request ──▶ reference + upload token
  └─ per file: POST …/media (token) ──▶ signed upload URL
               PUT file ───────────────▶ private bucket `service-evidence` (Supabase Storage)
               POST …/media/:id/complete ▶ size + content verified ──▶ service_media UPLOADED
```

- Files go **straight from the browser to private storage** with a one-object,
  2-hour signed upload URL. They never pass through our API: the create
  endpoint still caps bodies at 16 KB, and Vercel functions cap bodies at
  4.5 MB.
- A sequential reference is **not** a credential. Media endpoints need the
  random upload token returned only to the browser that created the request
  (stored hashed, valid 6 hours).
- The request exists before any upload, so media failures never lose,
  duplicate or renumber it. Each file retries or is removed on its own.
- UI: `useMediaUploads` (queue, retry, remove, refresh recovery) and
  `steps/UploadStep.tsx`, which shows the confirmed reference first. Both reach
  the backend only through `getServiceRequestClient()`.

## AI processing (Phase 4)

Full detail: [AI.md](./AI.md).
- **Phase 4A:** foundation.
- **Phase 4B:** OpenAI voice transcription. Audio is read server-side from the
  private bucket and only the bytes and model are sent; transcripts are cached
  per file.
- **No report is generated with the real provider until 4C.** AI is off
  (`SERVICE_AI_ENABLED` unset) in every deployed environment.

```
Finish ─▶ POST …/finalize (upload token, fire-and-forget, always 202)
              └─ after(): enqueue_service_ai_run ─▶ claim (lease) ─▶ processRun ─▶ complete → report v1, v2, …
sweep (admin endpoint; no cron yet) ─┘          manual reprocess (admin) ─┘
```

- Runs **after** the customer's request is saved, never inside submit or
  upload calls. AI failures can't lose, fail or alter a request.
- **Does not touch `service_requests.status` or `status_history`.** AI state
  lives in `service_ai_runs`. The `AI_PROCESSED` / `AWAITING_REVIEW` request
  statuses stay unused until the staff phase decides transitions with human review.
- `src/lib/service-call/ai/` is vendor-free: schema, validation, fingerprint,
  privacy boundary, provider interface and pipeline. `server/ai-*.ts` wires in
  Supabase and the kill switch (`SERVICE_AI_ENABLED`, off unless set to true).
- Reports are versioned and their AI content is immutable. The original
  submission and media remain the source records.

## Security

- The service-role key lives only in server environment variables and is read
  only in `server/store.ts` (guarded by `import "server-only"`).
- Every table has row level security enabled with no policies, and the
  `anon`/`authenticated` roles have no grants. The public anon key, if exposed,
  can read or write nothing.
- `create_service_request` is executable only by `service_role`.
- The API validates types, lengths and allowed values, rejects non-JSON bodies
  and bodies over 16 KB, and never logs request bodies (PII).
- `GET /api/service-requests/:reference` is disabled unless
  `SERVICE_REQUESTS_ADMIN_TOKEN` is set, and then requires it.
- `/service-call` is `noindex` during development; API responses send
  `X-Robots-Tag: noindex`.

- AI (Phase 4): new tables follow the same rules: RLS with no policies,
  service-role-only functions. Providers receive only allow-listed, scrubbed
  fields (no contact details, references, tokens or URLs). See AI.md.
- Media: private bucket with no storage policies; upload token per request;
  per-object signed upload URLs; four validation layers including a content
  sniff; staff access only through 5-minute signed read URLs (see MEDIA.md).

### ⛔ Launch blockers

- **No rate limiting or bot protection** on `POST /api/service-requests` or the
  media endpoints. Anyone can create requests or exhaust storage. Add Vercel
  Firewall rate-limit rules (per IP, on `/api/service-requests*`) and/or a
  Turnstile challenge on submit **before the page is linked publicly**.
- **Abandoned-upload cleanup is not scheduled** (endpoint exists; see MEDIA.md).
- **Video size**: 50 MB on the Supabase Free plan. Long iPhone videos exceed it;
  a paid plan plus resumable (TUS) uploads are recommended for launch.
- **Production database/bucket** don't exist yet: Production has no Supabase
  variables, by design.
