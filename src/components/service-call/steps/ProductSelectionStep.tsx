"use client";

import { useRef, useState, type FormEvent } from "react";
import { SERVICE_PRODUCTS } from "@/lib/service-call/config";
import type { ServiceProductId } from "@/lib/service-call/types";
import { validateProducts } from "@/lib/service-call/validation";
import { FieldError, StepActions, StepHeading, TextField } from "../fields";
import { Icon } from "../icons";
import type { StepProps } from "./types";

export default function ProductSelectionStep({ draft, onChange, onNext, onBack, headingRef, nextLabel }: StepProps) {
  const [attempted, setAttempted] = useState(false);
  const firstOptionRef = useRef<HTMLInputElement>(null);
  const error = attempted ? validateProducts(draft).products : undefined;

  const toggle = (id: ServiceProductId) => {
    const on = draft.productIds.includes(id);
    onChange({
      productIds: on ? draft.productIds.filter((p) => p !== id) : [...draft.productIds, id],
      ...(id === "other" && on ? { otherProduct: "" } : {}),
    });
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    if (validateProducts(draft).products) {
      setAttempted(true);
      firstOptionRef.current?.focus();
      return;
    }
    onNext();
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="service-step-heading">
      <StepHeading
        ref={headingRef}
        eyebrow="02 — Product"
        title="What needs attention?"
        intro="Choose everything that applies — for example a sliding door and its hardware."
      />

      <fieldset aria-describedby={error ? "sc-products-error" : undefined}>
        <legend className="sr-only">What needs attention? Select all that apply.</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICE_PRODUCTS.map((p, i) => {
            const on = draft.productIds.includes(p.id);
            return (
              <label
                key={p.id}
                className={`relative flex min-h-[7.5rem] cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#007969] has-[:focus-visible]:ring-offset-2 ${
                  on
                    ? "border-[#007969] bg-[#f0fdf4] text-[#007969]"
                    : error
                      ? "border-red-600/60 text-[#3a3a3c] hover:border-[#007969]"
                      : "border-gray-200 text-[#3a3a3c] hover:border-[#007969] hover:bg-[#f0fdf4]"
                }`}
              >
                <input
                  ref={i === 0 ? firstOptionRef : undefined}
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => toggle(p.id)}
                />
                <span className="flex items-start justify-between gap-2">
                  <Icon name={p.id} className="w-8 h-8" />
                  <span
                    aria-hidden="true"
                    className={`flex w-5 h-5 flex-shrink-0 items-center justify-center rounded border ${
                      on ? "bg-[#007969] border-[#007969]" : "border-gray-300 bg-white"
                    }`}
                  >
                    {on && <Icon name="check" className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </span>
                </span>
                <span>
                  <span className={`block text-[0.9375rem] font-semibold leading-tight ${on ? "text-[#007969]" : "text-[#1c1c1e]"}`}>
                    {p.label}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-snug text-[#6b7280]">{p.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <FieldError id="sc-products-error">{error}</FieldError>

      {draft.productIds.includes("other") && (
        <TextField
          id="sc-other-product"
          label="What is it?"
          optional
          placeholder="e.g. Pergola louvres, insect screen"
          value={draft.otherProduct}
          onChange={(v) => onChange({ otherProduct: v })}
          className="mt-6"
        />
      )}

      <StepActions onBack={onBack} continueLabel={nextLabel ?? "Continue"} />
    </form>
  );
}
