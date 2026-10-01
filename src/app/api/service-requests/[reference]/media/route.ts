// POST /api/service-requests/:reference/media — authorise one file upload.
// GET  /api/service-requests/:reference/media — list this request's files (for recovery after a refresh).
// Both require the upload token issued when the request was created. See MEDIA.md.
import { NextRequest, NextResponse } from "next/server";
import type { AuthoriseMediaResponse } from "@/lib/service-call/api-contract";
import { authoriseUpload, fail, NO_STORE, serverFailure } from "@/lib/service-call/server/http";
import { MediaLimitError, mediaStore } from "@/lib/service-call/server/media-store";
import { toMediaSummary } from "@/lib/service-call/server/media-summary";
import { validateAuthoriseMedia } from "@/lib/service-call/server/validate-media";

type Ctx = { params: Promise<{ reference: string }> };
const MAX_BODY_BYTES = 4 * 1024; // metadata only — the file itself goes straight to storage

export async function POST(req: NextRequest, { params }: Ctx) {
  const { reference } = await params;
  try {
    const auth = await authoriseUpload(req, reference);
    if (!auth.ok) return auth.response;

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return fail(413, "payload_too_large", "Send file details only, not the file.");
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return fail(400, "invalid_json", "The request body is not valid JSON.");
    }
    const v = validateAuthoriseMedia(body);
    if (!v.ok) return fail(422, "validation_failed", "This file can't be added.", v.fields);

    let record;
    try {
      record = await mediaStore.reserve({ ...v.value, requestId: auth.request.id });
    } catch (err) {
      if (err instanceof MediaLimitError) return fail(409, "media_limit_reached", "This request already has the maximum number of files.");
      throw err;
    }
    // Already verified (a retry after success): nothing to upload.
    const upload = record.uploadStatus === "UPLOADED" ? null : await mediaStore.signUpload(record);
    const response: AuthoriseMediaResponse = { media: toMediaSummary(record), upload };
    return NextResponse.json(response, { headers: NO_STORE });
  } catch (err) {
    return serverFailure("authorise media", err);
  }
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { reference } = await params;
  try {
    const auth = await authoriseUpload(req, reference);
    if (!auth.ok) return auth.response;
    const media = await mediaStore.list(auth.request.id);
    return NextResponse.json({ media: media.map(toMediaSummary) }, { headers: NO_STORE });
  } catch (err) {
    return serverFailure("list media", err);
  }
}
