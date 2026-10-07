// The staff access decision, as a pure function so every branch is testable.
// Inputs come only from the server: a user verified with Supabase Auth, the
// session's assurance level, and the staff_members allow-list row.

export type StaffRole = "STAFF" | "ADMIN";

export interface StaffMember {
  id: string;
  authUserId: string;
  displayName: string;
  role: StaffRole;
  active: boolean;
}

/** A TOTP verification older than this needs to be repeated. */
export const MFA_MAX_AGE_SECONDS = 12 * 60 * 60;

export type AccessDecision =
  | { kind: "SIGNED_OUT" }
  /** Signed in, but not on the allow-list (or deactivated). Never shown dashboard data. */
  | { kind: "NOT_AUTHORISED" }
  /** Allow-listed, but no verified authenticator yet: must enrol one. */
  | { kind: "MFA_ENROLL" }
  /** Allow-listed with an authenticator, but this session hasn't passed it (or did so > 12 h ago). */
  | { kind: "MFA_VERIFY" }
  /** Fully signed in, but the operation needs a higher role. */
  | { kind: "FORBIDDEN_ROLE"; staff: StaffMember }
  | { kind: "OK"; staff: StaffMember };

export interface AccessInput {
  userId: string | null;
  staff: StaffMember | null;
  hasVerifiedTotp: boolean;
  aal: "aal1" | "aal2" | null;
  /** Unix seconds of the most recent TOTP verification in this session. */
  totpVerifiedAt: number | null;
  nowSeconds: number;
  minRole?: StaffRole;
}

export function decideAccess(i: AccessInput): AccessDecision {
  if (!i.userId) return { kind: "SIGNED_OUT" };
  // Allow-list before anything else: someone who isn't staff never reaches MFA enrolment.
  if (!i.staff || !i.staff.active || i.staff.authUserId !== i.userId) return { kind: "NOT_AUTHORISED" };
  if (!i.hasVerifiedTotp) return { kind: "MFA_ENROLL" };
  if (i.aal !== "aal2" || i.totpVerifiedAt === null || i.nowSeconds - i.totpVerifiedAt > MFA_MAX_AGE_SECONDS) return { kind: "MFA_VERIFY" };
  if (i.minRole === "ADMIN" && i.staff.role !== "ADMIN") return { kind: "FORBIDDEN_ROLE", staff: i.staff };
  return { kind: "OK", staff: i.staff };
}
