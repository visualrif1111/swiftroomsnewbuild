// POST /api/service-requests/:reference/media/:mediaId/complete — verify an
// upload and mark it UPLOADED. Idempotent. Requires the upload token.
import { NextRequest, NextResponse } from "next/server";
import type { CompleteMediaResponse } from "@/lib/service-call/api-contract";
import { authoriseUpload, fail, NO_STORE, serverFailure, UUID_PATTERN } from "@/lib/service-call/server/http";
import { mediaStore } from "@/lib/service-call/server/media-store";
import { toMediaSummary } from "@/lib/service-call/server/media-summary";

type Ctx = { params: Promise<{ reference: string; mediaId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { reference, mediaId } = await params;
  try {
    const auth = await authoriseUpload(req, reference);
    if (!auth.ok) return auth.response;
    const record = UUID_PATTERN.test(mediaId) ? await mediaStore.get(auth.request.id, mediaId) : null;
    if (!record) return fail(404, "media_not_found", "That file isn't part of this request.");

    const { record: updated, outcome } = await mediaStore.complete(record);
    if (outcome === "not_uploaded") return fail(409, "not_uploaded", "The file hasn't arrived in storage yet.");
    if (outcome === "rejected") {
      return NextResponse.json(
        { error: "media_rejected", message: "This file couldn't be accepted.", fields: { file: updated.failureReason ?? "rejected" }, media: toMediaSummary(updated) },
        { status: 422, headers: NO_STORE },
      );
    }
    const response: CompleteMediaResponse = { media: toMediaSummary(updated) };
    return NextResponse.json(response, { headers: NO_STORE });
  } catch (err) {
    return serverFailure("complete media", err);
  }
}
