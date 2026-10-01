// DELETE /api/service-requests/:reference/media/:mediaId — remove a file
// (storage object and record). Safe to repeat. Requires the upload token.
import { NextRequest, NextResponse } from "next/server";
import { authoriseUpload, NO_STORE, serverFailure, UUID_PATTERN } from "@/lib/service-call/server/http";
import { mediaStore } from "@/lib/service-call/server/media-store";

type Ctx = { params: Promise<{ reference: string; mediaId: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { reference, mediaId } = await params;
  try {
    const auth = await authoriseUpload(req, reference);
    if (!auth.ok) return auth.response;
    if (UUID_PATTERN.test(mediaId)) {
      const record = await mediaStore.get(auth.request.id, mediaId);
      if (record) await mediaStore.remove(record);
    }
    // Already gone (or never existed for this request) is success: the file isn't there.
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  } catch (err) {
    return serverFailure("remove media", err);
  }
}
