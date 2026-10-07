"use server";
// Staff sign-in: passwordless email code, then a mandatory authenticator-app
// (TOTP) factor. Every action is a public POST endpoint, so each one checks
// what it needs itself and returns only what the form shows. Provider-neutral:
// all authentication calls go through staffAuth (auth/provider.ts).
import { redirect } from "next/navigation";
import { dashboardConfigured, getAccess, staffAuth } from "@/lib/service-dashboard/auth/session";
import { findStaffMember } from "@/lib/service-dashboard/staff-store";

export interface SignInState {
  step: "email" | "code";
  email?: string;
  error?: string;
  notice?: string;
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const CODE = /^\d{6,10}$/;
const GENERIC_SENT =
  "If this address belongs to an authorised member of staff, a sign-in code is on its way. It expires in a few minutes. If nothing arrives within a minute, start again.";

/** Step 1: email a one-time code. Every outcome looks identical, so the form can't reveal who is staff. */
export async function requestCode(_: SignInState, form: FormData): Promise<SignInState> {
  if (!dashboardConfigured()) return { step: "email", error: "Sign-in is unavailable." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { step: "email", error: "Enter a valid email address." };
  await staffAuth.requestEmailCode(email);
  return { step: "code", email, notice: GENERIC_SENT };
}

/** Step 2: verify the emailed code, then require the allow-list before MFA. */
export async function verifyCode(_: SignInState, form: FormData): Promise<SignInState> {
  if (!dashboardConfigured()) return { step: "email", error: "Sign-in is unavailable." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!EMAIL.test(email)) return { step: "email", error: "Enter a valid email address." };
  if (!CODE.test(code)) return { step: "code", email, error: "Enter the code from the email." };
  const userId = await staffAuth.verifyEmailCode(email, code);
  if (!userId) return { step: "code", email, error: "That code is incorrect or has expired. Request a new one if needed." };
  const staff = await findStaffMember(userId);
  if (!staff || !staff.active) {
    await staffAuth.signOut();
    return { step: "email", error: "This account isn't authorised for the service dashboard." };
  }
  redirect("/admin/sign-in/mfa");
}

export interface MfaState {
  error?: string;
  enrolment?: { factorId: string; qrCode: string; secret: string };
}

/** Starts authenticator enrolment (allow-listed staff without a verified authenticator only). */
export async function startEnrolment(): Promise<MfaState> {
  const access = await getAccess();
  if (access.kind !== "MFA_ENROLL") return { error: "Enrolment isn't available for this session." };
  const enrolment = await staffAuth.startTotpEnrolment();
  return enrolment ? { enrolment } : { error: "Couldn't start authenticator set-up. Try again." };
}

/** Completes enrolment, or verifies an enrolled authenticator, upgrading the session. */
export async function verifyAuthenticator(prev: MfaState, form: FormData): Promise<MfaState> {
  const access = await getAccess();
  if (access.kind !== "MFA_ENROLL" && access.kind !== "MFA_VERIFY") {
    if (access.kind === "OK") redirect("/admin/service");
    return { error: "Your session has ended. Sign in again." };
  }
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return { ...prev, error: "Enter the 6-digit code from your authenticator app." };
  const ok = await staffAuth.verifyTotp(code, access.kind === "MFA_ENROLL" ? String(form.get("factorId") ?? "") : null);
  if (!ok) return { ...prev, error: "That code didn't match. Check the time on your device and try the current code." };
  redirect("/admin/service");
}

export async function signOut(): Promise<void> {
  if (!dashboardConfigured()) redirect("/");
  await staffAuth.signOut();
  redirect("/admin/sign-in");
}
