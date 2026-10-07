"use client";

import { useActionState, useEffect, useRef, useState } from "react";
export interface SignInState {
  step: "email" | "code";
  email?: string;
  error?: string;
  notice?: string;
}
type SignInAction = (prev: SignInState, form: FormData) => Promise<SignInState>;

export default function SignInForm(props: { requestCode: SignInAction; verifyCode: SignInAction }) {
  // Remounting resets both steps ("use a different address").
  const [attempt, setAttempt] = useState(0);
  return <Steps key={attempt} {...props} onRestart={() => setAttempt((n) => n + 1)} />;
}

function Steps({ onRestart, requestCode, verifyCode }: { onRestart: () => void; requestCode: SignInAction; verifyCode: SignInAction }) {
  const [sent, send, sending] = useActionState(requestCode, { step: "email" } as SignInState);
  const [checked, check, checking] = useActionState(verifyCode, { step: "code" } as SignInState);
  const codeRef = useRef<HTMLInputElement>(null);
  // A failed code check can send the user back to the email step (e.g. not authorised).
  const state = checked.error && checked.step === "email" ? checked : sent;

  useEffect(() => {
    if (state.step === "code") codeRef.current?.focus();
  }, [state.step]);

  if (state.step === "code" && state.email) {
    return (
      <form action={check} className="sd-form">
        <input type="hidden" name="email" value={state.email} />
        {state.notice && !checked.error && (
          <div className="sd-alert ok" role="status">
            {state.notice}
          </div>
        )}
        {checked.error && (
          <div className="sd-alert err" role="alert">
            {checked.error}
          </div>
        )}
        <label className="field">
          Code from the email
          <input ref={codeRef} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,12}" maxLength={12} required className="sd-code-input" />
        </label>
        <button className="sd-btn" type="submit" disabled={checking}>
          {checking ? "Checking…" : "Continue"}
        </button>
        <p className="hint">
          Sent to <strong>{state.email}</strong>.{" "}
          <button type="button" onClick={onRestart} style={{ background: "none", border: 0, padding: 0, color: "var(--sd-brand-ink)", textDecoration: "underline", cursor: "pointer", font: "inherit" }}>
            Use a different address
          </button>
        </p>
      </form>
    );
  }

  return (
    <form action={send} className="sd-form">
      {state.error && (
        <div className="sd-alert err" role="alert">
          {state.error}
        </div>
      )}
      <label className="field">
        Work email
        <input type="email" name="email" autoComplete="email" required maxLength={254} defaultValue={state.email} />
      </label>
      <button className="sd-btn" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Email me a code"}
      </button>
    </form>
  );
}
