"use client";

import { useRef, useState, type FormEvent } from "react";
import type { ServiceMedia } from "@/lib/service-call/types";
import { validateEvidence } from "@/lib/service-call/validation";
import { StepActions, StepHeading } from "../fields";
import { Icon } from "../icons";
import MediaUploader from "../MediaUploader";
import type { StepProps } from "./types";

interface Props extends StepProps {
  onAddMedia: (items: ServiceMedia[]) => void;
  onRemoveMedia: (id: string) => void;
}

const TIPS = [
  "Step back to show the whole window or door, then get close to the problem.",
  "For anything that sticks, rattles or won't close, a short video of it opening and closing helps most.",
  "Turn on a light or open the blinds if it's dark.",
];

export default function EvidenceStep({ draft, onNext, onBack, headingRef, nextLabel, onAddMedia, onRemoveMedia }: Props) {
  const [attempted, setAttempted] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const error = attempted ? validateEvidence(draft).evidence : undefined;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (validateEvidence(draft).evidence) {
      setAttempted(true);
      // Wait for the message to render, then move focus to it.
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    onNext();
  }

  const hasWrittenOrVoice = draft.description.trim().length > 0 || draft.voiceNote !== null;

  return (
    <form noValidate onSubmit={submit} aria-labelledby="service-step-heading">
      <StepHeading
        ref={headingRef}
        eyebrow="04 — Evidence"
        title="Show us the issue"
        intro="Photos and video help our service team understand the problem before we contact you — so we can come prepared."
      />

      <ul className="mb-6 space-y-2 rounded-xl bg-[#f8f9fa] px-4 py-4 text-sm text-[#3a3a3c]">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2.5">
            <Icon name="check" className="mt-0.5 w-4 h-4 flex-shrink-0 text-[#007969]" strokeWidth={2.5} />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <MediaUploader media={draft.media} onAdd={onAddMedia} onRemove={onRemoveMedia} />

      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 outline-none"
        >
          <Icon name="alert" className="mt-0.5 w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StepActions
        onBack={onBack}
        continueLabel={nextLabel ?? (draft.media.length === 0 && hasWrittenOrVoice ? "Skip to review" : "Review request")}
      />
    </form>
  );
}
