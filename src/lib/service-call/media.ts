// Helpers for turning browser files and recordings into ServiceMedia items.
import { ACCEPTED_MEDIA_TYPES } from "./config";
import type { ServiceMedia, ServiceMediaKind, ServiceMediaSource } from "./types";

/** File extension → MIME type, for files the browser leaves untyped (some camera captures). */
const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif",
  mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm", "3gp": "video/3gpp",
  m4a: "audio/mp4", aac: "audio/aac", mp3: "audio/mpeg", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", wav: "audio/wav",
};

/** Browser aliases → the canonical type the API and bucket accept. */
const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg", "image/pjpeg": "image/jpeg", "video/x-m4v": "video/mp4", "audio/m4a": "audio/mp4",
  "audio/x-aac": "audio/aac", "audio/mp3": "audio/mpeg", "audio/vnd.wave": "audio/wav", "audio/wave": "audio/wav",
};

/**
 * The canonical MIME type for a file of this kind: codec parameters dropped
 * ("audio/webm;codecs=opus" → "audio/webm"), aliases folded, and the extension
 * used when the browser gives no type. Container types are shared between
 * kinds (a WebM voice note may report video/webm), so the kind decides.
 */
export function normaliseMimeType(file: Blob, kind: ServiceMediaKind, fileName?: string): string {
  let type = (file.type || "").split(";")[0].trim().toLowerCase();
  type = MIME_ALIASES[type] ?? type;
  if (!type) {
    const name = fileName ?? (file instanceof File ? file.name : "");
    type = EXTENSION_TYPES[name.split(".").pop()?.toLowerCase() ?? ""] ?? "";
  }
  if (kind === "voice-note" && (type === "video/webm" || type === "video/mp4" || type === "video/3gpp")) type = type.replace("video/", "audio/");
  return type;
}

export function isAcceptedType(type: string, kind: ServiceMediaKind): boolean {
  return (ACCEPTED_MEDIA_TYPES[kind] as readonly string[]).includes(type);
}

/** Storage extension for a canonical type. */
export function extensionFor(type: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
    "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/3gpp": "3gp",
    "audio/webm": "webm", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/mpeg": "mp3",
    "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav", "audio/3gpp": "3gp",
  };
  return map[type] ?? "bin";
}

// A UUID: also the file's idempotency key with the API (clientMediaId).
const newId = () => crypto.randomUUID();

export function createMedia(
  file: Blob,
  kind: ServiceMediaKind,
  source: ServiceMediaSource,
  fileName?: string,
  durationSeconds?: number,
): ServiceMedia {
  const name = fileName ?? (file instanceof File ? file.name : `${kind}-${new Date().toISOString().slice(0, 19)}`);
  return {
    id: newId(),
    kind,
    source,
    fileName: name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    durationSeconds,
    addedAt: new Date().toISOString(),
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

/** Releases the object URL behind a preview. Safe to call more than once. */
export function releaseMedia(media: ServiceMedia | null | undefined) {
  if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl);
}

/** Classifies a picked file as photo or video by type, falling back to the extension. */
export function mediaKindOf(file: File): "photo" | "video" | null {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "heic", "heif", "webp"].includes(ext)) return "photo";
  if (["mp4", "mov", "m4v", "webm", "3gp"].includes(ext)) return "video";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const MEDIA_KIND_LABEL: Record<ServiceMedia["kind"], string> = {
  photo: "Photo",
  video: "Video",
  "voice-note": "Voice note",
};
