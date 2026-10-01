"use client";

// Form primitives for the service call wizard. Visual language matches
// LeadTypeform (rounded-xl inputs, brand focus ring), with visible labels and
// errors wired up for assistive technology.
import { forwardRef, type ReactNode } from "react";
import { Icon } from "./icons";

export const inputCls =
  "w-full px-4 py-3.5 text-base text-[#1c1c1e] bg-white border rounded-xl outline-none transition-all placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#007969]/30 focus:border-[#007969]";

export const inputBorder = (invalid?: boolean) => (invalid ? "border-red-600" : "border-gray-200");

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
      <Icon name="alert" className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#1c1c1e] mb-2">
      {children}
      {optional && <span className="font-normal text-[#6b7280]"> (optional)</span>}
    </label>
  );
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, value, onChange, error, hint, optional, className = "", ...rest },
  ref,
) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 mb-2 text-sm text-[#6b7280]">
          {hint}
        </p>
      )}
      <input
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={!optional}
        className={`${inputCls} ${inputBorder(!!error)}`}
        {...rest}
      />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
});

/** Heading for each step. Receives focus when the step changes. */
export const StepHeading = forwardRef<HTMLHeadingElement, { eyebrow: string; title: string; intro?: string }>(
  function StepHeading({ eyebrow, title, intro }, ref) {
    return (
      <div className="mb-6 md:mb-8">
        <p className="text-label text-[#007969] mb-2">{eyebrow}</p>
        <h2 ref={ref} tabIndex={-1} className="text-2xl md:text-3xl font-semibold text-[#1c1c1e] outline-none">
          {title}
        </h2>
        {intro && <p className="mt-2 text-[#6b7280] text-[0.9375rem] leading-relaxed max-w-xl">{intro}</p>}
      </div>
    );
  },
);

/** Back / Continue row at the foot of every step. Never fixed — scrolls with the page. */
export function StepActions({
  onBack,
  backLabel = "Back",
  continueLabel = "Continue",
  continueDisabled,
  extra,
}: {
  onBack?: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="mt-8 md:mt-10 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 min-h-12 px-4 text-[0.75rem] tracking-widest uppercase font-semibold text-[#6b7280] hover:text-[#007969] transition-colors font-accent"
        >
          <Icon name="arrowLeft" className="w-4 h-4" strokeWidth={2} />
          {backLabel}
        </button>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
        {extra}
        <button type="submit" disabled={continueDisabled} className="btn-brand min-h-12 w-full sm:w-auto disabled:opacity-50">
          {continueLabel}
          <Icon name="arrowRight" className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
