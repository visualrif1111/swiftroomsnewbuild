// After a refresh mid-upload, files that hadn't finished are listed as "lost"
// (the browser no longer has them) and the customer is asked to add them again.
// When they do, the new file replaces the lost entry instead of sitting next to
// it — otherwise the confirmation counts the same photo as both received and
// missing.
//
// A re-added file replaces a lost entry only when kind, file name AND exact
// byte size all match, and each lost entry is replaced at most once. Anything
// that doesn't match stays reported as missing. Rejected files (bad content,
// too large) are never "lost", so they are never replaced here.
//
// Only type imports: kept pure so it can be unit-tested with `node --test`.
import type { ServiceMediaKind } from "./types";

export interface RecoverableEntry {
  id: string;
  kind: ServiceMediaKind;
  fileName: string;
  sizeBytes: number;
  state: string;
  /** Interrupted by a refresh and waiting to be added again. */
  lost?: boolean;
}

export interface AddedFile {
  id: string;
  kind: ServiceMediaKind;
  fileName: string;
  sizeBytes: number;
}

/** Maps each added file's id to the id of the lost entry it replaces. */
export function matchLostEntries(entries: RecoverableEntry[], added: AddedFile[]): Map<string, string> {
  const available = entries.filter((e) => e.lost && e.state === "FAILED");
  const replaced = new Map<string, string>();
  for (const file of added) {
    const i = available.findIndex((e) => e.kind === file.kind && e.fileName === file.fileName && e.sizeBytes === file.sizeBytes);
    if (i === -1) continue;
    replaced.set(file.id, available[i].id);
    available.splice(i, 1);
  }
  return replaced;
}
