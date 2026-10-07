import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/service-dashboard/auth/session";
import { getRequestDetail } from "@/lib/service-dashboard/data";
import { AI_STATE_LABEL, REVIEW_LABEL, STATUS_LABEL, TRANSITION_VERB, URGENCY_LABEL } from "@/lib/service-dashboard/labels";
import { formatDateTime } from "@/lib/service-dashboard/format";
import { Pill, WarnIcon } from "@/components/service-dashboard/bits";
import { AiReportView, AiStateNotice, CustomerRequest, Evidence, History, Versions } from "@/components/service-dashboard/detail";
import { StatusForm } from "@/components/service-dashboard/client";
import { changeStatusAction, reviewReportAction } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return { title: reference };
}

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ version?: string }> }) {
  const staff = await requireStaffPage();
  const { reference } = await params;
  const d = await getRequestDetail(reference);
  if (!d) notFound();

  const { version } = await searchParams;
  const reports = [...d.reports].sort((a, b) => a.version - b.version);
  const current = reports.filter((r) => !r.supersededAt).at(-1) ?? null;
  const asked = version ? reports.find((r) => r.version === Number(version)) : null;
  const shown = asked ?? current;
  const report = shown?.aiReport ?? null;
  const urgency = current?.aiReport?.content.urgency.level ?? "NONE";
  const isAdmin = staff.role === "ADMIN";
  const currentReview = current ? d.reviews.find((v) => v.reportId === current.id && !v.supersededAt) : null;

  return (
    <>
      <Link href="/admin/service" className="sd-back">
        ← All requests
      </Link>
      <div className="sd-dhead">
        <div>
          <div className="ref">{d.request.reference}</div>
          <h1>{d.request.customerName}</h1>
          <p className="muted" style={{ margin: "2px 0 0" }}>
            Submitted {formatDateTime(d.request.createdAt)} · last updated {formatDateTime(d.request.updatedAt)}
          </p>
        </div>
      </div>

      <section className="sd-panel sd-facts" aria-label="Request state">
        <div>
          <span className="eyebrow">Service status</span>
          <Pill kind="st" value={d.request.status} label={STATUS_LABEL[d.request.status]} />
        </div>
        <div>
          <span className="eyebrow">AI processing</span>
          <Pill kind="ai" value={d.aiState} label={AI_STATE_LABEL[d.aiState]} />
          {d.latestRun && <span className="sub">Run {d.latestRun.runNumber}</span>}
        </div>
        <div>
          <span className="eyebrow">Urgency (AI)</span>
          <Pill kind="ug" value={urgency} label={URGENCY_LABEL[urgency as keyof typeof URGENCY_LABEL]} />
          {currentReview?.editedReport && <span className="sub">Staff: {URGENCY_LABEL[currentReview.editedReport.urgency.level as keyof typeof URGENCY_LABEL]}</span>}
        </div>
        <div>
          <span className="eyebrow">Report version</span>
          <span style={{ fontWeight: 600 }}>{current ? `v${current.version} of ${reports.length}` : "No report"}</span>
          {current && <span className="sub">{current.processingStatus === "PARTIAL" ? "Partial" : "Complete"} · {formatDateTime(current.generatedAt)}</span>}
        </div>
        <div>
          <span className="eyebrow">Staff review</span>
          {current ? <Pill kind="rv" value={current.reviewStatus} label={REVIEW_LABEL[current.reviewStatus]} /> : <span className="muted">—</span>}
          {currentReview && <span className="sub">{currentReview.reviewerName}</span>}
        </div>
      </section>

      <div className="sd-detail">
        <div className="sd-col">
          <CustomerRequest d={d} />
          <Evidence d={d} report={current?.aiReport ?? null} />

          <section className="sd-panel" aria-labelledby="h-ai" id="ai-report">
            <header>
              <h2 id="h-ai">AI service call report</h2>
              {shown && <span className="eyebrow">v{shown.version} · {formatDateTime(shown.generatedAt)}</span>}
            </header>
            {report && (
              <div className="sd-ai-banner" role="note">
                <WarnIcon />
                <span>
                  <strong>AI-assisted report — staff verification required.</strong> It summarises what the customer said and what is visible in their media. It has not confirmed any fault, cause, liability, warranty, repair method, price or appointment.
                </span>
              </div>
            )}
            <AiStateNotice d={d} hasReport={!!report} />
            {report && shown && (
              <AiReportView
                d={d}
                report={report}
                row={shown}
                isCurrent={!shown.supersededAt}
                reviews={d.reviews}
                canReview={shown.reviewStatus === "AWAITING_REVIEW"}
                canSupersede={shown.reviewStatus !== "AWAITING_REVIEW" && isAdmin}
                reviewAction={reviewReportAction}
              />
            )}
          </section>

          <Versions d={d} shown={shown?.version ?? null} />
        </div>

        <aside className="sd-aside" aria-label="Workflow">
          <div className="sd-aside-grid sd-col">
            <section className="sd-panel" aria-labelledby="h-status">
              <header>
                <h2 id="h-status">Status</h2>
                <span className="eyebrow">{isAdmin ? "Admin" : "Staff"} actions</span>
              </header>
              <div className="body">
                <div className="sd-status-now">
                  <span className="muted">Currently</span>
                  <Pill kind="st" value={d.request.status} label={STATUS_LABEL[d.request.status]} />
                </div>
                <StatusForm
                    action={changeStatusAction}
                    reference={d.request.reference}
                    current={d.request.status}
                    options={d.transitions.map((t) => ({
                      to: t.to,
                      label: STATUS_LABEL[t.to],
                      verb: d.request.status === "CLOSED" || (d.request.status === "RESOLVED" && t.to !== "CLOSED") ? `Reopen → ${STATUS_LABEL[t.to]}` : (TRANSITION_VERB[t.to] ?? STATUS_LABEL[t.to]),
                      noteRequired: t.noteRequired,
                      adminOnly: t.minRole === "ADMIN",
                    }))}
                    emptyText={d.request.status === "CLOSED" ? "This request is closed. Only an administrator can reopen it." : "No status changes are available to your role from here."}
                  />
              </div>
            </section>
            <History d={d} />
          </div>
        </aside>
      </div>
    </>
  );
}
