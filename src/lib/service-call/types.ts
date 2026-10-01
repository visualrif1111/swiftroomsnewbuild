// Service & Aftercare — domain models.
//
// These types are the contract between the customer-facing UI and whatever
// backend eventually stores service requests. They deliberately contain no
// framework or vendor types (no Next.js, Vercel, Sanity or Supabase), so the
// same definitions can be lifted into another codebase unchanged.
// `ServiceRequestClient` below is the full contract a backend must implement.

/** Lifecycle of a service request once it leaves the customer's device. */
export type ServiceStatus =
  | "submitted" // received from the customer, not yet looked at
  | "triaged" // reviewed by the service team, next step decided
  | "scheduled" // visit booked
  | "in_progress" // engineer attending / parts on order
  | "resolved" // fixed, awaiting confirmation
  | "closed"; // complete

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
}

export interface SubmitOptions {
  /** 0–1 overall progress, for media uploads. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/**
 * The only thing the UI knows about the backend. Phase 1 ships a mock;
 * a production implementation replaces it without touching any component.
 */
export interface ServiceRequestClient {
  submit(draft: ServiceRequestDraft, options?: SubmitOptions): Promise<ServiceRequestReceipt>;
}
