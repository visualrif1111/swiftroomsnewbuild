// Dates in the service team's time zone (Gulf Standard Time), fixed format.
const DT = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
const D = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", year: "numeric" });
const T = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", hour12: false });

export const formatDateTime = (iso: string | null | undefined) => (iso ? DT.format(new Date(iso)).replace(",", "") : "—");
export const formatDate = (iso: string) => D.format(new Date(iso));
export const formatTime = (iso: string) => T.format(new Date(iso));

/** "3 h ago" style age for the inbox; falls back to the date after a week. */
export function formatAge(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return formatDate(iso);
}

export function formatBytes(n: number | null) {
  if (n === null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
