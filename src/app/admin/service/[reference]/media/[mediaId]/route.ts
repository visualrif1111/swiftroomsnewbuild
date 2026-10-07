// Authorised evidence access for staff. The page never embeds signed storage
// URLs: an <img>/<audio>/<video> points here, and each load re-verifies the
// staff session and mints a 5-minute signed URL for exactly this file.
import { NextResponse, type NextRequest } from "next/server";
import { dashboardConfigured, StaffAuthError } from "@/lib/service-dashboard/auth/session";
import { signEvidence } from "@/lib/service-dashboard/data";

const HEADERS = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" };

export async function GET(_: NextRequest, { params }: { params: Promise<{ reference: string; mediaId: string }> }) {
  if (!dashboardConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });
  const { reference, mediaId } = await params;
  try {
    const url = await signEvidence(reference, mediaId);
    if (!url) return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });
    return NextResponse.redirect(url, { status: 302, headers: HEADERS });
  } catch (e) {
    if (e instanceof StaffAuthError) return NextResponse.json({ error: "not_authorised" }, { status: 401, headers: HEADERS });
    console.error(`[dashboard] evidence access failed: ${(e as Error).name}`);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: HEADERS });
  }
}
