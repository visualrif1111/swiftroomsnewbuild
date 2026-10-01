// Mock ServiceRequestClient for UI work without a backend
// (NEXT_PUBLIC_SERVICE_CALL_CLIENT=mock — see client.ts).
//
// Nothing leaves the browser: no network calls, no uploads, no storage beyond a
// localStorage counter so references increase between test runs. References it
// returns are NOT real — the database allocates the authoritative ones.
import {
  MediaUploadError,
  ServiceRequestSubmitError,
  type ServiceRequestClient,
  type ServiceRequestDraft,
  type ServiceRequestReceipt,
  type SubmitOptions,
} from "./types";

const COUNTER_KEY = "swiftrooms.service-call.mock-sequence";

function nextSequence(): number {
  try {
    const next = Number(window.localStorage.getItem(COUNTER_KEY) ?? "0") + 1;
    window.localStorage.setItem(COUNTER_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

/** SR-<year>-<5-digit sequence>, e.g. SR-2026-00001. */
export function formatReference(year: number, sequence: number): string {
  return `SR-${year}-${String(sequence).padStart(5, "0")}`;
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export const mockServiceRequestClient: ServiceRequestClient = {
  async submit(draft: ServiceRequestDraft, options: SubmitOptions): Promise<ServiceRequestReceipt> {
    // QA hook: add ?mock=fail to the page URL to see the error state.
    if (new URLSearchParams(window.location.search).get("mock") === "fail") {
      await wait(800, options.signal);
      throw new ServiceRequestSubmitError("server", "Mock submission failure");
    }

    // Simulate upload progress, a little slower when there is more media.
    const items = draft.media.length + (draft.voiceNote ? 1 : 0);
    const ticks = Math.max(4, items * 2);
    for (let i = 1; i <= ticks; i++) {
      await wait(180, options.signal);
      options.onProgress?.(i / ticks);
    }

    const submittedAt = new Date();
    return {
      id: `mock_${submittedAt.getTime()}`,
      reference: formatReference(submittedAt.getFullYear(), nextSequence()),
      status: "SUBMITTED",
      submittedAt: submittedAt.toISOString(),
      upload: { token: "mock", expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString() },
    };
  },

  // Simulated uploads: progress over ~1 s per file, nothing stored.
  // QA hook: ?mock=upload-fail fails every upload.
  async uploadMedia(_receipt, media, { onRegistered, onProgress, signal } = {}) {
    onRegistered?.(`mock_${media.id}`);
    for (let i = 1; i <= 5; i++) {
      await wait(200, signal);
      onProgress?.(i / 5);
    }
    if (new URLSearchParams(window.location.search).get("mock") === "upload-fail") {
      throw new MediaUploadError("network", "Mock upload failure");
    }
    return { mediaId: `mock_${media.id}`, status: "UPLOADED" };
  },

  async removeMedia() {},

  async listMedia() {
    return [];
  },
};
