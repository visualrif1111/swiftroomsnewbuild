"use client";

import type { FormEvent, Ref } from "react";
import type { ServiceRequestDraft } from "@/lib/service-call/types";
import { StepActions, StepHeading } from "../fields";
import { Icon } from "../icons";
import ServiceSummary from "../ServiceSummary";

interface Props {
  draft: ServiceRequestDraft;
  headingRef: Ref<HTMLHeadingElement>;
  onEdit: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  /** 0–1 while submitting. */
  progress: number;
  error: string | null;
}

export default function ReviewStep({ draft, headingRef, onEdit, onBack, onSubmit, submitting, progress, error }: Props) {
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!submitting) onSubmit();
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="service-step-heading" aria-busy={submitting}>
      <StepHeading
        ref={headingRef}
        eyebrow="05 — Review"
        title="Review your request"
        intro="Check everything is right before you send it. Use Edit to change any section."
      />

      <ServiceSummary draft={draft} onEdit={submitting ? undefined : onEdit} />

      <p className="mt-6 text-sm text-[#6b7280]">
        By submitting, you agree to Swift Rooms contacting you about this service request.
      </p>

      {submitting && (
        <div className="mt-6" role="status">
          <p className="mb-2 text-sm text-[#3a3a3c]">
            Sending your request…
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#007969] transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="alert" className="mt-0.5 w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StepActions
        onBack={submitting ? undefined : onBack}
        continueLabel={submitting ? "Sending…" : error ? "Try again" : "Submit service request"}
        continueDisabled={submitting}
      />
    </form>
  );
}
