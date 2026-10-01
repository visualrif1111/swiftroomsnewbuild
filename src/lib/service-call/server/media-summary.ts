import "server-only";
import type { MediaSummary } from "../api-contract";
import { TYPE_TO_KIND, type MediaRecord } from "./media-store";

/** What the customer's browser may see about a file — never storage paths or URLs. */
export const toMediaSummary = (r: MediaRecord): MediaSummary => ({
  id: r.id,
  clientMediaId: r.clientMediaId,
  kind: TYPE_TO_KIND[r.mediaType],
  mimeType: r.mimeType,
  fileName: r.originalFilename,
  size: r.fileSize ?? r.declaredSize,
  uploadStatus: r.uploadStatus,
  failureReason: r.failureReason,
});
