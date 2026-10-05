// Customer-facing wording for media the server rejected.
//
// The API reports machine-readable reasons (stored in service_media.failure_reason
// and returned by POST …/media/:id/complete). Those codes are for logs and staff
// tools; customers only ever see the plain-language text below. Anything we
// don't recognise gets the generic message, never the raw code.
//
// No imports: kept pure so it can be unit-tested with `node --test`.

/** Verification failures recorded by the server (media-store.ts → complete()). */
export const MEDIA_FAILURE_MESSAGES: Readonly<Record<string, string>> = {
  content_does_not_match_type: "This file does not appear to match its file type. Please choose another file.",
  file_too_large: "This file is too large to upload. Please choose a smaller file or a shorter video.",
  empty_file: "This file is empty. Please choose another file.",
};

export const GENERIC_MEDIA_REJECTION = "This file can't be accepted. Please choose another file.";

/**
 * Upload-authorisation validation fields whose messages are written for
 * customers (validate-media.ts). Other fields (clientMediaId, kind, source…)
 * describe programming errors and fall back to the generic text.
 */
const CUSTOMER_FACING_FIELDS = ["mimeType", "size"];

/** Plain-language message for a failure code; the generic text for unknown codes. */
export function mediaFailureMessage(code: string | null | undefined): string {
  return (code && Object.hasOwn(MEDIA_FAILURE_MESSAGES, code) && MEDIA_FAILURE_MESSAGES[code]) || GENERIC_MEDIA_REJECTION;
}

/**
 * Reads a 422 response body from the media API. Returns the customer message
 * plus the internal code (kept for logging/debugging, never displayed).
 */
export function describeMediaRejection(body: { error?: string; fields?: Record<string, string> } | null): {
  message: string;
  code: string;
} {
  const fields = body?.fields ?? {};
  if (body?.error === "media_rejected") {
    const code = fields.file ?? "rejected";
    return { message: mediaFailureMessage(code), code };
  }
  if (body?.error === "validation_failed") {
    const field = CUSTOMER_FACING_FIELDS.find((f) => typeof fields[f] === "string" && fields[f]);
    return { message: field ? fields[field] : GENERIC_MEDIA_REJECTION, code: `validation_failed:${Object.keys(fields).join(",")}` };
  }
  return { message: GENERIC_MEDIA_REJECTION, code: body?.error ?? "unknown" };
}
