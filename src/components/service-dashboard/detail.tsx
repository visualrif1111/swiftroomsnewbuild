// Request detail sections (server components). The customer's own request is
// always shown first and never depends on AI. AI content is visibly marked as
// AI-assisted, and its three kinds of content — what the customer said, what
// was seen in their media, and what remains unknown — never share a style.
import Link from "next/link";
import type { FormAction, RequestDetail, ReviewEntry } from "@/lib/service-dashboard/types";
import type { AiReport } from "@/lib/service-call/ai/run-store";
import type { ServiceCallReport } from "@/lib/service-call/ai/report-schema";
import {
  AI_STATE_LABEL, BASIS_LABEL, DISCREPANCY_TOPICS, INDICATOR_LABEL, ISSUE_CATEGORY_LABEL, MEDIA_LABEL, NEXT_STEP_LABEL, OBSERVATION_LABEL,
  REVIEW_LABEL, STATUS_LABEL, TOPIC_LABEL, URGENCY_LABEL, formatSeconds, productLabel, reasonLabel,
} from "@/lib/service-dashboard/labels";
import { formatBytes, formatDateTime } from "@/lib/service-dashboard/format";
import { Pill } from "./bits";
import { PhotoThumb, ReviewForm, VideoWithFrames } from "./client";

type Report = ServiceCallReport;
const mediaHref = (reference: string, id: string) => `/admin/service/${reference}/media/${id}`;
const evAnchor = (id: string) => `#ev-${id}`;

// ─── Customer request (original submission) ────────────────────────────────
export function CustomerRequest({ d }: { d: RequestDetail }) {
  const r = d.request;
  const received = d.evidence.filter((e) => e.uploadStatus === "UPLOADED");
  const count = (t: string) => received.filter((e) => e.type === t).length;
  return (
    <section className="sd-panel" aria-labelledby="h-request">
      <header>
        <h2 id="h-request">Customer request</h2>
        <span className="eyebrow">As submitted · {formatDateTime(r.createdAt)}</span>
      </header>
      <div className="body">
        <p className="eyebrow" style={{ margin: "0 0 6px" }}>
          Problem, in the customer&apos;s words
        </p>
        <p className="sd-original">{r.problemDescription || <span className="muted">No written description. See the evidence below.</span>}</p>
        <dl className="sd-kv">
          <dt>Products</dt>
          <dd>
            <span className="sd-chips">
              {r.productCategories.map((p) => (
                <span key={p} className="sd-chip">
                  {productLabel(p)}
                </span>
              ))}
            </span>
            {r.otherProduct && <div style={{ marginTop: 4 }}>Other: {r.otherProduct}</div>}
          </dd>
          <dt>Customer</dt>
          <dd>{r.customerName}</dd>
          <dt>Mobile</dt>
          <dd>
            <a href={`tel:${r.mobileE164}`} className="mono">
              {r.mobileE164}
            </a>
          </dd>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${r.email}`}>{r.email}</a>
          </dd>
          <dt>Location</dt>
          <dd>{r.location}</dd>
          <dt>Existing customer</dt>
          <dd>{r.existingCustomer === null ? <span className="muted">Not answered</span> : r.existingCustomer ? "Yes" : "No"}</dd>
          {r.projectReference && (
            <>
              <dt>Project reference</dt>
              <dd className="mono">{r.projectReference}</dd>
            </>
          )}
          <dt>Evidence</dt>
          <dd>
            Received {count("PHOTO")} of {r.declaredMedia.photos} photo{r.declaredMedia.photos === 1 ? "" : "s"}, {count("VIDEO")} of {r.declaredMedia.videos} video
            {r.declaredMedia.videos === 1 ? "" : "s"}
            {r.declaredMedia.voiceNote ? `, ${count("VOICE")} of 1 voice note` : count("VOICE") ? `, ${count("VOICE")} voice note` : ""}
          </dd>
          <dt>Channel</dt>
          <dd className="muted">{r.channel}</dd>
        </dl>
      </div>
    </section>
  );
}

// ─── Evidence ───────────────────────────────────────────────────────────────
function latestAnalysis(d: RequestDetail, mediaId: string, kind: string) {
  return d.analyses.filter((a) => a.mediaId === mediaId && a.kind === kind).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function AnalysisLine({ ok, text, tone }: { ok?: boolean; text: string; tone?: "bad" | "warn" }) {
  return <p className={`sd-status-line${tone ? ` ${tone}` : ""}`} style={{ margin: 0 }}>{ok ? "✓ " : tone ? "! " : ""}{text}</p>;
}

function coverageLine(report: Report | null, mediaId: string) {
  const c = report?.processing.mediaCoverage.find((m) => m.mediaId === mediaId);
  if (!c) return null;
  if (c.outcome === "ANALYSED") return null;
  return <AnalysisLine tone={c.outcome === "FAILED" ? "bad" : "warn"} text={`${c.outcome === "FAILED" ? "Analysis failed" : "Not analysed"}${c.reasonCode ? `: ${reasonLabel(c.reasonCode)}` : ""}`} />;
}

export function Evidence({ d, report }: { d: RequestDetail; report: Report | null }) {
  const ref = d.request.reference;
  const photos = d.evidence.filter((e) => e.type === "PHOTO" && e.uploadStatus === "UPLOADED");
  const voices = d.evidence.filter((e) => e.type === "VOICE" && e.uploadStatus === "UPLOADED");
  const videos = d.evidence.filter((e) => e.type === "VIDEO" && e.uploadStatus === "UPLOADED");
  const incomplete = d.evidence.filter((e) => e.uploadStatus !== "UPLOADED");
  const obsFor = (id: string) => report?.content.mediaObservations.filter((o) => o.evidence.mediaId === id) ?? [];
  const transcriptFor = (id: string) => report?.transcripts.find((t) => t.mediaId === id);

  return (
    <section className="sd-panel" aria-labelledby="h-evidence" id="evidence">
      <header>
        <h2 id="h-evidence">Evidence</h2>
        <span className="eyebrow">Private · opened on demand, links expire after 5 minutes</span>
      </header>
      <div className="body">
        {!photos.length && !voices.length && !videos.length && <p className="muted" style={{ margin: 0 }}>The customer didn&apos;t upload any evidence.</p>}

        {photos.length > 0 && (
          <div className="sd-ev-group">
            <h3>Photos ({photos.length})</h3>
            <div className="sd-photos">
              {photos.map((p) => {
                const a = report?.photoAssessments.find((x) => x.mediaId === p.id);
                const failed = latestAnalysis(d, p.id, "IMAGE_OBSERVATIONS");
                const obs = obsFor(p.id);
                return (
                  <article key={p.id} className="sd-photo" id={`ev-${p.id}`}>
                    <PhotoThumb src={mediaHref(ref, p.id)} label={p.label} />
                    <div className="meta">
                      <strong>{p.label}</strong>
                      {a ? (
                        <AnalysisLine
                          ok={a.quality === "CLEAR" && a.relevance === "RELEVANT"}
                          tone={a.quality === "UNUSABLE" || a.relevance === "NOT_RELEVANT" ? "warn" : undefined}
                          text={`Analysed · quality ${a.quality.toLowerCase()} · ${a.relevance === "RELEVANT" ? "shows the product" : a.relevance === "UNCLEAR" ? "relevance unclear" : "doesn't appear to show the product"}`}
                        />
                      ) : (
                        coverageLine(report, p.id) ??
                        (failed && failed.status !== "COMPLETED" ? <AnalysisLine tone="bad" text={`Photo analysis ${failed.status.toLowerCase()}: ${reasonLabel(failed.errorCode) ?? "no reason recorded"}`} /> : <AnalysisLine text="No AI analysis" />)
                      )}
                      {obs.length > 0 && (
                        <ul className="sd-list" style={{ fontSize: 13 }} aria-label={`AI observations for ${p.label}`}>
                          {obs.map((o) => (
                            <li key={o.id}>
                              <span style={{ color: "var(--sd-media)", fontWeight: 600 }}>AI observed:</span> {o.observation} <span className={`muted sd-cert-${o.certainty}`}>({o.certainty.toLowerCase()})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="muted" style={{ fontSize: 12 }}>
                        {p.mimeType} · {formatBytes(p.fileSize)} · uploaded {formatDateTime(p.createdAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {voices.length > 0 && (
          <div className="sd-ev-group">
            <h3>Voice notes ({voices.length})</h3>
            {voices.map((v) => {
              const t = transcriptFor(v.id);
              const a = latestAnalysis(d, v.id, "TRANSCRIPT");
              const text = t?.text ?? (a?.status === "COMPLETED" ? a.transcript : null);
              return (
                <article key={v.id} className="sd-media-item" id={`ev-${v.id}`}>
                  <div className="row">
                    <strong>{v.label}</strong>
                    {v.durationSeconds !== null && <span className="muted mono">{formatSeconds(v.durationSeconds)}</span>}
                    <span className="muted" style={{ fontSize: 12 }}>{v.mimeType} · {formatBytes(v.fileSize)}</span>
                  </div>
                  <audio controls preload="none" src={mediaHref(ref, v.id)} aria-label={`${v.label} recording`} />
                  {text ? (
                    <div className="sd-transcript">
                      <span className="prov">
                        Machine transcript of {v.label}
                        {(t?.language ?? a?.language) ? ` · language: ${t?.language ?? a?.language}` : ""} · the recording is the authoritative evidence
                      </span>
                      {text}
                    </div>
                  ) : null}
                  {t?.possiblyIncomplete && <AnalysisLine tone="warn" text="The transcript may be incomplete. Listen to the recording." />}
                  {t?.noSpeechDetected && <AnalysisLine tone="warn" text="No speech was recognised in this recording." />}
                  {!text && (coverageLine(report, v.id) ?? (a && a.status !== "COMPLETED" ? <AnalysisLine tone="bad" text={`Transcription ${a.status.toLowerCase()}: ${reasonLabel(a.errorCode) ?? "no reason recorded"}`} /> : <AnalysisLine text="Not transcribed" />))}
                </article>
              );
            })}
          </div>
        )}

        {videos.length > 0 && (
          <div className="sd-ev-group">
            <h3>Videos ({videos.length})</h3>
            {videos.map((v) => {
              const va = report?.videoAssessments.find((x) => x.mediaId === v.id);
              const t = transcriptFor(v.id);
              const obs = obsFor(v.id);
              return (
                <article key={v.id} className="sd-media-item" id={`ev-${v.id}`}>
                  <div className="row">
                    <strong>{v.label}</strong>
                    {(va?.durationSeconds ?? v.durationSeconds) != null && <span className="muted mono">{formatSeconds((va?.durationSeconds ?? v.durationSeconds)!)}</span>}
                    <span className="muted" style={{ fontSize: 12 }}>{v.mimeType} · {formatBytes(v.fileSize)}</span>
                  </div>
                  <VideoWithFrames src={mediaHref(ref, v.id)} label={`${v.label} recording`}>
                    <div>
                      {va ? (
                        <>
                          <p className="sd-status-line" style={{ margin: "0 0 8px" }}>
                            {va.analysedPortion}
                          </p>
                          {va.partiallyAnalysed && <AnalysisLine tone="warn" text="Only part of this video was analysed. Watch the original." />}
                          <ol className="sd-frames" aria-label={`Analysed frames of ${v.label}`}>
                            {va.frames.map((f) => {
                              const fo = obs.filter((o) => o.evidence.frameAtSeconds !== null && Math.abs(o.evidence.frameAtSeconds - f.atSeconds) < 0.05);
                              return (
                                <li key={f.atSeconds} className={f.outcome === "ANALYSED" ? "analysed" : undefined}>
                                  <button type="button" className="ts" data-seek={f.atSeconds} aria-label={`Jump to ${formatSeconds(f.atSeconds)}`}>
                                    {formatSeconds(f.atSeconds)}
                                  </button>{" "}
                                  <span className="muted">
                                    {f.outcome === "ANALYSED"
                                      ? `Analysed · ${f.quality?.toLowerCase() ?? "?"} quality${f.relevance === "NOT_RELEVANT" ? " · not showing the product" : ""}`
                                      : f.outcome === "DUPLICATE"
                                        ? "Near-duplicate, skipped"
                                        : f.outcome === "BLANK"
                                          ? "Blank frame"
                                          : `Failed${f.reasonCode ? `: ${reasonLabel(f.reasonCode)}` : ""}`}
                                  </span>
                                  {fo.map((o) => (
                                    <div key={o.id} style={{ marginTop: 3 }}>
                                      <span style={{ color: "var(--sd-media)", fontWeight: 600 }}>AI observed:</span> {o.observation}{" "}
                                      <span className={`muted sd-cert-${o.certainty}`}>({o.certainty.toLowerCase()})</span>
                                    </div>
                                  ))}
                                </li>
                              );
                            })}
                          </ol>
                        </>
                      ) : (
                        coverageLine(report, v.id) ?? <AnalysisLine text="No AI analysis of this video" />
                      )}
                    </div>
                  </VideoWithFrames>
                  {t?.text ? (
                    <div className="sd-transcript">
                      <span className="prov">
                        Machine transcript of {v.label} audio
                        {va?.audio.transcribedSeconds ? ` (${formatSeconds(va.audio.transcribedSeconds.from)}–${formatSeconds(va.audio.transcribedSeconds.to)})` : ""}
                        {t.language ? ` · language: ${t.language}` : ""} · the recording is the authoritative evidence
                      </span>
                      {t.text}
                    </div>
                  ) : va ? (
                    <AnalysisLine tone={va.audio.status === "FAILED" ? "bad" : undefined} text={`Audio: ${va.audio.status === "NO_AUDIO" ? "no audio track" : va.audio.status === "TRANSCRIBED" ? "no speech recognised" : `${va.audio.status.toLowerCase().replace(/_/g, " ")}${va.audio.reasonCode ? ` (${reasonLabel(va.audio.reasonCode)})` : ""}`}`} />
                  ) : null}
                  {t?.possiblyIncomplete && <AnalysisLine tone="warn" text="The transcript may be incomplete. Listen to the recording." />}
                </article>
              );
            })}
          </div>
        )}

        {incomplete.length > 0 && (
          <div className="sd-ev-group">
            <h3>Uploads not completed ({incomplete.length})</h3>
            <ul className="sd-list">
              {incomplete.map((e) => (
                <li key={e.id} className="muted">
                  {MEDIA_LABEL[e.type]} · {e.uploadStatus === "PENDING" ? "upload started, never finished" : `rejected${e.failureReason ? `: ${e.failureReason.replace(/_/g, " ")}` : ""}`} · {formatDateTime(e.createdAt)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── AI report ──────────────────────────────────────────────────────────────
function EvidenceChip({ id, label, at }: { id: string; label: string; at?: number | null }) {
  return (
    <a className="sd-chip media" href={evAnchor(id)}>
      {label}
      {at !== null && at !== undefined ? ` · ${formatSeconds(at)}` : ""}
    </a>
  );
}

function sourceChip(report: Report, s: Report["content"]["customerReported"]["statements"][number]) {
  if (s.source.type === "DESCRIPTION") return <span className="sd-chip cust">Written description</span>;
  const label = report.transcripts.find((t) => t.mediaId === s.source.mediaId)?.label ?? "Recording";
  return (
    <a className="sd-chip cust" href={s.source.mediaId ? evAnchor(s.source.mediaId) : undefined}>
      {s.source.type === "VOICE_NOTE" ? label : `${label} audio`} (transcript)
    </a>
  );
}

export function AiStateNotice({ d, hasReport }: { d: RequestDetail; hasReport: boolean }) {
  const run = d.latestRun;
  const s = d.aiState;
  if (hasReport && (s === "COMPLETED" || s === "PARTIAL")) return null;
  const msg: Record<string, string> = {
    NOT_STARTED: "AI analysis hasn't run for this request. Everything you need is in the customer's request and evidence above.",
    PROCESSING: hasReport ? "A newer AI analysis is in progress. The report below is the latest completed version." : "AI analysis is in progress. Work from the customer's request and evidence meanwhile.",
    FAILED: hasReport
      ? "The most recent AI analysis failed. The report below is the last completed version."
      : "AI analysis failed for this request. Work from the customer's request and evidence; nothing is lost.",
    COMPLETED: "AI analysis completed but produced no report.",
    PARTIAL: "AI analysis completed partially but produced no report.",
  };
  return (
    <div className="sd-ai-state">
      <p>
        <Pill kind="ai" value={s} label={AI_STATE_LABEL[s]} />
      </p>
      <p>{msg[s]}</p>
      {run && s === "FAILED" && (
        <p className="muted" style={{ fontSize: 13 }}>
          Run {run.runNumber} · {run.errorCode ? reasonLabel(run.errorCode) : "no reason recorded"} · {run.attempts}/{run.maxAttempts} attempts · {formatDateTime(run.finishedAt)}
        </p>
      )}
    </div>
  );
}

export function AiReportView({
  d, report, row, isCurrent, reviews, canReview, canSupersede, reviewAction,
}: {
  reviewAction: FormAction;
  d: RequestDetail;
  report: Report;
  row: AiReport;
  isCurrent: boolean;
  reviews: ReviewEntry[];
  canReview: boolean;
  canSupersede: boolean;
}) {
  const c = report.content;
  const unknowns = c.unknownsRequiringInspection;
  const discrepancies = unknowns.filter((u) => (DISCREPANCY_TOPICS as readonly string[]).includes(u.topic));
  const others = unknowns.filter((u) => !(DISCREPANCY_TOPICS as readonly string[]).includes(u.topic));
  const coverageIssues = report.processing.mediaCoverage.filter((m) => m.outcome !== "ANALYSED");
  const current = reviews.find((r) => r.reportId === row.id && !r.supersededAt);
  const edit = current?.status === "EDITED" ? current.editedReport : null;

  return (
    <>
      {!isCurrent && (
        <div className="sd-alert warn" style={{ margin: "14px 18px 0" }} role="note">
          You&apos;re viewing version {row.version}, which was replaced {formatDateTime(row.supersededAt)}. <Link href={`/admin/service/${d.request.reference}`}>View the current version</Link>.
        </div>
      )}
      {edit && (
        <div className="sd-rsec">
          <div className="sd-staff-edit" style={{ marginBottom: 0 }}>
            <span className="tag">Staff-edited version · {current!.reviewerName} · {formatDateTime(current!.createdAt)}</span>
            <p style={{ margin: "6px 0" }}>{edit.issueSummary}</p>
            <p style={{ margin: 0, fontSize: 14 }}>
              Staff urgency: <Pill kind="ug" value={edit.urgency.level} label={URGENCY_LABEL[edit.urgency.level as keyof typeof URGENCY_LABEL] ?? edit.urgency.level} />
              {edit.urgency.reason ? ` ${edit.urgency.reason}` : ""}
            </p>
            {edit.corrections && <p style={{ margin: "6px 0 0", fontSize: 14 }}>Corrections: {edit.corrections}</p>}
          </div>
        </div>
      )}

      <div className="sd-rsec">
        <div className="head">
          <h3>Summary</h3>
          {edit && <span className="kind" style={{ background: "var(--sd-sunk)", color: "var(--sd-ink-3)" }}>AI original</span>}
        </div>
        <p className="sd-summary">{c.issueSummary}</p>
        {c.potentialIssueCategories.length > 0 && (
          <p style={{ margin: "10px 0 0", fontSize: 13.5 }}>
            <span className="muted">Possible issue areas (not confirmed): </span>
            {c.potentialIssueCategories.map((p) => `${ISSUE_CATEGORY_LABEL[p.category] ?? p.category} (${p.likelihood.toLowerCase()})`).join(" · ")}
          </p>
        )}
      </div>

      <div className="sd-rsec sd-prov-cust">
        <div className="head">
          <h3>Customer reported information</h3>
          <span className="kind">What the customer said</span>
        </div>
        {c.customerReported.statements.length ? (
          <ul className="sd-statement">
            {c.customerReported.statements.map((s) => (
              <li key={s.id}>
                <div>{s.text}</div>
                <blockquote>{s.quote}</blockquote>
                <div className="src">Source: {sourceChip(report, s)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>No statements extracted.</p>
        )}
        {(c.customerReported.reportedOnset || c.customerReported.locationInProperty) && (
          <dl className="sd-kv" style={{ marginTop: 12 }}>
            {c.customerReported.reportedOnset && (
              <>
                <dt>When it started</dt>
                <dd>{c.customerReported.reportedOnset}</dd>
              </>
            )}
            {c.customerReported.locationInProperty && (
              <>
                <dt>Where in the property</dt>
                <dd>{c.customerReported.locationInProperty}</dd>
              </>
            )}
          </dl>
        )}
      </div>

      <div className="sd-rsec sd-prov-media">
        <div className="head">
          <h3>Observations from provided media</h3>
          <span className="kind">Seen in photos/video</span>
        </div>
        {c.mediaObservations.length ? (
          <ul className="sd-obs">
            {c.mediaObservations.map((o) => (
              <li key={o.id}>
                <span className="ev">
                  <EvidenceChip id={o.evidence.mediaId} label={o.evidence.label} at={o.evidence.frameAtSeconds} />
                </span>
                <span className="what">{o.observation}</span>
                <span className="cert">
                  {OBSERVATION_LABEL[o.type] ?? o.type} · <span className={`sd-cert-${o.certainty}`}>{o.certainty === "CLEAR" ? "clearly visible" : o.certainty === "PROBABLE" ? "probably visible" : "uncertain"}</span>
                  {o.evidence.frameAtSeconds !== null ? " · single still frame" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>{report.photoAssessments.length || report.videoAssessments.length ? "Nothing notable was observed in the analysed media." : "No media was analysed."}</p>
        )}
      </div>

      <div className="sd-rsec">
        <div className="head">
          <h3>Urgency and safety</h3>
          <span className="kind" style={{ background: "var(--sd-sunk)", color: "var(--sd-ink-3)" }}>AI assessment</span>
        </div>
        <div className="sd-urg">
          <span className={`lvl ug-${c.urgency.level}`}>{URGENCY_LABEL[c.urgency.level]}</span>
          <div>
            <p style={{ margin: 0 }}>{c.urgency.reason}</p>
            {c.urgency.indicators.length > 0 && (
              <ul className="sd-list" style={{ marginTop: 6 }}>
                {c.urgency.indicators.map((i) => (
                  <li key={i.indicator}>
                    {INDICATOR_LABEL[i.indicator] ?? i.indicator} <span className="muted">· {BASIS_LABEL[i.basis] ?? i.basis}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {report.safetyFlags.length > 0 && (
          <div className="sd-alert warn" style={{ marginTop: 12 }}>
            <strong>Safety keywords in the customer&apos;s own words</strong> (automatic check, independent of the AI):{" "}
            {[...new Set(report.safetyFlags.map((f) => `${INDICATOR_LABEL[f.indicator] ?? f.indicator} (${f.matchedIn === "DESCRIPTION" ? "description" : "transcript"})`))].join(", ")}
          </div>
        )}
        <p style={{ margin: "12px 0 0", fontSize: 13.5 }}>
          <span className="muted">AI-suggested next step (nothing has been booked): </span>
          {NEXT_STEP_LABEL[c.recommendedNextStep] ?? c.recommendedNextStep}
          {c.inspection.recommended ? ` · inspection suggested: ${c.inspection.reason}` : ""}
        </p>
      </div>

      <div className="sd-rsec sd-prov-disc">
        <div className="head">
          <h3>Discrepancies</h3>
          <span className="kind">Needs staff judgement</span>
        </div>
        {discrepancies.length ? (
          <ul className="sd-disc-list">
            {discrepancies.map((u, i) => (
              <li key={i}>
                <div className="topic">{TOPIC_LABEL[u.topic]}</div>
                <div>{u.question}</div>
                <div className="muted" style={{ fontSize: 13 }}>{u.whyUnknown}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ margin: 0 }}>No discrepancies were identified. Staff should still compare the evidence with the description.</p>
        )}
      </div>

      <div className="sd-rsec sd-prov-unk">
        <div className="head">
          <h3>Unknown / requires inspection</h3>
          <span className="kind">Not established</span>
        </div>
        <ul className="sd-unknowns">
          {others.map((u, i) => (
            <li key={i}>
              <span className="topic">{TOPIC_LABEL[u.topic] ?? u.topic}</span>
              <p>{u.question}</p>
              <p className="why">{u.whyUnknown}</p>
            </li>
          ))}
        </ul>
        {c.moreInformationNeeded.length > 0 && (
          <>
            <p className="eyebrow" style={{ margin: "14px 0 6px" }}>
              Questions to ask the customer
            </p>
            <ul className="sd-list">
              {c.moreInformationNeeded.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="sd-rsec">
        <div className="head">
          <h3>Evidence limitations</h3>
        </div>
        <ul className="sd-list sd-limits">
          {report.processing.status === "PARTIAL" && <li>This report is <strong>partial</strong>: some evidence couldn&apos;t be analysed.</li>}
          {coverageIssues.map((m) => (
            <li key={m.mediaId}>
              <a href={evAnchor(m.mediaId)}>{m.label}</a>: {m.outcome === "FAILED" ? "analysis failed" : "not analysed"}
              {m.reasonCode ? ` (${reasonLabel(m.reasonCode)})` : ""}
            </li>
          ))}
          {report.evidenceNotices.map((n, i) => (
            <li key={`n${i}`}>
              <a href={evAnchor(n.mediaId)}>{n.label}</a>: {n.message}
            </li>
          ))}
          {c.limitations.map((l, i) => (
            <li key={`l${i}`}>{l}</li>
          ))}
          <li>
            Overall AI confidence: <strong>{c.confidence.overall.toLowerCase()}</strong>. {c.confidence.reason}
          </li>
        </ul>
      </div>

      <div className="sd-rsec" id="review">
        <div className="head">
          <h3>Staff review</h3>
          <Pill kind="rv" value={row.reviewStatus} label={REVIEW_LABEL[row.reviewStatus]} />
        </div>
        {current ? (
          <p style={{ margin: "0 0 10px", fontSize: 14 }}>
            {REVIEW_LABEL[current.status]} by <strong>{current.reviewerName}</strong> ({current.reviewerRole.toLowerCase()}) · {formatDateTime(current.createdAt)}
            {current.notes && <span className="sd-timeline"><span className="note" style={{ display: "block" }}>{current.notes}</span></span>}
          </p>
        ) : (
          <p className="muted" style={{ margin: "0 0 10px" }}>Not yet reviewed by staff.</p>
        )}
        {reviews.filter((r) => r.reportId === row.id && r.supersededAt).length > 0 && (
          <details style={{ marginBottom: 12 }}>
            <summary style={{ cursor: "pointer", fontSize: 14 }}>Earlier reviews of this version</summary>
            <ul className="sd-list" style={{ marginTop: 8 }}>
              {reviews
                .filter((r) => r.reportId === row.id && r.supersededAt)
                .map((r) => (
                  <li key={r.id}>
                    {REVIEW_LABEL[r.status]} by {r.reviewerName} · {formatDateTime(r.createdAt)} · replaced {formatDateTime(r.supersededAt)}
                    {r.notes ? ` · "${r.notes}"` : ""}
                  </li>
                ))}
            </ul>
          </details>
        )}
        {isCurrent && (
          <ReviewForm
            key={row.id}
            action={reviewAction}
            reference={d.request.reference}
            reportId={row.id}
            expectedStatus={row.reviewStatus}
            mode={canReview ? "review" : canSupersede ? "supersede" : "none"}
            defaults={{ summary: c.issueSummary, urgency: c.urgency.level, urgencyReason: c.urgency.reason }}
          />
        )}
      </div>
    </>
  );
}

// ─── Versions ───────────────────────────────────────────────────────────────
export function Versions({ d, shown }: { d: RequestDetail; shown: number | null }) {
  if (d.reports.length === 0) return null;
  const rows = [...d.reports].sort((a, b) => b.version - a.version);
  return (
    <section className="sd-panel" aria-labelledby="h-versions">
      <header>
        <h2 id="h-versions">Report versions</h2>
        <span className="eyebrow">{rows.length} generated · originals are never changed</span>
      </header>
      <div style={{ overflowX: "auto" }}>
        <table className="sd-versions">
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col">Generated</th>
              <th scope="col">Result</th>
              <th scope="col">Review</th>
              <th scope="col">Pipeline</th>
              <th scope="col">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} aria-current={r.version === shown ? "true" : undefined}>
                <td>
                  <strong>v{r.version}</strong> {r.supersededAt ? <span className="muted">replaced</span> : <span style={{ color: "var(--sd-brand-ink)", fontWeight: 600 }}>current</span>}
                </td>
                <td>{formatDateTime(r.generatedAt)}</td>
                <td>{r.processingStatus === "PARTIAL" ? "Partial" : "Complete"}</td>
                <td>
                  <Pill kind="rv" value={r.reviewStatus} label={REVIEW_LABEL[r.reviewStatus]} />
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>
                  {r.pipelineVersion} · {r.promptVersion} · {r.schemaVersion}
                </td>
                <td>{r.version === shown ? <span className="muted">Shown</span> : <Link href={`/admin/service/${d.request.reference}?version=${r.version}#ai-report`}>View</Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── History ────────────────────────────────────────────────────────────────
export function History({ d }: { d: RequestDetail }) {
  const items = [...d.history].reverse();
  return (
    <section className="sd-panel" aria-labelledby="h-history">
      <header>
        <h2 id="h-history">Status history</h2>
        <span className="eyebrow">Append-only</span>
      </header>
      <div className="body">
        <ol className="sd-timeline">
          {items.map((h) => (
            <li key={h.id}>
              <div className="t">
                {h.fromStatus ? (
                  <>
                    {STATUS_LABEL[h.fromStatus]} → {STATUS_LABEL[h.toStatus]}
                  </>
                ) : (
                  <>Request {STATUS_LABEL[h.toStatus].toLowerCase()}</>
                )}
              </div>
              <div className="by">
                <time dateTime={h.changedAt}>{formatDateTime(h.changedAt)}</time> ·{" "}
                {h.actorName ? (
                  <>
                    {h.actorName}{" "}
                    <span className="muted">({h.actorRole?.toLowerCase()})</span>
                  </>
                ) : h.changedBy === "customer" ? (
                  "Customer (web form)"
                ) : (
                  h.changedBy
                )}
              </div>
              {h.note && <div className="note">{h.note}</div>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
