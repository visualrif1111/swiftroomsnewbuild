// POST /api/service-requests/maintenance/cleanup-media — delete abandoned
// uploads (PENDING/FAILED for longer than the cutoff) and their storage
// objects. Admin token only; intended for a scheduled job (see MEDIA.md).
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, NO_STORE, serverFailure } from "@/lib/service-call/server/http";
import { mediaStore } from "@/lib/service-call/server/media-store";

/** Comfortably longer than the 6-hour upload window. */
const DEFAULT_MAX_AGE_HOURS = 24;

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  const hours = Number(new URL(req.url).searchParams.get("olderThanHours") ?? DEFAULT_MAX_AGE_HOURS);
  if (!Number.isFinite(hours) || hours < 0) return NextResponse.json({ error: "invalid_age" }, { status: 400, headers: NO_STORE });
  try {
    const { removed } = await mediaStore.cleanupStale(new Date(Date.now() - hours * 3600_000));
    return NextResponse.json({ removed }, { headers: NO_STORE });
  } catch (err) {
    return serverFailure("cleanup media", err);
  }
}
