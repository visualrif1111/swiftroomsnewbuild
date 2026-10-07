"use client";
// Interactive pieces of the request detail page. Evidence elements point at
// the authorised media route; nothing here holds a signed storage URL.

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult, FormAction } from "@/lib/service-dashboard/types";

// ─── Photo with full preview ────────────────────────────────────────────────
export function PhotoThumb({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="thumb" onClick={() => { setOpen(true); ref.current?.showModal(); }} aria-label={`Open ${label} full size`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- private evidence via the authorised redirect route; not optimisable */}
        <img src={src} alt={label} loading="lazy" decoding="async" />
      </button>
      <dialog ref={ref} className="sd-dialog" aria-label={`${label}, full size`} onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="bar">
          <span>{label}</span>
          <button type="button" onClick={() => ref.current?.close()} autoFocus>
            Close
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
        {open && <img src={src} alt={`${label}, full size`} />}
      </dialog>
    </>
  );
}

// ─── Video with seekable analysed frames ────────────────────────────────────
export function VideoWithFrames({ src, label, children }: { src: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-seek]");
      if (!t || !ref.current) return;
      const v = ref.current;
      v.currentTime = Number(t.dataset.seek);
      if (v.preload === "none" && v.readyState === 0) v.load();
      v.pause();
      v.focus();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);
  return (
    <div className="sd-video">
      <video ref={ref} src={src} controls preload="none" playsInline aria-label={label} />
      {children}
    </div>
  );
}

// ─── Status change ──────────────────────────────────────────────────────────
export interface TransitionOption {
  to: string;
  label: string;
  verb: string;
  noteRequired: boolean;
  adminOnly: boolean;
}

function ResultAlert({ state }: { state: ActionResult | null }) {
  if (!state?.message) return null;
  return (
    <div className={`sd-alert ${state.ok ? "ok" : state.stale ? "warn" : "err"}`} role={state.ok ? "status" : "alert"}>
      {state.message}
    </div>
  );
}

/**
 * Stays mounted across refreshes so its outcome message (including "another
 * member of staff changed this first") survives the refresh it triggers.
 */
export function StatusForm({ action: changeStatus, reference, current, options, emptyText }: { action: FormAction; reference: string; current: string; options: TransitionOption[]; emptyText: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(changeStatus, null);
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  // When the status changes (ours or someone else's), clear the half-made choice.
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setTo("");
    setNote("");
  }
  const chosen = options.find((o) => o.to === to);

  useEffect(() => {
    if (state?.ok || state?.stale) router.refresh();
  }, [state, router]);

  const trimmed = note.trim();
  const noteInvalid = chosen?.noteRequired ? trimmed.length < 3 : trimmed.length > 0 && trimmed.length < 3;

  if (!options.length) {
    return (
      <div className="sd-form">
        <ResultAlert state={state} />
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="sd-form" aria-label="Change status">
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="expectedFrom" value={current} />
      <ResultAlert state={state} />
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 6 }}>
          Move to
        </legend>
        <div className="sd-choices">
          {options.map((o) => (
            <label key={o.to} className="sd-choice">
              <input type="radio" name="to" value={o.to} checked={to === o.to} onChange={() => setTo(o.to)} required />
              <span>{o.verb}</span>
              <span className={`tag${o.adminOnly ? " admin" : ""}`}>
                {o.adminOnly ? "Admin" : ""}
                {o.adminOnly && o.noteRequired ? " · " : ""}
                {o.noteRequired ? "Note required" : ""}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        Internal note {chosen?.noteRequired ? <span style={{ color: "var(--sd-disc)" }}>(required)</span> : <span className="hint">(optional)</span>}
        <textarea name="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} required={!!chosen?.noteRequired} minLength={chosen?.noteRequired ? 3 : undefined} placeholder={chosen?.noteRequired ? "Why is this changing? Staff only — never shown to the customer." : "Staff only — never shown to the customer."} aria-describedby="note-help" />
        <span id="note-help" className="hint">
          {trimmed.length}/2,000 · 3 characters minimum when given
        </span>
      </label>
      <button className="sd-btn" type="submit" disabled={pending || !chosen || noteInvalid}>
        {pending ? "Saving…" : chosen ? `${chosen.verb}` : "Choose a new status"}
      </button>
    </form>
  );
}

// ─── AI report review ───────────────────────────────────────────────────────
export function ReviewForm({
  action: review, reference, reportId, expectedStatus, mode, defaults,
}: {
  action: FormAction;
  reference: string;
  reportId: string;
  expectedStatus: string;
  /** review: first review · supersede: admin replaces a review · none: read-only (outcome message only). */
  mode: "review" | "supersede" | "none";
  defaults: { summary: string; urgency: string; urgencyReason: string };
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(review, null);
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [seen, setSeen] = useState(expectedStatus);
  if (seen !== expectedStatus) {
    setSeen(expectedStatus);
    setDecision("");
    setNotes("");
  }
  useEffect(() => {
    if (state?.ok || state?.stale) router.refresh();
  }, [state, router]);
  const supersede = mode === "supersede";
  const notesNeeded = decision === "REJECTED" || supersede;

  if (mode === "none") {
    return (
      <>
        <ResultAlert state={state} />
        <p className="muted" style={{ margin: state?.message ? "10px 0 0" : 0, fontSize: 13.5 }}>
          Only an administrator can replace an existing review.
        </p>
      </>
    );
  }

  return (
    <form action={action} className="sd-form" aria-label={supersede ? "Supersede review" : "Review AI report"}>
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="expectedStatus" value={expectedStatus} />
      <ResultAlert state={state} />
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 6 }}>
          {supersede ? "Replace the current review (admin)" : "Your review"}
        </legend>
        <div className="sd-choices">
          {[
            ["APPROVED", "Approve", "The report is a fair summary of the evidence."],
            ["EDITED", "Approve with edits", "Save a corrected version. The AI original is kept unchanged."],
            ["REJECTED", "Reject", "The report is misleading or wrong. Note required."],
          ].map(([v, label, hint]) => (
            <label key={v} className="sd-choice" style={{ alignItems: "flex-start" }}>
              <input type="radio" name="decision" value={v} checked={decision === v} onChange={() => setDecision(v)} required style={{ marginTop: 4 }} />
              <span>
                <strong>{label}</strong>
                <br />
                <span className="hint">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {decision === "EDITED" && (
        <div className="sd-staff-edit" style={{ display: "grid", gap: 10 }}>
          <span className="tag">Staff-edited version</span>
          <label className="field">
            Summary
            <textarea name="editSummary" defaultValue={defaults.summary} maxLength={400} required minLength={3} />
          </label>
          <label className="field">
            Urgency (staff assessment)
            <select name="editUrgency" defaultValue={defaults.urgency} required>
              {["URGENT", "HIGH", "NORMAL", "LOW"].map((u) => (
                <option key={u} value={u}>
                  {u[0] + u.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Urgency reason
            <textarea name="editUrgencyReason" defaultValue={defaults.urgencyReason} maxLength={500} />
          </label>
          <label className="field">
            Corrections to the AI report
            <textarea name="editCorrections" maxLength={2000} placeholder="What the AI got wrong or missed, e.g. an observation not supported by the photo." />
          </label>
        </div>
      )}
      <label className="field">
        Review note {notesNeeded ? <span style={{ color: "var(--sd-disc)" }}>(required)</span> : <span className="hint">(optional)</span>}
        <textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} required={notesNeeded} minLength={notesNeeded ? 3 : undefined} />
      </label>
      <button className="sd-btn" type="submit" disabled={pending || !decision || (notesNeeded && notes.trim().length < 3)}>
        {pending ? "Saving…" : supersede ? "Replace review" : "Save review"}
      </button>
    </form>
  );
}
