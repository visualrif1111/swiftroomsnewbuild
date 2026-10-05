"use client";

// Uploads a submitted request's photos, videos and voice note, one record per
// file, through getServiceRequestClient(). Owns per-file state (WAITING →
// UPLOADING → UPLOADED | FAILED, or REMOVED), retries, removal and recovery
// after a refresh. The request itself already exists: nothing here can create
// or re-create it.
import { useCallback, useEffect, useRef, useState } from "react";
import { getServiceRequestClient } from "@/lib/service-call/client";
import {
  clearUploadSession,
  saveUploadSession,
  type StoredUploadItem,
  type UploadSession,
  type UploadState,
} from "@/lib/service-call/upload-session";
import { MediaUploadError, type ServiceMedia, type ServiceRequestReceipt } from "@/lib/service-call/types";
import { mediaFailureMessage } from "@/lib/service-call/media-errors";
import { matchLostEntries } from "@/lib/service-call/upload-recovery";
import type { UploadRow } from "./steps/UploadStep";

const CONCURRENCY = 2;

interface Entry extends StoredUploadItem {
  progress: number;
  error?: string;
  retryable: boolean;
  /** The file is still in memory (false after a refresh). */
  hasFile: boolean;
  previewUrl?: string;
  /** Interrupted by a refresh; replaced when the customer adds the same file again. */
  lost?: boolean;
}

const errorText = (err: unknown) => {
  if (!(err instanceof MediaUploadError)) return { message: "Something went wrong — try again.", retryable: true };
  switch (err.kind) {
    case "rejected":
      return { message: err.message, retryable: false };
    case "expired":
      return { message: "The time for adding files has passed. Our team will contact you about any photos you still need to send.", retryable: false };
    case "limit":
      return { message: "This request already has the maximum number of files.", retryable: false };
    case "network":
      return { message: "The connection dropped — check your signal and retry.", retryable: true };
    default:
      return { message: "We couldn't upload this file — try again.", retryable: true };
  }
};

export function useMediaUploads() {
  const [receipt, setReceipt] = useState<ServiceRequestReceipt | null>(null);
  const [firstName, setFirstName] = useState("");
  const [order, setOrder] = useState<string[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [recovered, setRecovered] = useState(false);

  // Mirrors for async work (avoid stale closures).
  const entriesRef = useRef(entries);
  const receiptRef = useRef(receipt);
  const files = useRef(new Map<string, ServiceMedia>());
  const controllers = useRef(new Map<string, AbortController>());
  const running = useRef(new Set<string>());
  // The queue re-runs itself when an upload settles; called through a ref so
  // the callback doesn't reference itself.
  const pumpRef = useRef<() => void>(() => {});

  // Entries are updated in the ref first (synchronously, so the queue sees
  // them at once), then mirrored into state for rendering.
  const commit = useCallback((next: Record<string, Entry>) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  const patch = useCallback(
    (id: string, p: Partial<Entry>) => {
      const prev = entriesRef.current;
      if (!prev[id]) return;
      commit({ ...prev, [id]: { ...prev[id], ...p } });
    },
    [commit],
  );

  // Persist after every change so a refresh can recover (progress isn't stored).
  useEffect(() => {
    if (!receipt) return;
    const items = order
      .map((id) => entries[id])
      .filter(Boolean)
      .map(({ id, kind, fileName, sizeBytes, state, mediaId }) => ({ id, kind, fileName, sizeBytes, state, mediaId }));
    saveUploadSession({ receipt, firstName, items } satisfies UploadSession);
  }, [receipt, firstName, order, entries]);

  const pump = useCallback(() => {
    const r = receiptRef.current;
    if (!r) return;
    const waiting = Object.values(entriesRef.current).filter((e) => e.state === "WAITING" && !running.current.has(e.id));
    for (const e of waiting) {
      if (running.current.size >= CONCURRENCY) break;
      const media = files.current.get(e.id);
      if (!media) {
        patch(e.id, { state: "FAILED", error: "This file needs to be added again.", retryable: false });
        continue;
      }
      running.current.add(e.id);
      const controller = new AbortController();
      controllers.current.set(e.id, controller);
      patch(e.id, { state: "UPLOADING", progress: 0, error: undefined });
      getServiceRequestClient()
        .uploadMedia(r, media, {
          signal: controller.signal,
          onRegistered: (mediaId) => patch(e.id, { mediaId }),
          onProgress: (progress) => patch(e.id, { progress }),
        })
        .then(({ mediaId }) => patch(e.id, { state: "UPLOADED", progress: 1, mediaId }))
        .catch((err) => {
          if (controller.signal.aborted) return; // removed while uploading
          const { message, retryable } = errorText(err);
          patch(e.id, { state: "FAILED", error: message, retryable });
        })
        .finally(() => {
          running.current.delete(e.id);
          controllers.current.delete(e.id);
          pumpRef.current();
        });
    }
  }, [patch]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const add = useCallback(
    (items: ServiceMedia[]) => {
      if (!items.length) return;
      for (const m of items) files.current.set(m.id, m);
      // A file added again after a refresh takes the place of its lost entry.
      const replaces = matchLostEntries(Object.values(entriesRef.current), items);
      const replacedBy = new Map([...replaces].map(([newId, oldId]) => [oldId, newId]));
      setOrder((o) => [
        ...o.map((id) => replacedBy.get(id) ?? id),
        ...items.filter((m) => !replaces.has(m.id)).map((m) => m.id),
      ]);
      {
        const next = { ...entriesRef.current };
        for (const oldId of replacedBy.keys()) next[oldId] = { ...next[oldId], state: "REMOVED", lost: false };
        for (const m of items) {
          next[m.id] = {
            id: m.id,
            kind: m.kind,
            fileName: m.fileName,
            sizeBytes: m.sizeBytes,
            state: "WAITING",
            progress: 0,
            retryable: true,
            hasFile: true,
            previewUrl: m.previewUrl,
          };
        }
        commit(next);
      }
      pump();
    },
    [pump, commit],
  );

  /** Starts uploading a just-created request's files. */
  const begin = useCallback(
    (r: ServiceRequestReceipt, name: string, items: ServiceMedia[]) => {
      receiptRef.current = r;
      setReceipt(r);
      setFirstName(name);
      setRecovered(false);
      add(items);
    },
    [add],
  );

  /**
   * After a refresh: files that were uploaded stay uploaded (checked with the
   * server); the rest were lost with the page and must be added again. Their
   * half-finished server records are removed.
   */
  const restore = useCallback(async (session: UploadSession) => {
    receiptRef.current = session.receipt;
    setReceipt(session.receipt);
    setFirstName(session.firstName);
    setRecovered(true);
    let server: Awaited<ReturnType<ReturnType<typeof getServiceRequestClient>["listMedia"]>> = [];
    try {
      server = await getServiceRequestClient().listMedia(session.receipt);
    } catch {
      // Upload window closed or offline: show what we remember.
    }
    const byClientId = new Map(server.map((m) => [m.clientMediaId, m]));
    const next: Record<string, Entry> = {};
    for (const item of session.items) {
      if (item.state === "REMOVED") continue;
      const known = byClientId.get(item.id);
      if (known?.status === "UPLOADED") {
        next[item.id] = { ...item, state: "UPLOADED", mediaId: known.mediaId, progress: 1, retryable: false, hasFile: false };
      } else if (known?.status === "FAILED") {
        // Rejected by the server (e.g. wrong content): still missing, but adding it again won't help.
        next[item.id] = { ...item, state: "FAILED", progress: 0, error: mediaFailureMessage(known.failureReason), retryable: false, hasFile: false };
      } else {
        next[item.id] = { ...item, state: "FAILED", progress: 0, error: "Not uploaded before the page reloaded — add it again below.", retryable: false, hasFile: false, lost: true };
      }
    }
    commit(next);
    setOrder(Object.keys(next));
    for (const m of server) {
      if (m.status !== "UPLOADED") getServiceRequestClient().removeMedia(session.receipt, m.mediaId).catch(() => {});
    }
  }, [commit]);

  const retry = useCallback(
    (id: string) => {
      patch(id, { state: "WAITING", progress: 0, error: undefined });
      pump();
    },
    [patch, pump],
  );

  const retryAll = useCallback(() => {
    for (const e of Object.values(entriesRef.current)) {
      if (e.state === "FAILED" && e.retryable && files.current.has(e.id)) patch(e.id, { state: "WAITING", progress: 0, error: undefined });
    }
    pump();
  }, [patch, pump]);

  const remove = useCallback(
    async (id: string) => {
      const entry = entriesRef.current[id];
      const r = receiptRef.current;
      if (!entry || !r) return;
      const previous = entry.state;
      controllers.current.get(id)?.abort();
      patch(id, { state: "REMOVED" });
      if (entry.mediaId) {
        try {
          await getServiceRequestClient().removeMedia(r, entry.mediaId);
        } catch {
          // Keep it visible so the customer knows it's still attached.
          patch(id, { state: previous === "UPLOADING" ? "FAILED" : previous, error: "We couldn't remove this file — try again." });
          return;
        }
      }
      files.current.delete(id);
      patch(id, { hasFile: false });
    },
    [patch],
  );

  /** Ends the upload stage. Returns how many files made it. */
  const finish = useCallback(() => {
    const all = Object.values(entriesRef.current);
    const summary = {
      uploaded: all.filter((e) => e.state === "UPLOADED").length,
      notUploaded: all.filter((e) => e.state === "FAILED" || e.state === "WAITING").length,
    };
    clearUploadSession();
    return summary;
  }, []);

  const reset = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    running.current.clear();
    files.current.clear();
    receiptRef.current = null;
    commit({});
    setOrder([]);
    setReceipt(null);
    setRecovered(false);
    clearUploadSession();
  }, [commit]);

  const rows: UploadRow[] = order
    .map((id) => entries[id])
    .filter(Boolean)
    .map((e) => ({
      id: e.id,
      kind: e.kind,
      fileName: e.fileName,
      sizeBytes: e.sizeBytes,
      state: e.state as UploadState,
      progress: e.progress,
      error: e.error,
      hasFile: e.hasFile,
      retryable: e.retryable,
      previewUrl: e.previewUrl,
    }));

  /** Photos/videos counting towards the per-request limit (uploaded or still to go). */
  const visualCount = rows.filter((r) => r.kind !== "voice-note" && r.state !== "REMOVED" && (r.hasFile || r.state === "UPLOADED")).length;

  return { receipt, firstName, rows, recovered, visualCount, begin, restore, add, retry, retryAll, remove, finish, reset };
}
