// POST /api/service-requests/:reference/finalize — the customer has finished
// adding evidence. Requires the request's upload token (same as the media
// endpoints).
//
// Always answers 202 { received: true } once authorised: whether AI is
// disabled, already queued, already processed or failed to queue. AI work
// runs after the response (never while the customer waits), and nothing
// here can fail or change the service request itself. No AI content or
// status is ever returned to the customer.
import { after, NextRequest, NextResponse } from "next/server";
import type { FinalizeResponse } from "@/lib/service-call/api-contract";
import { isServiceAiEnabled } from "@/lib/service-call/server/ai-config";
import { enqueueAiProcessing, runAiWorker } from "@/lib/service-call/server/ai-worker";
import { authoriseUpload, NO_STORE, serverFailure } from "@/lib/service-call/server/http";

type Ctx = { params: Promise<{ reference: string }> };

const received = () => NextResponse.json({ received: true } satisfies FinalizeResponse, { status: 202, headers: NO_STORE });

export async function POST(req: NextRequest, { params }: Ctx) {
  const { reference } = await params;
  let auth;
  try {
    auth = await authoriseUpload(req, reference);
  } catch (err) {
    return serverFailure("finalize", err);
  }
  if (!auth.ok) return auth.response;
  if (!isServiceAiEnabled()) return received();

  try {
    const result = await enqueueAiProcessing(auth.request.id, "FINALIZE", "customer");
    if (result.outcome === "created") {
      after(async () => {
        try {
          await runAiWorker(1);
        } catch (err) {
          // The sweep will pick the run up again; the customer is unaffected.
          console.error("[service-ai] finalize worker failed:", err instanceof Error ? err.message : err);
        }
      });
    }
  } catch (err) {
    // Queueing failed: the sweep discovers the request later. Never surfaced.
    console.error("[service-ai] finalize enqueue failed:", err instanceof Error ? err.message : err);
  }
  return received();
}
