// Phase 5: the staff access decision, inbox query parsing, and architecture
// guards (provider isolation, no Vercel lock-in, no secrets in client code).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { decideAccess, MFA_MAX_AGE_SECONDS } from "../../src/lib/service-dashboard/auth/access.ts";
import { parseInboxQuery, toRpcArgs, inboxHref, PAGE_SIZE } from "../../src/lib/service-dashboard/inbox-query.ts";

const NOW = 1_800_000_000;
const staff = (o = {}) => ({ id: "s1", authUserId: "u1", displayName: "Synthetic", role: "STAFF", active: true, ...o });
const base = (o = {}) => ({ userId: "u1", staff: staff(), hasVerifiedTotp: true, aal: "aal2", totpVerifiedAt: NOW - 60, nowSeconds: NOW, ...o });

test("access: signed out", () => {
  assert.equal(decideAccess(base({ userId: null })).kind, "SIGNED_OUT");
});

test("access: not allow-listed, inactive, or allow-list row for someone else → NOT_AUTHORISED (before any MFA step)", () => {
  assert.equal(decideAccess(base({ staff: null })).kind, "NOT_AUTHORISED");
  assert.equal(decideAccess(base({ staff: staff({ active: false }) })).kind, "NOT_AUTHORISED");
  assert.equal(decideAccess(base({ staff: staff({ authUserId: "someone-else" }) })).kind, "NOT_AUTHORISED");
  assert.equal(decideAccess(base({ staff: null, hasVerifiedTotp: false, aal: "aal1" })).kind, "NOT_AUTHORISED", "non-staff never reach enrolment");
});

test("access: MFA is mandatory — enrol, then verify; stale verification (> 12 h) must be repeated", () => {
  assert.equal(decideAccess(base({ hasVerifiedTotp: false, aal: "aal1", totpVerifiedAt: null })).kind, "MFA_ENROLL");
  assert.equal(decideAccess(base({ aal: "aal1", totpVerifiedAt: null })).kind, "MFA_VERIFY");
  assert.equal(decideAccess(base({ aal: null })).kind, "MFA_VERIFY");
  assert.equal(decideAccess(base({ totpVerifiedAt: NOW - MFA_MAX_AGE_SECONDS - 1 })).kind, "MFA_VERIFY");
  assert.equal(decideAccess(base({ totpVerifiedAt: NOW - MFA_MAX_AGE_SECONDS })).kind, "OK");
  assert.equal(decideAccess(base({ totpVerifiedAt: null })).kind, "MFA_VERIFY");
});

test("access: roles — staff vs admin", () => {
  assert.equal(decideAccess(base()).kind, "OK");
  assert.equal(decideAccess(base({ minRole: "ADMIN" })).kind, "FORBIDDEN_ROLE");
  assert.equal(decideAccess(base({ minRole: "ADMIN", staff: staff({ role: "ADMIN" }) })).kind, "OK");
  assert.equal(decideAccess(base({ minRole: "STAFF", staff: staff({ role: "ADMIN" }) })).kind, "OK");
});

test("inbox query: defaults, validation, bounds; unknown values dropped", () => {
  const d = parseInboxQuery({});
  assert.deepEqual([d.status, d.sort, d.page, d.urgency, d.product, d.ai], ["open", "newest", 1, null, null, null]);
  assert.ok(!d.statuses.includes("RESOLVED") && !d.statuses.includes("CLOSED"), "open excludes resolved/closed");
  const bad = parseInboxQuery({ status: "DROP TABLE", urgency: "'; --", product: "x", ai: "MAYBE", from: "2026-13-45", to: "yesterday", sort: "evil", page: "-3", q: "a".repeat(500) });
  assert.deepEqual([bad.status, bad.urgency, bad.product, bad.ai, bad.from, bad.to, bad.sort, bad.page, bad.search.length], ["open", null, null, null, null, null, "newest", 1, 100]);
  const q = parseInboxQuery({ q: " SR-2026-00001 ", status: "CLOSED", urgency: "URGENT", product: "window", ai: "FAILED", from: "2026-10-01", to: "2026-10-07", sort: "urgency", page: "3" });
  const a = toRpcArgs(q);
  assert.equal(a.p_search, "SR-2026-00001");
  assert.deepEqual([a.p_statuses, a.p_urgencies, a.p_products, a.p_ai_states, a.p_sort], [["CLOSED"], ["URGENT"], ["window"], ["FAILED"], "urgency"]);
  assert.equal(a.p_from, "2026-09-30T20:00:00.000Z", "Dubai midnight");
  assert.equal(a.p_to, "2026-10-07T20:00:00.000Z", "'to' includes the whole day");
  assert.deepEqual([a.p_limit, a.p_offset], [PAGE_SIZE, 50]);
  assert.equal(parseInboxQuery({ status: "all" }).statuses, null);
  assert.equal(inboxHref(q, { page: "4" }), "/admin/service?q=SR-2026-00001&status=CLOSED&urgency=URGENT&product=window&ai=FAILED&from=2026-10-01&to=2026-10-07&sort=urgency&page=4");
  assert.equal(inboxHref(d, {}), "/admin/service");
});

// ─── Architecture guards ────────────────────────────────────────────────────
const ROOT = path.resolve(import.meta.dirname, "../..");
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? walk(path.join(dir, f)) : [path.join(dir, f)]));
const src = (dir) => walk(path.join(ROOT, dir)).filter((f) => /\.(ts|tsx)$/.test(f)).map((f) => ({ f: path.relative(ROOT, f), s: readFileSync(f, "utf8") }));
const imports = (s) => [...s.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);

test("architecture: presentation components import no providers, stores, server code or app routes", () => {
  for (const { f, s } of src("src/components/service-dashboard")) {
    for (const i of imports(s)) {
      assert.ok(!/supabase|@\/app\/|service-call\/server|\/data$|evidence-access|staff-store|auth\/session|auth\/supabase/.test(i), `${f} imports ${i}`);
    }
  }
});

test("architecture: only the Supabase Auth adapter knows about Supabase Auth", () => {
  const all = [...src("src/lib/service-dashboard"), ...src("src/app/admin"), ...src("src/components/service-dashboard"), { f: "src/proxy.ts", s: readFileSync(path.join(ROOT, "src/proxy.ts"), "utf8") }];
  for (const { f, s } of all) {
    if (/auth\/supabase-(auth|proxy)\.ts$/.test(f)) continue;
    assert.ok(!imports(s).some((i) => i.startsWith("@supabase/")), `${f} imports a Supabase package`);
    assert.ok(!/\.auth\.(getUser|signIn|verifyOtp|mfa)/.test(s), `${f} calls Supabase Auth directly`);
    if (f !== "src/lib/service-dashboard/auth/session.ts") assert.ok(!imports(s).some((i) => /auth\/supabase-auth/.test(i)), `${f} imports the Supabase adapter`);
  }
});

test("architecture: no Vercel-only runtime dependencies in Service & Aftercare (Phase 4E Sandbox worker excepted)", () => {
  const all = [...src("src/lib/service-dashboard"), ...src("src/lib/service-call"), ...src("src/app/admin"), ...src("src/app/api/service-requests"), ...src("src/components/service-dashboard")];
  for (const { f, s } of all) {
    for (const i of imports(s)) {
      if (i === "@vercel/sandbox" && /video-processor|ai-config/.test(f)) continue; // documented portability item (Phase 4E)
      assert.ok(!/^@vercel\/(blob|kv|edge-config|global-config|functions|queue)/.test(i) && i !== "@vercel/sandbox", `${f} imports ${i}`);
    }
  }
});

test("architecture: client components never read server-only secrets", () => {
  const clients = [...src("src/components"), ...src("src/app")].filter(({ s }) => /^["']use client["']/.test(s.trimStart()));
  for (const { f, s } of clients) {
    assert.ok(!/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|SERVICE_REQUESTS_ADMIN_TOKEN|OPENAI_API_KEY|SUPABASE_JWT_SECRET/.test(s), f);
  }
});
