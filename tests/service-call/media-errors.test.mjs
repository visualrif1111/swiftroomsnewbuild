// Run with `npm test` (Node's built-in runner; imports the TypeScript source directly).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GENERIC_MEDIA_REJECTION,
  MEDIA_FAILURE_MESSAGES,
  describeMediaRejection,
  mediaFailureMessage,
} from "../../src/lib/service-call/media-errors.ts";

test("known failure codes map to plain language", () => {
  assert.equal(
    mediaFailureMessage("content_does_not_match_type"),
    "This file does not appear to match its file type. Please choose another file.",
  );
  for (const code of ["content_does_not_match_type", "file_too_large", "empty_file"]) {
    const message = mediaFailureMessage(code);
    assert.equal(message, MEDIA_FAILURE_MESSAGES[code]);
    assert.ok(!message.includes("_"), `no raw code in: ${message}`);
  }
});

test("unknown, empty and prototype-like codes fall back to the generic message", () => {
  for (const code of ["something_new", "", null, undefined, "toString", "__proto__"]) {
    assert.equal(mediaFailureMessage(code), GENERIC_MEDIA_REJECTION);
  }
});

test("media_rejected response: friendly message, internal code kept", () => {
  const r = describeMediaRejection({ error: "media_rejected", message: "This file couldn't be accepted.", fields: { file: "content_does_not_match_type" } });
  assert.equal(r.message, MEDIA_FAILURE_MESSAGES.content_does_not_match_type);
  assert.equal(r.code, "content_does_not_match_type");
});

test("media_rejected with an unknown reason never shows the code", () => {
  const r = describeMediaRejection({ error: "media_rejected", fields: { file: "storage_backend_exploded" } });
  assert.equal(r.message, GENERIC_MEDIA_REJECTION);
  assert.equal(r.code, "storage_backend_exploded");
});

test("validation_failed shows customer-facing size/type text only", () => {
  assert.equal(
    describeMediaRejection({ error: "validation_failed", fields: { size: "The file is over 25 MB." } }).message,
    "The file is over 25 MB.",
  );
  assert.equal(
    describeMediaRejection({ error: "validation_failed", fields: { clientMediaId: "Expected a UUID." } }).message,
    GENERIC_MEDIA_REJECTION,
  );
});

test("missing or malformed bodies are safe", () => {
  assert.equal(describeMediaRejection(null).message, GENERIC_MEDIA_REJECTION);
  assert.equal(describeMediaRejection({}).message, GENERIC_MEDIA_REJECTION);
});
