"use client";

import type { ReactNode } from "react";
import { SERVICE_PRODUCTS } from "@/lib/service-call/config";
import { formatDuration } from "@/lib/service-call/media";
import type { ServiceRequestDraft } from "@/lib/service-call/types";
import { Icon } from "./icons";
import MediaPreviewCard from "./MediaPreviewCard";

/**
 * Organised read-out of a service request. Used by the Review step (with Edit
 * links); also suitable for a future internal "request detail" view.
 */
export default function ServiceSummary({
  draft,
  onEdit,
}: {
  draft: ServiceRequestDraft;
  /** Called with the step index to return to. Omit for a read-only summary. */
  onEdit?: (step: number) => void;
}) {
  const c = draft.customer;
  const products = draft.productIds
    .map((id) => SERVICE_PRODUCTS.find((p) => p.id === id)?.label ?? id)
    .map((label) => (label === "Other" && draft.otherProduct.trim() ? `Other — ${draft.otherProduct.trim()}` : label));
  const photos = draft.media.filter((m) => m.kind === "photo").length;
  const videos = draft.media.length - photos;

  return (
    <div className="divide-y divide-gray-100 border-y border-gray-100">
      <Section title="Your details" editLabel="your details" onEdit={onEdit && (() => onEdit(0))}>
        <Row label="Name" value={c.fullName} />
        <Row label="Mobile" value={`${c.countryCode} ${c.mobile}`} />
        <Row label="Email" value={c.email} />
        <Row
          label="Existing customer"
          value={c.isExistingCustomer === null ? "Not specified" : c.isExistingCustomer ? "Yes" : "No"}
        />
        {c.reference.trim() && <Row label="Reference" value={c.reference} />}
      </Section>

      <Section title="Property" editLabel="property" onEdit={onEdit && (() => onEdit(0))}>
        <Row label="Location" value={c.location} />
      </Section>

      <Section title="Product" editLabel="product" onEdit={onEdit && (() => onEdit(1))}>
        <Row label="Needs attention" value={products.join(", ") || "—"} />
      </Section>

      <Section title="Problem" editLabel="problem" onEdit={onEdit && (() => onEdit(2))}>
        <Row label="Description" value={draft.description.trim() || "No written description"} multiline />
        <Row
          label="Voice note"
          value={
            draft.voiceNote
              ? `Included${draft.voiceNote.durationSeconds ? ` · ${formatDuration(draft.voiceNote.durationSeconds)}` : ""}`
              : "None"
          }
        />
        {draft.voiceNote?.previewUrl && (
          <audio controls src={draft.voiceNote.previewUrl} preload="metadata" className="mt-2 w-full" aria-label="Play your voice note" />
        )}
      </Section>

      <Section title="Media provided" editLabel="media" onEdit={onEdit && (() => onEdit(3))}>
        {draft.media.length ? (
          <>
            <p className="mb-3 text-sm text-[#3a3a3c]">
              {[photos && `${photos} photo${photos > 1 ? "s" : ""}`, videos && `${videos} video${videos > 1 ? "s" : ""}`]
                .filter(Boolean)
                .join(", ")}
            </p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {draft.media.map((m) => (
                <MediaPreviewCard key={m.id} media={m} />
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-[#6b7280]">No photos or video</p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="py-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-label text-[#007969]">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${editLabel}`}
            className="-my-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-accent text-[0.75rem] font-semibold uppercase tracking-widest text-[#007969] hover:bg-[#f0fdf4]"
          >
            <Icon name="edit" className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[0.8125rem] text-[#6b7280]">{label}</dt>
      <dd className={`text-[0.9375rem] text-[#1c1c1e] break-words ${multiline ? "whitespace-pre-line" : ""}`}>{value}</dd>
    </div>
  );
}
