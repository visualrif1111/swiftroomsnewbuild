"use client";

import Link from "next/link";
import type { Ref } from "react";
import type { ServiceRequestReceipt } from "@/lib/service-call/types";
import { Icon } from "../icons";

/** Shown after a successful submit. Replaces the wizard (no progress bar). */
export default function ConfirmationStep({
  receipt,
  firstName,
  headingRef,
  onStartAnother,
}: {
  receipt: ServiceRequestReceipt;
  firstName: string;
  headingRef: Ref<HTMLHeadingElement>;
  onStartAnother: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex w-14 h-14 items-center justify-center rounded-full bg-[#f0fdf4]">
        <Icon name="check" className="w-7 h-7 text-[#007969]" strokeWidth={2} />
      </div>

      <p className="text-label text-[#007969] mb-3">Service request received</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl md:text-3xl font-semibold text-[#1c1c1e] outline-none">
        Thank you{firstName ? `, ${firstName}` : ""}.
      </h2>

      <div className="mx-auto mt-6 max-w-xs rounded-xl border border-[#007969]/25 bg-[#f0fdf4] px-6 py-5">
        <p className="text-[0.8125rem] text-[#3a3a3c]">Your reference</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-wide text-[#007969] tabular-nums">{receipt.reference}</p>
      </div>

      <p className="mx-auto mt-6 max-w-md text-[#3a3a3c] leading-relaxed">
        Thank you for contacting Swift Rooms Service &amp; Aftercare.
      </p>
      <p className="mx-auto mt-2 max-w-md text-[#6b7280] leading-relaxed">
        Our service team will review the information you&apos;ve provided and contact you regarding the next step. Keep your
        reference handy if you need to get in touch.
      </p>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        {/* Phase 1 placeholder — no WhatsApp integration yet. */}
        <button
          type="button"
          disabled
          aria-describedby="sc-whatsapp-note"
          className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-white opacity-60"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z" />
          </svg>
          Continue on WhatsApp
        </button>
        <p id="sc-whatsapp-note" className="-mt-1 text-[0.75rem] text-[#6b7280]">
          Coming soon — WhatsApp updates aren&apos;t connected in this preview.
        </p>
        <Link href="/" className="btn-outline min-h-12 justify-center">
          Return home
        </Link>
        <button
          type="button"
          onClick={onStartAnother}
          className="min-h-11 font-accent text-[0.75rem] font-semibold uppercase tracking-widest text-[#6b7280] hover:text-[#007969]"
        >
          Report another issue
        </button>
      </div>
    </div>
  );
}
