// GET /api/service-requests/:reference — read one request with its customer
// and status history. Staff/testing use only: disabled unless
// SERVICE_REQUESTS_ADMIN_TOKEN is set, and then requires it as a Bearer token.
// The staff dashboard (later phase) will replace this with real auth.
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRequestStore, StoreNotConfiguredError } from "@/lib/service-call/server/store";

const REFERENCE = /^SR-\d{4}-\d{5,}$/;
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

function authorised(req: NextRequest) {
  const expected = process.env.SERVICE_REQUESTS_ADMIN_TOKEN;
  if (!expected) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  // Same response whether the endpoint is disabled or the token is wrong.
  if (!authorised(req)) return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });

  const { reference } = await params;
  if (!REFERENCE.test(reference)) return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });

  try {
    const request = await getServiceRequestStore().getByReference(reference);
    if (!request) return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });
    return NextResponse.json(request, { headers: HEADERS });
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503, headers: HEADERS });
    }
    console.error("[service-requests] read failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: HEADERS });
  }
}
