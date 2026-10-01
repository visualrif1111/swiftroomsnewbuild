# Service & Aftercare — Database

Supabase (Postgres 15+). Schema: `supabase/migrations/0001_service_requests.sql`.

## Entities

```
customers 1 ──< service_requests 1 ──< status_history
                       │
                       ├──< service_media      (Phase 3)
                       ├──< ai_reports         (later)
                       ├──< staff_notes        (later)
                       └──< appointments       (later)

service_reference_counters   (one row per year, allocates SR numbers)
```

Phase 2 creates `customers`, `service_requests`, `status_history` and
`service_reference_counters`. The later tables are listed so their foreign keys
can be planned: each references `service_requests.id`.

### customers

One row per person, matched on **case-insensitive email + mobile (E.164)**. A
repeat submission with the same email and mobile updates `full_name` and
`location` to the latest values and links the new request to the same
customer. A different email *or* a different mobile creates a new customer:
merging on either alone risks attaching one person's requests to another's
record.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| full_name | text | latest submitted |
| email | text | stored lower-case; unique with mobile |
| mobile_e164 | text | e.g. `+971501234567` |
| location | text | latest submitted |
| created_at / updated_at | timestamptz | `updated_at` maintained by trigger |

### service_requests

Keeps a **snapshot** of what the customer submitted, so later edits to
`customers` never change the historical record.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| reference | text unique | `SR-YYYY-XXXXX` |
| customer_id | uuid FK → customers | |
| customer_name | text | as submitted |
| mobile_country_code | text | `+971` |
| mobile_national | text | digits only |
| mobile_e164 | text | |
| email | text | lower-case |
| location | text | property / location |
| existing_customer | boolean null | null = not answered |
| project_reference | text null | project / invoice / reference number |
| product_categories | text[] | ≥ 1; the form allows several. Values: `window`, `sliding-door`, `bi-fold-door`, `entrance-door`, `glass`, `hardware`, `motorised-system`, `curtain-wall`, `other` |
| other_product | text null | only when `other` is selected |
| problem_description | text | may be empty if media was attached |
| declared_media | jsonb | `{"photos":n,"videos":n,"voiceNote":bool}` — attached in the browser, not uploaded (Phase 3 replaces this with `service_media`) |
| status | `service_request_status` | default `SUBMITTED` |
| channel | text | `website/service-call` |
| idempotency_key | uuid unique | one request per submit attempt |
| created_at / updated_at | timestamptz | |

Indexes: `customer_id`; `(status, created_at desc)` for staff queues.

### status_history

Append-only audit trail. Every status change writes a row; the request's
`status` column is the current value.

| column | type | notes |
|---|---|---|
| id | bigint identity PK | |
| service_request_id | uuid FK → service_requests (cascade) | |
| from_status | status null | null for the first entry |
| to_status | status | |
| changed_by | text | `customer`, `system`, later a staff user id |
| note | text null | |
| changed_at | timestamptz | |

New requests get one row: `null → SUBMITTED`, `changed_by = 'customer'`.

### service_reference_counters

| column | type |
|---|---|
| year | integer PK |
| last_value | integer |

## Status model

`service_request_status` enum:

| status | meaning |
|---|---|
| SUBMITTED | received from the customer (initial) |
| AI_PROCESSED | automated triage has run |
| AWAITING_REVIEW | waiting for the service team |
| MORE_INFORMATION_REQUIRED | customer asked for more detail or media |
| INSPECTION_REQUIRED | a site visit is needed |
| SCHEDULED | visit booked |
| IN_PROGRESS | engineer attending / parts on order |
| RESOLVED | fixed, awaiting confirmation |
| CLOSED | complete |

Phase 2 only creates `SUBMITTED`. Transition rules (which status can follow
which) belong to the staff phase. Whatever enforces them must update
`service_requests.status` **and** insert a `status_history` row in the same
transaction.

## Reference numbers

Format `SR-YYYY-XXXXX`: the year in **Dubai time** (Asia/Dubai), then a
five-digit sequence that restarts each year. Past 99,999 it grows to six digits
rather than truncating.

Allocation happens **inside** `create_service_request`, never in the browser:

```sql
insert into service_reference_counters as c (year, last_value)
values (v_year, 1)
on conflict (year) do update set last_value = c.last_value + 1
returning c.last_value
```

The upsert takes a row lock on that year's counter, so concurrent submissions
queue on it and each receives a distinct number. `reference` is also `UNIQUE`,
a second guarantee. If anything later in the transaction fails, the counter
increment rolls back with it, so failed submissions don't burn numbers. (A
number can still be skipped if the database connection drops after the
increment, which is acceptable.)

## create_service_request(p_payload jsonb, p_idempotency_key uuid)

`SECURITY DEFINER`, executable only by `service_role`. Returns
`(id, reference, status, created_at, replayed)`.

1. If a request already has this idempotency key, return it with
   `replayed = true`.
2. Upsert the customer on (lower(email), mobile_e164).
3. Allocate the next reference.
4. Insert the request (snapshot fields from the payload).
5. Insert `status_history` (`null → SUBMITTED`).
6. If two calls with the same key race, the loser hits the unique constraint,
   its writes roll back, and it returns the winner's request.

The payload keys are those of `ValidServiceRequest` in
`src/lib/service-call/server/validate.ts`. The API validates before calling,
and table constraints (NOT NULL, CHECK on categories) are the backstop.

## Access control

- Row level security is **enabled on every table with no policies**, so
  `anon` and `authenticated` see nothing.
- Table privileges are revoked from `anon` and `authenticated`.
- Only `service_role` (server-side) can call `create_service_request`, and it
  bypasses RLS for reads.
- The later staff dashboard should use authenticated staff users with explicit
  RLS policies (or keep all access server-side), not the service role in the
  browser.

## Applying the migration

Run `supabase/migrations/0001_service_requests.sql` once against the project's
database, either in the Supabase SQL editor or with
`psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0001_service_requests.sql`.
It is not idempotent: it creates types and tables, so run it once per database.
