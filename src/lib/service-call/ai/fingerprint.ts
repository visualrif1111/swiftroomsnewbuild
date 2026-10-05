// Deterministic fingerprints for AI processing inputs.
//
// The input fingerprint answers "has exactly this request + evidence already
// been processed?". It covers only what processing reads:
//   - the customer's problem description, product categories, "other"
//     product and existing-customer flag (from the submission snapshot);
//   - each UPLOADED media file's id, type, MIME type and verified size.
// It deliberately excludes timestamps, statuses, tokens, the reference and
// all contact details, and is independent of media order and of key order,
// so identical inputs always give the same hash.
//
// A media input hash identifies one file for one processing step, so a
// transcript or observation is reused while the file, model and prompt
// version are unchanged.
import { createHash } from "node:crypto";

export interface FingerprintRequest {
  problemDescription: string;
  productCategories: string[];
  otherProduct: string | null;
  existingCustomer: boolean | null;
}

export interface FingerprintMedia {
  id: string;
  type: "PHOTO" | "VIDEO" | "VOICE";
  mimeType: string;
  fileSize: number;
}

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

/** JSON with object keys sorted at every level, so key order never matters. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function computeInputFingerprint(request: FingerprintRequest, media: FingerprintMedia[]): string {
  return sha256(
    canonicalJson({
      v: 1,
      request: {
        problemDescription: request.problemDescription.normalize("NFC").trim(),
        productCategories: [...new Set(request.productCategories)].sort(),
        otherProduct: request.otherProduct?.normalize("NFC").trim() || null,
        existingCustomer: request.existingCustomer,
      },
      media: media
        .map((m) => ({ id: m.id.toLowerCase(), type: m.type, mimeType: m.mimeType, fileSize: m.fileSize }))
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
    }),
  );
}

/**
 * `variant` distinguishes several analyses of one file for the same step
 * (Phase 4E: one entry per video frame); omitted, the hash is unchanged.
 */
export function mediaInputHash(step: { mediaId: string; fileSize: number; kind: string; provider: string; model: string; promptVersion: string; variant?: string }): string {
  return sha256(canonicalJson({ v: 1, ...step, mediaId: step.mediaId.toLowerCase() }));
}
