"use client";

import Link from "next/link";
import { useCTAForms } from "./CTAFormProvider";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function QuoteButton({ className, children, onClick }: ButtonProps) {
  const { openFreeQuoteForm } = useCTAForms();
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

export function ShowroomButton({ className, children, onClick }: ButtonProps) {
  const { openShowroomVisitForm } = useCTAForms();
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
