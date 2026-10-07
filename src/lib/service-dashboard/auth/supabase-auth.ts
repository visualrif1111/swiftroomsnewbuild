// Supabase Auth implementation of StaffAuthProvider — the ONLY module that
// knows the dashboard uses Supabase Auth (plus supabase-proxy.ts for cookie
// refresh). Server-only: the browser never talks to Supabase Auth, so the
// session cookies are httpOnly. The anon key grants nothing on its own (RLS on,
// no policies, nothing granted to anon/authenticated).
import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { StaffAuthProvider, VerifiedIdentity } from "./provider";

/** Session cookies: httpOnly, Secure outside local development, SameSite=Lax, at most 12 hours. */
export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 12 * 60 * 60,
};

export function supabaseAuthConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

type CookieWrite = { name: string; value: string; options?: CookieOptions };

/** Client options shared by pages/actions and the proxy. */
export function authClientOptions(io: { getAll(): { name: string; value: string }[]; setAll(list: CookieWrite[]): void }) {
  return {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: io.getAll,
      setAll: (list: CookieWrite[]) => io.setAll(list.map((c) => ({ ...c, options: { ...c.options, ...AUTH_COOKIE_OPTIONS, ...(c.value ? {} : { maxAge: 0 }) } }))),
    },
    // Email codes are verified server-side; no redirect flow, so no PKCE verifier cookie.
    auth: { flowType: "implicit" as const, detectSessionInUrl: false },
  };
}

/** A per-request Supabase Auth client bound to the request cookies. */
async function client() {
  const config = supabaseAuthConfig();
  if (!config) throw new Error("Supabase Auth is not configured");
  const store = await cookies();
  return createServerClient(
    config.url,
    config.key,
    authClientOptions({
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server Components can't write cookies; the proxy refreshes sessions for them.
        try {
          for (const c of list) store.set(c.name, c.value, c.options);
        } catch {
          /* read-only context */
        }
      },
    }),
  );
}

export const supabaseStaffAuth: StaffAuthProvider = {
  configured: () => supabaseAuthConfig() !== null,

  async getVerifiedIdentity(): Promise<VerifiedIdentity | null> {
    const supabase = await client();
    // getUser() asks Supabase Auth to validate the token (signature, expiry, session still exists).
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const methods = (aal?.currentAuthenticationMethods ?? []) as { method: string; timestamp: number }[];
    const totp = methods.filter((m) => typeof m === "object" && m.method === "totp").map((m) => m.timestamp);
    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      hasVerifiedTotp: (data.user.factors ?? []).some((f) => f.factor_type === "totp" && f.status === "verified"),
      aal: aal?.currentLevel === "aal2" ? "aal2" : "aal1",
      totpVerifiedAt: totp.length ? Math.max(...totp) : null,
    };
  },

  async requestEmailCode(email) {
    const supabase = await client();
    // shouldCreateUser: false — only existing accounts get a code; nobody can sign up here.
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) console.warn(`[staff-auth] otp request not sent: ${error.code ?? error.status}`);
  },

  async verifyEmailCode(email, code) {
    const supabase = await client();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    return error || !data.user ? null : data.user.id;
  },

  async startTotpEnrolment() {
    const supabase = await client();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) {
      if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Swift Rooms dashboard ${new Date().toISOString().slice(0, 10)}` });
    if (error || !data) return null;
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  },

  async verifyTotp(code, enrolmentFactorId) {
    const supabase = await client();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    // The factor always comes from this user's own factors, never from the form alone.
    const factor = enrolmentFactorId
      ? (factors?.all ?? []).find((f) => f.id === enrolmentFactorId && f.factor_type === "totp" && f.status === "unverified")
      : (factors?.totp ?? []).find((f) => f.status === "verified");
    if (!factor) return false;
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    return !error;
  },

  async signOut() {
    const supabase = await client();
    await supabase.auth.signOut({ scope: "local" });
  },
};
