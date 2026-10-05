// The privacy boundary for AI processing: the ONLY place that decides what a
// model may see.
//
// Allowed: the problem description, product categories, the "other" product,
// the existing-customer flag, transcripts, and neutral labels for media.
// Never included: name, email, mobile, address/location, project reference,
// the service reference, upload tokens, storage paths or URLs.
//
// Fields are copied by name from an allow-list, so passing a full database
// row can't leak anything. Free text (description, transcripts) is also
// scrubbed of email addresses, phone-like numbers and the customer's own
// known details, in case they typed or said them.
import type { EvidenceType } from "./report-schema";

/** What the pipeline knows about the request (may include PII; only allow-listed fields are used). */
export interface RequestForAi {
  problemDescription: string;
  productCategories: string[];
  otherProduct: string | null;
  existingCustomer: boolean | null;
}

/** The customer's own details, used ONLY to scrub free text. Never forwarded. */
export interface KnownPersonalData {
  fullName?: string | null;
  email?: string | null;
  mobileE164?: string | null;
  mobileNational?: string | null;
  location?: string | null;
  projectReference?: string | null;
}

export interface MediaForAi {
  mediaId: string;
  type: EvidenceType;
  durationSeconds: number | null;
}

export interface TranscriptForAi {
  mediaId: string;
  kind: "VOICE_NOTE" | "VIDEO_AUDIO";
  text: string;
  language: string | null;
}

export interface ServiceAiInput {
  request: {
    description: string;
    productCategories: string[];
    otherProduct: string | null;
    existingCustomer: boolean | null;
  };
  evidence: { mediaId: string; label: string; type: EvidenceType; durationSeconds: number | null }[];
  transcripts: { mediaId: string; label: string; kind: "VOICE_NOTE" | "VIDEO_AUDIO"; text: string; language: string | null }[];
}

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// 7+ digits, allowing spaces, dashes, dots, brackets and a leading +.
const PHONE = /\+?\(?\d(?:[\s\-.()]*\d){6,}/g;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Removes contact details and the customer's known details from free text. */
export function scrubFreeText(text: string, known: KnownPersonalData = {}): string {
  let out = text.replace(EMAIL, "[email removed]").replace(PHONE, "[number removed]");
  const terms = [
    known.email, known.location, known.projectReference, known.fullName,
    // Individual name parts ("Aisha", "Khan"); very short parts are skipped.
    ...(known.fullName?.split(/\s+/) ?? []),
  ]
    .map((t) => t?.trim())
    .filter((t): t is string => !!t && t.length >= 3)
    .sort((a, b) => b.length - a.length);
  for (const term of terms) out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(term)}(?![\\p{L}\\p{N}])`, "giu"), "[personal detail removed]");
  return out;
}

const LABEL: Record<EvidenceType, string> = { PHOTO: "Photo", VIDEO: "Video", VOICE: "Voice note" };

/** Stable, neutral labels ("Photo 1", "Video 1", "Voice note 1") in the given order. */
export function labelEvidence(media: MediaForAi[]): Map<string, string> {
  const counts: Record<EvidenceType, number> = { PHOTO: 0, VIDEO: 0, VOICE: 0 };
  return new Map(media.map((m) => [m.mediaId, `${LABEL[m.type]} ${++counts[m.type]}`]));
}

export function buildServiceAiInput(
  request: RequestForAi,
  media: MediaForAi[],
  transcripts: TranscriptForAi[],
  known: KnownPersonalData = {},
): ServiceAiInput {
  const labels = labelEvidence(media);
  return {
    request: {
      description: scrubFreeText(request.problemDescription ?? "", known),
      productCategories: [...request.productCategories],
      otherProduct: request.otherProduct ? scrubFreeText(request.otherProduct, known) : null,
      existingCustomer: request.existingCustomer,
    },
    evidence: media.map((m) => ({ mediaId: m.mediaId, label: labels.get(m.mediaId)!, type: m.type, durationSeconds: m.durationSeconds })),
    transcripts: transcripts
      .filter((t) => labels.has(t.mediaId))
      .map((t) => ({ mediaId: t.mediaId, label: labels.get(t.mediaId)!, kind: t.kind, text: scrubFreeText(t.text, known), language: t.language })),
  };
}
