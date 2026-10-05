// Service & Aftercare — domain models.
//
// These types are the contract between the customer-facing UI and whatever
// backend eventually stores service requests. They deliberately contain no
// framework or vendor types (no Next.js, Vercel, Sanity or Supabase), so the
// same definitions can be lifted into another codebase unchanged.
// `ServiceRequestClient` below is the full contract a backend must implement.

/**
 * Lifecycle of a service request once it leaves the customer's device.
 * Mirrors the `service_request_status` enum in the database.
 */
export const SERVICE_STATUSES = [
  "SUBMITTED", // received from the customer, not yet looked at
  "AI_PROCESSED", // automated triage has run (later phase)
  "AWAITING_REVIEW", // waiting for the service team
  "MORE_INFORMATION_REQUIRED", // customer asked for more detail or media
  "INSPECTION_REQUIRED", // a site visit is needed
  "SCHEDULED", // visit booked
  "IN_PROGRESS", // engineer attending / parts on order
  "RESOLVED", // fixed, awaiting confirmation
  "CLOSED", // complete
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

/** The categories a customer can pick on "What needs attention?". */
export type ServiceProductId =
  | "window"
  | "sliding-door"
  | "bi-fold-door"
  | "entrance-door"
  | "glass"
  | "hardware"
  | "motorised-system"
  | "curtain-wall"
  | "other";

export interface ServiceProduct {
  id: ServiceProductId;
  label: string;
  /** One short line shown under the label to help customers choose. */
  hint: string;
}

export interface Customer {
  fullName: string;
  /** Dialling code including "+", e.g. "+971". */
  countryCode: string;
  /** National number as typed (digits, spaces, dashes). */
  mobile: string;
  email: string;
  /** Free-text property / location, e.g. "Villa 12, Arabian Ranches, Dubai". */
  location: string;
  /** null = not answered. */
  isExistingCustomer: boolean | null;
  /** Project, invoice or reference number — optional. */
  reference: string;
}

export type ServiceMediaKind = "photo" | "video" | "voice-note";

/** How the item reached the form — useful for triage and analytics. */
export type ServiceMediaSource = "camera" | "upload" | "recording";

/**
 * One photo, video or voice note attached to a request.
 *
 * `file` and `previewUrl` only exist in the browser. A production client
 * uploads `file`, then sends the metadata (minus those two fields) plus the
 * storage key returned by the upload.
 */
export interface ServiceMedia {
  id: string;
  kind: ServiceMediaKind;
  source: ServiceMediaSource;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Seconds, when known (recordings always; uploads when readable). */
  durationSeconds?: number;
  /** ISO timestamp of when it was added to the form. */
  addedAt: string;
  /** Browser-only: the binary to upload. */
  file?: Blob;
  /** Browser-only: object URL for thumbnails and playback. */
  previewUrl?: string;
}

/** Everything the customer has entered so far. */
export interface ServiceRequestDraft {
  customer: Customer;
  productIds: ServiceProductId[];
  /** Optional detail when "other" is selected. */
  otherProduct: string;
  description: string;
  voiceNote: ServiceMedia | null;
  /** Photos and videos (not the voice note). */
  media: ServiceMedia[];
}

/** A submitted request, as the backend would return or list it. */
export interface ServiceRequest {
  id: string;
  /** Human-facing reference, e.g. "SR-2026-00001". */
  reference: string;
  status: ServiceStatus;
  submittedAt: string;
  customer: Customer;
  productIds: ServiceProductId[];
  otherProduct?: string;
  description: string;
  voiceNote: Omit<ServiceMedia, "file" | "previewUrl"> | null;
  media: Omit<ServiceMedia, "file" | "previewUrl">[];
  /** Where the request came from, e.g. "website/service-call". */
  channel: string;
}

/** What the UI needs back after a successful submit. */
export interface ServiceRequestReceipt {
  id: string;
  reference: string;
  status: ServiceStatus;
  submittedAt: string;
  /** Lets this browser attach media to the request it just created. */
  upload?: { token: string; expiresAt: string };
}

/** A file's server-side state after an upload attempt. */
export interface UploadedMediaResult {
  mediaId: string;
  status: "UPLOADED";
}

export interface UploadMediaOptions {
  /** Called once the server has registered the file (before the upload starts). */
  onRegistered?: (mediaId: string) => void;
  /** 0–1 for this file. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/** Why a media upload failed. */
export type MediaErrorKind =
  | "network" // connection dropped — retry
  | "rejected" // the file isn't acceptable (type/size/content) — remove it
  | "expired" // the upload window has closed
  | "limit" // too many files on this request
  | "server"; // anything else — retry

export class MediaUploadError extends Error {
  constructor(
    public readonly kind: MediaErrorKind,
    message: string,
    /** Internal reason from the server (e.g. content_does_not_match_type) — for debugging, never shown. */
    public readonly code?: string,
  ) {
    super(message);
    this.name = "MediaUploadError";
  }
}

export interface SubmitOptions {
  /**
   * Identifies one submit attempt. Sending the same key again (double click,
   * retry after a timeout, refresh mid-submit) returns the original request
   * rather than creating a duplicate.
   */
  idempotencyKey: string;
  /** 0–1 overall progress, for media uploads. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/** Why a submit failed, so the UI can say something useful. */
export type SubmitErrorKind =
  | "validation" // the server rejected the data (fieldErrors says which)
  | "network" // offline or the connection dropped
  | "timeout" // no answer in time — the request may or may not exist
  | "unavailable" // the service is not configured or is down
  | "server"; // anything else

export class ServiceRequestSubmitError extends Error {
  constructor(
    public readonly kind: SubmitErrorKind,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ServiceRequestSubmitError";
  }
}

/**
 * The only thing the UI knows about the backend. Phase 1 ships a mock;
 * a production implementation replaces it without touching any component.
 */
export interface ServiceRequestClient {
  submit(draft: ServiceRequestDraft, options: SubmitOptions): Promise<ServiceRequestReceipt>;
  /**
   * Uploads one file to the request: register → upload straight to private
   * storage → verify. Safe to call again for the same media (same media.id):
   * the server returns the existing record and never duplicates the file.
   */
  uploadMedia(receipt: ServiceRequestReceipt, media: ServiceMedia, options?: UploadMediaOptions): Promise<UploadedMediaResult>;
  /** Removes a registered file (storage object and record). Safe to repeat. */
  removeMedia(receipt: ServiceRequestReceipt, mediaId: string): Promise<void>;
  /**
   * Tells the server the customer has finished adding evidence (so automated
   * triage can start). Best effort: callers ignore failures, and it never
   * affects the request or what the customer sees.
   */
  finalize(receipt: ServiceRequestReceipt): Promise<void>;
  /** The request's files as the server knows them (recovery after a refresh). */
  listMedia(receipt: ServiceRequestReceipt): Promise<{ mediaId: string; clientMediaId: string; status: "PENDING" | "UPLOADED" | "FAILED"; failureReason: string | null; fileName: string | null; kind: ServiceMediaKind; size: number }[]>;
}
