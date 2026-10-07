"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
export interface MfaState {
  error?: string;
  enrolment?: { factorId: string; qrCode: string; secret: string };
}

export default function MfaForm({ mode, startEnrolment, verifyAuthenticator }: {
  mode: "enrol" | "verify";
  startEnrolment: () => Promise<MfaState>;
  verifyAuthenticator: (prev: MfaState, form: FormData) => Promise<MfaState>;
}) {
  const [enrolment, setEnrolment] = useState<MfaState>({});
  const [starting, start] = useTransition();
  const [state, verify, verifying] = useActionState(verifyAuthenticator, {} as MfaState);

  useEffect(() => {
    if (mode === "enrol") start(async () => setEnrolment(await startEnrolment()));
  }, [mode, startEnrolment]);

  const e = enrolment.enrolment;
  return (
    <form action={verify} className="sd-form">
      {mode === "enrol" && (
        <div className="sd-qr" aria-busy={starting}>
          {e ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL from Supabase */}
              <img src={e.qrCode} alt="QR code to add Swift Rooms to your authenticator app" />
              <span className="hint">Can&apos;t scan? Enter this key:</span>
              <span className="sd-secret">{e.secret}</span>
            </>
          ) : (
            <span className="hint">{enrolment.error ?? "Preparing…"}</span>
          )}
        </div>
      )}
      {e && <input type="hidden" name="factorId" value={e.factorId} />}
      {state.error && (
        <div className="sd-alert err" role="alert">
          {state.error}
        </div>
      )}
      <label className="field">
        6-digit code
        <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required className="sd-code-input" autoFocus={mode === "verify"} />
      </label>
      <button className="sd-btn" type="submit" disabled={verifying || (mode === "enrol" && !e)}>
        {verifying ? "Checking…" : mode === "enrol" ? "Turn on and continue" : "Verify"}
      </button>
    </form>
  );
}
