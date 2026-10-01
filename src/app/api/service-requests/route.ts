// POST /api/service-requests — create a service & aftercare request.
// Contract: docs/service-aftercare/API.md. Not part of the sales pipeline:
// nothing here notifies WhatsApp/CRM; requests go to the operational database.
import { NextRequest, NextResponse } from "next/server";
import type {
  CreateServiceRequestResponse,
  ServiceRequestErrorCode,
  ServiceRequestErrorResponse,
} from "@/lib/service-call/api-contract";
import { IDEMPOTENCY_HEADER } from "@/lib/service-call/api-contract";
import { getServiceRequestStore, StoreNotConfiguredError } from "@/lib/service-call/server/store";
import { validateCreatePayload } from "@/lib/service-call/server/validate";

const MAX_BODY_BYTES = 16 * 1024; // text fields only — media never comes through here
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

function fail(status: number, error: ServiceRequestErrorCode, message: string, fields?: Record<string, string>) {
  const body: ServiceRequestErrorResponse = fields ? { error, message, fields } : { error, message };
  return NextResponse.json(body, { status, headers: HEADERS });
}

export async function POST(req: NextRequest) {
  const key = req.headers.get(IDEMPOTENCY_HEADER) ?? "";
  if (!UUID.test(key)) return fail(400, "missing_idempotency_key", `Send a UUID in the ${IDEMPOTENCY_HEADER} header.`);
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "unsupported_media_type", "Send the request as application/json.");
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return fail(413, "payload_too_large", "The request is too large. Photos and videos are not sent here.");
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_json", "The request body is not valid JSON.");
  }

  const result = validateCreatePayload(body);
  if (!result.ok) return fail(422, "validation_failed", "Some details need correcting.", result.fields);

  try {
    const store = getServiceRequestStore();
    const created = await store.create(result.value, key.toLowerCase());
    // Proof for the media endpoints that this caller created the request. Only
    // the holder of the (random, unguessable) idempotency key can get one, so a
    // replay may safely issue a fresh token.
    const upload = await store.issueUploadToken(created.id);
    const response: CreateServiceRequestResponse = {
      id: created.id,
      reference: created.reference,
      status: created.status,
      submittedAt: created.createdAt,
      replayed: created.replayed,
      upload,
    };
    return NextResponse.json(response, { status: created.replayed ? 200 : 201, headers: HEADERS });
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) {
      console.error("[service-requests]", err.message);
      return fail(503, "not_configured", "Service requests are temporarily unavailable.");
    }
    console.error("[service-requests] create failed:", err instanceof Error ? err.message : err);
    return fail(500, "server_error", "We couldn't save your request.");
  }
}
