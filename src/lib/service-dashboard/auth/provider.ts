// The authentication-provider boundary. The dashboard depends only on this
// interface (via session.ts and the sign-in actions); supabase-auth.ts is the
// one implementation today. Replacing Supabase Auth means writing another
// implementation of StaffAuthProvider, nothing else.
//
// Requirements on any implementation:
// - identity is verified server-side on every call (never trusted from the client);
// - sessions live in httpOnly, Secure, SameSite=Lax cookies the browser can't read;
// - passwordless email code as the first factor, TOTP as the mandatory second;
// - sign-out revokes the session server-side.

export interface VerifiedIdentity {
  /** Stable provider user id; staff_members.auth_user_id stores it. */
  userId: string;
  email: string | null;
  /** The account has a verified TOTP authenticator. */
  hasVerifiedTotp: boolean;
  /** "aal2" once this session has passed TOTP. */
  aal: "aal1" | "aal2";
  /** Unix seconds of this session's latest TOTP verification. */
  totpVerifiedAt: number | null;
}

export interface TotpEnrolment {
  factorId: string;
  /** Image URL (data: URL) of the provisioning QR code. */
  qrCode: string;
  /** The shared secret, for manual entry. */
  secret: string;
}

export interface StaffAuthProvider {
  /** False where the provider isn't configured (the dashboard is then absent). */
  configured(): boolean;
  /** The verified identity of the current request's session, or null. */
  getVerifiedIdentity(): Promise<VerifiedIdentity | null>;
  /** Emails a one-time code to an existing account. Never creates accounts; never reveals whether one exists. */
  requestEmailCode(email: string): Promise<void>;
  /** Verifies the code and starts a first-factor session. Returns the user id, or null. */
  verifyEmailCode(email: string, code: string): Promise<string | null>;
  /** Starts TOTP enrolment for the current session's user (drops abandoned, unverified enrolments). */
  startTotpEnrolment(): Promise<TotpEnrolment | null>;
  /** Verifies a TOTP code (completing an enrolment, or for an enrolled user) and upgrades the session. */
  verifyTotp(code: string, enrolmentFactorId: string | null): Promise<boolean>;
  /** Ends the current session (revoked server-side). */
  signOut(): Promise<void>;
}
