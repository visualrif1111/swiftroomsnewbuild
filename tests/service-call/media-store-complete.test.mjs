// Run with `npm test`. Exercises mediaStore.complete() against a stubbed
// Supabase (fetch is replaced), so no network or database is touched.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_URL = "https://stub.supabase.test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "stub-service-role-key";
const { mediaStore } = await import("../../src/lib/service-call/server/media-store.ts");

const PATH = "service-requests/2026/SR-2026-00001/0b6f6c1e-8a43-4d5e-9b51-1f2a3c4d5e6f.jpg";
const record = (over = {}) => ({
  id: "0b6f6c1e-8a43-4d5e-9b51-1f2a3c4d5e6f",
  serviceRequestId: "11111111-2222-4333-8444-555555555555",
  clientMediaId: "66666666-7777-4888-9999-aaaaaaaaaaaa",
  mediaType: "PHOTO",
  mimeType: "image/jpeg",
  originalFilename: "photo.jpg",
  declaredSize: 10,
  fileSize: null,
  storagePath: PATH,
  uploadStatus: "PENDING",
  failureReason: null,
  uploadedAt: null,
  durationSeconds: null,
  createdAt: "2026-10-05T00:00:00Z",
  ...over,
});
// What the RPCs return: the row as PostgREST would after the update.
const row = (status, extra = {}) => ({
  id: record().id, service_request_id: record().serviceRequestId, client_media_id: record().clientMediaId,
  media_type: "PHOTO", mime_type: "image/jpeg", original_filename: "photo.jpg", declared_size: 10,
  file_size: null, storage_path: PATH, upload_status: status, failure_reason: null, uploaded_at: null,
  duration_seconds: null, created_at: "2026-10-05T00:00:00Z", ...extra,
});

let calls;
/** Stubs fetch: `read` answers the 64-byte storage read; RPCs and deletes answer like Supabase. */
function stubSupabase(read) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method: init.method ?? "GET", path: u.pathname, body });
    if (u.pathname.startsWith("/storage/v1/object/authenticated/")) return read();
    if (u.pathname === "/storage/v1/object/service-evidence" && init.method === "DELETE") return Response.json([]);
    if (u.pathname === "/rest/v1/rpc/mark_service_media_failed") return Response.json([row("FAILED", { failure_reason: body.p_reason })]);
    if (u.pathname === "/rest/v1/rpc/mark_service_media_uploaded") return Response.json([row("UPLOADED", { file_size: body.p_file_size })]);
    throw new Error(`unexpected call ${init.method} ${u.pathname}`);
  };
}
const called = (path) => calls.filter((c) => c.path === path);
const JPEG_HEAD = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(60).fill(0)]);

beforeEach(() => { calls = []; });

test("declared non-zero, stored 0 bytes (Storage answers 416) → rejected as empty_file, not a server error", async () => {
  stubSupabase(() => new Response(null, { status: 416, headers: { "content-range": "bytes */0" } }));
  const { record: updated, outcome } = await mediaStore.complete(record({ declaredSize: 10 }));
  assert.equal(outcome, "rejected");
  assert.equal(updated.failureReason, "empty_file");
  assert.equal(updated.uploadStatus, "FAILED", "the row must not stay PENDING");
});

test("empty object is deleted from storage and the row marked FAILED/empty_file", async () => {
  stubSupabase(() => new Response(null, { status: 416 }));
  await mediaStore.complete(record());
  const deletes = calls.filter((c) => c.method === "DELETE" && c.path === "/storage/v1/object/service-evidence");
  assert.deepEqual(deletes.map((d) => d.body), [{ prefixes: [PATH] }]);
  assert.deepEqual(called("/rest/v1/rpc/mark_service_media_failed").map((c) => c.body), [{ p_media_id: record().id, p_reason: "empty_file" }]);
  assert.equal(called("/rest/v1/rpc/mark_service_media_uploaded").length, 0);
  // Only media calls: the parent service request is never touched.
  assert.ok(calls.every((c) => !c.path.includes("service_requests")));
});

test("a valid upload still completes normally with its real size", async () => {
  stubSupabase(() => new Response(JPEG_HEAD, { status: 206, headers: { "content-range": "bytes 0-63/95042" } }));
  const { record: updated, outcome } = await mediaStore.complete(record({ declaredSize: 95042 }));
  assert.equal(outcome, "uploaded");
  assert.equal(updated.uploadStatus, "UPLOADED");
  assert.deepEqual(called("/rest/v1/rpc/mark_service_media_uploaded").map((c) => c.body), [{ p_media_id: record().id, p_file_size: 95042 }]);
  assert.equal(calls.filter((c) => c.method === "DELETE").length, 0, "a valid upload is never deleted");
});

test("a small file read in full (200, no content-range) still completes", async () => {
  stubSupabase(() => new Response(JPEG_HEAD.slice(0, 20), { status: 200 }));
  const { outcome, record: updated } = await mediaStore.complete(record({ declaredSize: 20 }));
  assert.equal(outcome, "uploaded");
  assert.equal(updated.fileSize, 20);
});

test("object not in storage yet (404) is still 'not uploaded', nothing deleted", async () => {
  stubSupabase(() => new Response(JSON.stringify({ error: "not_found" }), { status: 404 }));
  const { outcome } = await mediaStore.complete(record());
  assert.equal(outcome, "not_uploaded");
  assert.equal(calls.length, 1);
});

test("other storage failures still raise (handled as a generic server error by the route)", async () => {
  stubSupabase(() => new Response("boom", { status: 503 }));
  await assert.rejects(mediaStore.complete(record()), { name: "SupabaseError", status: 503 });
  assert.equal(calls.filter((c) => c.method === "DELETE").length, 0);
});
