// Helpers for turning browser files and recordings into ServiceMedia items.
import type { ServiceMedia, ServiceMediaKind, ServiceMediaSource } from "./types";

let counter = 0;
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `media-${Date.now()}-${++counter}`;

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

/** Classifies an uploaded file by MIME type, falling back to the extension. */
export function mediaKindOf(file: File): "photo" | "video" | null {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "heic", "heif", "webp", "gif"].includes(ext)) return "photo";
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
