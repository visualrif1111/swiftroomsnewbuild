"use client";

import { useRef, useState, type FormEvent } from "react";
import { COUNTRY_CODES } from "@/lib/service-call/config";
import type { Customer } from "@/lib/service-call/types";
import { validateDetails, type DetailsField } from "@/lib/service-call/validation";
import { FieldError, FieldLabel, StepActions, StepHeading, TextField, inputBorder, inputCls } from "../fields";
import type { StepProps } from "./types";

const FIELD_ORDER: DetailsField[] = ["fullName", "mobile", "email", "location"];

export default function CustomerDetailsStep({ draft, onChange, onNext, headingRef, nextLabel }: StepProps) {
  const customer = draft.customer;
  const [touched, setTouched] = useState<Partial<Record<DetailsField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const refs = useRef<Partial<Record<DetailsField, HTMLInputElement | null>>>({});

  const errors = validateDetails(customer);
  const shown = (f: DetailsField) => (attempted || touched[f] ? errors[f] : undefined);
  const set = (patch: Partial<Customer>) => onChange({ customer: { ...customer, ...patch } });
  const touch = (f: DetailsField) => () => setTouched((t) => ({ ...t, [f]: true }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) {
      setAttempted(true);
      refs.current[first]?.focus();
      return;
    }
    onNext();
  }

  const mobileError = shown("mobile");

  return (
    <form noValidate onSubmit={submit} aria-labelledby="service-step-heading">
      <StepHeading
        ref={headingRef}
        eyebrow="01 — Details"
        title="Your details"
        intro="So our service team knows who you are and where the issue is."
      />

      <div className="grid gap-5 md:grid-cols-2 md:gap-x-5 md:gap-y-6">
        <TextField
          ref={(el) => {
            refs.current.fullName = el;
          }}
          id="sc-full-name"
          label="Full name"
          autoComplete="name"
          value={customer.fullName}
          onChange={(v) => set({ fullName: v })}
          onBlur={touch("fullName")}
          error={shown("fullName")}
          className="md:col-span-2"
        />

        <div>
          <FieldLabel htmlFor="sc-mobile">Mobile number</FieldLabel>
          <div className="flex gap-2">
            <select
              aria-label="Country code"
              value={customer.countryCode}
              onChange={(e) => set({ countryCode: e.target.value })}
              autoComplete="tel-country-code"
              className={`w-[6.5rem] flex-shrink-0 px-3 py-3.5 text-base bg-white border rounded-xl outline-none focus:ring-2 focus:ring-[#007969]/30 ${inputBorder(!!mobileError)}`}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.country}
                </option>
              ))}
            </select>
            <input
              ref={(el) => {
                refs.current.mobile = el;
              }}
              id="sc-mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="50 123 4567"
              required
              value={customer.mobile}
              onChange={(e) => set({ mobile: e.target.value.replace(/[^\d\s\-()]/g, "") })}
              onBlur={touch("mobile")}
              aria-invalid={mobileError ? true : undefined}
              aria-describedby={mobileError ? "sc-mobile-error" : undefined}
              className={`min-w-0 flex-1 ${inputCls} ${inputBorder(!!mobileError)}`}
            />
          </div>
          <FieldError id="sc-mobile-error">{mobileError}</FieldError>
        </div>

        <TextField
          ref={(el) => {
            refs.current.email = el;
          }}
          id="sc-email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={customer.email}
          onChange={(v) => set({ email: v })}
          onBlur={touch("email")}
          error={shown("email")}
        />

        <TextField
          ref={(el) => {
            refs.current.location = el;
          }}
          id="sc-location"
          label="Property / location"
          hint="Villa or unit number, community and emirate."
          autoComplete="street-address"
          placeholder="e.g. Villa 12, Arabian Ranches, Dubai"
          value={customer.location}
          onChange={(v) => set({ location: v })}
          onBlur={touch("location")}
          error={shown("location")}
          className="md:col-span-2"
        />

        <fieldset className="md:col-span-2">
          <legend className="block text-sm font-semibold text-[#1c1c1e] mb-2">
            Existing Swift Rooms customer?
          </legend>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ].map((o) => {
              const on = customer.isExistingCustomer === o.value;
              return (
                <label
                  key={o.label}
                  className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-[0.9375rem] font-medium transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#007969] ${
                    on ? "border-[#007969] bg-[#f0fdf4] text-[#007969]" : "border-gray-200 text-[#3a3a3c] hover:border-[#007969]"
                  }`}
                >
                  <input
                    type="radio"
                    name="sc-existing"
                    className="sr-only"
                    checked={on}
                    onChange={() => set({ isExistingCustomer: o.value, ...(o.value ? {} : { reference: "" }) })}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {customer.isExistingCustomer !== false && (
          <TextField
            id="sc-reference"
            label="Project, invoice or reference number"
            optional
            hint="You'll find this on your invoice or handover documents."
            value={customer.reference}
            onChange={(v) => set({ reference: v })}
            className="md:col-span-2"
          />
        )}
      </div>

      <StepActions continueLabel={nextLabel ?? "Continue"} />
    </form>
  );
}
