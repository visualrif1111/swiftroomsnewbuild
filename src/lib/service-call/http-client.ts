// Production ServiceRequestClient: POSTs the draft to the service-requests API.
//
// Media is not uploaded in Phase 2 — only a count of what was attached is sent
// (see api-contract.ts). The same Idempotency-Key is sent on every retry of one
// submission, so the server never creates the request twice.
import {
  IDEMPOTENCY_HEADER,
  SERVICE_REQUESTS_ENDPOINT,
  toCreatePayload,
  type CreateServiceRequestResponse,
  type ServiceRequestErrorResponse,
} from "./api-contract";
import { ServiceRequestSubmitError, type ServiceRequestClient } from "./types";

/** Give up waiting after this long; a retry with the same key is always safe. */
const TIMEOUT_MS = 30_000;

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
      return { id: body.id, reference: body.reference, status: body.status, submittedAt: body.submittedAt };
    }

    const error = (await res.json().catch(() => null)) as ServiceRequestErrorResponse | null;
    if (res.status === 422 && error?.fields) {
      throw new ServiceRequestSubmitError("validation", error.message, error.fields);
    }
    if (res.status === 503) throw new ServiceRequestSubmitError("unavailable", error?.message ?? "Unavailable.");
    throw new ServiceRequestSubmitError("server", error?.message ?? `HTTP ${res.status}`);
  },
};
