// Shared plumbing for talking to Supabase from the server: configuration and a
// small fetch wrapper for the REST (PostgREST) and Storage APIs.
//
// The service-role key bypasses row level security and storage policies, so it
// is read only here and never leaves the server.
import "server-only";

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("Service request storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    this.name = "StoreNotConfiguredError";
  }
}

/** A Supabase call failed. `status` and `code` come from Supabase, never the request body. */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

export const EVIDENCE_BUCKET = "service-evidence";
const TIMEOUT_MS = 15_000;

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new StoreNotConfiguredError();
  return { url: url.replace(/\/+$/, ""), key };
}

/** Calls a Supabase endpoint as the service role. Returns the raw Response for non-JSON uses. */
export async function supabaseFetch(path: string, init: RequestInit & { raw?: boolean } = {}) {
  const { url, key } = supabaseConfig();
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (init.raw) return res;
  if (!res.ok) {
    // Log Supabase's own error code only — never request bodies (PII).
    const detail = await res.json().catch(() => ({}));
    throw new SupabaseError(
      `Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${detail?.code ?? detail?.error ?? ""}`.trim(),
      res.status,
      detail?.code ?? detail?.error,
    );
  }
  return res;
}

/** JSON helper over supabaseFetch. */
export async function supabaseJson<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = (await supabaseFetch(path, init)) as Response;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
