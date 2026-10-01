// Remembers an in-progress media upload for the request this tab just created,
// so a refresh mid-upload can show what's done and let the customer re-add the
// rest — without creating another request.
//
// sessionStorage: scoped to this tab and cleared when it closes. Holds the
// reference, the short-lived upload token (it only authorises adding files to
// this one request, for six hours) and file names/states. The files themselves
// can't be kept across a refresh.
import type { ServiceMediaKind, ServiceRequestReceipt } from "./types";

const KEY = "swiftrooms.service-call.uploads.v1";

/** Customer-facing upload states. */
export type UploadState = "LOCAL" | "WAITING" | "UPLOADING" | "UPLOADED" | "FAILED" | "REMOVED";

export interface StoredUploadItem {
  /** = ServiceMedia.id = clientMediaId on the server. */
  id: string;
  kind: ServiceMediaKind;
  fileName: string;
  sizeBytes: number;
  state: UploadState;
  /** Server id once registered (needed to remove it). */
  mediaId?: string;
}

export interface UploadSession {
  receipt: ServiceRequestReceipt;
  firstName: string;
  items: StoredUploadItem[];
}

export function loadUploadSession(): UploadSession | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as UploadSession;
    return s?.receipt?.reference && Array.isArray(s.items) ? s : null;
  } catch {
    return null;
  }
}

export function saveUploadSession(session: UploadSession) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — a refresh will land on the confirmation-less start; the request still exists.
  }
}

export function clearUploadSession() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
