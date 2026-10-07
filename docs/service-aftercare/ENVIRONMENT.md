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
| `SERVICE_AI_ENABLED` | server | no | AI processing kill switch (Phase 4). Only `true`/`1`/`yes`/`on` enables it; unset, empty or `false` disables it. **Unset in every environment today.** Keep Production disabled until the launch decisions in HANDOFF.md are made. No `NEXT_PUBLIC_` equivalent. See AI.md. |
| `SERVICE_AI_PROVIDER` | server | when AI is enabled | `openai` or `stub`. **No default**: unset means AI fails closed (nothing processed). `stub` is refused when `VERCEL_ENV=production`. |
| `OPENAI_API_KEY` | server | with `openai` | OpenAI key for transcription (Phase 4B). Use a project-scoped key with a budget limit. Never `NEXT_PUBLIC_`; never logged; only sent to `api.openai.com`. |
| `SERVICE_AI_MODEL_TRANSCRIBE` | server | no | Transcription model. Default `gpt-transcribe`. |
| `SERVICE_AI_MODEL_REPORT` | server | no | Report-synthesis model (Phase 4C). Default `gpt-6.1-sol`. Recorded on every run and report. |
| `SERVICE_AI_MODEL_VISION` | server | no | Photo-observation model (Phase 4D). Default `gpt-6.1-sol`. |
| `SERVICE_AI_REPORT_REASONING` | server | no | Reasoning effort for synthesis: `none`/`low`/`medium`/`high`. Default `low`; an invalid value falls back to the default. |
| `SERVICE_AI_VIDEO_WORKER_SNAPSHOT` | server | for video | Phase 4E media-worker snapshot id (`snap_…`), built by `scripts/media-worker/build-snapshot.mjs`. With the region below it enables video analysis; without both, videos are SKIPPED and no sandbox is created. |
| `SERVICE_AI_VIDEO_WORKER_REGION` | server | for video | Vercel region the worker runs in (e.g. `bom1`). **Required explicitly** — the SDK default (`iad1`) is never used by omission. Data-residency decision pending (HANDOFF). |
| `VERCEL_OIDC_TOKEN` | server | for video | Provided automatically by Vercel to functions; authenticates the Sandbox SDK. Locally it comes from `vercel env pull` (expires after 12 h). Never logged. |
| `SUPABASE_ANON_KEY` | server | dashboard | Phase 5 staff authentication (Supabase Auth calls, made **server-side only**). Grants no data access (RLS, no grants). `SUPABASE_PUBLISHABLE_KEY` is accepted instead. Without it (and `SUPABASE_URL`), every `/admin` route answers 404. |
| `NEXT_PUBLIC_SERVICE_CALL_CLIENT` | browser | no | Set to `mock` to run the wizard with no backend (nothing is saved). Unset = real API. |

¹ One of the two keys is required. Without `SUPABASE_URL` and a key, the API
returns `503 not_configured` and the customer sees the retry message with the
service phone number.

Only `server/supabase.ts` reads the Supabase variables (used by `store.ts` and
`media-store.ts`), and it is guarded by `import "server-only"`, so a client
import fails the build.

**Phase 4A added `SERVICE_AI_ENABLED`. Phase 4B added `SERVICE_AI_PROVIDER`,
`OPENAI_API_KEY` and `SERVICE_AI_MODEL_TRANSCRIBE`. Phase 4C adds the optional
`SERVICE_AI_MODEL_REPORT` and `SERVICE_AI_REPORT_REASONING`. Phase 4D adds the
optional `SERVICE_AI_MODEL_VISION`. Phase 4E adds `SERVICE_AI_VIDEO_WORKER_SNAPSHOT`
and `SERVICE_AI_VIDEO_WORKER_REGION`. None of these is set in any Vercel
environment; the defaults apply. (4E verification set the worker variables
only in a local process.)**

Where they are set:
- Vercel **Development** only: `OPENAI_API_KEY`, for controlled local verification.
- **Not** Preview or Production.
- `SERVICE_AI_ENABLED` is unset in every environment, so AI stays off.

Production must stay disabled until the launch decisions in HANDOFF.md are made.

**Phase 3 added no environment variables.** Media uses the same Supabase URL
and service-role key, and the bucket name `service-evidence` is a constant in
code and in migration 0002. The browser never receives Supabase credentials:
it gets only per-object signed upload URLs and the per-request upload token.

**Phase 5 added no new variables.** The dashboard reads `SUPABASE_ANON_KEY`
(already present in Development and Preview from the Supabase integration)
server-side for staff Auth; it does not use `SERVICE_REQUESTS_ADMIN_TOKEN`.
Production has none of these, so `/admin` is absent there. A full
name/purpose/sensitivity/provider table for handover is in
[HANDOVER.md](./HANDOVER.md#c-environment-variables).

## Variables the Supabase integration also adds

The Vercel Marketplace Supabase integration injects further variables
(Postgres connection strings, the anon key, `NEXT_PUBLIC_SUPABASE_*`). The
service-request code does not use them (except `SUPABASE_ANON_KEY`, server-side,
for staff Auth since Phase 5). In particular, nothing in the browser uses the anon key. Even if it were used, row level security blocks all access.

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
