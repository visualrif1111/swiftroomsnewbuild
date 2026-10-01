// Server-side validation of POST /api/service-requests bodies.
//
// The browser runs the same rules (validation.ts) step by step; this is the
// authoritative check, because the endpoint is public and anything can be
// posted to it. Shape checks come first (types, lengths, known values), then
// the shared business rules.
import "server-only";
import { COUNTRY_CODES, DESCRIPTION_MAX_LENGTH, MEDIA_LIMITS, SERVICE_PRODUCTS } from "../config";
import type { ServiceProductId, ServiceRequestDraft } from "../types";
import { validateDetails, validateProblem, validateProducts } from "../validation";

const MAX = { name: 120, email: 254, location: 300, reference: 100, otherProduct: 120 } as const;
const PRODUCT_IDS = new Set<string>(SERVICE_PRODUCTS.map((p) => p.id));
const COUNTRY_CODE_SET = new Set<string>(COUNTRY_CODES.map((c) => c.code));

/** What the database function receives (see create_service_request). */
export interface ValidServiceRequest {
  customerName: string;
  email: string;
  mobileCountryCode: string;
  mobileNational: string;
  mobileE164: string;
  location: string;
  existingCustomer: boolean | null;
  projectReference: string;
  productCategories: ServiceProductId[];
  otherProduct: string;
  problemDescription: string;
  declaredMedia: { photos: number; videos: number; voiceNote: boolean };
  channel: string;
}

export type ValidationResult =
  | { ok: true; value: ValidServiceRequest }
  | { ok: false; fields: Record<string, string> };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : null);
const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MEDIA_LIMITS.maxItems ? (v as number) : null);

export function validateCreatePayload(body: unknown): ValidationResult {
  const fields: Record<string, string> = {};
  if (!isObject(body) || !isObject(body.customer)) return { ok: false, fields: { body: "Expected a service request object." } };
  const c = body.customer;

  const fullName = str(c.fullName);
  const countryCode = str(c.countryCode);
  const mobile = str(c.mobile);
  const email = str(c.email);
  const location = str(c.location);
  const reference = c.reference === undefined ? "" : str(c.reference);
  const existing = c.isExistingCustomer;
  const otherProduct = body.otherProduct === undefined ? "" : str(body.otherProduct);
  const description = body.description === undefined ? "" : str(body.description);
  const productIds = body.productIds;
  const media = isObject(body.declaredMedia) ? body.declaredMedia : { photos: 0, videos: 0, voiceNote: false };

  // Shape and length.
  if (fullName === null) fields["customer.fullName"] = "Enter your full name.";
  else if (fullName.length > MAX.name) fields["customer.fullName"] = `Keep your name under ${MAX.name} characters.`;
  if (countryCode === null || !COUNTRY_CODE_SET.has(countryCode)) fields["customer.countryCode"] = "Choose a dialling code from the list.";
  if (mobile === null) fields["customer.mobile"] = "Enter your mobile number so we can reach you.";
  if (email === null) fields["customer.email"] = "Enter your email address.";
  else if (email.length > MAX.email) fields["customer.email"] = "That email address is too long.";
  if (location === null) fields["customer.location"] = "Tell us where the property is.";
  else if (location.length > MAX.location) fields["customer.location"] = `Keep the location under ${MAX.location} characters.`;
  if (reference === null || reference.length > MAX.reference) fields["customer.reference"] = `Keep the reference under ${MAX.reference} characters.`;
  if (!(existing === null || typeof existing === "boolean")) fields["customer.isExistingCustomer"] = "Answer yes, no, or leave it blank.";
  if (!Array.isArray(productIds) || !productIds.every((id) => typeof id === "string" && PRODUCT_IDS.has(id))) {
    fields.productIds = "Choose from the listed options.";
  }
  if (otherProduct === null || otherProduct.length > MAX.otherProduct) fields.otherProduct = `Keep this under ${MAX.otherProduct} characters.`;
  if (description === null) fields.description = "The description must be text.";
  const photos = count(media.photos);
  const videos = count(media.videos);
  if (photos === null || videos === null || typeof media.voiceNote !== "boolean") fields.declaredMedia = "Invalid media summary.";
  if (Object.keys(fields).length) return { ok: false, fields };

  // Business rules, shared with the browser.
  const ids = [...new Set(productIds as ServiceProductId[])];
  const draft: ServiceRequestDraft = {
    customer: {
      fullName: fullName!,
      countryCode: countryCode!,
      mobile: mobile!,
      email: email!,
      location: location!,
      isExistingCustomer: existing as boolean | null,
      reference: reference!,
    },
    productIds: ids,
    otherProduct: otherProduct!,
    description: description!,
    voiceNote: null,
    media: [],
  };
  for (const [k, v] of Object.entries(validateDetails(draft.customer))) fields[`customer.${k}`] = v!;
  for (const [k, v] of Object.entries(validateProducts(draft))) fields[k === "products" ? "productIds" : k] = v!;
  for (const [k, v] of Object.entries(validateProblem(draft))) fields[k] = v!;
  if (description!.length > DESCRIPTION_MAX_LENGTH) fields.description = `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters.`;
  // The problem must be described in words or shown with media.
  if (!description && photos === 0 && videos === 0 && !media.voiceNote) {
    fields.description = "Describe the problem, or add a photo, video or voice note.";
  }
  if (Object.keys(fields).length) return { ok: false, fields };

  const national = mobile!.replace(/\D/g, "");
  return {
    ok: true,
    value: {
      customerName: fullName!,
      email: email!.toLowerCase(),
      mobileCountryCode: countryCode!,
      mobileNational: national,
      mobileE164: `${countryCode}${national}`,
      location: location!,
      existingCustomer: existing as boolean | null,
      projectReference: reference!,
      productCategories: ids,
      otherProduct: ids.includes("other") ? otherProduct! : "",
      problemDescription: description!,
      declaredMedia: { photos: photos!, videos: videos!, voiceNote: media.voiceNote as boolean },
      channel: "website/service-call",
    },
  };
}
