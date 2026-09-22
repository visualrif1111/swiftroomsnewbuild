"use client";

import Link from "next/link";
import { useCTAForms, type LeadContext } from "./CTAFormProvider";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  /** Attribution passed through to the lead payload. */
  context?: LeadContext;
}

export function QuoteButton({ className, children, onClick, context }: ButtonProps) {
  const { openFreeQuoteForm } = useCTAForms();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        openFreeQuoteForm(context);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function ShowroomButton({ className, children, onClick, context }: ButtonProps) {
  const { openShowroomVisitForm } = useCTAForms();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        openShowroomVisitForm(context);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

/**
 * Smart CTA link: /enquire → opens quote form, /showroom → opens showroom form,
 * any other href → regular <Link>.
 */
export function CTALink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { openFreeQuoteForm, openShowroomVisitForm } = useCTAForms();

  if (href === "/enquire") {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          openFreeQuoteForm();
          onClick?.();
        }}
      >
        {children}
      </button>
    );
  }

  if (href === "/showroom") {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          openShowroomVisitForm();
          onClick?.();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
