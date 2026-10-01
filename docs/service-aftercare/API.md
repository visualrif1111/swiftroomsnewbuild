# Service & Aftercare — API

Types: `src/lib/service-call/api-contract.ts`. All bodies are JSON. All
responses send `Cache-Control: no-store` and `X-Robots-Tag: noindex`.

## POST /api/service-requests

Creates a service request.

### Headers

| header | required | |
|---|---|---|
| `Content-Type: application/json` | yes | otherwise 415 |
| `Idempotency-Key: <uuid>` | yes | one per submit attempt; reuse it on retries |

### Body (max 16 KB)

```json
{
  "customer": {
    "fullName": "Aisha Khan",
    "countryCode": "+971",
    "mobile": "50 123 4567",
    "email": "aisha@example.com",
    "location": "Villa 12, Arabian Ranches, Dubai",
    "isExistingCustomer": true,
    "reference": "INV-2041"
  },
  "productIds": ["sliding-door", "other"],
  "otherProduct": "Insect screen",
  "description": "The living room sliding door catches halfway when opening.",
  "declaredMedia": { "photos": 2, "videos": 0, "voiceNote": false }
}
```

| field | rules |
|---|---|
| customer.fullName | required, ≤ 120 chars |
| customer.countryCode | one of the codes in `COUNTRY_CODES` (`config.ts`) |
| customer.mobile | required; digits (spaces/dashes ignored), without the leading 0; length must match the country |
| customer.email | required, valid address, ≤ 254 chars |
| customer.location | required, ≤ 300 chars |
| customer.isExistingCustomer | `true`, `false` or `null` (not answered) |
| customer.reference | optional, ≤ 100 chars |
| productIds | ≥ 1 of `window`, `sliding-door`, `bi-fold-door`, `entrance-door`, `glass`, `hardware`, `motorised-system`, `curtain-wall`, `other` |
| otherProduct | optional, ≤ 120 chars; ignored unless `other` is selected |
| description | ≤ 2000 chars; required unless media was declared |
| declaredMedia | counts 0–10 and a voice-note flag. Media files are **not** sent here (Phase 3). |

### Responses

**201 Created**: a new request.
**200 OK**: this `Idempotency-Key` already created a request; the original is
returned and nothing new is created.

```json
{
  "id": "6f1c…",
  "reference": "SR-2026-00042",
  "status": "SUBMITTED",
  "submittedAt": "2026-10-01T09:30:12.345Z",
  "replayed": false
}
```

### Errors

```json
{ "error": "validation_failed", "message": "Some details need correcting.",
  "fields": { "customer.email": "Enter a valid email address, like name@example.com." } }
```

| status | error | when | what the customer sees |
|---|---|---|---|
| 400 | `missing_idempotency_key` | header absent or not a UUID | (client bug) generic retry message |
| 400 | `invalid_json` | body isn't JSON | generic retry message |
| 413 | `payload_too_large` | body > 16 KB | generic retry message |
| 415 | `unsupported_media_type` | not `application/json` | generic retry message |
| 422 | `validation_failed` | rules above; `fields` maps field path → message | "Some details need checking: …" + Edit |
| 503 | `not_configured` | database env vars missing | retry message with the service phone number |
| 500 | `server_error` | database unreachable or failed | retry message with the service phone number |

Browser-side failures, from `httpServiceRequestClient`:

| kind | when | message |
|---|---|---|
| `network` | offline / connection dropped | check your connection and try again |
| `timeout` | no response in 30 s | try again; a retry can't create a duplicate |

In every failure case the wizard stays on the review step, keeps everything the
customer entered (including across a refresh) and shows **no reference**. A
reference appears only after a 200/201.

### Idempotency

- The browser generates one UUID per submit attempt.
- Retrying the **same answers** (button again, after a timeout, after a
  refresh) sends the **same key**, so the server returns the original request.
- Changing any answer before retrying issues a **new key**: it's a different
  request. Attachments are excluded from this comparison, because they can't
  survive a refresh.
- Concurrent requests with the same key are safe: exactly one is created (the
  database enforces `UNIQUE (idempotency_key)`).

## GET /api/service-requests/:reference

Reads one request with its customer and status history. For staff and testing
only.

- Disabled (404) unless `SERVICE_REQUESTS_ADMIN_TOKEN` is set on the server.
- Requires `Authorization: Bearer <SERVICE_REQUESTS_ADMIN_TOKEN>`. Wrong or
  missing token → 404, the same response as "disabled".
- `:reference` must match `SR-YYYY-NNNNN`.

```json
{
  "id": "…", "reference": "SR-2026-00042", "status": "SUBMITTED",
  "createdAt": "…", "updatedAt": "…",
  "customer": { "id": "…", "fullName": "…", "email": "…", "mobileE164": "+971501234567", "location": "…" },
  "submitted": {
    "customerName": "…", "email": "…", "mobileE164": "…", "location": "…",
    "existingCustomer": true, "projectReference": "INV-2041",
    "productCategories": ["sliding-door", "other"], "otherProduct": "Insect screen",
    "problemDescription": "…", "declaredMedia": { "photos": 2, "videos": 0, "voiceNote": false },
    "channel": "website/service-call"
  },
  "statusHistory": [
    { "fromStatus": null, "toStatus": "SUBMITTED", "changedBy": "customer", "note": "Submitted via website/service-call", "changedAt": "…" }
  ]
}
```

The staff dashboard (later phase) will replace this with proper staff
authentication.

## Example

```bash
curl -X POST "$SITE/api/service-requests" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d @request.json
```
