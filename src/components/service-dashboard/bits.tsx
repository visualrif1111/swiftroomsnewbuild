// Small presentational pieces shared by the dashboard pages (server components).

export function Pill({ kind, value, label, plain }: { kind: "st" | "ug" | "ai" | "rv"; value: string; label: string; plain?: boolean }) {
  return <span className={`sd-pill ${kind}-${value}${plain ? " plain" : ""}`}>{label}</span>;
}

const Icon = {
  photo: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
      <circle cx="8" cy="8" r="2.25" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.75" y="3.75" width="9" height="8.5" rx="1.5" />
      <path d="M10.75 7l3.5-2v6l-3.5-2" />
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.75" y="1.75" width="4.5" height="8" rx="2.25" />
      <path d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2.25" />
    </svg>
  ),
};

export function EvidenceCounts({ photos, videos, voice }: { photos: number; videos: number; voice: number }) {
  if (!photos && !videos && !voice) return <span className="muted" style={{ fontSize: 13 }}>None</span>;
  const label = [photos && `${photos} photo${photos > 1 ? "s" : ""}`, videos && `${videos} video${videos > 1 ? "s" : ""}`, voice && `${voice} voice note${voice > 1 ? "s" : ""}`]
    .filter(Boolean)
    .join(", ");
  return (
    <span className="sd-ev" aria-label={label} title={label}>
      {photos > 0 && <span>{Icon.photo}{photos}</span>}
      {videos > 0 && <span>{Icon.video}{videos}</span>}
      {voice > 0 && <span>{Icon.voice}{voice}</span>}
    </span>
  );
}

export function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M10 2.5l8 14.5H2L10 2.5z" strokeLinejoin="round" />
      <path d="M10 8v4M10 14.5v.5" strokeLinecap="round" />
    </svg>
  );
}
