// Service & Aftercare — static configuration: steps, product options, limits.
// Kept separate from components so copy and limits can change in one place.
import type { ServiceProduct, ServiceRequestDraft } from "./types";

export const SERVICE_CALL_STEPS = [
  { id: "details", number: "01", label: "Details", title: "Your details" },
  { id: "product", number: "02", label: "Product", title: "What needs attention?" },
  { id: "problem", number: "03", label: "Problem", title: "What's the problem?" },
  { id: "evidence", number: "04", label: "Evidence", title: "Show us the issue" },
  { id: "review", number: "05", label: "Review", title: "Review your request" },
] as const;

export type ServiceCallStepId = (typeof SERVICE_CALL_STEPS)[number]["id"];

export const SERVICE_PRODUCTS: ServiceProduct[] = [
  { id: "window", label: "Window", hint: "Casement, tilt & turn, fixed" },
  { id: "sliding-door", label: "Sliding Door", hint: "Including lift & slide" },
  { id: "bi-fold-door", label: "Bi-Fold Door", hint: "Folding door sets" },
  { id: "entrance-door", label: "Entrance Door", hint: "Front and pivot doors" },
  { id: "glass", label: "Glass", hint: "Cracked, misted or scratched" },
  { id: "hardware", label: "Hardware", hint: "Handles, locks, hinges, rollers" },
  { id: "motorised-system", label: "Motorised System", hint: "Motors, controls, sensors" },
  { id: "curtain-wall", label: "Curtain Wall / Façade", hint: "Facade and structural glazing" },
  { id: "other", label: "Other", hint: "Something else" },
];

/** Dialling codes offered on the mobile field, UAE first. */
export const COUNTRY_CODES = [
  { code: "+971", country: "UAE", minLength: 9, maxLength: 9 },
  { code: "+966", country: "Saudi Arabia", minLength: 9, maxLength: 9 },
  { code: "+974", country: "Qatar", minLength: 8, maxLength: 8 },
  { code: "+965", country: "Kuwait", minLength: 8, maxLength: 8 },
  { code: "+973", country: "Bahrain", minLength: 8, maxLength: 8 },
  { code: "+968", country: "Oman", minLength: 8, maxLength: 8 },
  { code: "+91", country: "India", minLength: 10, maxLength: 10 },
  { code: "+92", country: "Pakistan", minLength: 10, maxLength: 10 },
  { code: "+20", country: "Egypt", minLength: 10, maxLength: 10 },
  { code: "+44", country: "UK", minLength: 10, maxLength: 10 },
  { code: "+1", country: "USA/Canada", minLength: 10, maxLength: 10 },
] as const;

/**
 * Media limits, shared by the browser and the API (server/media.ts), and
 * mirrored by the storage bucket (supabase/migrations/0002_service_media.sql).
 * Videos are capped at 50 MB: the Supabase Free plan's per-file ceiling. A
 * paid plan allows larger files — raise maxVideoBytes and the bucket limit
 * together.
 */
export const MEDIA_LIMITS = {
  maxItems: 10, // photos + videos per request
  maxVoiceNotes: 1,
  maxPhotoBytes: 25 * 1024 * 1024,
  maxVideoBytes: 50 * 1024 * 1024,
  maxVoiceNoteBytes: 25 * 1024 * 1024,
  maxVoiceNoteSeconds: 180,
  photoAccept: "image/*",
  videoAccept: "video/*",
  audioAccept: "audio/*",
} as const;

/**
 * MIME types accepted per kind — what phone cameras, galleries and browser
 * recorders actually produce (iPhone: HEIC/JPEG photos, MOV/MP4 video, MP4/AAC
 * voice; Android: JPEG, MP4/3GP video; Chrome/Firefox recorders: WebM/Ogg).
 * Pickers still use image/* etc. so phones show their normal gallery; the
 * file is checked after it's chosen, and its bytes are checked on the server.
 */
export const ACCEPTED_MEDIA_TYPES = {
  photo: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/3gpp"],
  "voice-note": ["audio/webm", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/3gpp"],
} as const;

/** Readable list of formats per kind, for error messages. */
export const ACCEPTED_FORMATS_LABEL = {
  photo: "JPEG, PNG, HEIC or WebP",
  video: "MP4, MOV, WebM or 3GP",
  "voice-note": "M4A, MP3, AAC, WebM, Ogg or WAV",
} as const;

export const DESCRIPTION_MAX_LENGTH = 2000;

export const EMPTY_DRAFT: ServiceRequestDraft = {
  customer: {
    fullName: "",
    countryCode: "+971",
    mobile: "",
    email: "",
    location: "",
    isExistingCustomer: null,
    reference: "",
  },
  productIds: [],
  otherProduct: "",
  description: "",
  voiceNote: null,
  media: [],
};
