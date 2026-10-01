"use client";

// Shown after the service request has been created and its files are being
// uploaded. The request already exists — the reference is shown first so the
// customer never wonders whether it was received — and each file uploads,
// retries or is removed on its own. Nothing here can create a second request.
import type { Ref } from "react";
import { MEDIA_KIND_LABEL, formatBytes } from "@/lib/service-call/media";
import type { UploadState } from "@/lib/service-call/upload-session";
import type { ServiceMedia, ServiceMediaKind, ServiceRequestReceipt } from "@/lib/service-call/types";
import { Icon } from "../icons";
import MediaUploader from "../MediaUploader";

export interface UploadRow {
  id: string;
  kind: ServiceMediaKind;
  fileName: string;
  sizeBytes: number;
  state: UploadState;
  progress: number;
  error?: string;
  /** False when the file was lost (page refreshed) and must be added again. */
  hasFile: boolean;
  /** Retrying can't help (rejected type/size, or the upload window closed). */
  retryable: boolean;
  previewUrl?: string;
}

const STATE_LABEL: Record<UploadState, string> = {
  LOCAL: "Ready",
  WAITING: "Waiting…",
  UPLOADING: "Uploading",
  UPLOADED: "Uploaded",
  FAILED: "Not uploaded",
  REMOVED: "Removed",
};

export default function UploadStep({
  receipt,
  rows,
  headingRef,
  recovered,
  existingCount,
  onRetry,
  onRetryAll,
  onRemove,
  onAddMedia,
  onFinish,
}: {
  receipt: ServiceRequestReceipt;
  rows: UploadRow[];
  headingRef: Ref<HTMLHeadingElement>;
  /** The page was refreshed mid-upload. */
  recovered: boolean;
  /** Photos/videos already on the request (for the add-more limit). */
  existingCount: number;
  onRetry: (id: string) => void;
  onRetryAll: () => void;
  onRemove: (id: string) => void;
  onAddMedia: (items: ServiceMedia[]) => void;
  onFinish: () => void;
}) {
  const visible = rows.filter((r) => r.state !== "REMOVED");
  const active = visible.some((r) => r.state === "WAITING" || r.state === "UPLOADING");
  const failed = visible.filter((r) => r.state === "FAILED");
  const uploaded = visible.filter((r) => r.state === "UPLOADED").length;
  const overall = visible.length ? visible.reduce((sum, r) => sum + (r.state === "UPLOADED" ? 1 : r.progress), 0) / visible.length : 1;

  const title = active ? "Uploading your files" : failed.length ? "Some files didn't upload" : "Your files are uploaded";

  return (
    <div>
      <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-[#007969]/25 bg-[#f0fdf4] px-4 py-4">
        <span className="mt-0.5 flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-full bg-[#007969] text-white">
          <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
        <p className="text-sm text-[#1c1c1e] leading-relaxed">
          <span className="font-semibold">Your service request has been received.</span> Reference{" "}
          <span className="font-semibold tabular-nums text-[#007969]">{receipt.reference}</span>
          {active ? " — now sending your photos and videos. Please keep this page open." : "."}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-label text-[#007969] mb-2">Evidence</p>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl md:text-3xl font-semibold text-[#1c1c1e] outline-none">
          {title}
        </h2>
        {recovered && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#6b7280] max-w-xl">
            The page was reloaded, so files that hadn&apos;t finished uploading need to be added again. Your request and
            anything already uploaded are safe.
          </p>
        )}
      </div>

      {visible.length > 0 && (
        <>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-[#3a3a3c]">
              {uploaded} of {visible.length} uploaded
            </span>
            <span className="text-[#6b7280] tabular-nums">{Math.round(overall * 100)}%</span>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <div className="h-full rounded-full bg-[#007969] transition-[width] duration-300" style={{ width: `${Math.round(overall * 100)}%` }} />
          </div>

          <ul className="space-y-3" aria-label="Files">
            {visible.map((r) => (
              <UploadRowItem key={r.id} row={r} onRetry={() => onRetry(r.id)} onRemove={() => onRemove(r.id)} />
            ))}
          </ul>
        </>
      )}

      {recovered && !active && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="mb-3 text-sm font-semibold text-[#1c1c1e]">Add photos or videos again</p>
          <MediaUploader media={[]} existingCount={existingCount} onAdd={onAddMedia} onRemove={() => {}} showList={false} />
        </div>
      )}

      {failed.length > 0 && !active && (
        <p role="alert" className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Icon name="alert" className="mt-0.5 w-4 h-4 flex-shrink-0" />
          <span>
            {failed.length === 1 ? "One file wasn't uploaded." : `${failed.length} files weren't uploaded.`} Try again, remove
            {failed.length === 1 ? " it" : " them"}, or finish without {failed.length === 1 ? "it" : "them"} — your request{" "}
            {receipt.reference} is already with our service team.
          </span>
        </p>
      )}

      <div className="mt-8 md:mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        {failed.some((r) => r.retryable && r.hasFile) && !active && (
          <button
            type="button"
            onClick={onRetryAll}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none border border-[#007969] px-6 font-accent text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[#007969] hover:bg-[#f0fdf4]"
          >
            Retry failed uploads
          </button>
        )}
        <button type="button" onClick={onFinish} disabled={active} className="btn-brand min-h-12 w-full sm:w-auto sm:ml-auto disabled:opacity-50">
          {active ? "Uploading…" : failed.length ? "Finish without them" : "Finish"}
          {!active && <Icon name="arrowRight" className="w-4 h-4" strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}

function UploadRowItem({ row, onRetry, onRemove }: { row: UploadRow; onRetry: () => void; onRemove: () => void }) {
  const icon = row.kind === "video" ? "video" : row.kind === "voice-note" ? "mic" : "camera";
  const failed = row.state === "FAILED";
  return (
    <li className={`flex items-center gap-3 rounded-xl border bg-white p-3 ${failed ? "border-amber-300" : "border-gray-200"}`}>
      <div className="relative flex w-14 h-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f8f9fa] text-[#007969]">
        {row.previewUrl && row.kind === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL
          <img src={row.previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name={icon} className="w-6 h-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.875rem] font-medium text-[#1c1c1e]" title={row.fileName}>
          {row.fileName}
        </p>
        <p className="text-[0.75rem] text-[#6b7280]">
          {MEDIA_KIND_LABEL[row.kind]} · {formatBytes(row.sizeBytes)} ·{" "}
          <span className={failed ? "font-semibold text-amber-800" : row.state === "UPLOADED" ? "font-semibold text-[#007969]" : ""}>
            {STATE_LABEL[row.state]}
            {row.state === "UPLOADING" ? ` ${Math.round(row.progress * 100)}%` : ""}
          </span>
        </p>
        {row.state === "UPLOADING" && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <div className="h-full rounded-full bg-[#007969] transition-[width] duration-200" style={{ width: `${Math.round(row.progress * 100)}%` }} />
          </div>
        )}
        {failed && row.error && <p className="mt-1 text-[0.75rem] text-amber-800">{row.error}</p>}
      </div>

      <div className="flex flex-shrink-0 items-center">
        {failed && row.retryable && row.hasFile && (
          <button
            type="button"
            onClick={onRetry}
            aria-label={`Retry ${row.fileName}`}
            className="min-h-11 px-3 font-accent text-[0.75rem] font-semibold uppercase tracking-widest text-[#007969] hover:underline"
          >
            Retry
          </button>
        )}
        {row.state === "UPLOADED" && <Icon name="check" className="mx-2 w-5 h-5 text-[#007969]" strokeWidth={2.5} />}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${row.fileName}`}
          className="flex w-11 h-11 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f8f9fa] hover:text-red-600"
        >
          <Icon name="close" className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
