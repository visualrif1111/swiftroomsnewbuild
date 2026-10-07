// Private-evidence access boundary (storage layer). The dashboard UI only
// ever requests /admin/service/<reference>/media/<id>; that route asks this
// module for a short-lived read URL. Swapping Supabase Storage for R2, S3 or
// UAE Host storage means another EvidenceAccess implementation (any store
// that can mint expiring read URLs, or stream the bytes through the route).
import "server-only";
import { mediaStore } from "@/lib/service-call/server/media-store";

export interface EvidenceAccess {
  /** A read URL valid for `expiresInSeconds` for an UPLOADED file belonging to the request, else null. */
  signedReadUrl(requestId: string, mediaId: string, expiresInSeconds: number): Promise<string | null>;
}

/** Supabase Storage (private bucket "service-evidence"), via the Phase 3 media store. */
export const supabaseEvidenceAccess: EvidenceAccess = {
  async signedReadUrl(requestId, mediaId, expiresInSeconds) {
    const record = await mediaStore.get(requestId, mediaId);
    if (!record || record.uploadStatus !== "UPLOADED") return null;
    return mediaStore.signRead(record, expiresInSeconds);
  },
};

export const evidenceAccess: EvidenceAccess = supabaseEvidenceAccess;
