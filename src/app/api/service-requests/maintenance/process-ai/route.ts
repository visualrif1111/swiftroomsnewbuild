// POST /api/service-requests/maintenance/process-ai — AI processing sweep.
// Admin token only (404 otherwise). Queues settled, unprocessed requests,
// recovers expired leases and processes a bounded batch. Intended for a
// scheduled job later; no cron is configured yet. Returns ids and outcomes
// only — never report content.
import { NextRequest, NextResponse } from "next/server";
import { sweepAi } from "@/lib/service-call/server/ai-worker";
import { isAdmin, NO_STORE, serverFailure } from "@/lib/service-call/server/http";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  try {
    return NextResponse.json(await sweepAi(), { headers: NO_STORE });
  } catch (err) {
    return serverFailure("process ai", err);
  }
}
