// Single-path line icons in the same style as LeadTypeform's option icons.
const PATHS = {
  window: "M4 4h16v16H4zM12 4v16M4 12h16",
  "sliding-door": "M3 4h18v16H3zM12 4v16M5.5 12h3m0 0L7 10.5M8.5 12 7 13.5M18.5 12h-3m0 0 1.5-1.5M15.5 12l1.5 1.5",
  "bi-fold-door": "M3 4h18v16H3zM8 4v16M13 4v16M18 4v16",
  "entrance-door": "M6 3h12v18H6zM15 12h.01M3 21h18",
  glass: "M5 3h14v18H5zM9 7l-2 2M14 7l-5 5M15 12l-4 4",
  hardware: "M7 4h3v16H7zM10 9h7a1.5 1.5 0 010 3h-7",
  "motorised-system": "M13 2 4 14h7l-1 8 9-12h-7l1-8z",
  "curtain-wall": "M3 21V3h18v18M3 9h18M3 15h18M9 3v18M15 3v18",
  other: "M5 12h.01M12 12h.01M19 12h.01",
  camera:
    "M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  video: "M3 7a2 2 0 012-2h9a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM16 10l5-3v10l-5-3",
  mic: "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3",
  upload: "M12 15V3m0 0L8 7m4-4 4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2",
  check: "M5 13l4 4L19 7",
  close: "M6 6l12 12M18 6 6 18",
  stop: "M7 7h10v10H7z",
  play: "M7 5v14l11-7z",
  edit: "M14 6l4 4-8 8-4 1 1-4 8-8zM13 7l4 4",
  alert: "M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  arrowLeft: "M15 18l-6-6 6-6",
  arrowRight: "M9 6l6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "w-6 h-6", strokeWidth = 1.5 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={name === "other" ? 3 : strokeWidth}
        d={PATHS[name]}
      />
    </svg>
  );
}
