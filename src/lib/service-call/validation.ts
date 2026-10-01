// Service & Aftercare — validation. Pure functions, no React, so the same rules
// can run in the browser now and on the server later.
import { COUNTRY_CODES, DESCRIPTION_MAX_LENGTH, MEDIA_LIMITS } from "./config";
import type { Customer, ServiceMediaKind, ServiceRequestDraft } from "./types";

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export type DetailsField = "fullName" | "mobile" | "email" | "location";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMobile(countryCode: string, mobile: string): string | undefined {
  const digits = mobile.replace(/\D/g, "");
  if (!digits) return "Enter your mobile number so we can reach you.";
  const country = COUNTRY_CODES.find((c) => c.code === countryCode);
  if (country && (digits.length < country.minLength || digits.length > country.maxLength)) {
    return `Enter a valid ${country.country} mobile number (${country.minLength} digits, without the leading 0).`;
  }
  return undefined;
}

export function validateDetails(customer: Customer): FieldErrors<DetailsField> {
  const errors: FieldErrors<DetailsField> = {};
  if (!customer.fullName.trim()) errors.fullName = "Enter your full name.";
  const mobile = validateMobile(customer.countryCode, customer.mobile);
  if (mobile) errors.mobile = mobile;
  if (!customer.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(customer.email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  if (!customer.location.trim()) errors.location = "Tell us where the property is, e.g. community and emirate.";
  return errors;
}

export function validateProducts(draft: ServiceRequestDraft): FieldErrors<"products"> {
  return draft.productIds.length ? {} : { products: "Choose at least one option." };
}

export function validateProblem(draft: ServiceRequestDraft): FieldErrors<"description"> {
  if (draft.description.length > DESCRIPTION_MAX_LENGTH) {
    return { description: `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters.` };
  }
  return {};
}

/** True when the customer has told or shown us something about the problem. */
export function hasProblemInformation(draft: ServiceRequestDraft): boolean {
  return draft.description.trim().length > 0 || draft.voiceNote !== null || draft.media.length > 0;
}

/** Required: a written description OR some media (photo, video or voice note). */
export function validateEvidence(draft: ServiceRequestDraft): FieldErrors<"evidence"> {
  return hasProblemInformation(draft)
    ? {}
    : { evidence: "Add a photo or video, or go back and describe the problem in writing or with a voice note." };
}

/** Checks a file before it is added. Returns an error message, or undefined if it's fine. */
export function validateMediaFile(file: Blob, kind: ServiceMediaKind): string | undefined {
  const expected = kind === "photo" ? "image/" : kind === "video" ? "video/" : "audio/";
  // Some browsers leave `type` empty for camera captures — allow those through.
  if (file.type && !file.type.startsWith(expected)) {
    return kind === "voice-note" ? "That file isn't an audio recording." : `That file isn't a ${kind}.`;
  }
  const max =
    kind === "photo" ? MEDIA_LIMITS.maxPhotoBytes : kind === "video" ? MEDIA_LIMITS.maxVideoBytes : MEDIA_LIMITS.maxVoiceNoteBytes;
  if (file.size > max) return `That ${kind === "voice-note" ? "recording" : kind} is over ${Math.round(max / 1024 / 1024)} MB.`;
  return undefined;
}
