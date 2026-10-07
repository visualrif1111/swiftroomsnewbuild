// Parses the inbox URL (?q=&status=&urgency=&product=&ai=&from=&to=&sort=&page=)
// into a bounded, validated query. Unknown values are dropped, never passed on.
import { AI_STATES, OPEN_STATUSES, SERVICE_STATUSES, URGENCIES, PRODUCT_LABEL, type AiState, type Urgency } from "./labels";

export const PAGE_SIZE = 25;
export const SORTS = ["newest", "oldest", "urgency"] as const;
export type InboxSort = (typeof SORTS)[number];

export interface InboxQuery {
  search: string;
  /** "open" (default), "all", or one status. */
  status: string;
  statuses: string[] | null;
  urgency: Urgency | null;
  product: string | null;
  ai: AiState | null;
  from: string | null;
  to: string | null;
  sort: InboxSort;
  page: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const validDate = (s: string) => DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

export function parseInboxQuery(sp: Record<string, string | string[] | undefined>): InboxQuery {
  const search = one(sp.q).trim().slice(0, 100);
  const rawStatus = one(sp.status) || "open";
  const status = rawStatus === "all" || rawStatus === "open" || (SERVICE_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : "open";
  const statuses = status === "all" ? null : status === "open" ? [...OPEN_STATUSES] : [status];
  const u = one(sp.urgency);
  const p = one(sp.product);
  const a = one(sp.ai);
  const from = one(sp.from);
  const to = one(sp.to);
  const s = one(sp.sort);
  const page = Math.min(Math.max(1, Number.parseInt(one(sp.page), 10) || 1), 10_000);
  return {
    search,
    status,
    statuses,
    urgency: (URGENCIES as readonly string[]).includes(u) ? (u as Urgency) : null,
    product: p in PRODUCT_LABEL ? p : null,
    ai: (AI_STATES as readonly string[]).includes(a) ? (a as AiState) : null,
    from: validDate(from) ? from : null,
    to: validDate(to) ? to : null,
    sort: (SORTS as readonly string[]).includes(s) ? (s as InboxSort) : "newest",
    page,
  };
}

/** Arguments for list_service_requests(). `to` is inclusive of the whole day (Gulf Standard Time). */
export function toRpcArgs(q: InboxQuery) {
  const dayStart = (d: string) => new Date(`${d}T00:00:00+04:00`).toISOString();
  const dayAfter = (d: string) => new Date(new Date(`${d}T00:00:00+04:00`).getTime() + 86_400_000).toISOString();
  return {
    p_search: q.search || null,
    p_statuses: q.statuses,
    p_urgencies: q.urgency ? [q.urgency] : null,
    p_products: q.product ? [q.product] : null,
    p_from: q.from ? dayStart(q.from) : null,
    p_to: q.to ? dayAfter(q.to) : null,
    p_ai_states: q.ai ? [q.ai] : null,
    p_sort: q.sort,
    p_limit: PAGE_SIZE,
    p_offset: (q.page - 1) * PAGE_SIZE,
  };
}

/** The same query with some fields changed, as a URL search string (page resets unless given). */
export function inboxHref(q: InboxQuery, change: Partial<Record<"q" | "status" | "urgency" | "product" | "ai" | "from" | "to" | "sort" | "page", string | null>>) {
  const cur: Record<string, string | null> = {
    q: q.search || null, status: q.status === "open" ? null : q.status, urgency: q.urgency, product: q.product, ai: q.ai, from: q.from, to: q.to,
    sort: q.sort === "newest" ? null : q.sort, page: null,
  };
  const next = { ...cur, ...change };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
  const s = params.toString();
  return `/admin/service${s ? `?${s}` : ""}`;
}
