// Service request storage — the only module that talks to the database.
//
//   Route handler  →  getServiceRequestStore()  →  Supabase (PostgREST over HTTPS)
//
// Plain fetch against Supabase's REST API keeps this dependency-free and easy
// to port. The service-role key bypasses row level security, so it must only
// ever be read here, on the server.
import "server-only";
import type { ServiceStatus } from "../types";
import type { ValidServiceRequest } from "./validate";

export interface CreatedServiceRequest {
  id: string;
  reference: string;
  status: ServiceStatus;
  createdAt: string;
  /** True when the idempotency key had already created this request. */
  replayed: boolean;
}

export interface StatusHistoryEntry {
  fromStatus: ServiceStatus | null;
  toStatus: ServiceStatus;
  changedBy: string;
  note: string | null;
  changedAt: string;
}

export interface StoredServiceRequest {
  id: string;
  reference: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; fullName: string; email: string; mobileE164: string; location: string | null };
  submitted: {
    customerName: string;
    email: string;
    mobileE164: string;
    location: string;
    existingCustomer: boolean | null;
    projectReference: string | null;
    productCategories: string[];
    otherProduct: string | null;
    problemDescription: string;
    declaredMedia: { photos: number; videos: number; voiceNote: boolean };
    channel: string;
  };
  statusHistory: StatusHistoryEntry[];
}

export interface ServiceRequestStore {
  create(request: ValidServiceRequest, idempotencyKey: string): Promise<CreatedServiceRequest>;
  getByReference(reference: string): Promise<StoredServiceRequest | null>;
}

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("Service request storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    this.name = "StoreNotConfiguredError";
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

function supabaseStore(url: string, key: string): ServiceRequestStore {
  const base = url.replace(/\/+$/, "");
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  async function call(path: string, init: RequestInit) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Log the database's own error code only — never the request body (PII).
      const detail = await res.json().catch(() => ({}));
      throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${detail?.code ?? ""}`.trim());
    }
    return res.json();
  }

  return {
    async create(request, idempotencyKey) {
      const rows = await call("/rest/v1/rpc/create_service_request", {
        method: "POST",
        body: JSON.stringify({ p_payload: request, p_idempotency_key: idempotencyKey }),
      });
      const row = Array.isArray(rows) ? rows[0] : rows;
      return { id: row.id, reference: row.reference, status: row.status, createdAt: row.created_at, replayed: row.replayed };
    },

    async getByReference(reference) {
      const select = "*,customer:customers(*),status_history(*)";
      const rows = await call(
        `/rest/v1/service_requests?reference=eq.${encodeURIComponent(reference)}&select=${encodeURIComponent(select)}&status_history.order=changed_at.asc,id.asc`,
        { method: "GET" },
      );
      const r = rows[0];
      if (!r) return null;
      return {
        id: r.id,
        reference: r.reference,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        customer: {
          id: r.customer.id,
          fullName: r.customer.full_name,
          email: r.customer.email,
          mobileE164: r.customer.mobile_e164,
          location: r.customer.location,
        },
        submitted: {
          customerName: r.customer_name,
          email: r.email,
          mobileE164: r.mobile_e164,
          location: r.location,
          existingCustomer: r.existing_customer,
          projectReference: r.project_reference,
          productCategories: r.product_categories,
          otherProduct: r.other_product,
          problemDescription: r.problem_description,
          declaredMedia: r.declared_media,
          channel: r.channel,
        },
        statusHistory: (r.status_history ?? []).map((h: Record<string, unknown>) => ({
          fromStatus: h.from_status,
          toStatus: h.to_status,
          changedBy: h.changed_by,
          note: h.note,
          changedAt: h.changed_at,
        })),
      };
    },
  };
}

/** The configured store. Throws StoreNotConfiguredError when env vars are missing. */
export function getServiceRequestStore(): ServiceRequestStore {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new StoreNotConfiguredError();
  return supabaseStore(url, key);
}
