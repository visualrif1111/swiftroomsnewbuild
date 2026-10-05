// Run with `npm test` (Node's built-in runner; imports the TypeScript source directly).
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchLostEntries } from "../../src/lib/service-call/upload-recovery.ts";

const lost = (id, fileName, sizeBytes, kind = "photo") => ({ id, kind, fileName, sizeBytes, state: "FAILED", lost: true });
const file = (id, fileName, sizeBytes, kind = "photo") => ({ id, kind, fileName, sizeBytes });

test("re-added file replaces the matching lost entry", () => {
  const m = matchLostEntries([lost("old-video", "clip.webm", 5373, "video")], [file("new-video", "clip.webm", 5373, "video")]);
  assert.deepEqual([...m], [["new-video", "old-video"]]);
});

test("same name but different size is a different file", () => {
  assert.equal(matchLostEntries([lost("a", "IMG_0001.jpg", 1000)], [file("b", "IMG_0001.jpg", 1001)]).size, 0);
});

test("same name and size but different kind does not match", () => {
  assert.equal(matchLostEntries([lost("a", "x.webm", 10, "video")], [file("b", "x.webm", 10, "voice-note")]).size, 0);
});

test("rejected (not lost) and uploaded entries are never replaced", () => {
  const entries = [
    { id: "rejected", kind: "photo", fileName: "fake.jpg", sizeBytes: 1140, state: "FAILED" },
    { id: "done", kind: "photo", fileName: "ok.jpg", sizeBytes: 50, state: "UPLOADED" },
  ];
  assert.equal(matchLostEntries(entries, [file("n1", "fake.jpg", 1140), file("n2", "ok.jpg", 50)]).size, 0);
});

test("each lost entry is replaced at most once", () => {
  const m = matchLostEntries(
    [lost("a1", "IMG.jpg", 10), lost("a2", "IMG.jpg", 10)],
    [file("b1", "IMG.jpg", 10), file("b2", "IMG.jpg", 10), file("b3", "IMG.jpg", 10)],
  );
  assert.deepEqual([...m], [["b1", "a1"], ["b2", "a2"]]);
});

test("files that match nothing stay as new entries", () => {
  assert.equal(matchLostEntries([lost("a", "door.jpg", 10)], [file("b", "window.jpg", 10)]).size, 0);
});
