// POST /api/service-requests/:reference/ai/reprocess — intentional
// reprocessing (staff/testing; admin token, 404 otherwise). Always creates a
// new MANUAL run — and so a new report version — unless one is already
// queued or running. Cached per-media results are reused; earlier report
// versions are kept and marked superseded, never overwritten.
import { after, NextRequest, NextResponse } from "next/server";
import { isServiceAiEnabled } from "@/lib/service-call/server/ai-config";
import { supabaseAiStore } from "@/lib/service-call/server/ai-store";
import { enqueueAiProcessing, runAiWorker } from "@/lib/service-call/server/ai-worker";
import { isAdmin, NO_STORE, REFERENCE_PATTERN, serverFailure } from "@/lib/service-call/server/http";

export async function POST(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  if (!isAdmin(req)) return notFound();
  const { reference } = await params;
  if (!REFERENCE_PATTERN.test(reference)) return notFound();
  if (!isServiceAiEnabled()) {
    return NextResponse.json({ error: "ai_disabled", message: "AI processing is disabled (SERVICE_AI_ENABLED)." }, { status: 409, headers: NO_STORE });
  }

  try {
    const request = await supabaseAiStore.findRequestByReference(reference);
    if (!request) return notFound();
    const result = await enqueueAiProcessing(request.id, "MANUAL", "admin");
    if (result.outcome === "created") {
      after(async () => {
        try {
          await runAiWorker(1);
        } catch (err) {
          console.error("[service-ai] reprocess worker failed:", err instanceof Error ? err.message : err);
        }
      });
    }
    const run = "run" in result && result.run ? { id: result.run.id, runNumber: result.run.runNumber, status: result.run.status, trigger: result.run.trigger } : null;
    return NextResponse.json({ outcome: result.outcome, run }, { status: result.outcome === "created" ? 202 : 200, headers: NO_STORE });
  } catch (err) {
    return serverFailure("reprocess ai", err);
  }
}
