// Phase 5 end-to-end checks against a running build (local `next start` or a
// protected Preview) and the DEVELOPMENT Supabase project. SYNTHETIC ONLY.
//
//   E2E_BASE=http://localhost:3100 PLAYWRIGHT_CORE=<path to playwright-core> \
//   E2E_CHROMIUM=<chromium executable> E2E_OUT=<screenshot dir> \
//   node tests/service-dashboard/e2e/run-e2e.mjs
//
// Optional E2E_OIDC_HEADER=1 sends VERCEL_OIDC_TOKEN as the trusted-OIDC
// header (protected Preview). Uses ONE synthetic Supabase Auth account
// (example.com, never deliverable): its email code comes from the admin API
// and its TOTP secret lives only in this process. Prints no tokens or keys.
//
// Expects `seed-dev.mjs seed` to have run first. Leaves the synthetic staff
// member in place for the final teardown (see seed-dev.mjs teardown + the
// cleanup at the end of this file).
import { createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.env.E2E_BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const SB = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEV_REF = "izvikdwykvrabbpczbae";
const STAFF_EMAIL = "phase5.synthetic.staff@example.com";
const OUT = process.env.E2E_OUT ?? "./e2e-out";
const E2E_CUSTOMER_EMAIL = "e2e+phase5-dashboard@visualrif.com";
if (!SB || !SR) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required");
if (new URL(SB).hostname.split(".")[0] !== DEV_REF) throw new Error("Refusing: not the Development project");
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const extraHeaders = process.env.E2E_OIDC_HEADER ? { "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN } : {};

// ─── Result tracking ────────────────────────────────────────────────────────
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail: ok ? "" : String(detail).slice(0, 300) });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : ` — ${String(detail).slice(0, 300)}`}`);
}

// ─── Supabase admin helpers (Development) ───────────────────────────────────
const SH = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
async function sb(p, init = {}) {
  const res = await fetch(`${SB}${p}`, { ...init, headers: { ...SH, ...init.headers } });
  const t = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${p.split("?")[0]} → ${res.status} ${t.slice(0, 160)}`);
  return t ? JSON.parse(t) : null;
}
/** A fresh synthetic Auth user (no authenticator yet), so every run proves enrolment. */
async function freshAuthUser() {
  const list = await sb(`/auth/v1/admin/users?per_page=200`);
  const found = list.users.find((u) => u.email === STAFF_EMAIL);
  if (found) {
    await sb(`/rest/v1/staff_members?auth_user_id=eq.${found.id}`, { method: "DELETE" });
    await sb(`/auth/v1/admin/users/${found.id}`, { method: "DELETE" });
  }
  const u = await sb(`/auth/v1/admin/users`, { method: "POST", body: JSON.stringify({ email: STAFF_EMAIL, email_confirm: true }) });
  return u.id;
}
async function emailOtp() {
  const r = await sb(`/auth/v1/admin/generate_link`, { method: "POST", body: JSON.stringify({ type: "magiclink", email: STAFF_EMAIL }) });
  return r.email_otp ?? r.properties?.email_otp;
}
const setStaff = (authUserId, patch) => sb(`/rest/v1/staff_members?auth_user_id=eq.${authUserId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch) });
const reqRow = async (ref) => (await sb(`/rest/v1/service_requests?reference=eq.${ref}&select=id,status`))[0];
const history = async (id) => sb(`/rest/v1/status_history?service_request_id=eq.${id}&select=*&order=id.asc`);

// ─── TOTP (RFC 6238) ────────────────────────────────────────────────────────
function base32(s) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, "0");
  return Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
}
let lastCounter = -1;
async function totp(secret) {
  let counter = Math.floor(Date.now() / 30000);
  if (counter === lastCounter || 30 - ((Date.now() / 1000) % 30) < 3) {
    await new Promise((r) => setTimeout(r, (30 - ((Date.now() / 1000) % 30)) * 1000 + 600));
    counter = Math.floor(Date.now() / 30000);
  }
  lastCounter = counter;
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, "0");
}

// ─── Browser flows ──────────────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: process.env.E2E_CHROMIUM || undefined });
const newContext = (opts = {}) => browser.newContext({ extraHTTPHeaders: extraHeaders, viewport: { width: 1440, height: 1000 }, ...opts });

async function signInEmail(page) {
  await page.goto(`${BASE}/admin/sign-in`);
  await page.fill('input[name="email"]', STAFF_EMAIL);
  await page.click('button[type="submit"]');
  await page.waitForSelector('input[name="code"]');
  await page.fill('input[name="code"]', await emailOtp());
  await page.click('button[type="submit"]');
}

/** Captures the next server-action POST the page makes (headers + body), for replay. */
function captureAction(page) {
  return new Promise((resolve) => {
    const on = (req) => {
      if (req.method() === "POST" && req.headers()["next-action"]) {
        page.off("request", on);
        resolve({ url: req.url(), headers: req.headers(), body: req.postDataBuffer() });
      }
    };
    page.on("request", on);
  });
}
async function replay(captured, cookieHeader) {
  const h = { ...captured.headers, ...extraHeaders };
  delete h.cookie;
  if (cookieHeader) h.cookie = cookieHeader;
  const res = await fetch(captured.url, { method: "POST", headers: h, body: captured.body, redirect: "manual" });
  return { status: res.status, text: await res.text() };
}
const cookieHeader = (cookies) => cookies.map((c) => `${c.name}=${c.value}`).join("; ");

// Scenario references (seeded).
const seeded = await sb(`/rest/v1/service_requests?email=eq.${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&select=reference,customer_name&order=reference.asc`);
const REF = Object.fromEntries(seeded.map((r) => [r.customer_name.replace("PHASE5 E2E ", ""), r.reference]));
check("seed: 7 synthetic requests present", seeded.length === 7, JSON.stringify(REF));

// ── A. Signed out ───────────────────────────────────────────────────────────
{
  const r = await fetch(`${BASE}/admin/service`, { redirect: "manual", headers: extraHeaders });
  check("signed out: /admin/service redirects to sign-in", r.status === 307 && (r.headers.get("location") ?? "").includes("/admin/sign-in"), `${r.status} ${r.headers.get("location")}`);
  const d = await fetch(`${BASE}/admin/service/${REF.CONTRADICTION}`, { redirect: "manual", headers: extraHeaders });
  check("signed out: request detail redirects to sign-in", d.status === 307, d.status);
  const html = await (await fetch(`${BASE}/admin/sign-in`, { headers: extraHeaders })).text();
  check("signed out: sign-in page has no dashboard data", !html.includes(REF.CONTRADICTION) && !html.includes("PHASE5 E2E"), "leak");
  check("sign-in page is noindex", /<meta name="robots" content="noindex, nofollow/.test(html), "robots meta missing");
}

// ── B. Signed in but not allow-listed ───────────────────────────────────────
const authUserId = await freshAuthUser();
{
  const ctx = await newContext();
  const page = await ctx.newPage();
  await signInEmail(page);
  await page.waitForSelector('.sd-alert[role="alert"]');
  check("not allow-listed: refused after the email code", (await page.textContent('.sd-alert[role="alert"]')).includes("isn't authorised"), await page.textContent("body"));
  const cookies = (await ctx.cookies()).filter((c) => c.name.startsWith("sb-"));
  check("not allow-listed: session removed (no auth cookie left)", cookies.every((c) => !c.value), cookies.map((c) => c.name).join(","));
  await ctx.close();
}

// ── C. Staff: allow-list, mandatory MFA enrolment ───────────────────────────
await sb(`/rest/v1/staff_members`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ auth_user_id: authUserId, display_name: "Synthetic Staff (E2E)", role: "STAFF" }) });
const ctx = await newContext();
const page = await ctx.newPage();
let secret;
{
  await signInEmail(page);
  await page.waitForURL(/\/admin\/sign-in\/mfa/);
  // Before MFA the dashboard is unreachable.
  const pre = await page.request.get(`${BASE}/admin/service`, { maxRedirects: 0 });
  check("aal1 (email code only): dashboard refused until MFA", pre.status() === 307 && (pre.headers().location ?? "").includes("/admin/sign-in/mfa"), `${pre.status()} ${pre.headers().location}`);
  const preMedia = await page.request.get(`${BASE}/admin/service/${REF.CONTRADICTION}/media/00000000-0000-4000-8000-000000000000`, { maxRedirects: 0 });
  check("aal1: media route refused (401)", preMedia.status() === 401, preMedia.status());
  await page.waitForSelector(".sd-secret");
  secret = (await page.textContent(".sd-secret")).trim();
  await page.fill('input[name="code"]', await totp(secret));
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin/service`);
  check("staff: MFA enrolled, signed in to the inbox", page.url() === `${BASE}/admin/service`, page.url());
  const cookies = (await ctx.cookies()).filter((c) => c.name.startsWith("sb-") && c.value);
  check("session cookies are httpOnly + SameSite=Lax", cookies.length > 0 && cookies.every((c) => c.httpOnly && c.sameSite === "Lax"), JSON.stringify(cookies.map((c) => [c.name, c.httpOnly, c.sameSite, c.secure])));
  check("session cookies are Secure", cookies.every((c) => c.secure), JSON.stringify(cookies.map((c) => [c.name, c.secure])));
  check("page scripts can't read the session (document.cookie)", !(await page.evaluate(() => document.cookie)).includes("sb-"), "visible to JS");
}

// ── Browser bundle: no secrets ──────────────────────────────────────────────
{
  const secrets = { SUPABASE_SERVICE_ROLE_KEY: SR, SERVICE_REQUESTS_ADMIN_TOKEN: process.env.SERVICE_REQUESTS_ADMIN_TOKEN, OPENAI_API_KEY: process.env.OPENAI_API_KEY, SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY, SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET };
  const urls = new Set();
  for (const p of ["/admin/service", `/admin/service/${REF.CONTRADICTION}`, "/admin/sign-in"]) {
    const res = await page.request.get(`${BASE}${p}`);
    const html = await res.text();
    for (const [name, v] of Object.entries(secrets)) if (v) check(`no ${name} in HTML of ${p}`, !html.includes(v), "found");
    for (const m of html.matchAll(/src="([^"]+\.js[^"]*)"/g)) urls.add(new URL(m[1], BASE).href);
  }
  let leaked = [];
  for (const u of urls) {
    const js = await (await page.request.get(u)).text();
    for (const [name, v] of Object.entries(secrets)) if (v && js.includes(v)) leaked.push(`${name} in ${u}`);
  }
  check(`no secrets in ${urls.size} client scripts`, leaked.length === 0, leaked.join(", "));
}

// ── Inbox: search, filters, pagination ──────────────────────────────────────
{
  await page.goto(`${BASE}/admin/service?status=all`);
  const total = Number((await page.textContent(".sd-pagehead p:not(.eyebrow)")).replace(/[^\d]/g, "").slice(0, 6));
  check("inbox: lists requests with a total", total >= 7, total);
  check("inbox: 25 rows per page", (await page.$$(".sd-table tbody tr")).length === 25, (await page.$$(".sd-table tbody tr")).length);
  check("inbox: no evidence loaded (no img/video/audio)", (await page.$$("img, video, audio")).length === 0, "media elements present");
  await page.goto(`${BASE}/admin/service?status=all&page=2`);
  check("inbox: page 2 renders", (await page.textContent(".sd-pager")).includes("Page 2"), await page.textContent(".sd-pager"));
  await page.goto(`${BASE}/admin/service?status=all&q=${REF.URGENT}`);
  const refs = await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent));
  check("search: by reference", refs.length === 1 && refs[0] === REF.URGENT, refs.join(","));
  await page.goto(`${BASE}/admin/service?status=all&q=phase5+e2e+contra`);
  check("search: by customer name", (await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent))).join() === REF.CONTRADICTION, "");
  await page.goto(`${BASE}/admin/service?status=all&q=050+000+0005`);
  check("search: by phone (national format)", (await page.$$(".sd-table tbody tr")).length === 7, (await page.$$(".sd-table tbody tr")).length);
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&ai=FAILED`);
  check("filter: AI state FAILED", (await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent))).join() === REF["AI FAILED"], "");
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&urgency=URGENT`);
  check("filter: urgency URGENT", (await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent))).join() === REF.URGENT, "");
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&ai=PARTIAL`);
  check("filter: AI state PARTIAL", (await page.$$(".sd-table tbody tr")).length === 2, (await page.$$(".sd-table tbody tr")).length);
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&product=entrance-door`);
  check("filter: product", (await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent))).join() === REF["AI PROCESSING"], "");
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&sort=urgency`);
  check("sort: most urgent first", (await page.$$eval(".sd-table .ref a", (as) => as.map((a) => a.textContent)))[0] === REF.URGENT, "");
  await page.goto(`${BASE}/admin/service?status=all&q=${encodeURIComponent(E2E_CUSTOMER_EMAIL)}&from=2099-01-01`);
  check("filter: date range (future → empty state)", (await page.textContent(".sd-empty")).includes("No service requests match"), "");
  await page.goto(`${BASE}/admin/service?status=bogus&urgency=%27;drop&page=-4&sort=x`);
  check("invalid filter values are ignored safely", (await page.$$(".sd-table tbody tr")).length > 0, "");
}

// ── Detail: hierarchy, provenance, discrepancies, unknowns, versions ───────
{
  await page.goto(`${BASE}/admin/service/${REF.CONTRADICTION}`);
  const body = await page.textContent("body");
  check("detail: AI banner shown", body.includes("AI-assisted report — staff verification required."), "");
  for (const h of ["Customer request", "Evidence", "Summary", "Customer reported information", "Observations from provided media", "Urgency and safety", "Discrepancies", "Unknown / requires inspection", "Evidence limitations", "Staff review", "Report versions", "Status history"]) {
    check(`detail: section "${h}"`, body.includes(h), "missing");
  }
  const styles = await page.evaluate(() => ["cust", "media", "unk"].map((k) => {
    const el = document.querySelector(`.sd-prov-${k} li`) ;
    if (!el) return null;
    const s = getComputedStyle(el);
    return `${s.borderLeftColor}|${s.borderTopStyle}|${s.backgroundColor}`;
  }));
  check("provenance blocks are visually distinct", styles.every(Boolean) && new Set(styles).size === 3, JSON.stringify(styles));
  check("customer statements show their source (description / voice note / video audio)", (await page.$$(".sd-statement .src .sd-chip")).length >= 3, (await page.$$(".sd-statement .src .sd-chip")).length);
  const evChips = await page.$$eval(".sd-obs .sd-chip.media", (as) => as.map((a) => [a.textContent, a.getAttribute("href")]));
  check("observations link to their exact evidence (and frame time)", evChips.length >= 2 && evChips.every(([, h]) => /^#ev-[0-9a-f-]{36}$/.test(h)) && evChips.some(([t]) => /Video 1 · \d+:\d\d/.test(t)), JSON.stringify(evChips));
  check("discrepancies listed separately", (await page.$$(".sd-disc-list li")).length === 2, (await page.$$(".sd-disc-list li")).length);
  check("unknowns include warranty/cost/repair method", ["Warranty", "Cost", "Repair method"].every((t) => body.includes(t)), "");
  check("never states a confirmed fault/warranty/price/appointment", !/\b(is covered by warranty|will be replaced|we will repair|appointment (is )?(booked|confirmed))\b/i.test(body), "");
  check("report version history: 2 versions", (await page.$$(".sd-versions tbody tr")).length === 2, "");
  await page.goto(`${BASE}/admin/service/${REF.CONTRADICTION}?version=1`);
  check("older version viewable read-only with notice", (await page.textContent("body")).includes("You're viewing version 1") && (await page.$$('form[aria-label="Review AI report"]')).length === 0, "");
  await page.goto(`${BASE}/admin/service/${REF.CONTRADICTION}`);

  // Evidence: authorised, on demand, signed, short-lived.
  const imgs = await page.$$eval(".sd-photo img", (xs) => xs.map((x) => x.getAttribute("src")));
  check("photos load through the authorised route (no storage URL in page)", imgs.length === 1 && imgs.every((s) => s.startsWith(`/admin/service/${REF.CONTRADICTION}/media/`)) && !(await page.content()).includes("/storage/v1/object/sign"), JSON.stringify(imgs));
  await page.$eval(".sd-photo img", (img) => img.scrollIntoView());
  await page.waitForFunction(() => { const i = document.querySelector(".sd-photo img"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  check("photo thumbnail renders", true);
  const m = await page.request.get(`${BASE}${imgs[0]}`, { maxRedirects: 0 });
  const loc = m.headers().location ?? "";
  check("media route: 302 to a signed URL, no-store, no-referrer", m.status() === 302 && loc.includes("/storage/v1/object/sign/") && m.headers()["cache-control"]?.includes("no-store") && m.headers()["referrer-policy"] === "no-referrer", `${m.status()} ${JSON.stringify({ cc: m.headers()["cache-control"], rp: m.headers()["referrer-policy"], loc: loc.replace(/token=[^&]+/, "token=…").replace(/^https:\/\/[^/]+/, "") })}`);
  const token = new URL(loc).searchParams.get("token") ?? "";
  const claims = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString() || "{}");
  check("signed media URL expires after 300 s", claims.exp - claims.iat === 300, `${claims.exp - claims.iat}`);
  check("signed URL serves the file", (await fetch(loc)).status === 200, "");
  const tampered = loc.replace(/token=([^&]+)/, (_, t) => `token=${t.slice(0, -4)}AAAA`);
  check("tampered signed URL refused", (await fetch(tampered)).status >= 400, "");
  // Expiry: a 1-second signed URL for the same object stops working.
  const photoPath = decodeURIComponent(new URL(loc).pathname.replace(/^.*\/object\/sign\/service-evidence\//, ""));
  const short = await sb(`/storage/v1/object/sign/service-evidence/${photoPath.split("/").map(encodeURIComponent).join("/")}`, { method: "POST", body: JSON.stringify({ expiresIn: 1 }) });
  await new Promise((r) => setTimeout(r, 2500));
  check("signed URL refused after it expires", (await fetch(`${SB}/storage/v1${short.signedURL}`)).status >= 400, "");
  check("audio/video don't preload (fetched only when played)", (await page.$$eval("audio, video", (xs) => xs.every((x) => x.getAttribute("preload") === "none"))), "");
  const mediaIds = await page.$$eval("[id^='ev-']", (xs) => xs.map((x) => x.id.slice(3)));
  const cross = await page.request.get(`${BASE}/admin/service/${REF.URGENT}/media/${mediaIds[0]}`, { maxRedirects: 0 });
  check("media of one request can't be fetched under another reference", cross.status() === 404, cross.status());
  check("video frames listed with timestamps", (await page.$$(".sd-frames li")).length > 0 && (await page.$$(".sd-frames button.ts")).length > 0, "");
  check("voice transcript with provenance", (await page.textContent("body")).includes("Machine transcript of Voice note 1"), "");
  check("video-audio transcript with provenance", (await page.textContent("body")).includes("Machine transcript of Video 1 audio"), "");
}

// ── AI failure / partial states ─────────────────────────────────────────────
{
  const expect = { "AI FAILED": ["AI failed", "Work from the customer's request", "Transcription failed"], "AI PROCESSING": ["AI analysis is in progress"], "NO AI": ["AI analysis hasn't run"], "UNSUPPORTED VIDEO": ["AI partial", "not supported"], "LONG VIDEO": ["Only part of this video was analysed"] };
  for (const [k, needles] of Object.entries(expect)) {
    await page.goto(`${BASE}/admin/service/${REF[k]}`);
    const t = await page.textContent("body");
    check(`AI state "${k}": request still fully shown + state explained`, t.includes("Customer request") && t.includes("Problem, in the customer's words") && needles.every((n) => t.includes(n)), needles.filter((n) => !t.includes(n)).join(" | "));
  }
}

// ── Status workflow as STAFF ────────────────────────────────────────────────
async function openDetail(ref) {
  await page.goto(`${BASE}/admin/service/${ref}`);
}
async function choose(to, note) {
  await page.check(`form[aria-label="Change status"] input[name="to"][value="${to}"]`);
  if (note !== undefined) await page.fill('form[aria-label="Change status"] textarea[name="note"]', note);
}
async function submitStatus() {
  await page.click('form[aria-label="Change status"] button[type="submit"]');
  await page.waitForSelector('form[aria-label="Change status"] .sd-alert, .sd-status-now', { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}
const offered = async () => page.$$eval('form[aria-label="Change status"] input[name="to"]', (xs) => xs.map((x) => x.value));
let capturedStatusAction;
{
  const ref = REF.CONTRADICTION;
  const id = (await reqRow(ref)).id;
  await openDetail(ref);
  check("staff from SUBMITTED: only staff transitions offered", JSON.stringify(await offered()) === JSON.stringify(["AWAITING_REVIEW", "MORE_INFORMATION_REQUIRED", "INSPECTION_REQUIRED"]), JSON.stringify(await offered()));
  await choose("MORE_INFORMATION_REQUIRED");
  check("UI: note-required transition can't be submitted without a note", await page.isDisabled('form[aria-label="Change status"] button[type="submit"]'), "enabled");
  await choose("AWAITING_REVIEW", "");
  const cap = captureAction(page);
  await submitStatus();
  capturedStatusAction = await cap;
  const h = await history(id);
  const last = h.at(-1);
  const staffRow = (await sb(`/rest/v1/staff_members?auth_user_id=eq.${authUserId}&select=id`))[0];
  check("staff: SUBMITTED → AWAITING_REVIEW recorded", (await reqRow(ref)).status === "AWAITING_REVIEW" && last.to_status === "AWAITING_REVIEW", JSON.stringify(last));
  check("audit: from, to, changed_at, changed_by, actor_staff_id, actor_role", last.from_status === "SUBMITTED" && !!last.changed_at && last.changed_by === `staff:${staffRow.id}` && last.actor_staff_id === staffRow.id && last.actor_role === "STAFF", JSON.stringify(last));
  check("history shows the actor's name and role", (await page.textContent(".sd-timeline")).includes("Synthetic Staff (E2E) (staff)"), await page.textContent(".sd-timeline"));

  // Tampered form posts (the real action endpoint, arbitrary fields).
  await openDetail(ref);
  await page.evaluate(() => {
    const f = document.querySelector('form[aria-label="Change status"]');
    const r = f.querySelector('input[name="to"]');
    r.value = "CLOSED";
    r.checked = true;
    for (const [n, v] of [["actor", "00000000-0000-4000-8000-000000000001"], ["p_auth_user_id", "00000000-0000-4000-8000-000000000001"], ["actorStaffId", "x"]]) {
      const i = document.createElement("input");
      i.type = "hidden"; i.name = n; i.value = v; f.appendChild(i);
    }
    f.querySelector("textarea").value = "Forged close attempt.";
    f.querySelector("button[type=submit]").disabled = false;
  });
  await submitStatus();
  check("staff can't close an unresolved request (direct post)", (await page.textContent("body")).includes("isn't allowed") && (await reqRow(ref)).status === "AWAITING_REVIEW", (await reqRow(ref)).status);
  check("injected actor fields are ignored", (await history(id)).every((x) => x.actor_staff_id === null || x.actor_staff_id === staffRow.id), "");

  await openDetail(ref);
  await page.evaluate(() => {
    const f = document.querySelector('form[aria-label="Change status"]');
    const r = f.querySelector('input[name="to"][value="MORE_INFORMATION_REQUIRED"]');
    r.checked = true;
    f.querySelector("textarea").removeAttribute("required");
    f.querySelector("textarea").removeAttribute("minlength");
    f.querySelector("button[type=submit]").disabled = false;
  });
  await submitStatus();
  check("note required: server refuses an empty note", (await page.textContent("body")).includes("needs a note") && (await reqRow(ref)).status === "AWAITING_REVIEW", "");

  // Concurrency: two tabs, same request.
  const second = await ctx.newPage();
  await second.goto(`${BASE}/admin/service/${ref}`);
  await openDetail(ref);
  await choose("INSPECTION_REQUIRED", "Inspection needed to check the glass.");
  await submitStatus();
  await second.check('form[aria-label="Change status"] input[name="to"][value="MORE_INFORMATION_REQUIRED"]');
  await second.fill('form[aria-label="Change status"] textarea[name="note"]', "Asking which window is affected.");
  await second.click('form[aria-label="Change status"] button[type="submit"]');
  await second.waitForSelector(".sd-alert.warn", { timeout: 15000 });
  await second.waitForLoadState("networkidle");
  check("concurrency: stale tab told another member of staff changed it first", (await second.textContent(".sd-alert.warn")).includes("Another member of staff changed this request first"), "");
  check("concurrency: nothing overwritten", (await reqRow(ref)).status === "INSPECTION_REQUIRED" && (await history(id)).filter((x) => x.to_status === "MORE_INFORMATION_REQUIRED").length === 0, (await reqRow(ref)).status);
  await second.waitForFunction(() => document.querySelector(".sd-status-now")?.textContent.includes("Inspection required"), null, { timeout: 10000 });
  check("concurrency: stale tab refreshed to the latest status", true);
  await second.close();

  // Through to RESOLVED → reopen → RESOLVED → CLOSED (staff may close a resolved request).
  for (const [to, note] of [["SCHEDULED", ""], ["IN_PROGRESS", ""], ["RESOLVED", "Seal re-fitted; customer confirmed."], ["IN_PROGRESS", "Customer reports the seal is loose again."], ["RESOLVED", "Seal replaced."], ["CLOSED", ""]]) {
    await openDetail(ref);
    await choose(to, note);
    await submitStatus();
  }
  check("staff: lifecycle incl. RESOLVED reopening (note) and RESOLVED → CLOSED", (await reqRow(ref)).status === "CLOSED", (await reqRow(ref)).status);
  const reopenRow = (await history(id)).find((x) => x.from_status === "RESOLVED" && x.to_status === "IN_PROGRESS");
  check("RESOLVED reopening recorded with its note", reopenRow?.note === "Customer reports the seal is loose again.", JSON.stringify(reopenRow));
  await openDetail(ref);
  check("staff: CLOSED offers no reopening", (await page.$$('form[aria-label="Change status"]')).length === 0 && (await page.textContent("body")).includes("Only an administrator can reopen"), "");
  await page.evaluate(() => 0);
  // Reopen attempt as staff via a replayed action post.
  const forged = Buffer.from(capturedStatusAction.body).toString("latin1");
  check("captured a real status action post for replay", forged.includes("expectedFrom"), "");
}

// ── Direct server-action calls without / with a bad session ────────────────
{
  const noSession = await replay(capturedStatusAction, null);
  check("server action without a session: refused, no change", noSession.text.includes("Your session has ended or you don't have access") && noSession.status === 200, `${noSession.status} ${noSession.text.slice(0, 120)}`);
  // The session cookie may be split into chunks (name.0, name.1…): reassemble, edit, send unchunked.
  const all = await ctx.cookies();
  const authName = all.find((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))?.name.replace(/\.\d+$/, "");
  const raw = all.filter((c) => c.name === authName || c.name.startsWith(`${authName}.`)).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true })).map((c) => c.value).join("");
  const session = JSON.parse(Buffer.from(raw.replace(/^base64-/, ""), "base64url").toString());
  const asCookie = (s) => `${authName}=base64-${Buffer.from(JSON.stringify(s)).toString("base64url")}`;
  const [h, p] = session.access_token.split(".");
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  const forgedHeader = asCookie({ ...session, access_token: `${h}.${Buffer.from(JSON.stringify({ ...payload, sub: "aaaaaaaa-0000-4000-8000-00000000dead", aal: "aal2" })).toString("base64url")}.${"A".repeat(86)}` });
  const forged = await replay(capturedStatusAction, forgedHeader);
  check("server action with a forged session cookie: refused", forged.text.includes("Your session has ended or you don't have access"), forged.text.slice(0, 160));
  const forgedPage = await fetch(`${BASE}/admin/service`, { headers: { ...extraHeaders, cookie: forgedHeader }, redirect: "manual" });
  check("dashboard with a forged session cookie: redirected to sign-in", forgedPage.status === 307, forgedPage.status);
  const expiredHeader = asCookie({ ...session, expires_at: Math.floor(Date.now() / 1000) - 7200, refresh_token: "invalid-refresh-token" });
  const exp = await fetch(`${BASE}/admin/service`, { headers: { ...extraHeaders, cookie: expiredHeader }, redirect: "manual" });
  check("expired session (unrefreshable): redirected to sign-in", exp.status === 307 && (exp.headers.get("location") ?? "").includes("/admin/sign-in"), exp.status);
  const expAction = await replay(capturedStatusAction, expiredHeader);
  check("expired session: server action refused", expAction.text.includes("Your session has ended or you don't have access"), expAction.text.slice(0, 120));
}

// ── AI review as STAFF ──────────────────────────────────────────────────────
{
  await openDetail(REF.URGENT);
  await page.check('form[aria-label="Review AI report"] input[name="decision"][value="APPROVED"]');
  await page.click('form[aria-label="Review AI report"] button[type="submit"]');
  await page.waitForSelector("#review .sd-alert.ok", { timeout: 15000 });
  const rep = (await sb(`/rest/v1/service_ai_reports?service_request_id=eq.${(await reqRow(REF.URGENT)).id}&select=id,review_status,reviewed_by,ai_report`))[0];
  const staffRow = (await sb(`/rest/v1/staff_members?auth_user_id=eq.${authUserId}&select=id`))[0];
  check("staff: AI report approved, real actor recorded", rep.review_status === "APPROVED" && rep.reviewed_by === `staff:${staffRow.id}`, JSON.stringify({ s: rep.review_status, by: rep.reviewed_by }));
  await openDetail(REF.URGENT);
  check("staff: can't supersede an existing review (no form)", (await page.$$('form[aria-label="Supersede review"], form[aria-label="Review AI report"]')).length === 0, "");
}

// ── ADMIN ───────────────────────────────────────────────────────────────────
await setStaff(authUserId, { role: "ADMIN", display_name: "Synthetic Admin (E2E)" });
{
  const ref = REF.CONTRADICTION;
  const id = (await reqRow(ref)).id;
  await openDetail(ref);
  check("admin: CLOSED offers reopen → AWAITING_REVIEW only", JSON.stringify(await offered()) === JSON.stringify(["AWAITING_REVIEW"]), JSON.stringify(await offered()));
  await choose("AWAITING_REVIEW", "");
  check("admin: reopen requires a note (UI)", await page.isDisabled('form[aria-label="Change status"] button[type="submit"]'), "");
  await choose("AWAITING_REVIEW", "Customer reports the crack is spreading; reopening for review.");
  await submitStatus();
  const last = (await history(id)).at(-1);
  check("admin: CLOSED reopened to AWAITING_REVIEW with note, actor role ADMIN", last.from_status === "CLOSED" && last.to_status === "AWAITING_REVIEW" && last.actor_role === "ADMIN" && last.note.includes("spreading"), JSON.stringify(last));
  await openDetail(ref);
  check("admin: can close an unresolved request (offered)", (await offered()).includes("CLOSED"), JSON.stringify(await offered()));

  // EDITED review on the current version: original preserved.
  await page.check('form[aria-label="Review AI report"] input[name="decision"][value="EDITED"]');
  await page.fill('textarea[name="editSummary"]', "Staff: glass condition unconfirmed — call the customer to confirm which window and whether the pane is cracked.");
  await page.selectOption('select[name="editUrgency"]', "NORMAL");
  await page.fill('textarea[name="editUrgencyReason"]', "No stability concern reported; crack seen only in one photo.");
  await page.fill('textarea[name="editCorrections"]', "Video 1 may show a different window.");
  await page.click('form[aria-label="Review AI report"] button[type="submit"]');
  await page.waitForSelector("#review .sd-alert.ok", { timeout: 15000 });
  const reps = await sb(`/rest/v1/service_ai_reports?service_request_id=eq.${id}&select=version,review_status,reviewed_report,ai_report,superseded_at&order=version.asc`);
  check("admin: EDITED review stores a staff version", reps[1].review_status === "EDITED" && reps[1].reviewed_report?.schema === "staff-edit-1", JSON.stringify(reps[1].review_status));
  check("original AI report unchanged after edit", reps[1].ai_report.content.issueSummary.startsWith("Window: customer's written description"), "");
  await openDetail(ref);
  check("staff-edited version displayed beside the AI original", (await page.textContent("body")).includes("Staff-edited version") && (await page.textContent("body")).includes("AI original"), "");

  // Supersede the staff APPROVED review on URGENT with REJECTED.
  await openDetail(REF.URGENT);
  await page.check('form[aria-label="Supersede review"] input[name="decision"][value="REJECTED"]');
  await page.fill('form[aria-label="Supersede review"] textarea[name="notes"]', "Rechecked: the urgency indicators are supported but the summary overstates the evidence.");
  await page.click('form[aria-label="Supersede review"] button[type="submit"]');
  await page.waitForSelector("#review .sd-alert.ok", { timeout: 15000 });
  const repId = (await sb(`/rest/v1/service_ai_reports?service_request_id=eq.${(await reqRow(REF.URGENT)).id}&select=id`))[0].id;
  const revs = await sb(`/rest/v1/service_ai_report_reviews?report_id=eq.${repId}&select=review_status,reviewer_role,superseded_at,superseded_by&order=created_at.asc`);
  check("admin: review superseded, history preserved", revs.length === 2 && revs[0].review_status === "APPROVED" && revs[0].superseded_at && revs[1].review_status === "REJECTED" && revs[1].reviewer_role === "ADMIN", JSON.stringify(revs));
  await openDetail(REF.URGENT);
  check("earlier reviews shown", (await page.textContent("body")).includes("Earlier reviews of this version"), "");
}

// ── Responsive + accessibility ─────────────────────────────────────────────
{
  const axe = process.env.E2E_AXE ? await import("node:fs").then((fs) => fs.readFileSync(process.env.E2E_AXE, "utf8")) : null;
  for (const [name, w, h] of [["desktop", 1440, 1000], ["tablet", 1024, 1366], ["mobile", 390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const [label, url] of [["inbox", `/admin/service?status=all`], ["detail", `/admin/service/${REF.CONTRADICTION}`]]) {
      await page.goto(`${BASE}${url}`);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const culprits = overflow > 1 ? await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && ![...e.children].some((c) => c.getBoundingClientRect().right > window.innerWidth + 1)).slice(0, 6).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join(".")}:${Math.round(e.getBoundingClientRect().right)}`)) : [];
      check(`${name} ${label}: no horizontal overflow`, overflow <= 1, `${overflow}px ${culprits.join(" ")}`);
      await page.screenshot({ path: path.join(OUT, `${name}-${label}.png`), fullPage: label === "inbox" ? false : true });
      if (axe && name === "desktop") {
        await page.addScriptTag({ content: axe });
        const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id}(${x.nodes.length}: ${x.nodes.slice(0, 4).map((n) => `${n.target.join(" ")}${n.any[0]?.data?.contrastRatio ? `@${n.any[0].data.contrastRatio}` : ""}`).join(" | ")})`));
        check(`axe WCAG 2 A/AA: ${label}`, v.length === 0, v.join(", "));
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}

// ── Inactive staff + sign-out/revocation ───────────────────────────────────
{
  const before = await ctx.cookies();
  await setStaff(authUserId, { active: false, deactivated_at: new Date().toISOString() });
  const r = await page.request.get(`${BASE}/admin/service`, { maxRedirects: 0 });
  check("inactive staff: dashboard refused", r.status() === 307 && (r.headers().location ?? "").includes("not_authorised"), `${r.status()} ${r.headers().location}`);
  const act = await replay(capturedStatusAction, cookieHeader(before));
  check("inactive staff: server action refused", act.text.includes("Your session has ended or you don't have access"), act.text.slice(0, 120));
  const media = await page.request.get(`${BASE}/admin/service/${REF.CONTRADICTION}/media/00000000-0000-4000-8000-000000000000`, { maxRedirects: 0 });
  check("inactive staff: media refused (401)", media.status() === 401, media.status());
  await setStaff(authUserId, { active: true, deactivated_at: null, role: "STAFF" });

  await page.goto(`${BASE}/admin/service`);
  if (page.url().includes("/mfa")) {
    await page.fill('input[name="code"]', await totp(secret));
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/admin/service`);
  }
  const live = await ctx.cookies();
  await page.click(".sd-who button");
  await page.waitForURL(/\/admin\/sign-in/);
  const reuse = await fetch(`${BASE}/admin/service`, { headers: { ...extraHeaders, cookie: cookieHeader(live) }, redirect: "manual" });
  check("signed-out session can't be reused (revoked server-side)", reuse.status === 307, reuse.status);
  const reuseAct = await replay(capturedStatusAction, cookieHeader(live));
  check("signed-out session: server action refused", reuseAct.text.includes("Your session has ended or you don't have access"), reuseAct.text.slice(0, 120));
}

// ── MFA verification on a new sign-in (existing factor) ─────────────────────
{
  const c2 = await newContext();
  const p2 = await c2.newPage();
  await signInEmail(p2);
  await p2.waitForURL(/\/admin\/sign-in\/mfa/);
  check("returning staff: asked for authenticator code (no re-enrolment)", (await p2.textContent("h1")).includes("Confirm it's you") && (await p2.$$(".sd-secret")).length === 0, await p2.textContent("h1"));
  await p2.fill('input[name="code"]', "000000");
  await p2.click('button[type="submit"]');
  await p2.waitForSelector('.sd-alert[role="alert"]');
  check("wrong authenticator code refused", (await p2.textContent('.sd-alert[role="alert"]')).includes("didn't match"), "");
  await p2.fill('input[name="code"]', await totp(secret));
  await p2.click('button[type="submit"]');
  await p2.waitForURL(`${BASE}/admin/service`);
  check("returning staff: signed in after TOTP", true);
  await c2.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
