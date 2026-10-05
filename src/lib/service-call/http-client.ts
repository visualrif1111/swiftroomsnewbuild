// Production ServiceRequestClient: talks to the service-requests API.
//
// submit() POSTs the answers (no media) with an Idempotency-Key, so retries
// never create the request twice. Media is uploaded afterwards, one file at a
// time, straight from the browser to private storage using a signed URL the
// API issues (see docs/service-aftercare/MEDIA.md) — files never pass through
// our API.
import {
  IDEMPOTENCY_HEADER,
  SERVICE_REQUESTS_ENDPOINT,
  finalizeEndpoint,
  mediaEndpoint,
  toCreatePayload,
  type AuthoriseMediaPayload,
  type AuthoriseMediaResponse,
  type CreateServiceRequestResponse,
  type MediaSummary,
  type ServiceRequestErrorResponse,
} from "./api-contract";
import { normaliseMimeType } from "./media";
import { describeMediaRejection } from "./media-errors";
import {
  MediaUploadError,
  ServiceRequestSubmitError,
  type ServiceRequestClient,
  type ServiceRequestReceipt,
} from "./types";

/** Give up waiting after this long; a retry with the same key is always safe. */
const TIMEOUT_MS = 30_000;
/** Media API calls (not the upload itself, which can take minutes on mobile). */
const MEDIA_CALL_TIMEOUT_MS = 20_000;

function authHeaders(receipt: ServiceRequestReceipt) {
  if (!receipt.upload) throw new MediaUploadError("expired", "This request can't take more files.");
  return { Authorization: `Bearer ${receipt.upload.token}` };
}

async function mediaCall(url: string, init: RequestInit, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(MEDIA_CALL_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new MediaUploadError("network", "The connection dropped.");
  }
}

async function mediaError(res: Response): Promise<MediaUploadError> {
  const body = (await res.json().catch(() => null)) as ServiceRequestErrorResponse | null;
  if (res.status === 401) {
    return new MediaUploadError(
      "expired",
      body?.error === "upload_authorisation_expired" ? "The time for adding files has passed." : "Not authorised.",
    );
  }
  if (res.status === 409 && body?.error === "media_limit_reached") {
    return new MediaUploadError("limit", "This request already has the maximum number of files.");
  }
  if (res.status === 422) {
    const { message, code } = describeMediaRejection(body);
    return new MediaUploadError("rejected", message, code);
  }
  return new MediaUploadError("server", body?.message ?? `HTTP ${res.status}`);
}

/** PUT with upload progress (fetch can't report upload progress). Resolves with the HTTP status. */
function putWithProgress(
  upload: NonNullable<AuthoriseMediaResponse["upload"]>,
  body: Blob,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(upload.method, upload.url);
    for (const [k, v] of Object.entries(upload.headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => resolve(xhr.status);
    xhr.onerror = () => reject(new MediaUploadError("network", "The upload was interrupted."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(body);
  });
}

export const httpServiceRequestClient: ServiceRequestClient = {
  async submit(draft, { idempotencyKey, onProgress, signal }) {
    onProgress?.(0.15);
    const timeout = AbortSignal.timeout(TIMEOUT_MS);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let res: Response;
    try {
      res = await fetch(SERVICE_REQUESTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", [IDEMPOTENCY_HEADER]: idempotencyKey },
        body: JSON.stringify(toCreatePayload(draft)),
        signal: combined,
      });
    } catch (err) {
      if (signal?.aborted) throw err;
      if (timeout.aborted) throw new ServiceRequestSubmitError("timeout", "The request timed out.");
      throw new ServiceRequestSubmitError("network", "The request could not be sent.");
    }

    if (res.ok) {
      const body = (await res.json()) as CreateServiceRequestResponse;
      onProgress?.(1);
      return { id: body.id, reference: body.reference, status: body.status, submittedAt: body.submittedAt, upload: body.upload };
    }

    const error = (await res.json().catch(() => null)) as ServiceRequestErrorResponse | null;
    if (res.status === 422 && error?.fields) {
      throw new ServiceRequestSubmitError("validation", error.message, error.fields);
    }
    if (res.status === 503) throw new ServiceRequestSubmitError("unavailable", error?.message ?? "Unavailable.");
    throw new ServiceRequestSubmitError("server", error?.message ?? `HTTP ${res.status}`);
  },

  async uploadMedia(receipt, media, { onRegistered, onProgress, signal } = {}) {
    if (!media.file) throw new MediaUploadError("rejected", "The file is no longer available — add it again.");
    const base = mediaEndpoint(receipt.reference);
    const headers = { ...authHeaders(receipt), "Content-Type": "application/json" };

    // 1. Register the file and get a signed upload URL. Same media.id → same record.
    const payload: AuthoriseMediaPayload = {
      clientMediaId: media.id,
      kind: media.kind,
      mimeType: normaliseMimeType(media.file, media.kind, media.fileName),
      size: media.file.size,
      fileName: media.fileName,
      source: media.source,
      durationSeconds: media.durationSeconds ?? null,
    };
    let res = await mediaCall(base, { method: "POST", headers, body: JSON.stringify(payload) }, signal);
    if (!res.ok) throw await mediaError(res);
    const authorised = (await res.json()) as AuthoriseMediaResponse;
    const mediaId = authorised.media.id;
    onRegistered?.(mediaId);
    if (!authorised.upload) {
      onProgress?.(1);
      return { mediaId, status: "UPLOADED" }; // already uploaded on an earlier attempt
    }

    // 2. Upload straight to private storage. 409 means the object already
    //    exists from an earlier attempt (uploads never overwrite) — verify it.
    onProgress?.(0);
    const putStatus = await putWithProgress(authorised.upload, media.file, onProgress, signal);
    const refusedByStorage = putStatus >= 400 && putStatus !== 409;
    if (putStatus >= 300 && putStatus !== 409 && putStatus !== 400 && putStatus !== 413 && putStatus !== 415) {
      throw new MediaUploadError("network", `The upload failed (${putStatus}).`);
    }

    // 3. Ask the server to verify what arrived.
    res = await mediaCall(`${base}/${mediaId}/complete`, { method: "POST", headers }, signal);
    if (res.status === 409) {
      throw refusedByStorage
        ? new MediaUploadError("rejected", "This file type or size isn't accepted.")
        : new MediaUploadError("network", "The file didn't arrive — try again.");
    }
    if (!res.ok) throw await mediaError(res);
    onProgress?.(1);
    return { mediaId, status: "UPLOADED" };
  },

  async removeMedia(receipt, mediaId) {
    const res = await mediaCall(`${mediaEndpoint(receipt.reference)}/${encodeURIComponent(mediaId)}`, {
      method: "DELETE",
      headers: authHeaders(receipt),
    });
    if (!res.ok) throw await mediaError(res);
  },

  async finalize(receipt) {
    if (!receipt.upload) return;
    // keepalive: delivered even if the customer closes the tab straight after Finish.
    await mediaCall(finalizeEndpoint(receipt.reference), { method: "POST", headers: authHeaders(receipt), keepalive: true });
  },

  async listMedia(receipt) {
    const res = await mediaCall(mediaEndpoint(receipt.reference), { headers: authHeaders(receipt) });
    if (!res.ok) throw await mediaError(res);
    const { media } = (await res.json()) as { media: MediaSummary[] };
    return media.map((m) => ({
      mediaId: m.id,
      clientMediaId: m.clientMediaId,
      status: m.uploadStatus,
      failureReason: m.failureReason,
      fileName: m.fileName,
      kind: m.kind,
      size: m.size,
    }));
  },
};
