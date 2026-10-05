// In-process Postgres (PGlite) with the Supabase pieces our migrations rely
// on: the anon/authenticated/service_role roles with Supabase's default
// grants, and a stub storage.buckets table. Applies every migration in order.
// No network and no real Supabase project are involved.
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = new URL("../../supabase/migrations/", import.meta.url);

const SUPABASE_BASELINE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  -- Supabase's defaults: new tables and functions in public are granted to
  -- all three roles. The migrations must revoke what the browser roles get.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]
  );
`;

/** `upTo`: apply migrations whose file name sorts at or before this prefix (e.g. "0002"). */
export async function freshDatabase({ upTo } = {}) {
  const db = new PGlite();
  await db.exec(SUPABASE_BASELINE);
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files.filter((f) => !upTo || f.slice(0, upTo.length) <= upTo)) {
    await db.exec(readFileSync(new URL(file, MIGRATIONS), "utf8"));
  }
  return db;
}

/** Creates a service request through the real create_service_request(). */
export async function createRequest(db, overrides = {}) {
  const payload = {
    customerName: "PHASE 4A TEST", mobileCountryCode: "+971", mobileNational: "500000000", mobileE164: "+971500000000",
    email: "e2e+phase4a@visualrif.com", location: "TEST ADDRESS", existingCustomer: false, projectReference: "PHASE4A-TEST",
    productCategories: ["window"], otherProduct: null, problemDescription: "Test description.",
    declaredMedia: { photos: 0, videos: 0, voiceNote: false }, channel: "website/service-call",
    ...overrides,
  };
  const { rows } = await db.query("select * from create_service_request($1::jsonb, gen_random_uuid())", [JSON.stringify(payload)]);
  return rows[0];
}

export async function addMedia(db, requestId, { type = "PHOTO", status = "UPLOADED", size = 1000 } = {}) {
  const ext = type === "PHOTO" ? "jpg" : type === "VIDEO" ? "mp4" : "m4a";
  const mime = type === "PHOTO" ? "image/jpeg" : type === "VIDEO" ? "video/mp4" : "audio/mp4";
  const { rows } = await db.query(
    `insert into service_media (service_request_id, client_media_id, media_type, mime_type, file_extension, declared_size, file_size, storage_path, upload_status)
     values ($1, gen_random_uuid(), $2, $3, $4, $5, $6, 'service-requests/2026/TEST/' || gen_random_uuid() || '.' || $4, $7) returning *`,
    [requestId, type, mime, ext, size, status === "UPLOADED" ? size : null, status],
  );
  return rows[0];
}

export const FP = (c = "a") => c.repeat(64);
