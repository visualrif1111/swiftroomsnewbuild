// Phase 5 Development seed/teardown for dashboard E2E checks. SYNTHETIC ONLY.
//
//   node --experimental-transform-types --import ./tests/support/register.mjs \
//     tests/service-dashboard/e2e/seed-dev.mjs seed|teardown
//
// Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for the DEVELOPMENT project
// (refuses any other project). Never prints keys or tokens.
//
// Seeds seven requests covering every AI state the dashboard must handle:
// COMPLETED (two report versions, discrepancies), URGENT, PARTIAL
// (unsupported video), a long partially-analysed video, FAILED (no report,
// failed transcription), PROCESSING and NOT_STARTED. Report envelopes come
// from the real pipeline (deterministic provider, PGlite) and are remapped
// onto Development rows; the evidence files are real synthetic media.
//
// Teardown is targeted: storage objects by exact path first, then rows by the
// synthetic E2E email. Nothing else is touched.
import { createOpenAiProvider } from "../../../src/lib/service-call/server/openai-provider.ts";
import { DATASET } from "../../service-call/evals/dataset.mjs";
import { materialise, photoBytes, runScenario, scriptedWorker } from "../../service-call/evals/harness.mjs";
import { scene, speech, video } from "../../service-call/evals/fixtures.mjs";
import { VIDEO_FIXTURES } from "../../service-call/evals/dataset.mjs";
import { json, openAiMock } from "../../support/synthesis-mock.mjs";
import { freshDatabase } from "../../support/db.mjs";

export const E2E_EMAIL = "e2e+phase5-dashboard@visualrif.com";
export const E2E_NAME = "PHASE5 E2E";
const DEV_REF = "izvikdwykvrabbpczbae";
const BUCKET = "service-evidence";

const URL_ = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required");
if (new URL(URL_).hostname.split(".")[0] !== DEV_REF) throw new Error("Refusing: not the Development project");

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
async function rest(path, init = {}) {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: { ...H, ...init.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path.split("?")[0]} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}
const rpc = (fn, args) => rest(`/rest/v1/rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });

// ─── Pipeline envelopes (PGlite, deterministic provider) ────────────────────
async function envelopeFor(sc, db) {
  const media = await materialise(sc);
  const byMedia = new Map(media.filter((m) => m.type === "VIDEO").map((m) => [Buffer.from(m.bytes).toString("latin1"), m.spec]));
  const vids = media.filter((m) => m.type === "VIDEO");
  const queue = [...vids.filter((v) => v.spec !== "corrupt" && v.spec.audio).map((v) => v.transcript), ...media.filter((m) => m.type === "VOICE").map((m) => m.transcript)];
  const mock = openAiMock({ transcribe: (n) => json({ text: queue[n - 1] ?? "", usage: { type: "duration", seconds: 6 } }) });
  const provider = createOpenAiProvider({ apiKey: "sk-seed", transcribeModel: "gpt-transcribe", fetch: mock.fetch });
  const result = await runScenario(sc, media, { provider, videoProcessor: () => scriptedWorker(byMedia), db });
  return result;
}

// ─── Real synthetic evidence bytes ──────────────────────────────────────────
async function realBytes(sc, row, index) {
  if (row.media_type === "PHOTO") return { bytes: await photoBytes(row.fixture), mime: row.mime_type === "image/heic" ? "image/heic" : "image/jpeg", ext: row.mime_type === "image/heic" ? "heic" : "jpg" };
  if (row.media_type === "VOICE") return { bytes: await speech(sc.voice.segments), mime: "audio/mp4", ext: "m4a" };
  const v = sc.videos[index];
  const spec = VIDEO_FIXTURES[v.fixture];
  const shots = [];
  for (const s of spec.shots) shots.push({ image: s.photo ? await photoBytes(s.photo) : await scene(s.scene), seconds: s.seconds, pan: s.pan });
  const bytes = await video(shots, { audio: v.speech ? await speech(v.speech) : null, codec: spec.codec, container: spec.container, size: spec.size, fps: spec.fps });
  return { bytes, mime: spec.container === "mov" ? "video/quicktime" : "video/mp4", ext: spec.container === "mov" ? "mov" : "mp4" };
}

async function createDevRequest(label, sc) {
  const payload = {
    customerName: `${E2E_NAME} ${label}`, mobileCountryCode: "+971", mobileNational: "500000005", mobileE164: "+971500000005",
    email: E2E_EMAIL, location: "SYNTHETIC TEST ADDRESS, DUBAI", existingCustomer: label.length % 2 === 0, projectReference: "PHASE5-E2E",
    productCategories: sc.products, otherProduct: sc.otherProduct ?? null, problemDescription: sc.description ?? "",
    declaredMedia: { photos: sc.photos?.length ?? 0, videos: sc.videos?.length ?? 0, voiceNote: !!sc.voice }, channel: "website/service-call",
  };
  const [row] = await rpc("create_service_request", { p_payload: payload, p_idempotency_key: crypto.randomUUID() });
  return row;
}

async function uploadMedia(req, sc, mediaRows) {
  const map = new Map();
  let videoIndex = 0;
  for (const [i, row] of mediaRows.entries()) {
    const { bytes, mime, ext } = await realBytes(sc, row, row.media_type === "VIDEO" ? videoIndex++ : 0);
    const id = crypto.randomUUID();
    const path = `service-requests/${req.reference.split("-")[1]}/${req.reference}/${id}.${ext}`;
    const up = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${path}`, { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": mime, "x-upsert": "false" }, body: bytes });
    if (!up.ok) throw new Error(`upload ${row.media_type} → ${up.status} ${(await up.text()).slice(0, 160)}`);
    // Increasing created_at keeps the pipeline's labels (Photo 1, Video 1…) in the same order.
    await rest("/rest/v1/service_media", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id, service_request_id: req.id, client_media_id: crypto.randomUUID(), media_type: row.media_type, mime_type: mime, file_extension: ext,
        original_filename: `PHASE5-E2E-${row.media_type.toLowerCase()}-${i + 1}.${ext}`, source: "upload", declared_size: bytes.byteLength, file_size: bytes.byteLength,
        storage_path: path, upload_status: "UPLOADED", uploaded_at: new Date().toISOString(), created_at: new Date(Date.now() - 60_000 + i * 1000).toISOString(),
      }),
    });
    map.set(row.id, id);
  }
  return map;
}

const remap = (value, map) => {
  let s = JSON.stringify(value);
  for (const [from, to] of map) s = s.split(from).join(to);
  return JSON.parse(s);
};

async function completeRun(reqId, report, status, trigger, fp) {
  const [{ run }] = await rpc("enqueue_service_ai_run", { p_request_id: reqId, p_trigger: trigger, p_input_fingerprint: fp, p_pipeline_version: "4f.1", p_prompt_version: "openai-report-4", p_schema_version: "scr-1.4", p_requested_by: "phase5-seed", p_max_auto_runs: 3 });
  const claimed = await rpc("claim_service_ai_runs", { p_worker: "phase5-seed", p_lease_seconds: 120, p_limit: 1 });
  if (claimed[0]?.id !== run.id) throw new Error("seed claimed an unexpected run");
  await rpc("complete_service_ai_run", { p_run_id: run.id, p_worker: "phase5-seed", p_status: status, p_input_fingerprint: fp, p_provider: "openai", p_models: { report: "seed-deterministic" }, p_usage: {}, p_error_detail: null, p_report: report });
  return run.id;
}

async function copyAnalyses(result, map, runId) {
  for (const a of result.analyses) {
    if (!map.has(a.media_id)) continue;
    await rpc("record_service_media_analysis", {
      p_media_id: map.get(a.media_id), p_kind: a.kind, p_input_hash: a.input_hash, p_status: a.status, p_provider: a.provider, p_model: a.model, p_prompt_version: a.prompt_version,
      p_result: a.result ? remap(a.result, map) : null, p_transcript_text: a.transcript_text, p_language: a.language, p_error_code: a.error_code, p_usage: {}, p_run_id: runId,
    });
  }
}

// Rich, realistic synthetic content for the contradiction scenario (what a good model writes).
function contradictionContent(env, version) {
  const photo = env.photoAssessments[0];
  const vid = env.videoAssessments[0];
  const voice = env.transcripts.find((t) => t.kind === "VOICE_NOTE");
  const vt = env.transcripts.find((t) => t.kind === "VIDEO_AUDIO");
  const frame = vid?.frames.find((f) => f.outcome === "ANALYSED")?.atSeconds ?? 0;
  return {
    issueSummary: version === 1
      ? "Customer reports a loose window seal and says the glass is undamaged, but their voice note describes a large crack."
      : "Window: customer's written description (no glass damage, loose seal) conflicts with their voice note (large crack). A crack-like line appears visible in Photo 1; Video 1 shows no visible damage. Staff should confirm which window and the glass condition.",
    customerReported: {
      statements: [
        { id: "st-1", text: "The customer says the glass is not damaged and the seal is loose.", quote: "No damage to the glass at all, the seal is loose.", source: { type: "DESCRIPTION", mediaId: null } },
        ...(voice ? [{ id: "st-2", text: "In the voice note, the customer says the glass has a large crack.", quote: voice.text.slice(0, 120), source: { type: "VOICE_NOTE", mediaId: voice.mediaId } }] : []),
        ...(vt ? [{ id: "st-3", text: "In the video, the customer says the window looks fine.", quote: vt.text.slice(0, 120), source: { type: "VIDEO_AUDIO", mediaId: vt.mediaId } }] : []),
      ],
      reportedSymptoms: [{ id: "sy-1", symptom: "Loose seal", statementRefs: ["st-1"] }, { id: "sy-2", symptom: "Crack in the glass", statementRefs: ["st-2"] }],
      reportedOnset: null,
      locationInProperty: null,
    },
    mediaObservations: [
      ...(photo ? [{ id: "ob-1", evidence: { mediaId: photo.mediaId, label: photo.label, frameAtSeconds: null }, observation: "A long, thin line resembling a crack appears visible across the glass.", type: "GLASS_CRACK_OR_CHIP", certainty: "PROBABLE", relatesToSymptomRefs: ["sy-2"] }] : []),
      ...(vid ? [{ id: "ob-2", evidence: { mediaId: vid.mediaId, label: vid.label, frameAtSeconds: frame }, observation: "No damage to the glass or seal is visible in this frame.", type: "NOTHING_NOTABLE_VISIBLE", certainty: "UNCERTAIN", relatesToSymptomRefs: [] }] : []),
    ],
    unknownsRequiringInspection: [
      { topic: "CONFLICTING_CUSTOMER_INFORMATION", question: "Is the glass cracked? The written description says no damage; the voice note says there is a large crack.", whyUnknown: "The customer's own statements contradict each other." },
      { topic: "EVIDENCE_DISCREPANCY", question: "Do Photo 1 and Video 1 show the same window?", whyUnknown: "Photo 1 appears to show a crack-like line; no damage is visible in Video 1." },
      { topic: "SAFETY_CONFIRMATION", question: "If the glass is cracked, is the pane still firmly held in the frame?", whyUnknown: "Stability can't be judged from still images." },
      { topic: "BEHAVIOUR_OVER_TIME", question: "Does the seal move or let water in when the window is used?", whyUnknown: "Still frames from the video can't show movement or water entry." },
      { topic: "CAUSE", question: "What caused the crack or the loose seal?", whyUnknown: "Cause needs an inspection." },
      { topic: "WARRANTY", question: "Whether any warranty applies.", whyUnknown: "Warranty isn't assessed by this report." },
      { topic: "COST", question: "What any repair would cost.", whyUnknown: "Cost isn't assessed by this report." },
      { topic: "REPAIR_METHOD", question: "What repair, if any, is needed.", whyUnknown: "Needs an inspection." },
    ],
    affectedProducts: [{ category: "window", basis: "CUSTOMER_SELECTED" }],
    potentialIssueCategories: [{ category: "GLASS_DAMAGE", likelihood: "POSSIBLE", basedOnRefs: ["st-2", "ob-1"] }, { category: "WATER_INGRESS_OR_SEALS", likelihood: "POSSIBLE", basedOnRefs: ["st-1"] }],
    urgency: { level: "HIGH", indicators: [{ indicator: "CONTAINED_DAMAGE", basis: "BOTH", refs: ["st-2", "ob-1"] }], reason: "A crack is reported and appears visible, but whether the pane is stable is unconfirmed." },
    inspection: { recommended: true, reason: "The glass condition is contradicted between the customer's statements and the media." },
    recommendedNextStep: "STAFF_CALLBACK",
    moreInformationNeeded: ["Which window is affected, and is it the one in Photo 1?", "Is the glass cracked, and if so, is the pane firmly held in the frame?"],
    confidence: { overall: "LOW", reason: "The customer's statements and the media disagree." },
    limitations: ["Photo 1 and Video 1 may not show the same window.", "Still frames can't show whether the seal moves or leaks."],
  };
}

function urgentContent(env) {
  const photo = env.photoAssessments[0];
  const voice = env.transcripts.find((t) => t.kind === "VOICE_NOTE");
  return {
    ...env.content,
    issueSummary: "Glass pane reported shattered with sharp pieces falling onto a balcony used by children; broken glass appears visible in Photo 1.",
    customerReported: {
      ...env.content.customerReported,
      statements: [
        { id: "st-1", text: "The customer says the glass is broken.", quote: "Glass broken.", source: { type: "DESCRIPTION", mediaId: null } },
        ...(voice ? [{ id: "st-2", text: "The customer says sharp pieces are falling onto the balcony where children play.", quote: voice.text.slice(0, 120), source: { type: "VOICE_NOTE", mediaId: voice.mediaId } }] : []),
      ],
      reportedSymptoms: [{ id: "sy-1", symptom: "Shattered glass, pieces falling", statementRefs: voice ? ["st-1", "st-2"] : ["st-1"] }],
    },
    mediaObservations: photo ? [{ id: "ob-1", evidence: { mediaId: photo.mediaId, label: photo.label, frameAtSeconds: null }, observation: "Broken glass with multiple fracture lines appears visible.", type: "GLASS_CRACK_OR_CHIP", certainty: "CLEAR", relatesToSymptomRefs: ["sy-1"] }] : [],
    urgency: { level: "URGENT", indicators: [{ indicator: "BROKEN_OR_UNSTABLE_GLASS", basis: "BOTH", refs: voice ? ["st-2", "ob-1"] : ["st-1", "ob-1"] }, { indicator: "INJURY_RISK_LOOSE_COMPONENT", basis: "CUSTOMER_REPORTED", refs: voice ? ["st-2"] : ["st-1"] }], reason: "Broken glass is reported and visible, with pieces falling where children play." },
    recommendedNextStep: "URGENT_CALLBACK",
    potentialIssueCategories: [{ category: "GLASS_DAMAGE", likelihood: "LIKELY", basedOnRefs: ["ob-1"] }],
  };
}

// ─── Seed ───────────────────────────────────────────────────────────────────
async function seed() {
  const existing = await rest(`/rest/v1/service_requests?email=eq.${encodeURIComponent(E2E_EMAIL)}&select=id`);
  if (existing.length) throw new Error(`already seeded (${existing.length} rows) — run teardown first`);
  const db = await freshDatabase();
  const byId = (id) => DATASET.find((s) => s.id === id);
  const out = [];

  // 1. Full multimodal contradiction: two report versions, discrepancies, transcripts, frames.
  for (const [label, scId, kind] of [["CONTRADICTION", "m-f02", "rich"], ["URGENT", "m-f05", "urgent"], ["LONG VIDEO", "m-tvd03", "plain"], ["UNSUPPORTED VIDEO", "m-tvd04", "plain"]]) {
    const sc = byId(scId);
    const result = await envelopeFor(sc, db);
    const pgReport = result.reports.at(-1);
    if (!pgReport) throw new Error(`${scId}: pipeline produced no report`);
    const req = await createDevRequest(label, sc);
    const map = await uploadMedia(req, sc, result.mediaRows);
    map.set(result.request.reference, req.reference);
    const env = remap(pgReport.ai_report, map);
    env.serviceReference = req.reference;
    if (kind === "rich") {
      const runV1 = await completeRun(req.id, { ...env, content: contradictionContent(env, 1) }, pgReport.processing_status, "FINALIZE", "a".repeat(64));
      await copyAnalyses(result, map, runV1);
      await completeRun(req.id, { ...env, content: contradictionContent(env, 2) }, pgReport.processing_status, "MANUAL", "b".repeat(64));
    } else {
      const runId = await completeRun(req.id, kind === "urgent" ? { ...env, content: urgentContent(env) } : env, pgReport.processing_status, "FINALIZE", "c".repeat(64));
      await copyAnalyses(result, map, runId);
    }
    out.push(`${req.reference} ${label} (${pgReport.processing_status})`);
  }

  // 5. AI FAILED, no report: a voice note whose transcription failed.
  {
    const sc = { ...byId("m-v01"), description: "Recorded a voice note about the sliding door." };
    const req = await createDevRequest("AI FAILED", sc);
    const media = await materialise(sc);
    const map = await uploadMedia(req, sc, [{ id: "voice", media_type: "VOICE", mime_type: media[0].mime }]);
    const [{ run }] = await rpc("enqueue_service_ai_run", { p_request_id: req.id, p_trigger: "FINALIZE", p_input_fingerprint: "d".repeat(64), p_pipeline_version: "4f.1", p_prompt_version: "openai-report-4", p_schema_version: "scr-1.4", p_requested_by: "phase5-seed", p_max_auto_runs: 3 });
    await rpc("claim_service_ai_runs", { p_worker: "phase5-seed", p_lease_seconds: 120, p_limit: 1 });
    await rpc("record_service_media_analysis", { p_media_id: map.get("voice"), p_kind: "TRANSCRIPT", p_input_hash: "e".repeat(64), p_status: "FAILED", p_provider: "openai", p_model: "gpt-transcribe", p_prompt_version: "t-1", p_result: null, p_transcript_text: null, p_language: null, p_error_code: "provider_timeout", p_usage: {}, p_run_id: run.id });
    await rpc("fail_service_ai_run", { p_run_id: run.id, p_worker: "phase5-seed", p_error_code: "provider_timeout", p_error_detail: { stage: "transcribe" }, p_retryable: false, p_usage: {} });
    out.push(`${req.reference} AI FAILED`);
  }
  // 6. AI PROCESSING (queued run, nothing will claim it in Development).
  {
    const req = await createDevRequest("AI PROCESSING", { products: ["entrance-door"], description: "Front door drops at the handle side and rubs the frame." });
    await rpc("enqueue_service_ai_run", { p_request_id: req.id, p_trigger: "FINALIZE", p_input_fingerprint: "f".repeat(64), p_pipeline_version: "4f.1", p_prompt_version: "openai-report-4", p_schema_version: "scr-1.4", p_requested_by: "phase5-seed", p_max_auto_runs: 3 });
    out.push(`${req.reference} AI PROCESSING`);
  }
  // 7. AI NOT_STARTED, no media.
  {
    const req = await createDevRequest("NO AI", { products: ["hardware", "window"], description: "Window handle is stiff and the key is lost; the window is closed and locked." });
    out.push(`${req.reference} AI NOT_STARTED`);
  }
  console.log(out.join("\n"));
}

// ─── Teardown ───────────────────────────────────────────────────────────────
async function teardown() {
  const reqs = await rest(`/rest/v1/service_requests?email=eq.${encodeURIComponent(E2E_EMAIL)}&customer_name=like.${encodeURIComponent(`${E2E_NAME}*`)}&select=id,reference`);
  let objects = 0;
  for (const r of reqs) {
    const media = await rest(`/rest/v1/service_media?service_request_id=eq.${r.id}&select=storage_path`);
    const paths = media.map((m) => m.storage_path);
    if (paths.length) {
      const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: H, body: JSON.stringify({ prefixes: paths }) });
      if (!res.ok) throw new Error(`storage delete → ${res.status}`);
      objects += paths.length;
    }
  }
  if (reqs.length) await rest(`/rest/v1/service_requests?id=in.(${reqs.map((r) => r.id).join(",")})`, { method: "DELETE" });
  const customers = await rest(`/rest/v1/customers?email=eq.${encodeURIComponent(E2E_EMAIL)}&select=id`);
  if (customers.length) await rest(`/rest/v1/customers?id=in.(${customers.map((c) => c.id).join(",")})`, { method: "DELETE" });
  // The synthetic staff account (run-e2e.mjs): allow-list row, then the Auth user.
  const staff = await rest(`/rest/v1/staff_members?display_name=like.${encodeURIComponent("Synthetic*(E2E)")}&select=id,auth_user_id`);
  for (const s of staff) {
    await rest(`/rest/v1/staff_members?id=eq.${s.id}`, { method: "DELETE" });
    await rest(`/auth/v1/admin/users/${s.auth_user_id}`, { method: "DELETE" }).catch((e) => console.warn(`auth user: ${e.message.slice(0, 80)}`));
  }
  const users = (await rest(`/auth/v1/admin/users?per_page=200`)).users.filter((u) => u.email === "phase5.synthetic.staff@example.com");
  for (const u of users) await rest(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
  console.log(`teardown: ${reqs.length} requests, ${objects} objects, ${customers.length} customers, ${staff.length} staff rows, ${users.length + staff.length ? "synthetic Auth user" : "no Auth user"} removed`);
}

const mode = process.argv[2];
if (mode === "seed") await seed();
else if (mode === "teardown") await teardown();
else throw new Error("usage: seed|teardown");
