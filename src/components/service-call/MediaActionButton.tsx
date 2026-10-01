"use client";

import { Icon, type IconName } from "./icons";

/** Large, thumb-friendly media action (Take Photo, Record Video…). */
export default function MediaActionButton({
  icon,
  label,
  description,
  onClick,
  variant = "primary",
  disabled,
}: {
  icon: IconName;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full min-h-16 items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "border-[#007969] bg-[#007969] text-white hover:bg-[#005a50]"
          : "border-gray-200 bg-white text-[#1c1c1e] hover:border-[#007969] hover:bg-[#f0fdf4]"
      }`}
    >
      <span
        className={`flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-full ${
          primary ? "bg-white/15" : "bg-[#f0fdf4] text-[#007969]"
        }`}
      >
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <span className="min-w-0">
        <span className="block font-accent text-[0.9375rem] font-semibold uppercase tracking-[0.1em] leading-tight">{label}</span>
        {description && (
          <span className={`mt-0.5 block text-[0.8125rem] leading-snug ${primary ? "text-white/85" : "text-[#6b7280]"}`}>
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
