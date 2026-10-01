"use client";

import { useState } from "react";
import { MEDIA_KIND_LABEL, formatBytes } from "@/lib/service-call/media";
import type { ServiceMedia } from "@/lib/service-call/types";
import { Icon } from "./icons";

/** Thumbnail, type, filename and (optionally) a remove action for one media item. */
export default function MediaPreviewCard({ media, onRemove }: { media: ServiceMedia; onRemove?: () => void }) {
  // HEIC and some camera formats can't be drawn by every browser — show an icon instead.
  const [broken, setBroken] = useState(false);
  const isVideo = media.kind === "video";

  return (
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-[4/3] bg-[#f8f9fa]">
        {media.previewUrl && !broken ? (
          isVideo ? (
            <video
              src={`${media.previewUrl}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
              aria-hidden="true"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL, not optimisable
            <img src={media.previewUrl} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-[#007969]">
            <Icon name={isVideo ? "video" : "camera"} className="w-8 h-8" />
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#1c1c1e]/75 px-2 py-1 font-accent text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white">
          <Icon name={isVideo ? "video" : "camera"} className="w-3.5 h-3.5" strokeWidth={2} />
          {MEDIA_KIND_LABEL[media.kind]}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${MEDIA_KIND_LABEL[media.kind].toLowerCase()} ${media.fileName}`}
            className="absolute right-1 top-1 flex w-11 h-11 items-center justify-center"
          >
            <span className="flex w-8 h-8 items-center justify-center rounded-full bg-white text-[#1c1c1e] shadow-md hover:text-red-600">
              <Icon name="close" className="w-4 h-4" strokeWidth={2} />
            </span>
          </button>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-[0.8125rem] font-medium text-[#1c1c1e]" title={media.fileName}>
          {media.fileName}
        </p>
        <p className="text-[0.75rem] text-[#6b7280]">
          {formatBytes(media.sizeBytes)}
          {media.source === "camera" ? " · taken now" : ""}
        </p>
      </div>
    </li>
  );
}
