// Validates POST /api/service-requests/:reference/media bodies (one file).
import "server-only";
import type { ServiceMediaKind, ServiceMediaSource } from "../types";
import { extensionFor, isAcceptedType, normaliseMimeType } from "../media";
import { ACCEPTED_FORMATS_LABEL } from "../config";
import { maxBytesFor } from "../validation";
import { KIND_TO_TYPE, type ReserveInput } from "./media-store";
import { UUID_PATTERN } from "./http";

const KINDS: ServiceMediaKind[] = ["photo", "video", "voice-note"];
const SOURCES: ServiceMediaSource[] = ["camera", "upload", "recording"];

export type MediaValidation =
  | { ok: true; value: Omit<ReserveInput, "requestId"> }
  | { ok: false; fields: Record<string, string> };

export function validateAuthoriseMedia(body: unknown): MediaValidation {
  const fields: Record<string, string> = {};
  if (typeof body !== "object" || body === null) return { ok: false, fields: { body: "Expected a media object." } };
  const b = body as Record<string, unknown>;

  const clientMediaId = typeof b.clientMediaId === "string" && UUID_PATTERN.test(b.clientMediaId) ? b.clientMediaId.toLowerCase() : null;
  if (!clientMediaId) fields.clientMediaId = "Expected a UUID.";
  const kind = KINDS.includes(b.kind as ServiceMediaKind) ? (b.kind as ServiceMediaKind) : null;
  if (!kind) fields.kind = "Expected photo, video or voice-note.";
  const source = SOURCES.includes(b.source as ServiceMediaSource) ? (b.source as ServiceMediaSource) : null;
  if (!source) fields.source = "Expected camera, upload or recording.";
  // Metadata only — never used in the storage path. Strip control characters.
  const fileName = typeof b.fileName === "string" ? b.fileName.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 255) : "";
  const size = Number.isInteger(b.size) ? (b.size as number) : NaN;
  const duration = b.durationSeconds === undefined || b.durationSeconds === null ? null : Number(b.durationSeconds);
  if (duration !== null && !(Number.isFinite(duration) && duration >= 0 && duration <= 3600)) fields.durationSeconds = "Invalid duration.";

  let mimeType = "";
  if (kind) {
    mimeType = typeof b.mimeType === "string" ? normaliseMimeType(new Blob([], { type: b.mimeType }), kind, fileName) : "";
    if (!isAcceptedType(mimeType, kind)) fields.mimeType = `Unsupported file type. Use ${ACCEPTED_FORMATS_LABEL[kind]}.`;
    if (!(size > 0)) fields.size = "The file is empty.";
    else if (size > maxBytesFor(kind)) fields.size = `The file is over ${Math.round(maxBytesFor(kind) / 1024 / 1024)} MB.`;
  }
  if (Object.keys(fields).length || !kind || !clientMediaId || !source) return { ok: false, fields };

  return {
    ok: true,
    value: {
      clientMediaId,
      mediaType: KIND_TO_TYPE[kind],
      mimeType,
      extension: extensionFor(mimeType),
      declaredSize: size,
      originalFilename: fileName,
      source,
      durationSeconds: duration,
    },
  };
}
