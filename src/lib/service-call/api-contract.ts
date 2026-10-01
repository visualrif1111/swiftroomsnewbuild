// Service & Aftercare — HTTP contract between the browser and the API.
//
// Plain JSON shapes with no framework or vendor types, shared by the browser
// client (http-client.ts) and the route handler, and documented in
// docs/service-aftercare/API.md so the same contract can be implemented on
// another stack.
import type { ServiceProductId, ServiceRequestDraft, ServiceStatus } from "./types";

export const SERVICE_REQUESTS_ENDPOINT = "/api/service-requests";
export const IDEMPOTENCY_HEADER = "Idempotency-Key";

/** Body of POST /api/service-requests. Media itself is not sent (Phase 3). */
export interface CreateServiceRequestPayload {
  customer: {
    fullName: string;
    countryCode: string;
    mobile: string;
    email: string;
    location: string;
    isExistingCustomer: boolean | null;
    reference: string;
  };
  productIds: ServiceProductId[];
  otherProduct: string;
  description: string;
  /** What the customer attached in the browser, so staff know to ask for it. */
  declaredMedia: { photos: number; videos: number; voiceNote: boolean };
}

/** 201 Created (new) or 200 OK (same Idempotency-Key seen before). */
export interface CreateServiceRequestResponse {
  id: string;
  reference: string;
  status: ServiceStatus;
  submittedAt: string;
  /** True when this key had already created the request. */
  replayed: boolean;
}

export type ServiceRequestErrorCode =
  | "missing_idempotency_key"
  | "unsupported_media_type"
  | "payload_too_large"
  | "invalid_json"
  | "validation_failed"
  | "not_configured"
  | "server_error";

export interface ServiceRequestErrorResponse {
  error: ServiceRequestErrorCode;
  message: string;
  /** Present for validation_failed: field path → message. */
  fields?: Record<string, string>;
}

/** Builds the request body from the wizard's draft. */
export function toCreatePayload(draft: ServiceRequestDraft): CreateServiceRequestPayload {
  const photos = draft.media.filter((m) => m.kind === "photo").length;
  return {
    customer: {
      fullName: draft.customer.fullName.trim(),
      countryCode: draft.customer.countryCode,
      mobile: draft.customer.mobile.trim(),
      email: draft.customer.email.trim(),
      location: draft.customer.location.trim(),
      isExistingCustomer: draft.customer.isExistingCustomer,
      reference: draft.customer.reference.trim(),
    },
    productIds: draft.productIds,
    otherProduct: draft.productIds.includes("other") ? draft.otherProduct.trim() : "",
    description: draft.description.trim(),
    declaredMedia: {
      photos,
      videos: draft.media.length - photos,
      voiceNote: draft.voiceNote !== null,
    },
  };
}
