"use client";

import { useRef, useState, type FormEvent } from "react";
import { DESCRIPTION_MAX_LENGTH } from "@/lib/service-call/config";
import type { ServiceMedia } from "@/lib/service-call/types";
import { validateProblem } from "@/lib/service-call/validation";
import { FieldError, FieldLabel, StepActions, StepHeading, inputBorder, inputCls } from "../fields";
import VoiceRecorder from "../VoiceRecorder";
import type { StepProps } from "./types";

interface Props extends StepProps {
  onVoiceNoteChange: (media: ServiceMedia | null) => void;
}

export default function ProblemStep({ draft, onChange, onNext, onBack, headingRef, nextLabel, onVoiceNoteChange }: Props) {
  const [attempted, setAttempted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const error = attempted ? validateProblem(draft).description : undefined;
  const remaining = DESCRIPTION_MAX_LENGTH - draft.description.length;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (validateProblem(draft).description) {
      setAttempted(true);
      textareaRef.current?.focus();
      return;
    }
    onNext();
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="service-step-heading">
      <StepHeading
        ref={headingRef}
        eyebrow="03 — Problem"
        title="What's the problem?"
        intro="Write it down, say it in a voice note, or both. If it's easier to show us, you can add photos and video next."
      />

      <div>
        <FieldLabel htmlFor="sc-description">Describe the issue</FieldLabel>
        <p id="sc-description-hint" className="-mt-1 mb-2 text-sm text-[#6b7280]">
          Where is it, what happens, and when did it start?
        </p>
        <textarea
          ref={textareaRef}
          id="sc-description"
          rows={5}
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="e.g. The living room sliding door has become stiff and catches halfway when opening. Started last week."
          aria-invalid={error ? true : undefined}
          aria-describedby={["sc-description-hint", "sc-description-count", error && "sc-description-error"].filter(Boolean).join(" ")}
          className={`${inputCls} ${inputBorder(!!error)} min-h-36 resize-y`}
        />
        <p
          id="sc-description-count"
          className={`mt-1.5 text-right text-[0.8125rem] ${remaining < 0 ? "text-red-600" : "text-[#6b7280]"}`}
        >
          {remaining < 200 ? `${remaining} characters left` : `${draft.description.length} / ${DESCRIPTION_MAX_LENGTH}`}
        </p>
        <FieldError id="sc-description-error">{error}</FieldError>
      </div>

      <div className="mt-8">
        <p className="mb-1 text-sm font-semibold text-[#1c1c1e]">Prefer to talk it through?</p>
        <p className="mb-3 text-sm text-[#6b7280]">Record a short voice note describing what&apos;s happening.</p>
        <VoiceRecorder value={draft.voiceNote} onChange={onVoiceNoteChange} />
      </div>

      <StepActions onBack={onBack} continueLabel={nextLabel ?? "Continue"} />
    </form>
  );
}
