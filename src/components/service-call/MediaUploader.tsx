"use client";

// Photo and video capture/upload for the Evidence step.
//
// "Take photo" / "Record video" use <input capture="environment">, which opens
// the rear camera directly on phones and falls back to a file picker on
// desktop. Files stay in memory as object URLs in Phase 1.
import { useRef, useState } from "react";
import { MEDIA_LIMITS } from "@/lib/service-call/config";
import { createMedia, mediaKindOf } from "@/lib/service-call/media";
import type { ServiceMedia, ServiceMediaSource } from "@/lib/service-call/types";
import { validateMediaFile } from "@/lib/service-call/validation";
import MediaActionButton from "./MediaActionButton";
import MediaPreviewCard from "./MediaPreviewCard";

type Picker = "photo-camera" | "video-camera" | "photo-upload" | "video-upload";

const PICKERS: Record<Picker, { accept: string; capture?: "environment"; multiple?: boolean; source: ServiceMediaSource }> = {
  "photo-camera": { accept: MEDIA_LIMITS.photoAccept, capture: "environment", source: "camera" },
  "video-camera": { accept: MEDIA_LIMITS.videoAccept, capture: "environment", source: "camera" },
  "photo-upload": { accept: MEDIA_LIMITS.photoAccept, multiple: true, source: "upload" },
  "video-upload": { accept: MEDIA_LIMITS.videoAccept, multiple: true, source: "upload" },
};

export default function MediaUploader({
  media,
  onAdd,
  onRemove,
}: {
  media: ServiceMedia[];
  onAdd: (items: ServiceMedia[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputs = useRef<Partial<Record<Picker, HTMLInputElement | null>>>({});
  const [problems, setProblems] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const remaining = MEDIA_LIMITS.maxItems - media.length;
  const full = remaining <= 0;

  function handle(picker: Picker, list: FileList | null) {
    if (!list?.length) return;
    const issues: string[] = [];
    const added: ServiceMedia[] = [];
    for (const file of Array.from(list)) {
      const kind = mediaKindOf(file) ?? (picker.startsWith("photo") ? "photo" : "video");
      const error = validateMediaFile(file, kind);
      if (error) {
        issues.push(`${file.name}: ${error}`);
        continue;
      }
      if (added.length >= remaining) {
        issues.push(`You can add up to ${MEDIA_LIMITS.maxItems} photos and videos — ${file.name} wasn't added.`);
        continue;
      }
      added.push(createMedia(file, kind, PICKERS[picker].source));
    }
    if (added.length) {
      onAdd(added);
      const photos = added.filter((m) => m.kind === "photo").length;
      const videos = added.length - photos;
      setAnnouncement(
        [photos && `${photos} photo${photos > 1 ? "s" : ""}`, videos && `${videos} video${videos > 1 ? "s" : ""}`]
          .filter(Boolean)
          .join(" and ") + " added.",
      );
    }
    setProblems(issues);
  }

  const open = (p: Picker) => inputs.current[p]?.click();

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <MediaActionButton icon="camera" label="Take photo" description="Opens your camera" onClick={() => open("photo-camera")} disabled={full} />
        <MediaActionButton icon="video" label="Record video" description="Show it moving — 30 seconds is plenty" onClick={() => open("video-camera")} disabled={full} />
        <MediaActionButton icon="upload" label="Upload photos" description="From your gallery or files" onClick={() => open("photo-upload")} disabled={full} variant="secondary" />
        <MediaActionButton icon="upload" label="Upload video" description="From your gallery or files" onClick={() => open("video-upload")} disabled={full} variant="secondary" />
      </div>

      {(Object.keys(PICKERS) as Picker[]).map((p) => (
        <input
          key={p}
          ref={(el) => {
            inputs.current[p] = el;
          }}
          type="file"
          accept={PICKERS[p].accept}
          capture={PICKERS[p].capture}
          multiple={PICKERS[p].multiple}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            handle(p, e.target.files);
            e.target.value = ""; // allow the same file to be picked again after removal
          }}
        />
      ))}

      {problems.length > 0 && (
        <ul role="alert" className="mt-4 space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      {media.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 flex items-baseline justify-between text-sm">
            <span className="font-semibold text-[#1c1c1e]">Added</span>
            <span className="text-[#6b7280]">
              {media.length} of {MEDIA_LIMITS.maxItems}
            </span>
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <MediaPreviewCard
                key={m.id}
                media={m}
                onRemove={() => {
                  onRemove(m.id);
                  setAnnouncement(`${m.fileName} removed.`);
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
