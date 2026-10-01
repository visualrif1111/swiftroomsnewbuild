// Keeps typed answers across an accidental refresh (sessionStorage — cleared
// when the tab closes). Photos, videos and voice notes are NOT kept: they are
// large binaries and can't be stored safely, so the customer re-adds them.
import { EMPTY_DRAFT } from "./config";
import type { ServiceRequestDraft } from "./types";

const KEY = "swiftrooms.service-call.draft.v1";

/**
 * The submit attempt in progress: its idempotency key and a fingerprint of the
 * data it was issued for. Kept so a refresh mid-submit retries with the same
 * key (no duplicate); a different fingerprint means the customer edited the
 * request and it gets a new key.
 */
export interface PendingSubmission {
  key: string;
  fingerprint: string;
}

export interface StoredDraft {
  draft: ServiceRequestDraft;
  submission: PendingSubmission | null;
  /** Index of the step the customer was on. */
  step: number;
  /** True when media was attached before the refresh, so we can say it was lost. */
  hadMedia: boolean;
}

export function loadDraft(): StoredDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    const sub = parsed.submission;
    return {
      submission: sub && typeof sub.key === "string" && typeof sub.fingerprint === "string" ? sub : null,
      step: typeof parsed.step === "number" ? parsed.step : 0,
      hadMedia: !!parsed.hadMedia,
      draft: {
        ...EMPTY_DRAFT,
        ...parsed.draft,
        customer: { ...EMPTY_DRAFT.customer, ...parsed.draft?.customer },
        voiceNote: null,
        media: [],
      },
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: ServiceRequestDraft, step: number, submission: PendingSubmission | null = null) {
  try {
    const stored: StoredDraft = {
      submission,
      step,
      hadMedia: draft.media.length > 0 || draft.voiceNote !== null,
      draft: { ...draft, voiceNote: null, media: [] },
    };
    window.sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode, quota) — refresh will simply start over.
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
