// Phase 4D end to end: photos → real normaliser (sharp) → per-photo vision
// call (HTTP mocked) → po-1 validation → cache → server-injected
// observations → report synthesis (scr-1.4) over the real SQL (PGlite).
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { RunNotOwnedError } from "../../src/lib/service-call/ai/run-store.ts";
import { createOpenAiProvider } from "../../src/lib/service-call/server/openai-provider.ts";
import { enqueueAiProcessing, runAiWorker } from "../../src/lib/service-call/server/ai-worker.ts";
import { addMedia, createRequest, freshDatabase } from "../support/db.mjs";
import { pgliteAiStore } from "../support/ai-fixtures.mjs";
import { goodPhotoObservation, goodReport, json, openAiMock } from "../support/synthesis-mock.mjs";
import { claimedHugePng, corruptJpeg, heicLike, photoJpeg, solidPng } from "../support/images.mjs";

/**
 * photos: [{ bytes, mime }]; voice: transcript mock enabled when true.
 */
async function setup({ description = "The living room window glass looks damaged.", photos = [], voice = false, mock = openAiMock(), enabled = true } = {}) {
  const db = await freshDatabase();
  const request = await createRequest(db, { problemDescription: description });
  const bytes = new Map();
  const media = [];
  for (const p of photos) {
    const m = await addMedia(db, request.id, { type: "PHOTO", size: p.bytes.length });
    await db.query("update service_media set mime_type = $1, original_filename = $2 where id = $3", [p.mime ?? "image/jpeg", "PHASE4A-customer-name-IMG_0042.jpg", m.id]);
    bytes.set(m.id, p.bytes);
    media.push(m);
  }
  if (voice) {
    const v = await addMedia(db, request.id, { type: "VOICE" });
    await db.query("update service_media set mime_type = 'audio/webm' where id = $1", [v.id]);
    bytes.set(v.id, new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3]));
    media.push(v);
  }
  const store = pgliteAiStore(db, { RunNotOwnedError });
  const provider = createOpenAiProvider({ apiKey: "sk-test", transcribeModel: "gpt-transcribe", fetch: mock.fetch });
  const reads = [];
  const deps = { store, provider, enabled: () => enabled, readMedia: async (id) => (reads.push(id), bytes.get(id)) };
  return { db, request, media, mock, deps, reads };
}
const rows = async (db, sql, p) => (await db.query(sql, p)).rows;
const reports = (s) => rows(s.db, "select * from service_ai_reports where service_request_id = $1 order by version", [s.request.id]);
const runs = (s) => rows(s.db, "select * from service_ai_runs where service_request_id = $1 order by run_number", [s.request.id]);
const analyses = (s) => rows(s.db, "select * from service_media_analyses where kind = 'IMAGE_OBSERVATIONS' order by created_at");
async function finalize(s) {
  const q = await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps);
  const w = await runAiWorker(1, s.deps);
  return { q, out: w.results[0] };
}
const jpeg = async (seed = 1, opts = {}) => ({ bytes: await photoJpeg({ width: 640, height: 480, seed, ...opts }) });

test("1 clear single photo → po-1 cached; observation injected with exact attribution; report cites it", async () => {
  const mock = openAiMock({ model: ({ input }) => ({ ...goodReport(input), potentialIssueCategories: [{ category: "GLASS_DAMAGE", likelihood: "POSSIBLE", basedOnRefs: ["ob-1"] }] }) });
  const s = await setup({ photos: [await jpeg()], mock });
  const { out } = await finalize(s);
  assert.equal(out.outcome, "COMPLETED");
  const [a] = await analyses(s);
  assert.equal(a.status, "COMPLETED");
  assert.equal(a.media_id, s.media[0].id);
  assert.equal(a.result.schema, "po-1");
  assert.equal(a.prompt_version, "openai-observe-1/img-1");
  assert.equal(a.model, "gpt-6.1-sol");
  assert.match(a.result.sourceSha256, /^[0-9a-f]{64}$/);
  assert.equal(a.result.derivative.normaliser, "img-1");
  const [rep] = await reports(s);
  const r = rep.ai_report;
  assert.equal(r.schemaVersion, "scr-1.4");
  assert.deepEqual(r.content.mediaObservations, [{
    id: "ob-1", evidence: { mediaId: s.media[0].id, label: "Photo 1", frameAtSeconds: null },
    observation: "upper half of the glazed panel: A thin linear mark resembling a crack appears visible across the glazed area.",
    type: "GLASS_CRACK_OR_CHIP", certainty: "PROBABLE", relatesToSymptomRefs: [],
  }]);
  assert.deepEqual(r.content.potentialIssueCategories[0].basedOnRefs, ["ob-1"]);
  assert.equal(r.photoAssessments[0].mediaId, s.media[0].id);
  assert.equal(rep.models.observePromptVersion, "openai-observe-1/img-1");
  assert.match(rep.models.observePromptHash, /^[0-9a-f]{64}$/);
});

test("2 multiple photos → one call per photo, one image per call, each observation tied to its own photo", async () => {
  const mock = openAiMock({ observe: ({ label }) => ({ ...goodPhotoObservation(), observations: [{ type: "OTHER", observation: `Something appears visible in ${label}.`, certainty: "UNCERTAIN", location: null }] }) });
  const s = await setup({ photos: [await jpeg(1), await jpeg(2), await jpeg(3)], mock });
  await finalize(s);
  assert.equal(mock.calls.observe.length, 3);
  for (const c of mock.calls.observe) assert.equal(c.images.length, 1, "exactly one image per vision call");
  const obs = (await reports(s))[0].ai_report.content.mediaObservations;
  assert.deepEqual(obs.map((o) => [o.evidence.label, o.evidence.mediaId]), s.media.map((m, i) => [`Photo ${i + 1}`, m.id]));
  obs.forEach((o, i) => assert.match(o.observation, new RegExp(`Photo ${i + 1}\\.$`)));
});

test("3–5 text + photo, voice + photo, text + voice + photo: statements stay customer-quoted, observations stay separate", async () => {
  const s = await setup({ photos: [await jpeg()], voice: true });
  const { out } = await finalize(s);
  assert.equal(out.outcome, "COMPLETED");
  const c = (await reports(s))[0].ai_report.content;
  assert.deepEqual(c.customerReported.statements.map((x) => x.source.type), ["DESCRIPTION", "VOICE_NOTE"]);
  assert.ok(c.customerReported.statements.every((x) => !x.quote.includes("linear mark")), "photo content never appears as a customer quote");
  assert.equal(c.mediaObservations.length, 1);
  // A report that restates the photo observation as a customer statement is rejected (no such quote exists).
  const mock = openAiMock({
    model: ({ input, n }) => {
      const r = goodReport(input);
      if (n === 1) r.customerReported.statements.push({ id: "st-9", text: "Customer reports a crack.", quote: "A thin linear mark resembling a crack", source: { type: "DESCRIPTION", mediaId: null } });
      return r;
    },
  });
  const t = await setup({ photos: [await jpeg()], mock });
  await finalize(t);
  assert.match(mock.calls.responses.filter((x) => !x.body.text.format.name.startsWith("photo"))[1].correction, /quote_not_found_in_source/);
});

test("6 customer/photo contradiction → both preserved + EVIDENCE_DISCREPANCY; nothing decided", async () => {
  const mock = openAiMock({
    model: ({ input }) => ({
      ...goodReport(input, { unknowns: [{ topic: "EVIDENCE_DISCREPANCY", question: "Whether the glass is cracked.", whyUnknown: "The customer says it is not cracked; Photo 1 may show a crack-like mark." }] }),
      potentialIssueCategories: [{ category: "GLASS_DAMAGE", likelihood: "POSSIBLE", basedOnRefs: ["ob-1"] }],
    }),
  });
  const s = await setup({ description: "The glass isn't cracked.", photos: [await jpeg()], mock });
  assert.equal((await finalize(s)).out.outcome, "COMPLETED");
  const c = (await reports(s))[0].ai_report.content;
  assert.equal(c.customerReported.statements[0].quote, "The glass isn't cracked.");
  assert.equal(c.mediaObservations[0].type, "GLASS_CRACK_OR_CHIP");
  assert.ok(c.unknownsRequiringInspection.some((u) => u.topic === "EVIDENCE_DISCREPANCY"));
  assert.ok(!c.potentialIssueCategories.some((p) => p.likelihood === "LIKELY"));
});

test("7 ambiguous photo → LIMITED quality notice; LIKELY resting only on an UNCERTAIN observation is corrected", async () => {
  const mock = openAiMock({
    observe: () => ({ photo: { quality: "LIMITED", qualityIssues: ["DARK", "BLURRY"], relevance: "UNCLEAR", visibleProductTypes: [], visibleTextPresent: false, personalInfoVisible: false }, observations: [{ type: "OTHER", observation: "A darker area may be visible near the frame.", certainty: "UNCERTAIN", location: null }], cannotDetermine: ["What the darker area is."] }),
    model: ({ input, n }) => ({ ...goodReport(input), potentialIssueCategories: [{ category: "WATER_INGRESS_OR_SEALS", likelihood: n === 1 ? "LIKELY" : "POSSIBLE", basedOnRefs: ["ob-1"] }] }),
  });
  const s = await setup({ photos: [await jpeg()], mock });
  await finalize(s);
  assert.match(mock.calls.responses.filter((x) => x.body.text.format.name.startsWith("service"))[1].correction, /likely_based_only_on_uncertain_observations/);
  const r = (await reports(s))[0].ai_report;
  assert.deepEqual(r.evidenceNotices.map((n) => n.code), ["PHOTO_LIMITED_QUALITY"]);
  assert.deepEqual(r.photoAssessments[0].qualityIssues, ["DARK", "BLURRY"]);
});

test("8 irrelevant photo → NOT_RELEVANT notice; a defect observation on it is rejected", async () => {
  const irrelevant = { photo: { quality: "CLEAR", qualityIssues: [], relevance: "NOT_RELEVANT", visibleProductTypes: [], visibleTextPresent: false, personalInfoVisible: false }, observations: [{ type: "NOTHING_NOTABLE_VISIBLE", observation: "The photo appears to show a garden rather than a window or door.", certainty: "PROBABLE", location: null }], cannotDetermine: [] };
  const s = await setup({ photos: [await jpeg()], mock: openAiMock({ observe: () => irrelevant }) });
  await finalize(s);
  assert.ok((await reports(s))[0].ai_report.evidenceNotices.some((n) => n.code === "PHOTO_NOT_RELEVANT"));
  const bad = await setup({ photos: [await jpeg()], mock: openAiMock({ observe: () => ({ ...irrelevant, observations: [{ type: "GLASS_CRACK_OR_CHIP", observation: "A crack appears visible.", certainty: "PROBABLE", location: null }] }) }) });
  await finalize(bad);
  const [a] = await analyses(bad);
  assert.deepEqual([a.status, a.error_code], ["FAILED", "invalid_observation"]);
});

test("9–12 blank, corrupt, HEIC, decompression-risk → no vision call; SKIPPED/FAILED with notices; report continues", async () => {
  const mock = openAiMock();
  const s = await setup({
    photos: [
      { bytes: await solidPng({ color: "#ffffff" }), mime: "image/png" },
      { bytes: corruptJpeg() },
      { bytes: heicLike(), mime: "image/heic" },
      { bytes: claimedHugePng(), mime: "image/png" },
    ],
    mock,
  });
  const { out } = await finalize(s);
  assert.equal(out.outcome, "PARTIAL");
  assert.equal(mock.calls.observe.length, 0);
  const r = (await reports(s))[0].ai_report;
  assert.deepEqual(r.processing.mediaCoverage.map((c) => [c.outcome, c.reasonCode]), [
    ["SKIPPED", "image_blank"], ["FAILED", "image_unreadable"], ["SKIPPED", "image_format_not_supported"], ["FAILED", "image_too_large_to_process"],
  ]);
  assert.deepEqual(r.evidenceNotices.map((n) => n.code), ["PHOTO_BLANK", "NOT_ANALYSED", "NOT_ANALYSED", "NOT_ANALYSED"]);
  assert.deepEqual(r.content.mediaObservations, []);
});

test("12–13 large image is downscaled; EXIF orientation applied; what is sent has no EXIF/GPS", async () => {
  const mock = openAiMock();
  const s = await setup({ photos: [{ bytes: await photoJpeg({ width: 3000, height: 2000, withExif: true, orientation: 6 }) }], mock });
  await finalize(s);
  const sent = mock.calls.observe[0].image;
  const m = await sharp(sent).metadata();
  assert.deepEqual([m.width, m.height], [1024, 1536], "upright and bounded");
  assert.equal(m.exif, undefined);
  assert.equal(m.format, "jpeg");
  for (const secret of ["PHASE4D-PRIVATE-MODEL", "PHASE 4D SECRET OWNER", "GPS"]) assert.ok(!sent.includes(Buffer.from(secret)), secret);
  assert.equal(mock.calls.observe[0].images[0].detail, "high");
  assert.match(mock.calls.observe[0].images[0].image_url, /^data:image\/jpeg;base64,/);
});

test("14–15 visible text / personal info: flags recorded; transcription of text is rejected", async () => {
  const flagged = { ...goodPhotoObservation(), photo: { ...goodPhotoObservation().photo, visibleTextPresent: true, personalInfoVisible: true } };
  const s = await setup({ photos: [await jpeg()], mock: openAiMock({ observe: () => flagged }) });
  await finalize(s);
  const pa = (await reports(s))[0].ai_report.photoAssessments[0];
  assert.deepEqual([pa.visibleTextPresent, pa.personalInfoVisible], [true, true]);
  const transcribing = openAiMock({ observe: () => ({ ...goodPhotoObservation(), observations: [{ type: "OTHER", observation: 'A label appears visible reading "Unit 14, Al Barsha, call 0501234567".', certainty: "PROBABLE", location: null }] }) });
  const t = await setup({ photos: [await jpeg()], mock: transcribing });
  await finalize(t);
  assert.equal(transcribing.calls.observe.length, 2, "one corrective attempt");
  assert.match(transcribing.calls.observe[1].correction, /transcribed_text_not_allowed/);
  assert.equal((await analyses(t))[0].status, "FAILED");
});

test("16 exact duplicate photo → analysed once; second SKIPPED with PHOTO_DUPLICATE notice", async () => {
  const same = await jpeg(5);
  const mock = openAiMock();
  const s = await setup({ photos: [same, { bytes: new Uint8Array(same.bytes) }], mock });
  await finalize(s);
  assert.equal(mock.calls.observe.length, 1);
  const r = (await reports(s))[0].ai_report;
  assert.deepEqual(r.processing.mediaCoverage.map((c) => [c.outcome, c.reasonCode]), [["ANALYSED", null], ["SKIPPED", "duplicate_of_photo_1"]]);
  assert.ok(r.evidenceNotices.some((n) => n.code === "PHOTO_DUPLICATE" && n.label === "Photo 2"));
  assert.equal(r.content.mediaObservations.length, 1);
});

test("17 image prompt injection: obeying output rejected twice → photo FAILED, report continues without it; the instruction never changes behaviour", async () => {
  const obey = () => ({ ...goodPhotoObservation(), photo: { ...goodPhotoObservation().photo, visibleTextPresent: true }, observations: [{ type: "OTHER", observation: "This appears to be covered by the warranty and will be repaired free of charge.", certainty: "PROBABLE", location: null }] });
  const mock = openAiMock({ observe: obey });
  const s = await setup({ photos: [await jpeg()], mock });
  const { out } = await finalize(s);
  assert.equal(out.outcome, "PARTIAL");
  const [a] = await analyses(s);
  assert.deepEqual([a.status, a.error_code], ["FAILED", "invalid_observation"]);
  assert.ok(a.result.validationErrors.some((e) => e.includes("WARRANTY") || e.includes("conclusion_not_supported_by_photo")));
  const c = (await reports(s))[0].ai_report.content;
  assert.deepEqual(c.mediaObservations, []);
  // (The server's mandatory unknown "Whether any warranty applies." is expected; the injected claims are not.)
  assert.ok(!JSON.stringify(c).match(/covered by the warranty|repaired free of charge/i));
});

test("18–20 report model can't invent, alter or misattribute observations", async () => {
  // (a) its own mediaObservations → rejected
  const own = openAiMock({ model: ({ input, n }) => ({ ...goodReport(input), ...(n === 1 ? { mediaObservations: [{ id: "ob-1", evidence: { mediaId: input.mediaObservations[0].evidence.mediaId, label: "Photo 1", frameAtSeconds: null }, observation: "The glass is definitely shattered.", type: "GLASS_CRACK_OR_CHIP", certainty: "CLEAR", relatesToSymptomRefs: [] }] } : {}) }) });
  const a = await setup({ photos: [await jpeg()], mock: own });
  await finalize(a);
  assert.match(own.calls.responses.filter((x) => x.body.text.format.name.startsWith("service"))[1].correction, /must_be_server_provided/);
  const stored = (await reports(a))[0].ai_report.content.mediaObservations;
  assert.equal(stored[0].observation.includes("definitely"), false, "server-provided text survives, not the model's");
  // (b) references to observations that don't exist → rejected
  const ghost = openAiMock({ model: ({ input }) => ({ ...goodReport(input), potentialIssueCategories: [{ category: "GLASS_DAMAGE", likelihood: "POSSIBLE", basedOnRefs: ["ob-7"] }] }) });
  const b = await setup({ photos: [await jpeg()], mock: ghost });
  assert.equal((await finalize(b)).out.errorCode, "invalid_output");
  // (c) the report call never contains a photograph
  for (const r of [...own.calls.responses, ...ghost.calls.responses].filter((x) => x.body.text.format.name.startsWith("service"))) {
    const body = JSON.stringify(r.body);
    assert.ok(!body.includes("input_image") && !body.includes("data:image"), "no image in report synthesis");
  }
});

test("19 diagnosis / causation / repair / warranty in photo output → corrective attempt, then FAILED", async () => {
  for (const text of ["The hinge has failed.", "Staining appears visible, caused by a failed seal.", "A crack appears visible; replacement required.", "An installation fault appears visible."]) {
    const mock = openAiMock({ observe: () => ({ ...goodPhotoObservation(), observations: [{ type: "OTHER", observation: text, certainty: "PROBABLE", location: null }] }) });
    const s = await setup({ photos: [await jpeg()], mock });
    await finalize(s);
    assert.equal(mock.calls.observe.length, 2, text);
    assert.equal((await analyses(s))[0].status, "FAILED", text);
  }
});

test("21–23 provider failures: timeout/429/5xx requeue; 401 run-wide; 400 or refusal fail only that photo", async () => {
  for (const fail of [() => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); }, () => json({ error: { code: "rate_limit_exceeded" } }, 429), () => json({}, 503)]) {
    const mock = openAiMock({ observe: (c) => (c.n === 1 ? fail() : goodPhotoObservation()) });
    const s = await setup({ photos: [await jpeg()], mock });
    assert.equal((await finalize(s)).out.outcome, "REQUEUED");
    await s.db.query("update service_ai_runs set next_attempt_at = now()");
    assert.equal((await runAiWorker(1, s.deps)).results[0].outcome, "COMPLETED");
  }
  const auth = await setup({ photos: [await jpeg()], mock: openAiMock({ observe: () => json({ error: { code: "invalid_api_key" } }, 401) }) });
  const r = (await finalize(auth)).out;
  assert.deepEqual([r.outcome, r.errorCode], ["REQUEUED", "provider_auth_failed"]);
  assert.equal((await analyses(auth)).length, 0, "the photo is not blamed");
  for (const [resp, code] of [[json({ error: { code: "invalid_image" } }, 400), "image_rejected_by_provider"], [json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "No." }] }] }), "image_refused"]]) {
    const s = await setup({ photos: [await jpeg()], mock: openAiMock({ observe: () => resp }) });
    assert.equal((await finalize(s)).out.outcome, "PARTIAL");
    assert.deepEqual([(await analyses(s))[0].status, (await analyses(s))[0].error_code], ["FAILED", code]);
  }
});

test("24–26 repeated finalize and reprocess reuse the cached photo analysis (no new vision call); 27 v2 immutable", async () => {
  const mock = openAiMock();
  const s = await setup({ photos: [await jpeg()], mock });
  await finalize(s);
  for (let i = 0; i < 3; i++) assert.equal((await finalize(s)).q.outcome, "already_processed");
  assert.equal(mock.calls.observe.length, 1);
  const v1 = (await reports(s))[0];
  await enqueueAiProcessing(s.request.id, "MANUAL", "admin", s.deps);
  await runAiWorker(1, s.deps);
  assert.equal(mock.calls.observe.length, 1, "no new vision call on reprocess");
  const [r1, r2] = await reports(s);
  assert.equal(r2.version, 2);
  assert.deepEqual(r1.ai_report, v1.ai_report);
  assert.equal(r1.superseded_by, r2.id);
  assert.deepEqual(r2.ai_report.content.mediaObservations, r1.ai_report.content.mediaObservations);
  assert.ok((await runs(s))[1].usage.cacheHits >= 1);
  await assert.rejects(s.db.query("update service_ai_reports set ai_report = '{}' where id = $1", [r1.id]), /immutable/);
});

test("27 a 4C text-only report (v1) gets a photo-aware v2 under 4D versions; v1 untouched", async () => {
  const mock = openAiMock();
  const s = await setup({ photos: [await jpeg()], mock });
  const noPhotos = { ...s.deps, provider: { ...s.deps.provider, capabilities: { ...s.deps.provider.capabilities, observe: false } } };
  await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", noPhotos);
  await runAiWorker(1, noPhotos);
  await s.db.query("update service_ai_runs set pipeline_version = '4c.1', prompt_version = 'openai-report-1'");
  const v1 = (await reports(s))[0];
  assert.deepEqual(v1.ai_report.content.mediaObservations, []);
  assert.equal((await enqueueAiProcessing(s.request.id, "FINALIZE", "customer", s.deps)).outcome, "created");
  await runAiWorker(1, s.deps);
  const [a, b] = await reports(s);
  assert.deepEqual(a.ai_report, v1.ai_report);
  assert.equal(b.ai_report.content.mediaObservations.length, 1);
});

test("28 service request status, updated_at and history untouched", async () => {
  const s = await setup({ photos: [await jpeg(), { bytes: corruptJpeg() }] });
  const before = (await rows(s.db, "select * from service_requests where id = $1", [s.request.id]))[0];
  await finalize(s);
  assert.deepEqual((await rows(s.db, "select * from service_requests where id = $1", [s.request.id]))[0], before);
  assert.equal((await rows(s.db, "select count(*)::int n from status_history where service_request_id = $1", [s.request.id]))[0].n, 1);
});

test("29 vision requests carry no PII, reference, original filename, URL or storage path — only label, categories and the derivative", async () => {
  const mock = openAiMock();
  const s = await setup({ description: "Call PHASE 4A TEST on 0501234567 about the window.", photos: [await jpeg()], mock });
  await finalize(s);
  const c = mock.calls.observe[0];
  assert.deepEqual(JSON.parse(c.text), { photo: "Photo 1", productCategoriesSelectedByCustomer: ["window"] });
  assert.deepEqual(Object.keys(c.body).sort(), ["input", "instructions", "max_output_tokens", "model", "prompt_cache_key", "reasoning", "store", "text"]);
  assert.equal(c.body.store, false);
  assert.equal(c.body.max_output_tokens, 3000);
  assert.equal(c.body.text.format.strict, true);
  const body = JSON.stringify({ ...c.body, input: [{ ...c.body.input[0], content: c.body.input[0].content.map((p) => (p.type === "input_image" ? { ...p, image_url: "<image>" } : p)) }] });
  for (const pii of ["PHASE 4A TEST", "0501234567", "e2e+phase4a", "TEST ADDRESS", "PHASE4A-TEST", "IMG_0042", "customer-name", s.request.reference, "service-requests/", "supabase", s.media[0].id]) {
    assert.ok(!body.includes(pii), `leaked: ${pii}`);
  }
});

test("30 kill switch: AI disabled → no normalisation, no vision call", async () => {
  const mock = openAiMock();
  const s = await setup({ photos: [await jpeg()], mock, enabled: false });
  const { q } = await finalize(s);
  assert.equal(q.outcome, "disabled");
  assert.equal(mock.calls.observe.length, 0);
  assert.equal(s.reads.length, 0);
});
