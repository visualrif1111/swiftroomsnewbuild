"use client";

import { Icon } from "./icons";

interface Step {
  id: string;
  number: string;
  label: string;
}

interface Props {
  steps: readonly Step[];
  current: number;
  /** Furthest step reached — earlier steps can be revisited from the indicator. */
  maxReached: number;
  onSelect: (index: number) => void;
}

/**
 * Numbered progress for the wizard.
 * Mobile: "Step 2 of 5 · Product" over a five-segment bar.
 * md and up: the full 01–05 row; completed steps are buttons for jumping back.
 */
export default function ProgressIndicator({ steps, current, maxReached, onSelect }: Props) {
  const step = steps[current];

  return (
    <nav aria-label="Service request progress" className="mb-8 md:mb-10">
      {/* Mobile */}
      <div className="md:hidden">
        <p className="flex items-baseline justify-between gap-3 mb-3">
          <span className="text-label text-[#007969]">
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-sm font-semibold text-[#1c1c1e]">{step.label}</span>
        </p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-hidden="true">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-colors duration-300 ${i <= current ? "bg-[#007969]" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Tablet / desktop */}
      <ol className="hidden md:flex items-center">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached && !active;
          const marker = (
            <>
              <span
                className={`flex w-9 h-9 flex-shrink-0 items-center justify-center rounded-full border text-[0.8rem] font-semibold font-accent transition-colors ${
                  active
                    ? "border-[#007969] bg-[#007969] text-white"
                    : done
                      ? "border-[#007969] bg-[#f0fdf4] text-[#007969]"
                      : "border-gray-200 text-[#6b7280]"
                }`}
              >
                {done ? <Icon name="check" className="w-4 h-4" strokeWidth={2.5} /> : s.number}
              </span>
              <span
                className={`text-[0.75rem] tracking-[0.12em] uppercase font-semibold font-accent ${
                  active ? "text-[#1c1c1e]" : done ? "text-[#007969]" : "text-[#6b7280]"
                }`}
              >
                {s.label}
              </span>
            </>
          );
          return (
            <li key={s.id} className="flex items-center flex-1 last:flex-none min-w-0" aria-current={active ? "step" : undefined}>
              {reachable ? (
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  className="flex items-center gap-2.5 min-h-11 rounded-full pr-2 hover:opacity-80"
                  aria-label={`${s.label} — step ${i + 1}${done ? ", completed" : ""}. Go to this step`}
                >
                  {marker}
                </button>
              ) : (
                <span className="flex items-center gap-2.5 min-h-11 pr-2">
                  {marker}
                  <span className="sr-only">{active ? " (current step)" : " (not yet reached)"}</span>
                </span>
              )}
              {i < steps.length - 1 && (
                <span aria-hidden="true" className={`mx-2 lg:mx-3 h-px flex-1 ${i < current ? "bg-[#007969]" : "bg-gray-200"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
