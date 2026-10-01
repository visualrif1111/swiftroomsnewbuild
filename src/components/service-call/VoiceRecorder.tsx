"use client";

// Record or upload a single voice note. Recording uses the browser's
// MediaRecorder; in Phase 1 the audio only ever lives in memory.
import { useEffect, useRef, useState } from "react";
import { MEDIA_LIMITS } from "@/lib/service-call/config";
import { createMedia, formatDuration } from "@/lib/service-call/media";
import type { ServiceMedia } from "@/lib/service-call/types";
import { validateMediaFile } from "@/lib/service-call/validation";
import { Icon } from "./icons";
import MediaActionButton from "./MediaActionButton";

type Status = "idle" | "requesting" | "recording";

const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac"];

export default function VoiceRecorder({
  value,
  onChange,
}: {
  value: ServiceMedia | null;
  onChange: (media: ServiceMedia | null) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const discard = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const stopTracks = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  // Leaving the step mid-recording discards it and releases the microphone.
  useEffect(
    () => () => {
      discard.current = true;
      if (recorder.current?.state === "recording") recorder.current.stop();
      stopTracks();
    },
    [],
  );

  const stop = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  };

  async function start() {
    setMessage("");
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("Voice recording isn't available in this browser. You can upload a voice note instead.");
      return;
    }
    setStatus("requesting");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("idle");
      setMessage("We couldn't use your microphone. Check it's allowed for this site, or upload a voice note instead.");
      return;
    }

    const mimeType = PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stopTracks();
      if (discard.current) return;
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      const ext = /mp4|aac/.test(blob.type) ? "m4a" : "webm";
      const seconds = (Date.now() - startedAt) / 1000;
      onChange(createMedia(blob, "voice-note", "recording", `voice-note.${ext}`, seconds));
      setStatus("idle");
      setAnnouncement(`Voice note saved, ${Math.round(seconds)} seconds.`);
    };
    recorder.current = rec;
    rec.start();
    setElapsed(0);
    setStatus("recording");
    setAnnouncement("Recording started.");
    timer.current = setInterval(() => {
      const secs = (Date.now() - startedAt) / 1000;
      setElapsed(secs);
      if (secs >= MEDIA_LIMITS.maxVoiceNoteSeconds) stop();
    }, 250);
  }

  function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const error = validateMediaFile(file, "voice-note");
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    onChange(createMedia(file, "voice-note", "upload"));
    setAnnouncement("Voice note added.");
  }

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {status === "recording" ? (
        <div className="flex flex-col gap-4 rounded-xl border border-[#007969] bg-[#f0fdf4] p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <span aria-hidden="true" className="relative flex w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex w-3 h-3 rounded-full bg-red-600" />
            </span>
            <span className="font-accent text-sm font-semibold uppercase tracking-[0.12em] text-[#1c1c1e]">Recording</span>
            <span className="ml-auto font-mono text-sm tabular-nums text-[#3a3a3c] sm:ml-2" aria-hidden="true">
              {formatDuration(elapsed)} / {formatDuration(MEDIA_LIMITS.maxVoiceNoteSeconds)}
            </span>
          </div>
          <button type="button" onClick={stop} className="btn-brand min-h-12 w-full sm:w-auto">
            <Icon name="stop" className="w-4 h-4" strokeWidth={2} />
            Stop recording
          </button>
        </div>
      ) : value ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-[#007969]">
              <Icon name="mic" className="w-5 h-5" />
            </span>
            <p className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#1c1c1e]">Voice note</span>
              <span className="block truncate text-[0.8125rem] text-[#6b7280]">
                {value.durationSeconds ? formatDuration(value.durationSeconds) : value.fileName}
                {value.source === "upload" ? " · uploaded" : " · recorded"}
              </span>
            </p>
          </div>
          <audio
            aria-label="Play your voice note" controls src={value.previewUrl} className="mt-3 w-full" preload="metadata" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={start}
              className="min-h-11 rounded-lg px-3 text-[0.75rem] font-semibold uppercase tracking-widest text-[#007969] font-accent hover:bg-[#f0fdf4]"
            >
              Record again
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setAnnouncement("Voice note removed.");
              }}
              className="min-h-11 rounded-lg px-3 text-[0.75rem] font-semibold uppercase tracking-widest text-red-600 font-accent hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <MediaActionButton
            icon="mic"
            label={status === "requesting" ? "Allow microphone…" : "Record voice note"}
            description={`Up to ${MEDIA_LIMITS.maxVoiceNoteSeconds / 60} minutes`}
            onClick={start}
            disabled={status === "requesting"}
            variant="secondary"
          />
          <MediaActionButton
            icon="upload"
            label="Upload voice note"
            description="From your phone or computer"
            onClick={() => fileInput.current?.click()}
            variant="secondary"
          />
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={MEDIA_LIMITS.audioAccept}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      {message && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
