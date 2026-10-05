// GET /api/service-requests/:reference/ai — AI processing status, run history
// and every report version for one request. Staff/testing only: admin token
// required (404 otherwise, same as the other admin endpoints). Never exposed
// to customers.
import { NextRequest, NextResponse } from "next/server";
import { deriveAiStatus } from "@/lib/service-call/ai/run-store";
import { isServiceAiEnabled, resolveServiceAiProvider } from "@/lib/service-call/server/ai-config";
import { supabaseAiStore } from "@/lib/service-call/server/ai-store";
import { isAdmin, NO_STORE, REFERENCE_PATTERN, serverFailure } from "@/lib/service-call/server/http";

export async function GET(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
  if (!isAdmin(req)) return notFound();
  const { reference } = await params;
  if (!REFERENCE_PATTERN.test(reference)) return notFound();

  try {
    const request = await supabaseAiStore.findRequestByReference(reference);
    if (!request) return notFound();
    const [runs, reports, mediaAnalyses] = await Promise.all([
      supabaseAiStore.listRuns(request.id),
      supabaseAiStore.listReports(request.id),
      supabaseAiStore.listAnalyses(request.id),
    ]);
    const provider = resolveServiceAiProvider();
    return NextResponse.json(
      {
        reference: request.reference,
        aiEnabled: isServiceAiEnabled(),
        // Which provider would run, or why none would (never the key itself).
        aiProvider: provider.ok ? { id: provider.provider.id, models: provider.provider.models } : { id: null, problem: provider.reason },
        aiStatus: deriveAiStatus(runs),
        latestReportVersion: reports.findLast((r) => !r.supersededAt)?.version ?? null,
        // Lease owners are internal worker ids; not returned.
        runs: runs.map((run) => ({ ...run, leaseOwner: undefined })),
        reports,
        // Derived per-file results (e.g. transcripts). The original files remain the source records.
        mediaAnalyses,
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    return serverFailure("read ai", err);
  }
}
