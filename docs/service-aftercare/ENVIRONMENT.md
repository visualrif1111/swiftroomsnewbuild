# Service & Aftercare — Environment

Names only. **Never commit values.** `.env.local` is git-ignored, and
`.env.example` lists the names with empty values.

## Variables the code reads

| name | where | required | purpose |
|---|---|---|---|
| `SUPABASE_URL` | server | yes | Supabase project URL, e.g. `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes¹ | Service-role key. Bypasses RLS, so it must **never** be exposed to the browser or given a `NEXT_PUBLIC_` prefix. |
| `SUPABASE_SECRET_KEY` | server | alt¹ | Newer-style secret key, used if `SUPABASE_SERVICE_ROLE_KEY` is absent |
| `SERVICE_REQUESTS_ADMIN_TOKEN` | server | no | Enables `GET /api/service-requests/:reference` for staff/testing. Unset = endpoint disabled. Use a long random value (e.g. `openssl rand -hex 32`). |
| `NEXT_PUBLIC_SERVICE_CALL_CLIENT` | browser | no | Set to `mock` to run the wizard with no backend (nothing is saved). Unset = real API. |

¹ One of the two keys is required. Without `SUPABASE_URL` and a key, the API
returns `503 not_configured` and the customer sees the retry message with the
service phone number.

Only `server/supabase.ts` reads the Supabase variables (used by `store.ts` and
`media-store.ts`), and it is guarded by `import "server-only"`, so a client
import fails the build.

**Phase 3 added no environment variables.** Media uses the same Supabase URL
and service-role key, and the bucket name `service-evidence` is a constant in
code and in migration 0002. The browser never receives Supabase credentials:
it gets only per-object signed upload URLs and the per-request upload token.

## Variables the Supabase integration also adds

The Vercel Marketplace Supabase integration injects further variables
(Postgres connection strings, the anon key, `NEXT_PUBLIC_SUPABASE_*`). The
service-request code does not use them. In particular, nothing in the browser
uses the anon key. Even if it were used, row level security blocks all access.

`POSTGRES_URL_NON_POOLING` (if present) is the convenient connection string
for applying migrations with `psql`.

## Environments

| Vercel environment | database |
|---|---|
| Development (local, `vercel env pull`) | development Supabase project |
| Preview (branch deployments) | development Supabase project |
| Production | **not connected** during development. The variables are deliberately absent, so `/api/service-requests` answers 503 there. |

Before launch, create a separate production Supabase project, run **both**
migrations there (0002 creates the private bucket), and set its variables for
Production only. Never point Preview at production data. On a paid plan, raise
the bucket's `file_size_limit` and `MEDIA_LIMITS.maxVideoBytes` together.

## Local development

```bash
vercel env pull .env.local --environment=development   # Supabase vars
npm run dev
```

To work on the UI with no database:

```bash
NEXT_PUBLIC_SERVICE_CALL_CLIENT=mock npm run dev
```
