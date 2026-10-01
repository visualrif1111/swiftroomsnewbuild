// Service media: database rows (service_media) + objects in the private
// `service-evidence` bucket. Server-only — uses the service role.
//
// Lifecycle (docs/service-aftercare/MEDIA.md):
//   reserve()   → row PENDING + signed upload URL (browser PUTs the file to Storage)
//   complete()  → object checked (exists, size, content sniffed) → UPLOADED, or deleted → FAILED
//   remove()    → object and row deleted
//   cleanupStale() → PENDING/FAILED rows older than the cutoff, with any objects, deleted
import "server-only";
import { MEDIA_LIMITS } from "../config";
import type { ServiceMediaKind } from "../types";
import { maxBytesFor } from "../validation";
import { EVIDENCE_BUCKET, SupabaseError, supabaseConfig, supabaseFetch, supabaseJson } from "./supabase";

export type MediaType = "PHOTO" | "VIDEO" | "VOICE";
export type UploadStatus = "PENDING" | "UPLOADED" | "FAILED";

export const KIND_TO_TYPE: Record<ServiceMediaKind, MediaType> = { photo: "PHOTO", video: "VIDEO", "voice-note": "VOICE" };
export const TYPE_TO_KIND: Record<MediaType, ServiceMediaKind> = { PHOTO: "photo", VIDEO: "video", VOICE: "voice-note" };

export interface MediaRecord {
  id: string;
  serviceRequestId: string;
  clientMediaId: string;
  mediaType: MediaType;
  mimeType: string;
  originalFilename: string | null;
  declaredSize: number;
  fileSize: number | null;
  storagePath: string;
  uploadStatus: UploadStatus;
  failureReason: string | null;
  uploadedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

export class MediaLimitError extends Error {}

/* eslint-disable @typescript-eslint/no-explicit-any -- rows come from PostgREST as JSON */
const toRecord = (r: any): MediaRecord => ({
  id: r.id,
  serviceRequestId: r.service_request_id,
  clientMediaId: r.client_media_id,
  mediaType: r.media_type,
  mimeType: r.mime_type,
  originalFilename: r.original_filename,
  declaredSize: Number(r.declared_size),
  fileSize: r.file_size === null ? null : Number(r.file_size),
  storagePath: r.storage_path,
  uploadStatus: r.upload_status,
  failureReason: r.failure_reason,
  uploadedAt: r.uploaded_at,
  durationSeconds: r.duration_seconds === null ? null : Number(r.duration_seconds),
  createdAt: r.created_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const objectPath = (path: string) => `${EVIDENCE_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;

// ─── Content sniffing ────────────────────────────────────────────────────────
// The bucket enforces the declared Content-Type, but a declared type is just a
// claim. These checks read the file's first bytes and confirm the container
// matches the kind of media (a renamed .exe or PDF fails here).

type Container = "jpeg" | "png" | "webp" | "heif" | "isobmff" | "ebml" | "ogg" | "mp3" | "wav" | "aac" | "amr" | "unknown";

export function sniffContainer(b: Uint8Array): Container {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && ascii(0, 8) === "\x89PNG\r\n\x1a\n") return "png";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE") return "wav";
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "ebml";
  if (b.length >= 4 && ascii(0, 4) === "OggS") return "ogg";
  if (b.length >= 5 && ascii(0, 5) === "#!AMR") return "amr";
  if (b.length >= 12) {
    const box = ascii(4, 8);
    if (box === "ftyp") {
      const brand = ascii(8, 12);
      return ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"].includes(brand) ? "heif" : "isobmff";
    }
    // QuickTime files may open with another top-level atom before ftyp.
    if (["moov", "mdat", "wide", "free", "skip"].includes(box)) return "isobmff";
  }
  if (b.length >= 3 && ascii(0, 3) === "ID3") return "mp3";
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return "aac"; // ADTS
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "mp3"; // MPEG audio frame
  return "unknown";
}

const ALLOWED_CONTAINERS: Record<MediaType, Container[]> = {
  PHOTO: ["jpeg", "png", "webp", "heif"],
  VIDEO: ["isobmff", "ebml"],
  VOICE: ["isobmff", "ebml", "ogg", "mp3", "wav", "aac", "amr"],
};

// ─── Store ───────────────────────────────────────────────────────────────────

export interface ReserveInput {
  requestId: string;
  clientMediaId: string;
  mediaType: MediaType;
  mimeType: string;
  extension: string;
  declaredSize: number;
  originalFilename: string;
  source: "camera" | "upload" | "recording";
  durationSeconds: number | null;
}

export interface SignedUpload {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresInSeconds: number;
}

/** Supabase signed upload URLs are valid for two hours (fixed by Supabase). */
const SIGNED_UPLOAD_TTL_SECONDS = 2 * 60 * 60;

export const mediaStore = {
  async reserve(input: ReserveInput): Promise<MediaRecord> {
    try {
      const rows = await supabaseJson<unknown[]>("/rest/v1/rpc/reserve_service_media", {
        method: "POST",
        body: JSON.stringify({
          p_request_id: input.requestId,
          p_client_media_id: input.clientMediaId,
          p_media_type: input.mediaType,
          p_mime_type: input.mimeType,
          p_extension: input.extension,
          p_declared_size: input.declaredSize,
          p_original_name: input.originalFilename,
          p_source: input.source,
          p_duration: input.durationSeconds,
          p_max_visual: MEDIA_LIMITS.maxItems,
          p_max_voice: MEDIA_LIMITS.maxVoiceNotes,
        }),
      });
      return toRecord(rows[0]);
    } catch (err) {
      if (err instanceof SupabaseError && err.code === "P0001") throw new MediaLimitError("media_limit_reached");
      throw err;
    }
  },

  /** A one-off signed URL the browser PUTs the file to. Never overwrites (x-upsert: false). */
  async signUpload(record: MediaRecord): Promise<SignedUpload> {
    const { url } = supabaseConfig();
    const signed = await supabaseJson<{ url: string }>(`/storage/v1/object/upload/sign/${objectPath(record.storagePath)}`, {
      method: "POST",
      body: "{}",
    });
    return {
      url: `${url}/storage/v1${signed.url}`,
      method: "PUT",
      headers: { "Content-Type": record.mimeType, "x-upsert": "false" },
      expiresInSeconds: SIGNED_UPLOAD_TTL_SECONDS,
    };
  },

  async get(requestId: string, mediaId: string): Promise<MediaRecord | null> {
    const rows = await supabaseJson<unknown[]>(
      `/rest/v1/service_media?id=eq.${encodeURIComponent(mediaId)}&service_request_id=eq.${encodeURIComponent(requestId)}&select=*`,
    );
    return rows[0] ? toRecord(rows[0]) : null;
  },

  async list(requestId: string): Promise<MediaRecord[]> {
    const rows = await supabaseJson<unknown[]>(
      `/rest/v1/service_media?service_request_id=eq.${encodeURIComponent(requestId)}&select=*&order=created_at.asc`,
    );
    return rows.map(toRecord);
  },

  /**
   * Checks the uploaded object and marks the row UPLOADED, or deletes the
   * object and marks the row FAILED. Idempotent: an UPLOADED row is returned
   * as-is; a still-missing object leaves the row PENDING ("not_uploaded").
   */
  async complete(record: MediaRecord): Promise<{ record: MediaRecord; outcome: "uploaded" | "not_uploaded" | "rejected" }> {
    if (record.uploadStatus === "UPLOADED") return { record, outcome: "uploaded" };

    const res = (await supabaseFetch(`/storage/v1/object/authenticated/${objectPath(record.storagePath)}`, {
      headers: { Range: "bytes=0-63" },
      raw: true,
    })) as Response;
    if (res.status === 400 || res.status === 404) {
      await res.body?.cancel();
      return { record, outcome: "not_uploaded" };
    }
    if (!res.ok) {
      await res.body?.cancel();
      throw new SupabaseError(`Storage read failed: ${res.status}`, res.status);
    }
    const head = new Uint8Array(await res.arrayBuffer());
    const total = Number(res.headers.get("content-range")?.split("/")[1] ?? head.byteLength);

    const kind = TYPE_TO_KIND[record.mediaType];
    let reason: string | null = null;
    if (!total) reason = "empty_file";
    else if (total > maxBytesFor(kind)) reason = "file_too_large";
    else if (!ALLOWED_CONTAINERS[record.mediaType].includes(sniffContainer(head))) reason = "content_does_not_match_type";

    if (reason) {
      await this.deleteObject(record.storagePath);
      const rows = await supabaseJson<unknown[]>("/rest/v1/rpc/mark_service_media_failed", {
        method: "POST",
        body: JSON.stringify({ p_media_id: record.id, p_reason: reason }),
      });
      return { record: toRecord(rows[0]), outcome: "rejected" };
    }
    const rows = await supabaseJson<unknown[]>("/rest/v1/rpc/mark_service_media_uploaded", {
      method: "POST",
      body: JSON.stringify({ p_media_id: record.id, p_file_size: total }),
    });
    return { record: toRecord(rows[0]), outcome: "uploaded" };
  },

  async deleteObject(path: string): Promise<void> {
    // Deleting a missing object succeeds with an empty list — safe to repeat.
    await supabaseFetch(`/storage/v1/object/${EVIDENCE_BUCKET}`, { method: "DELETE", body: JSON.stringify({ prefixes: [path] }) });
  },

  /** Deletes the object, then the row. Safe to repeat. */
  async remove(record: MediaRecord): Promise<void> {
    await this.deleteObject(record.storagePath);
    await supabaseFetch(`/rest/v1/service_media?id=eq.${encodeURIComponent(record.id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  },

  /** Short-lived signed read URL for authorised staff. Never a public URL. */
  async signRead(record: MediaRecord, expiresInSeconds = 300): Promise<string> {
    const { url } = supabaseConfig();
    const signed = await supabaseJson<{ signedURL: string }>(`/storage/v1/object/sign/${objectPath(record.storagePath)}`, {
      method: "POST",
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    });
    return `${url}/storage/v1${signed.signedURL}`;
  },

  /** Removes abandoned uploads: PENDING/FAILED rows untouched since the cutoff, and their objects. */
  async cleanupStale(olderThan: Date): Promise<{ removed: number; paths: string[] }> {
    const rows = await supabaseJson<unknown[]>(
      `/rest/v1/service_media?upload_status=in.(PENDING,FAILED)&updated_at=lt.${encodeURIComponent(olderThan.toISOString())}&select=*&limit=500`,
    );
    const stale = rows.map(toRecord);
    for (const r of stale) await this.remove(r);
    return { removed: stale.length, paths: stale.map((r) => r.storagePath) };
  },
};
