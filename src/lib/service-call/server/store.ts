// Service request storage — the only module that talks to the database.
//
//   Route handler  →  getServiceRequestStore()  →  Supabase (PostgREST over HTTPS)
//
// Plain fetch against Supabase's REST API keeps this dependency-free and easy
// to port (see supabase.ts). Media lives in media-store.ts.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { ServiceStatus } from "../types";
import { StoreNotConfiguredError, supabaseConfig, supabaseJson } from "./supabase";
import type { ValidServiceRequest } from "./validate";

export { StoreNotConfiguredError };

/** How long a browser may keep adding media to the request it created. */
export const UPLOAD_TOKEN_TTL_MS = 6 * 60 * 60 * 1000;

/** SHA-256 of an upload token; only the hash is stored. */
export const hashUploadToken = (token: string) => createHash("sha256").update(token).digest("hex");

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

export interface UploadAuthorisation {
  token: string;
  expiresAt: string;
}

/** The request an upload token belongs to, if the token is valid for that reference. */
export interface AuthorisedRequest {
  id: string;
  reference: string;
  expired: boolean;
}

export interface ServiceRequestStore {
  create(request: ValidServiceRequest, idempotencyKey: string): Promise<CreatedServiceRequest>;
  getByReference(reference: string): Promise<StoredServiceRequest | null>;
  /**
   * Issues a fresh upload token for a request (replacing any previous one) and
   * returns it once; only its hash is stored.
   */
  issueUploadToken(requestId: string): Promise<UploadAuthorisation>;
  /** Looks up a request by reference AND upload token hash. */
  authoriseUpload(reference: string, token: string): Promise<AuthorisedRequest | null>;
}

function supabaseStore(): ServiceRequestStore {
  const call = (path: string, init: RequestInit) => supabaseJson<any>(path, init); // eslint-disable-line @typescript-eslint/no-explicit-any

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

    async issueUploadToken(requestId) {
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + UPLOAD_TOKEN_TTL_MS).toISOString();
      await call(`/rest/v1/service_requests?id=eq.${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ upload_token_hash: hashUploadToken(token), upload_token_expires_at: expiresAt }),
      });
      return { token, expiresAt };
    },

    async authoriseUpload(reference, token) {
      if (!token) return null;
      const rows = await call(
        `/rest/v1/service_requests?reference=eq.${encodeURIComponent(reference)}&upload_token_hash=eq.${hashUploadToken(token)}&select=id,reference,upload_token_expires_at`,
        { method: "GET" },
      );
      const r = rows?.[0];
      if (!r) return null;
      return { id: r.id, reference: r.reference, expired: !r.upload_token_expires_at || new Date(r.upload_token_expires_at) <= new Date() };
    },
  };
}

/** The configured store. Throws StoreNotConfiguredError when env vars are missing. */
export function getServiceRequestStore(): ServiceRequestStore {
  supabaseConfig(); // fail fast when not configured
  return supabaseStore();
}
