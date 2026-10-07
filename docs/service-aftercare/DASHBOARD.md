# Service & Aftercare — Staff Dashboard (Phase 5)

The internal Swift Rooms service-team dashboard: inbox, request detail,
evidence, AI report, status workflow and AI review. Handover material for
Syspree is in [HANDOVER.md](./HANDOVER.md).

**Status:** Development and protected Preview only. Production has no staff
authentication, no database and no dashboard: every `/admin` route answers
404 there (it fails closed when its variables are absent).

## Routes

| route | what | auth |
|---|---|---|
| `/admin` | redirects to `/admin/service` | — |
| `/admin/sign-in` | email address → one-time code | public (shows nothing else) |
| `/admin/sign-in/mfa` | authenticator enrolment or verification | first factor done + allow-listed |
| `/admin/service` | inbox: search, filters, pagination | staff (MFA) |
| `/admin/service/[reference]` | request detail; `?version=N` shows an older report version | staff (MFA) |
| `/admin/service/[reference]/media/[mediaId]` | authorised evidence: 302 to a 5-minute signed URL | staff (MFA) |
| Server actions | `changeStatusAction`, `reviewReportAction` (`src/app/admin/service/actions.ts`), sign-in actions (`src/app/admin/sign-in/actions.ts`) | each verifies itself |

All `/admin` responses: `Cache-Control: private, no-store`, `X-Robots-Tag:
noindex, nofollow`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`
(`next.config.ts`, `src/proxy.ts`), plus `<meta name="robots" content="noindex">`.

## Layers

```
presentation   src/components/service-dashboard/*      React + scoped CSS (src/app/admin/admin.css)
                 — no provider, store or server imports (enforced by tests/service-dashboard/access.test.mjs)
routes/actions src/app/admin/**                          pages, server actions, the evidence route
domain         src/lib/service-dashboard/labels.ts, inbox-query.ts, format.ts, types.ts, auth/access.ts
auth           src/lib/service-dashboard/auth/session.ts   getCurrentStaff / requireStaff / requireAdmin / requireStaffPage
               src/lib/service-dashboard/auth/provider.ts  StaffAuthProvider interface
               src/lib/service-dashboard/auth/supabase-auth.ts, supabase-proxy.ts   the Supabase Auth adapter (only files importing @supabase/ssr)
data           src/lib/service-dashboard/data.ts, staff-store.ts   Postgres via PostgREST (service role)
media          src/lib/service-dashboard/evidence-access.ts         EvidenceAccess interface; Supabase Storage implementation
database       supabase/migrations/0004_service_dashboard.sql
```

## Authentication

- **First factor:** passwordless email one-time code (`signInWithOtp` with
  `shouldCreateUser: false`, verified with `verifyOtp`). The form answers
  identically whether the address exists, is rate limited or was sent, so it
  can't be used to discover staff addresses.
- **Allow-list before MFA:** after the code is verified, the account must be an
  active row in `staff_members`; otherwise the session is signed out at once.
  Non-staff never reach authenticator enrolment.
- **Mandatory second factor:** TOTP authenticator app. First sign-in enrols
  (QR code + manual key), later sign-ins verify. The session must be at
  assurance level `aal2`, and the TOTP verification must be **less than 12 hours
  old**; otherwise the user is asked for a fresh code.
- **Sessions:** `@supabase/ssr` cookies, set **httpOnly, Secure (outside local
  dev), SameSite=Lax, max-age 12 h**. The browser never talks to Supabase Auth
  and page scripts can't read the tokens (`document.cookie` shows nothing).
- **Sign-out** revokes the session server-side: replaying the old cookies is refused.

### The security boundary

`proxy.ts` is **not** the boundary. It refreshes session cookies and redirects
signed-out page loads; it never redirects POSTs, so server actions always answer
for themselves. Every privileged entry point verifies independently:

| entry point | check |
|---|---|
| server pages | `requireStaffPage()` → redirect to the right sign-in step |
| server actions | the data function they call runs `requireStaff()` |
| data functions (`listInbox`, `getRequestDetail`, `changeRequestStatus`, `reviewAiReport`, `signEvidence`) | `requireStaff()` first |
| evidence route | `requireStaff()` (via `signEvidence`) → 401 |
| database functions | the actor's auth user id must belong to an **active** `staff_members` row; ADMIN-only rules are re-checked in SQL |

`requireStaff()` = `supabase.auth.getUser()` (Supabase Auth validates the token:
signature, expiry, session still exists) + assurance level + `staff_members`
row (active, matching user id) + role where required. Cached once per request
(React `cache`).

The **actor is never taken from the browser.** Mutations pass the verified
session's auth user id to SQL; any `actor`/`staffId` fields posted are ignored
(tested). Never exposed to the browser: `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_SECRET_KEY`, `SERVICE_REQUESTS_ADMIN_TOKEN`, `OPENAI_API_KEY`
(scanned in every client script by the E2E run). The shared admin token is not
used by the dashboard at all.

### Managing staff (documented procedure; no UI in Phase 5)

Run as the database owner (Supabase SQL editor or `psql`). Never use real
employees before the Production launch decisions.

```sql
-- 1. Create the Auth user (Supabase dashboard → Authentication → Add user, or the admin API),
--    with "auto confirm" on. Copy its user id.
-- 2. Allow-list it:
insert into public.staff_members (auth_user_id, display_name, role)
values ('<auth user id>', '<name shown in audit trails>', 'STAFF');   -- or 'ADMIN'

-- Change role:
update public.staff_members set role = 'ADMIN' where auth_user_id = '<id>';

-- Remove access (history keeps pointing at the row, so deactivate — don't delete):
update public.staff_members set active = false, deactivated_at = now() where auth_user_id = '<id>';
-- Reinstate:
update public.staff_members set active = true, deactivated_at = null where auth_user_id = '<id>';

-- Lost authenticator: delete the user's TOTP factor in Supabase Auth (dashboard → user → MFA),
-- then they enrol again at next sign-in.
```

Deactivation takes effect on the next request (no cached sessions are trusted).

## Status workflow

Rules live in the database (`service_status_transitions`, 28 rows, fixed by the
migration — inserts/updates/deletes are rejected). The UI offers exactly the
rows permitted for the viewer's role, but the database is authoritative.

| from | to | role | note |
|---|---|---|---|
| SUBMITTED | AWAITING_REVIEW | staff | optional |
| SUBMITTED | MORE_INFORMATION_REQUIRED | staff | **required** |
| SUBMITTED | INSPECTION_REQUIRED | staff | optional |
| SUBMITTED | CLOSED | **admin** | **required** |
| AWAITING_REVIEW | MORE_INFORMATION_REQUIRED | staff | **required** |
| AWAITING_REVIEW | INSPECTION_REQUIRED | staff | optional |
| AWAITING_REVIEW | SCHEDULED | staff | **required** |
| AWAITING_REVIEW | RESOLVED | staff | **required** |
| AWAITING_REVIEW | CLOSED | **admin** | **required** |
| MORE_INFORMATION_REQUIRED | AWAITING_REVIEW | staff | optional |
| MORE_INFORMATION_REQUIRED | INSPECTION_REQUIRED | staff | optional |
| MORE_INFORMATION_REQUIRED | CLOSED | **admin** | **required** |
| INSPECTION_REQUIRED | SCHEDULED | staff | optional |
| INSPECTION_REQUIRED | MORE_INFORMATION_REQUIRED | staff | **required** |
| INSPECTION_REQUIRED | AWAITING_REVIEW | staff | **required** |
| INSPECTION_REQUIRED | CLOSED | **admin** | **required** |
| SCHEDULED | IN_PROGRESS | staff | optional |
| SCHEDULED | INSPECTION_REQUIRED | staff | **required** |
| SCHEDULED | MORE_INFORMATION_REQUIRED | staff | **required** |
| SCHEDULED | CLOSED | **admin** | **required** |
| IN_PROGRESS | RESOLVED | staff | **required** |
| IN_PROGRESS | SCHEDULED | staff | **required** |
| IN_PROGRESS | MORE_INFORMATION_REQUIRED | staff | **required** |
| IN_PROGRESS | INSPECTION_REQUIRED | staff | **required** |
| RESOLVED | CLOSED | staff | optional |
| RESOLVED | IN_PROGRESS | staff | **required** (reopen) |
| RESOLVED | AWAITING_REVIEW | staff | **required** (reopen) |
| CLOSED | AWAITING_REVIEW | **admin** | **required** (reopen) |

No same-status changes; nothing returns to SUBMITTED; `AI_PROCESSED` stays in
the enum but has no transitions (AI never drives the service status). Notes:
3–2,000 characters after trimming, internal only.

`change_service_request_status(request, expected_from, to, auth_user_id, note)`
does everything in one transaction: active-staff check → row lock (`FOR UPDATE`)
→ **expected status must equal the current status** (else `status_changed`) →
matrix + role (`transition_not_allowed`) → note (`note_required`/`note_invalid`)
→ update → history row. A trigger rejects any other status update, and
`status_history` is append-only (it goes only with its request, by cascade).

Every staff transition records `from_status`, `to_status`, `changed_at`,
`changed_by` (`staff:<staff id>`), `actor_staff_id`, `actor_role` (the role at
the time) and `note`.

**Concurrency:** if two people act on the same request, the second gets
`status_changed`: nothing is overwritten, the page refreshes to the latest
status and history, and an amber notice explains what happened.

## AI review

`review_service_ai_report(report, expected_status, status, auth_user_id, notes, edited_report)`:

- APPROVED, EDITED (with a staff-edited version: summary, staff urgency + reason,
  corrections — schema `staff-edit-1`) or REJECTED (note required).
- Only the current (non-superseded) report version can be reviewed.
- First review: any staff. Changing an existing review: **admin only**, note
  required; the previous review is kept and marked superseded
  (`service_ai_report_reviews` is append-only).
- The original `ai_report` is immutable (0003 guard); review columns on
  `service_ai_reports` change only through this function (0004 guard).
- `expected_status` gives the same no-overwrite behaviour as status changes (`review_changed`).

## Inbox

`list_service_requests(...)` (SQL, `SECURITY DEFINER`, service role only):
search by reference, customer name, email or phone (UAE national `05x…` and
international forms; LIKE wildcards escaped), filters for status (default:
open = not resolved/closed), urgency (from the current report; `NONE` when no
report), product, AI state (NOT_STARTED / PROCESSING / PARTIAL / FAILED /
COMPLETED, derived from the latest run), date range (Gulf Standard Time days),
sort newest / oldest / most urgent, 25 per page (server cap 100). The URL holds
the state (`?q=&status=&urgency=&product=&ai=&from=&to=&sort=&page=`), so views
are shareable. The inbox loads **no evidence** — counts only.

## Request detail

Order of information: request facts (service status, AI processing state,
urgency, report version, staff review) → status + history (sidebar) →
**customer request as submitted** (always shown, independent of AI) →
evidence → AI report → report versions.

The AI report is clearly marked **"AI-assisted report — staff verification
required"** and never presents a fault, cause, liability, warranty, repair
method, price or appointment as confirmed ("Possible issue areas (not
confirmed)", "AI-suggested next step (nothing has been booked)").

Three kinds of content never share a style:

| kind | treatment |
|---|---|
| Customer reported information | blue left rule, quoted words, source chip (written description / voice note N / video N audio) |
| Observations from provided media | teal bordered cards, evidence chip linking to the exact photo or video frame time, certainty |
| Unknown / requires inspection | amber dashed blocks with topic and why it's unknown |
| Discrepancies | separate red section (conflicting statements, product-selection mismatch, media vs customer) |

Plus urgency/safety (with the deterministic safety-keyword flags, independent
of the AI), evidence limitations (coverage failures, evidence notices, model
limitations, confidence) and staff review.

AI failure never hides the request: NOT_STARTED, PROCESSING, PARTIAL, FAILED
and "no report" each get a plain explanation; per-file failures (transcription,
photo analysis, video analysis, unsupported formats) are shown on the evidence
item itself.

## Evidence

- `<img>`, `<audio>`, `<video>` point at `/admin/service/<ref>/media/<id>`;
  each load re-verifies staff and redirects to a **300-second** signed URL for
  that one object. No storage URL is embedded in the page.
- Audio and video use `preload="none"`; photos `loading="lazy"`. Nothing is
  fetched until it's on screen or played.
- A media id is only served under its own request's reference.
- Photos: thumbnail + full-size preview dialog + quality/relevance + the AI's
  observations for that photo. Voice: player + machine transcript with
  provenance ("the recording is the authoritative evidence") + incompleteness
  notice. Video: player + every sampled frame with timestamp (click to seek),
  outcome, quality, and the observations made at that instant + the
  video-audio transcript and its span.

## Tests

| suite | what |
|---|---|
| `tests/service-call/dashboard-db.test.mjs` (PGlite) | matrix seeded exactly; all 81 status pairs × 2 roles; notes; audit columns; inactive/unknown actors; concurrency; append-only history; status guard; AI review incl. supersession and immutability; inbox search/filters/pagination; lockdown; 0004 additivity |
| `tests/service-dashboard/access.test.mjs` | access decision (signed out, not allow-listed, inactive, MFA enrol/verify/12 h, roles); inbox query validation; architecture guards (presentation isolation, provider isolation, no Vercel-only packages, no secrets in client components) |
| `tests/service-dashboard/e2e/seed-dev.mjs` | Development seed/teardown (synthetic; refuses other projects) |
| `tests/service-dashboard/e2e/run-e2e.mjs` | browser E2E against a build + Development Supabase: 128 checks (auth boundary, forged/expired/revoked sessions, direct server-action POSTs, cookies, client bundle secret scan, inbox, detail, provenance, evidence signing/expiry, AI states, full status lifecycle, concurrency, reviews, responsive, axe WCAG 2 A/AA) |

```bash
set -a; source <dev env>; set +a
node --experimental-transform-types --import ./tests/support/register.mjs tests/service-dashboard/e2e/seed-dev.mjs seed
E2E_BASE=http://localhost:3000 PLAYWRIGHT_CORE=<path>/playwright-core/index.mjs E2E_CHROMIUM=<chrome> E2E_AXE=<axe.min.js> \
  node tests/service-dashboard/e2e/run-e2e.mjs        # add E2E_OIDC_HEADER=1 for a protected Preview
node --experimental-transform-types --import ./tests/support/register.mjs tests/service-dashboard/e2e/seed-dev.mjs teardown
```

The E2E run uses one synthetic Auth account (`phase5.synthetic.staff@example.com`,
undeliverable by design); its email code comes from the admin API and its TOTP
secret exists only in the test process. Teardown removes it.

## Before real staff use

1. Custom SMTP for Supabase Auth (the default sender only delivers to project
   team members and is heavily rate limited), and an email template containing
   the one-time code (`{{ .Token }}`) rather than only a link.
2. Real staff accounts via the procedure above.
3. A Production database/auth decision (HANDOVER.md, UAE Host assessment).
