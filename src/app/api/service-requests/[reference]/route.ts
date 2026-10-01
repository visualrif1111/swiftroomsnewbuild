// GET /api/service-requests/:reference — read one request with its customer,
// status history and media. Staff/testing use only: disabled unless
// SERVICE_REQUESTS_ADMIN_TOKEN is set, and then requires it as a Bearer token.
// Media come with short-lived (5 minute) signed read URLs — never public URLs.
// The staff dashboard (later phase) will replace this with real auth.
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, NO_STORE, REFERENCE_PATTERN, serverFailure } from "@/lib/service-call/server/http";
import { mediaStore } from "@/lib/service-call/server/media-store";
import { getServiceRequestStore } from "@/lib/service-call/server/store";

const SIGNED_READ_SECONDS = 300;

export async function GET(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  // Same response whether the endpoint is disabled or the token is wrong.
  const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  if (!isAdmin(req)) return notFound();

  const { reference } = await params;
  if (!REFERENCE_PATTERN.test(reference)) return notFound();

  try {
    const request = await getServiceRequestStore().getByReference(reference);
    if (!request) return notFound();
    const records = await mediaStore.list(request.id);
    const media = await Promise.all(
      records.map(async (m) => ({
        id: m.id,
        type: m.mediaType,
        mimeType: m.mimeType,
        originalFilename: m.originalFilename,
        fileSize: m.fileSize,
        uploadStatus: m.uploadStatus,
        failureReason: m.failureReason,
        storagePath: m.storagePath,
        uploadedAt: m.uploadedAt,
        signedUrl: m.uploadStatus === "UPLOADED" ? await mediaStore.signRead(m, SIGNED_READ_SECONDS) : null,
        signedUrlExpiresInSeconds: m.uploadStatus === "UPLOADED" ? SIGNED_READ_SECONDS : null,
      })),
    );
    return NextResponse.json({ ...request, media }, { headers: NO_STORE });
  } catch (err) {
    return serverFailure("read request", err);
  }
}
