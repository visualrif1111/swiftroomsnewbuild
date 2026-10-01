// Keeps typed answers across an accidental refresh (sessionStorage — cleared
// when the tab closes). Photos, videos and voice notes are NOT kept: they are
// large binaries and can't be stored safely, so the customer re-adds them.
import { EMPTY_DRAFT } from "./config";
import type { ServiceRequestDraft } from "./types";

const KEY = "swiftrooms.service-call.draft.v1";

export interface StoredDraft {
  draft: ServiceRequestDraft;
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
    return {
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

export function saveDraft(draft: ServiceRequestDraft, step: number) {
  try {
    const stored: StoredDraft = {
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
