// Small helpers shared by the service-request route handlers.
import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { ServiceRequestErrorCode, ServiceRequestErrorResponse } from "../api-contract";
import { getServiceRequestStore, type AuthorisedRequest } from "./store";
import { StoreNotConfiguredError } from "./supabase";

export const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
export const REFERENCE_PATTERN = /^SR-\d{4}-\d{5,}$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function fail(status: number, error: ServiceRequestErrorCode, message: string, fields?: Record<string, string>) {
  const body: ServiceRequestErrorResponse = fields ? { error, message, fields } : { error, message };
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Maps unexpected errors to 503/500 without leaking details or request data. */
export function serverFailure(scope: string, err: unknown) {
  if (err instanceof StoreNotConfiguredError) {
    console.error(`[service-requests] ${scope}:`, err.message);
    return fail(503, "not_configured", "Service requests are temporarily unavailable.");
  }
  console.error(`[service-requests] ${scope} failed:`, err instanceof Error ? err.message : err);
  return fail(500, "server_error", "Something went wrong. Please try again.");
}

/**
 * Checks `Authorization: Bearer <upload token>` against the request with this
 * reference. Wrong reference, wrong token and unknown request all get the same
 * 401, so the endpoint can't be used to discover which references exist.
 */
export async function authoriseUpload(
  req: Request,
  reference: string,
): Promise<{ ok: true; request: AuthorisedRequest } | { ok: false; response: NextResponse }> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+([A-Za-z0-9_-]{20,200})$/)?.[1];
  if (!token || !REFERENCE_PATTERN.test(reference)) {
    return { ok: false, response: fail(401, "unauthorised", "Not authorised to add media to this request.") };
  }
  const request = await getServiceRequestStore().authoriseUpload(reference, token);
  if (!request) return { ok: false, response: fail(401, "unauthorised", "Not authorised to add media to this request.") };
  if (request.expired) {
    return { ok: false, response: fail(401, "upload_authorisation_expired", "The time allowed for adding files has passed.") };
  }
  return { ok: true, request };
}

/** Staff/testing endpoints: `Authorization: Bearer <SERVICE_REQUESTS_ADMIN_TOKEN>`. Disabled when unset. */
export function isAdmin(req: Request) {
  const expected = process.env.SERVICE_REQUESTS_ADMIN_TOKEN;
  if (!expected) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
