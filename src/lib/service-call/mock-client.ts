// Phase 1 mock implementation of ServiceRequestClient.
//
// Nothing leaves the browser: no network calls, no uploads, no storage beyond a
// localStorage counter so references increase between test runs. Replace with a
// production implementation (see client.ts and the contract in types.ts).
import type { ServiceRequestClient, ServiceRequestDraft, ServiceRequestReceipt, SubmitOptions } from "./types";

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
  async submit(draft: ServiceRequestDraft, options: SubmitOptions = {}): Promise<ServiceRequestReceipt> {
    // QA hook: add ?mock=fail to the page URL to see the error state.
    if (new URLSearchParams(window.location.search).get("mock") === "fail") {
      await wait(800, options.signal);
      throw new Error("Mock submission failure");
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
      status: "submitted",
      submittedAt: submittedAt.toISOString(),
    };
  },
};
