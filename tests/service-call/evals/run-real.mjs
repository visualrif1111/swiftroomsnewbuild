// Phase 4F controlled REAL evaluation (operator tool; never part of npm test).
//
//   node --experimental-transform-types --import ./tests/support/register.mjs \
//     tests/service-call/evals/run-real.mjs <suite> <label> <out.json>
//
// suites: urgency | conflict | multimodal | <comma-separated scenario ids>
// Requires (Development only, never Production): OPENAI_API_KEY; for video
// SERVICE_AI_VIDEO_WORKER_SNAPSHOT, SERVICE_AI_VIDEO_WORKER_REGION and
// VERCEL_OIDC_TOKEN. Runs the real pipeline over in-process PGlite (real SQL),
// so no Development database rows are written. Synthetic data only.
// Records metadata, usage and timings — never the key, prompts or media.
import { writeFileSync } from "node:fs";
import { createOpenAiProvider } from "../../../src/lib/service-call/server/openai-provider.ts";
import { resolveVideoWorker } from "../../../src/lib/service-call/server/ai-config.ts";
import { freshDatabase } from "../../support/db.mjs";
import { DATASET } from "./dataset.mjs";
import { CONFLICT_SET, URGENCY_SET } from "./labelled-sets.mjs";
import { checkHardAssertions, materialise, photoBytes, runScenario } from "./harness.mjs";
import { scene, speech, video } from "./fixtures.mjs";
import { conflictMetrics, costOf, distribution, urgencyMetrics } from "./metrics.mjs";
import { EVAL_SET_VERSION } from "./thresholds.mjs";

const [suite, label, outFile] = process.argv.slice(2);
if (!suite || !label || !outFile) {
  console.error("usage: run-real.mjs <urgency|conflict|multimodal|ids> <label> <out.json>");
  process.exit(2);
}
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing (Development only)");
if (process.env.VERCEL_ENV === "production") throw new Error("never against Production");

const asText = (x) => ({ id: x.id, label: x.label, modality: "text", tags: ["labelled"], products: x.products, description: x.text, labels: { expectReport: true } });
const scenarios =
  suite === "urgency" ? URGENCY_SET.map(asText)
  : suite === "conflict" ? CONFLICT_SET.map(asText)
  : suite === "multimodal" ? DATASET.filter((s) => s.real)
  : DATASET.filter((s) => suite.split(",").includes(s.id));

// Every OpenAI call: kind, status, ms, usage. Bodies are inspected in memory only.
// One provider per lane, so each call is attributed to the scenario that made it.
const calls = [];
const providerFor = (state) => createOpenAiProvider({
  apiKey: process.env.OPENAI_API_KEY, transcribeModel: "gpt-transcribe",
  fetch: async (url, init) => {
    const kind = url.endsWith("/transcriptions") ? "transcribe" : JSON.parse(init.body).text.format.name === "photo_observation_po_1" ? "observe" : "report";
    const t0 = Date.now();
    const res = await fetch(url, init);
    const j = await res.clone().json().catch(() => null);
    calls.push({ kind, status: res.status, ms: Date.now() - t0, usage: j?.usage ?? null, body: typeof init.body === "string" ? init.body : "", scenario: state.current });
    return res;
  },
});
const provider = providerFor({});
const worker = resolveVideoWorker();
const videoProcessor = () => (worker.ok ? worker.processor : null);

const realFixtures = {
  voice: (v) => (v.segments.length ? speech(v.segments) : speech([{ text: " ", voice: "Samantha" }], { pauseSeconds: 4 })),
  video: async (v, spec) => {
    if (spec === "corrupt") return new Uint8Array(Buffer.from("not a video ".repeat(300)));
    const shots = [];
    for (const s of spec.shots) shots.push({ image: s.photo ? await photoBytes(s.photo) : await scene(s.scene), seconds: s.seconds, pan: s.pan });
    return video(shots, { audio: v.speech ? await speech(v.speech) : null, codec: spec.codec, container: spec.container, size: spec.size, fps: spec.fps });
  },
};

const LANES = Number(process.env.EVAL_LANES ?? (suite === "urgency" || suite === "conflict" ? 6 : 3));
const queue = [...scenarios];
const summaries = [];
async function lane() {
  const db = await freshDatabase();
  const state = { current: null };
  const laneProvider = providerFor(state);
  while (queue.length) {
    const sc = queue.shift();
    state.current = sc.id;
    const media = await materialise(sc, { real: true, realFixtures });
    const r = await runScenario(sc, media, { provider: laneProvider, videoProcessor, db });
    const rep = r.reports.at(-1);
    const c = rep?.ai_report.content;
    const usage = r.runs.reduce((acc, run) => { for (const [k, v] of Object.entries(run.usage ?? {})) acc[k] = (acc[k] ?? 0) + v; return acc; }, {});
    const violations = checkHardAssertions(sc, r, { calls: calls.filter((x) => x.scenario === sc.id) });
    summaries.push({
      id: sc.id, label: sc.label ?? sc.labels?.urgency ?? null, modality: sc.modality, tags: sc.tags, labels: sc.labels,
      reported: !!rep, outcomes: r.outcomes.map((o) => o.outcome + (o.errorCode ? `:${o.errorCode}` : "")),
      urgency: c ? { level: c.urgency.level, indicators: c.urgency.indicators.map((i) => `${i.indicator}/${i.basis}`), reason: c.urgency.reason } : null,
      topics: c ? c.unknownsRequiringInspection.map((u) => u.topic) : [],
      moreInformationNeeded: c?.moreInformationNeeded ?? [],
      confidence: c?.confidence.overall ?? null,
      categories: c?.potentialIssueCategories.map((p) => `${p.category}/${p.likelihood}`) ?? [],
      statements: c?.customerReported.statements.map((s) => `${s.source.type}: ${s.quote}`) ?? [],
      observations: c?.mediaObservations.map((o) => `${o.evidence.label} ${o.type}/${o.certainty}: ${o.observation}`) ?? [],
      notices: rep?.ai_report.evidenceNotices.map((n) => n.code) ?? [],
      photoAssessments: rep?.ai_report.photoAssessments.map((p) => `${p.label}:${p.quality}/${p.relevance}${p.visibleTextPresent ? "/text" : ""}${p.personalInfoVisible ? "/pii" : ""}`) ?? [],
      videoAssessments: rep?.ai_report.videoAssessments.map((v) => ({ label: v.label, partial: v.partiallyAnalysed, frames: v.frames.map((f) => `${f.atSeconds}:${f.outcome}:${f.quality ?? ""}/${f.relevance ?? ""}`), audio: v.audio.status, text: v.visibleTextPresent, pii: v.personalInfoVisible })) ?? [],
      transcripts: rep?.ai_report.transcripts.map((t) => ({ kind: t.kind, language: t.language, text: t.text, possiblyIncomplete: t.possiblyIncomplete, noSpeech: t.noSpeechDetected })) ?? [],
      analyses: r.analyses.map((a) => `${a.kind}:${a.status}${a.error_code ? `:${a.error_code}` : ""}`),
      usage, cost: costOf(usage), elapsedMs: r.elapsedMs,
      violations,
    });
    process.stdout.write(`${sc.id} ${rep ? `${c.urgency.level} ${c.confidence.overall}` : "no report"} ${violations.length ? `VIOLATIONS ${violations.map((x) => x.assertion).join(",")}` : ""} ${r.elapsedMs}ms\n`);
  }
}
function multimodalMetrics(sums) {
  const withLabel = (f) => sums.filter((x) => f(x.labels ?? {}));
  const frac = (arr, ok) => `${arr.filter(ok).length}/${arr.length}`;
  return {
    urgency: urgencyMetrics(sums.filter((x) => x.label)),
    evidenceDiscrepancyRecall: frac(withLabel((l) => l.discrepancy), (x) => x.topics.includes("EVIDENCE_DISCREPANCY")),
    statementConflictRecall: frac(withLabel((l) => l.conflict === "STATEMENT_CONFLICT"), (x) => x.topics.includes("CONFLICTING_CUSTOMER_INFORMATION")),
    expectedObservationFound: frac(withLabel((l) => l.expectObservation), (x) => x.observations.some((o) => o.includes(x.labels.expectObservation))),
    expectedRelevance: frac(withLabel((l) => l.expectRelevance), (x) => x.photoAssessments.some((p) => p.includes(x.labels.expectRelevance))),
    injectionScenarios: frac(withLabel((l) => l.injection), (x) => x.violations.length === 0 && x.urgency?.level !== "URGENT" && x.confidence !== "HIGH"),
    reportPresenceAsExpected: frac(sums, (x) => x.reported === (x.labels?.expectReport !== false)),
  };
}

const t0 = Date.now();
await Promise.all(Array.from({ length: Math.min(LANES, scenarios.length) }, lane));

const byKind = (k) => calls.filter((x) => x.kind === k);
const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) ?? 0), 0);
const out = {
  evalSet: EVAL_SET_VERSION, suite, label, at: new Date().toISOString(), wallMs: Date.now() - t0,
  provider: provider.id, models: provider.models, promptVersions: provider.promptVersions,
  videoWorker: worker.ok ? { id: worker.processor.id, version: worker.processor.version, region: worker.region } : { configured: false },
  scenarios: summaries.sort((a, b) => a.id.localeCompare(b.id)),
  metrics: {
    ...(suite === "urgency" ? { urgency: urgencyMetrics(summaries) } : {}),
    ...(suite === "conflict" ? { conflicts: conflictMetrics(summaries) } : {}),
    ...(suite !== "urgency" && suite !== "conflict" ? { multimodal: multimodalMetrics(summaries) } : {}),
    hardAssertionViolations: summaries.flatMap((s) => s.violations.map((v) => `${s.id}:${v.assertion}:${v.detail}`)),
  },
  calls: {
    report: { n: byKind("report").length, corrective: byKind("report").filter((x) => x.body.includes("YOUR PREVIOUS OUTPUT")).length, ms: distribution(byKind("report").map((x) => x.ms)) },
    correctionCodes: calls.filter((x) => x.body.includes("YOUR PREVIOUS OUTPUT")).map((x) => {
      const text = JSON.parse(x.body).input[0].content.find((p) => p.type === "input_text").text;
      return `${x.scenario}/${x.kind}: ${text.split("YOUR PREVIOUS OUTPUT")[1].split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2)).join(" | ")}`;
    }),
    observe: { n: byKind("observe").length, corrective: byKind("observe").filter((x) => x.body.includes("YOUR PREVIOUS OUTPUT")).length, ms: distribution(byKind("observe").map((x) => x.ms)) },
    transcribe: { n: byKind("transcribe").length, ms: distribution(byKind("transcribe").map((x) => x.ms)), seconds: sum(byKind("transcribe"), (x) => x.usage?.seconds) },
    errors: calls.filter((x) => x.status >= 400).map((x) => `${x.kind}:${x.status}`),
    tokens: {
      reportInput: sum(byKind("report"), (x) => x.usage?.input_tokens), reportCached: sum(byKind("report"), (x) => x.usage?.input_tokens_details?.cached_tokens), reportOutput: sum(byKind("report"), (x) => x.usage?.output_tokens),
      observeInput: sum(byKind("observe"), (x) => x.usage?.input_tokens), observeCached: sum(byKind("observe"), (x) => x.usage?.input_tokens_details?.cached_tokens), observeOutput: sum(byKind("observe"), (x) => x.usage?.output_tokens),
    },
  },
  elapsedMs: distribution(summaries.map((s) => s.elapsedMs)),
  cost: { openAiUsd: +sum(summaries, (s) => s.cost.openAiUsd).toFixed(4), sandboxUsdUpperBound: +sum(summaries, (s) => s.cost.sandboxUsdUpperBound).toFixed(5), sandboxSessions: sum(summaries, (s) => s.usage.videoWorkerSessions) },
};
writeFileSync(outFile, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ metrics: out.metrics, calls: { ...out.calls, tokens: out.calls.tokens }, cost: out.cost, elapsedMs: out.elapsedMs }, null, 1));
process.exit(0);
