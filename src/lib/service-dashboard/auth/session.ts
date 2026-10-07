// The dashboard's security boundary, provider-neutral. Every server page,
// server action, route handler and data function calls one of:
//
//   getCurrentStaff()   the signed-in, allow-listed, MFA-verified staff member, or null
//   requireStaff()      …or throws StaffAuthError
//   requireAdmin()      …and must be an ADMIN
//   requireStaffPage()  for pages: redirects to the right sign-in step instead
//
// The proxy only refreshes cookies and redirects signed-out visitors; it is not
// relied on. Identity comes from the auth provider's server-side verification
// (auth/provider.ts), never from anything the browser sends as data.
import "server-only";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { connection } from "next/server";
import { findStaffMember, staffStoreConfigured } from "../staff-store";
import { decideAccess, type AccessDecision, type StaffMember, type StaffRole } from "./access";
import type { StaffAuthProvider, VerifiedIdentity } from "./provider";
import { supabaseStaffAuth } from "./supabase-auth";

export type { StaffMember, StaffRole };

/** The configured authentication provider (Supabase Auth today). */
export const staffAuth: StaffAuthProvider = supabaseStaffAuth;

export class StaffAuthError extends Error {
  constructor(public readonly kind: Exclude<AccessDecision["kind"], "OK">) {
    super(kind === "FORBIDDEN_ROLE" ? "forbidden" : "not_authorised");
    this.name = "StaffAuthError";
  }
}

/** False where auth or the database isn't configured (e.g. Production today): the dashboard is then absent (404). */
export function dashboardConfigured() {
  return staffAuth.configured() && staffStoreConfigured();
}

interface VerifiedSession {
  identity: VerifiedIdentity | null;
  staff: StaffMember | null;
}

/** Verifies the request's session once per request (React cache). */
const verifySession = cache(async (): Promise<VerifiedSession> => {
  if (!dashboardConfigured()) return { identity: null, staff: null };
  const identity = await staffAuth.getVerifiedIdentity();
  if (!identity) return { identity: null, staff: null };
  return { identity, staff: await findStaffMember(identity.userId) };
});

export async function getAccess(minRole?: StaffRole): Promise<AccessDecision> {
  const { identity, staff } = await verifySession();
  return decideAccess({
    userId: identity?.userId ?? null,
    staff,
    hasVerifiedTotp: identity?.hasVerifiedTotp ?? false,
    aal: identity?.aal ?? null,
    totpVerifiedAt: identity?.totpVerifiedAt ?? null,
    nowSeconds: Math.floor(Date.now() / 1000),
    minRole,
  });
}

export async function getCurrentStaff(): Promise<StaffMember | null> {
  const d = await getAccess();
  return d.kind === "OK" ? d.staff : null;
}

export async function requireStaff(minRole?: StaffRole): Promise<StaffMember> {
  const d = await getAccess(minRole);
  if (d.kind !== "OK") throw new StaffAuthError(d.kind);
  return d.staff;
}

export const requireAdmin = () => requireStaff("ADMIN");

/** For dashboard pages that render before sign-in completes: always dynamic, 404 where not configured. */
export async function dashboardPage() {
  await connection();
  if (!dashboardConfigured()) notFound();
}

export async function requireStaffPage(minRole?: StaffRole): Promise<StaffMember> {
  await dashboardPage();
  const d = await getAccess(minRole);
  switch (d.kind) {
    case "OK":
      return d.staff;
    case "SIGNED_OUT":
      redirect("/admin/sign-in");
    case "NOT_AUTHORISED":
      redirect("/admin/sign-in?error=not_authorised");
    case "MFA_ENROLL":
    case "MFA_VERIFY":
      redirect("/admin/sign-in/mfa");
    case "FORBIDDEN_ROLE":
      notFound();
  }
}
