"use client";

// Service & Aftercare wizard — owns the draft, step navigation, focus and
// submission. Steps are presentational and talk back through callbacks; the
// backend is reached only through getServiceRequestClient().
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { toCreatePayload } from "@/lib/service-call/api-contract";
import { getServiceRequestClient } from "@/lib/service-call/client";
import { EMPTY_DRAFT, SERVICE_CALL_STEPS } from "@/lib/service-call/config";
import { clearDraft, loadDraft, saveDraft, type PendingSubmission } from "@/lib/service-call/draft-storage";
import { releaseMedia } from "@/lib/service-call/media";
import { SERVICE_PHONE } from "@/lib/contact";
import {
  ServiceRequestSubmitError,
  type ServiceMedia,
  type ServiceRequestDraft,
  type ServiceRequestReceipt,
} from "@/lib/service-call/types";
import { hasProblemInformation, validateDetails, validateProducts } from "@/lib/service-call/validation";
import { Icon } from "./icons";
import ProgressIndicator from "./ProgressIndicator";
import ConfirmationStep from "./steps/ConfirmationStep";
import CustomerDetailsStep from "./steps/CustomerDetailsStep";
import EvidenceStep from "./steps/EvidenceStep";
import ProblemStep from "./steps/ProblemStep";
import ProductSelectionStep from "./steps/ProductSelectionStep";
import ReviewStep from "./steps/ReviewStep";

const REVIEW = SERVICE_CALL_STEPS.length - 1;
const EVIDENCE = 3;
/** Clears the fixed navbar (h-16 / md:h-20) when scrolling a step into view. */
const NAV_OFFSET = 96;

type View = "intro" | "steps" | "done";

interface Initial {
  view: View;
  step: number;
  draft: ServiceRequestDraft;
  restored: { hadMedia: boolean } | null;
  submission: PendingSubmission | null;
}

/** What the customer would see if this submit failed. */
function submitErrorMessage(err: unknown): string {
  const kind = err instanceof ServiceRequestSubmitError ? err.kind : "server";
  const kept = "Nothing you've entered has been lost.";
  switch (kind) {
    case "validation": {
      const first = err instanceof ServiceRequestSubmitError ? Object.values(err.fieldErrors)[0] : undefined;
      return `Some details need checking${first ? `: ${first}` : "."} Use Edit to correct them.`;
    }
    case "network":
      return `We couldn't reach our service team. Check your connection and try again. ${kept}`;
    case "timeout":
      return `This is taking longer than expected. Try again — if your first attempt got through, you won't create a duplicate. ${kept}`;
    default:
      return `We couldn't send your request just now. Please try again, or call our service team on ${SERVICE_PHONE}. ${kept}`;
  }
}

function initialState(): Initial {
  const stored = loadDraft();
  if (!stored) return { view: "intro", step: 0, draft: EMPTY_DRAFT, restored: null, submission: null };
  let step = Math.min(Math.max(stored.step, 0), REVIEW);
  // Media doesn't survive a refresh; if it was the only evidence, send them back to add it.
  if (step > EVIDENCE && !hasProblemInformation(stored.draft)) step = EVIDENCE;
  return { view: "steps", step, draft: stored.draft, restored: { hadMedia: stored.hadMedia }, submission: stored.submission };
}

export default function ServiceCallWizard({ phone, phoneRaw }: { phone: string; phoneRaw: string }) {
  // Rendered client-only (see ServiceCallSection), so reading sessionStorage here is safe.
  const [init] = useState(initialState);
  const [view, setView] = useState<View>(init.view);
  const [step, setStep] = useState(init.step);
  const [maxReached, setMaxReached] = useState(init.step);
  const [draft, setDraft] = useState<ServiceRequestDraft>(init.draft);
  const [restored, setRestored] = useState(init.restored);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ServiceRequestReceipt | null>(null);

  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const focusPending = useRef(false);
  const latestDraft = useRef(draft);
  // The current submit attempt's key — reused for retries, so the server never
  // creates the request twice. A ref (not state) so a double click can't race.
  const submission = useRef<PendingSubmission | null>(init.submission);
  const inFlight = useRef(false);

  // Persist typed answers so a refresh doesn't lose them.
  useEffect(() => {
    latestDraft.current = draft;
    if (view === "steps") saveDraft(draft, step, submission.current);
  }, [draft, step, view]);

  // Free object URLs when the page is left.
  useEffect(
    () => () => {
      releaseMedia(latestDraft.current.voiceNote);
      latestDraft.current.media.forEach(releaseMedia);
    },
    [],
  );

  // The heading of each newly shown step takes focus once it has mounted
  // (after the exit animation), so screen readers announce the new step.
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusPending.current) {
      focusPending.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const scrollToTop = () => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const show = (nextView: View, nextStep = step) => {
    focusPending.current = true;
    setView(nextView);
    setStep(nextStep);
    setMaxReached((m) => Math.max(m, nextStep));
    scrollToTop();
  };

  const update = (patch: Partial<ServiceRequestDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const next = () => {
    // After reaching Review once, Continue returns there — unless editing removed the only evidence.
    if (maxReached >= REVIEW) {
      const target = step < EVIDENCE && !hasProblemInformation(draft) ? EVIDENCE : REVIEW;
      show("steps", target);
      return;
    }
    show("steps", Math.min(step + 1, REVIEW));
  };
  const back = () => show("steps", Math.max(step - 1, 0));

  const setVoiceNote = (media: ServiceMedia | null) => {
    if (draft.voiceNote && draft.voiceNote !== media) releaseMedia(draft.voiceNote);
    update({ voiceNote: media });
  };
  const addMedia = (items: ServiceMedia[]) => setDraft((d) => ({ ...d, media: [...d.media, ...items] }));
  const removeMedia = (id: string) => {
    releaseMedia(draft.media.find((m) => m.id === id));
    setDraft((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) }));
  };

  async function submit() {
    // Defensive re-check — normally every step has already been validated.
    if (Object.keys(validateDetails(draft.customer)).length) return show("steps", 0);
    if (Object.keys(validateProducts(draft)).length) return show("steps", 1);
    if (!hasProblemInformation(draft)) return show("steps", EVIDENCE);
    if (inFlight.current) return;
    inFlight.current = true;

    // Same answers as the last attempt → same key (a retry). Edited → new
    // request. Media counts are left out: attachments don't survive a refresh,
    // and losing them must not turn a retry into a second request.
    const fingerprint = JSON.stringify({ ...toCreatePayload(draft), declaredMedia: null });
    if (submission.current?.fingerprint !== fingerprint) submission.current = { key: crypto.randomUUID(), fingerprint };
    saveDraft(draft, step, submission.current); // survives a refresh mid-submit

    setSubmitting(true);
    setSubmitError(null);
    setProgress(0);
    try {
      const result = await getServiceRequestClient().submit(draft, {
        idempotencyKey: submission.current.key,
        onProgress: setProgress,
      });
      // Only now — the server has confirmed the request exists.
      submission.current = null;
      clearDraft();
      setReceipt(result);
      setRestored(null);
      show("done");
    } catch (err) {
      setSubmitError(submitErrorMessage(err));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function startAnother() {
    // Keep the customer's details — it's usually the same person reporting a second issue.
    releaseMedia(draft.voiceNote);
    draft.media.forEach(releaseMedia);
    setDraft({ ...EMPTY_DRAFT, customer: draft.customer });
    submission.current = null;
    setReceipt(null);
    setMaxReached(0);
    show("steps", 0);
  }

  function startOver() {
    releaseMedia(draft.voiceNote);
    draft.media.forEach(releaseMedia);
    clearDraft();
    submission.current = null;
    setDraft(EMPTY_DRAFT);
    setRestored(null);
    setMaxReached(0);
    show("steps", 0);
  }

  const nextLabel = maxReached >= REVIEW ? "Back to review" : undefined;
  const motionProps = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -16 },
    transition: { duration: reduceMotion ? 0.01 : 0.22 },
  };
  const stepProps = { draft, onChange: update, onNext: next, onBack: back, headingRef, nextLabel };

  return (
    <section
      ref={containerRef}
      id="service-request"
      aria-label="Service request"
      className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 lg:p-10"
    >
      {view === "steps" && (
        <ProgressIndicator steps={SERVICE_CALL_STEPS} current={step} maxReached={maxReached} onSelect={(i) => show("steps", i)} />
      )}

      {restored && view === "steps" && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[#007969]/20 bg-[#f0fdf4] px-4 py-3 text-sm text-[#1c1c1e] sm:flex-row sm:items-center">
          <p className="flex-1">
            We&apos;ve restored what you entered.
            {restored.hadMedia && " Photos, videos and voice notes aren't kept after a refresh — please add them again."}
          </p>
          <div className="flex gap-1">
            <button type="button" onClick={startOver} className="min-h-11 rounded-lg px-3 font-accent text-[0.75rem] font-semibold uppercase tracking-widest text-[#007969] hover:bg-white">
              Start over
            </button>
            <button type="button" onClick={() => setRestored(null)} aria-label="Dismiss message" className="flex w-11 h-11 items-center justify-center rounded-lg text-[#6b7280] hover:bg-white">
              <Icon name="close" className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view === "steps" ? `step-${step}` : view} {...motionProps}>
          {view === "intro" && <Intro headingRef={headingRef} onStart={() => show("steps", 0)} phone={phone} phoneRaw={phoneRaw} />}

          {view === "steps" && step === 0 && <CustomerDetailsStep {...stepProps} onBack={undefined} />}
          {view === "steps" && step === 1 && <ProductSelectionStep {...stepProps} />}
          {view === "steps" && step === 2 && <ProblemStep {...stepProps} onVoiceNoteChange={setVoiceNote} />}
          {view === "steps" && step === 3 && <EvidenceStep {...stepProps} onAddMedia={addMedia} onRemoveMedia={removeMedia} />}
          {view === "steps" && step === REVIEW && (
            <ReviewStep
              draft={draft}
              headingRef={headingRef}
              onEdit={(i) => show("steps", i)}
              onBack={back}
              onSubmit={submit}
              submitting={submitting}
              progress={progress}
              error={submitError}
            />
          )}

          {view === "done" && receipt && (
            <ConfirmationStep
              receipt={receipt}
              firstName={draft.customer.fullName.trim().split(/\s+/)[0] ?? ""}
              headingRef={headingRef}
              onStartAnother={startAnother}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Intro({
  headingRef,
  onStart,
  phone,
  phoneRaw,
}: {
  headingRef: (el: HTMLHeadingElement | null) => void;
  onStart: () => void;
  phone: string;
  phoneRaw: string;
}) {
  return (
    <div>
      <p className="text-label text-[#007969] mb-2">Report a service issue</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl md:text-3xl font-semibold text-[#1c1c1e] outline-none">
        It takes about three minutes
      </h2>
      <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[#6b7280]">
        Tell us what&apos;s happening, then show us with your phone&apos;s camera. Photos and video help our service team
        understand the issue before we get in touch.
      </p>

      <p className="mt-6 mb-3 text-sm font-semibold text-[#1c1c1e]">You&apos;ll need</p>
      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          { n: "01", t: "Your contact details and the property address" },
          { n: "02", t: "Which window, door or system needs attention" },
          { n: "03", t: "Photos or a short video of the issue, if you can" },
        ].map((item) => (
          <li key={item.n} className="flex gap-3 rounded-xl bg-[#f8f9fa] p-4 sm:flex-col sm:gap-2">
            <span className="font-accent text-sm font-bold text-[#007969]">{item.n}</span>
            <span className="text-sm leading-snug text-[#3a3a3c]">{item.t}</span>
          </li>
        ))}
      </ol>

      <button type="button" onClick={onStart} className="btn-brand mt-8 min-h-12 w-full sm:w-auto">
        Start service request
        <Icon name="arrowRight" className="w-4 h-4" strokeWidth={2} />
      </button>

      <p className="mt-6 border-t border-gray-100 pt-5 text-sm text-[#6b7280]">
        Urgent safety issue, like broken glass or a door that won&apos;t lock? Call us on{" "}
        <a href={`tel:${phoneRaw}`} className="font-semibold text-[#007969] underline-offset-4 hover:underline">
          {phone}
        </a>
        .
      </p>
    </div>
  );
}
