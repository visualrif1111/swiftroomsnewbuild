import Link from "next/link";
import { requireStaffPage } from "@/lib/service-dashboard/auth/session";
import { listInbox } from "@/lib/service-dashboard/data";
import { inboxHref, parseInboxQuery, PAGE_SIZE } from "@/lib/service-dashboard/inbox-query";
import {
  AI_STATES, AI_STATE_LABEL, PRODUCT_LABEL, REVIEW_LABEL, SERVICE_STATUSES, STATUS_LABEL, URGENCIES, URGENCY_LABEL, productLabel,
} from "@/lib/service-dashboard/labels";
import { formatAge, formatDateTime } from "@/lib/service-dashboard/format";
import { EvidenceCounts, Pill } from "@/components/service-dashboard/bits";

export const metadata = { title: "Service requests" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaffPage();
  const q = parseInboxQuery(await searchParams);
  const { rows, total } = await listInbox(q);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total ? (q.page - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(total, q.page * PAGE_SIZE);
  const filtered = !!(q.search || q.urgency || q.product || q.ai || q.from || q.to || q.status !== "open");

  return (
    <>
      <div className="sd-pagehead">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>
            Service &amp; Aftercare
          </p>
          <h1>Service requests</h1>
          <p>
            {total.toLocaleString("en-GB")} {q.status === "open" ? "open " : ""}
            {total === 1 ? "request" : "requests"}
            {filtered && q.status !== "open" ? " match these filters" : filtered ? " match" : ""}
          </p>
        </div>
      </div>

      <form className="sd-panel sd-filters" method="get" action="/admin/service" role="search" aria-label="Filter service requests">
        <label className="field search">
          Search
          <input type="search" name="q" defaultValue={q.search} placeholder="Reference, name, email or phone" maxLength={100} />
        </label>
        <label className="field">
          Status
          <select name="status" defaultValue={q.status}>
            <option value="open">Open (not resolved/closed)</option>
            <option value="all">All statuses</option>
            {SERVICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Urgency
          <select name="urgency" defaultValue={q.urgency ?? ""}>
            <option value="">Any urgency</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {URGENCY_LABEL[u]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Product
          <select name="product" defaultValue={q.product ?? ""}>
            <option value="">Any product</option>
            {Object.entries(PRODUCT_LABEL).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          AI state
          <select name="ai" defaultValue={q.ai ?? ""}>
            <option value="">Any AI state</option>
            {AI_STATES.map((a) => (
              <option key={a} value={a}>
                {AI_STATE_LABEL[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          From
          <input type="date" name="from" defaultValue={q.from ?? ""} />
        </label>
        <label className="field">
          To
          <input type="date" name="to" defaultValue={q.to ?? ""} />
        </label>
        <label className="field">
          Sort
          <select name="sort" defaultValue={q.sort}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="urgency">Most urgent first</option>
          </select>
        </label>
        <div className="actions">
          <button className="sd-btn" type="submit">
            Apply
          </button>
          {filtered && (
            <Link className="sd-btn ghost" href="/admin/service">
              Reset
            </Link>
          )}
        </div>
      </form>

      <section className="sd-panel sd-table-wrap" aria-label="Service requests">
        {rows.length === 0 ? (
          <div className="sd-empty">
            <p style={{ margin: 0, fontWeight: 600, color: "var(--sd-ink-2)" }}>No service requests match.</p>
            {filtered && <p style={{ margin: "6px 0 0" }}>Try fewer filters, or <Link href="/admin/service?status=all">show all statuses</Link>.</p>}
          </div>
        ) : (
          <table className="sd-table">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Customer</th>
                <th scope="col">Product</th>
                <th scope="col">Issue</th>
                <th scope="col">Evidence</th>
                <th scope="col">Urgency</th>
                <th scope="col">Status</th>
                <th scope="col">AI</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.urgency === "URGENT" ? "urgent" : undefined}>
                  <td className="ref c-ref">
                    <Link href={`/admin/service/${r.reference}`} prefetch={false}>
                      {r.reference}
                    </Link>
                  </td>
                  <td className="cust c-cust">{r.customerName}</td>
                  <td className="c-prod">{r.productCategories.map(productLabel).join(", ")}</td>
                  <td className="c-issue">
                    <span className="issue">{r.issue || <span className="muted">No description</span>}</span>
                  </td>
                  <td className="c-ev">
                    <EvidenceCounts photos={r.photos} videos={r.videos} voice={r.voiceNotes} />
                  </td>
                  <td className="c-urg">
                    <Pill kind="ug" value={r.urgency} label={URGENCY_LABEL[r.urgency as keyof typeof URGENCY_LABEL] ?? r.urgency} />
                  </td>
                  <td className="c-status">
                    <Pill kind="st" value={r.status} label={STATUS_LABEL[r.status]} />
                  </td>
                  <td className="c-ai">
                    <Pill kind="ai" value={r.aiState} label={AI_STATE_LABEL[r.aiState]} />
                    {r.reviewStatus && r.reviewStatus !== "AWAITING_REVIEW" && (
                      <div style={{ marginTop: 4 }}>
                        <Pill kind="rv" value={r.reviewStatus} label={REVIEW_LABEL[r.reviewStatus]} />
                      </div>
                    )}
                  </td>
                  <td className="c-date" title={formatDateTime(r.submittedAt)}>
                    <time dateTime={r.submittedAt}>{formatAge(r.submittedAt)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 0 && (
          <div className="sd-pager">
            <span>
              Showing {first}–{last} of {total.toLocaleString("en-GB")}
            </span>
            <nav aria-label="Pages">
              {q.page > 1 ? (
                <Link className="sd-btn ghost" href={inboxHref(q, { page: String(q.page - 1) })}>
                  ← Previous
                </Link>
              ) : (
                <span className="sd-btn ghost" aria-disabled="true">
                  ← Previous
                </span>
              )}
              <span style={{ alignSelf: "center" }}>
                Page {q.page} of {pages}
              </span>
              {q.page < pages ? (
                <Link className="sd-btn ghost" href={inboxHref(q, { page: String(q.page + 1) })}>
                  Next →
                </Link>
              ) : (
                <span className="sd-btn ghost" aria-disabled="true">
                  Next →
                </span>
              )}
            </nav>
          </div>
        )}
      </section>
    </>
  );
}
