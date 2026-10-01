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

## Submission flow

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

Phase 2 keeps the media UI (camera, upload, voice note, previews) but **does
not upload anything**. The request records only what was attached
(`declared_media`: photo count, video count, voice note yes/no) so staff know to
ask for it. Media never passes through `POST /api/service-requests` — that
endpoint caps bodies at 16 KB.

Phase 3 plan:

- Upload directly from the browser to object storage (Supabase Storage or
  Vercel Blob) using short-lived signed upload URLs issued by a new endpoint,
  e.g. `POST /api/service-requests/:reference/media`.
- Record each file in a `service_media` table (`service_request_id`, kind,
  storage key, MIME type, size, duration, uploaded_at), replacing
  `declared_media` as the source of truth.
- Voice-note transcripts attach to the `service_media` row.
- Server-side limits must match `MEDIA_LIMITS` in `config.ts`.

## AI (later phase)

An AI triage step will read the request and its media and write an
`ai_reports` row, moving the status `SUBMITTED → AI_PROCESSED → AWAITING_REVIEW`
through status history (`changed_by = 'system'`). It runs **after** the
customer's request is saved, never inside the submit call, so AI outages can't
lose a request.

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

Not yet in place (to add before public launch): rate limiting or bot
protection on the endpoint (for example Vercel Firewall rate-limit rules or
Turnstile).
