// Phase 4F quality metrics over evaluation results (pure functions).
// A "result summary" is what run-real.mjs records per scenario:
//   { id, label, urgency: { level, indicators }, topics: [..], moreInformationNeeded: [..], reported: bool, … }

const rate = (n, d) => (d ? Math.round((n / d) * 1000) / 1000 : null);
const SAFETY_QUESTION = /safe|secur|danger|sharp|loose|broken|shatter|fall|water|leak|injur|lock|glass|smok|spark|electric/i;

export function urgencyMetrics(summaries) {
  const by = (l) => summaries.filter((s) => s.label === l && s.reported);
  const N = by("NORMAL"), U = by("URGENT"), A = by("AMBIGUOUS");
  const lvl = (s) => s.urgency?.level;
  const followUp = (s) => s.topics.includes("SAFETY_CONFIRMATION") || s.moreInformationNeeded.some((q) => SAFETY_QUESTION.test(q));
  const matrix = {};
  for (const s of summaries.filter((x) => x.reported)) (matrix[s.label] ??= {})[lvl(s)] = ((matrix[s.label] ??= {})[lvl(s)] ?? 0) + 1;
  return {
    counts: { NORMAL: N.length, URGENT: U.length, AMBIGUOUS: A.length, notReported: summaries.filter((s) => !s.reported).map((s) => s.id) },
    matrix,
    genuineUrgentRecall: rate(U.filter((s) => lvl(s) === "URGENT").length, U.length),
    falseUrgentRate: rate(N.filter((s) => lvl(s) === "URGENT").length, N.length),
    normalOverEscalation: rate(N.filter((s) => ["HIGH", "URGENT"].includes(lvl(s))).length, N.length),
    ambiguousLow: A.filter((s) => lvl(s) === "LOW").length,
    ambiguousSafetyFollowUp: rate(A.filter(followUp).length, A.length),
    falseUrgentIds: N.filter((s) => lvl(s) === "URGENT").map((s) => s.id),
    missedUrgentIds: U.filter((s) => lvl(s) !== "URGENT").map((s) => `${s.id}:${lvl(s)}`),
  };
}

export function conflictMetrics(summaries) {
  const by = (l) => summaries.filter((s) => s.label === l && s.reported);
  const S = by("SELECTION_MISMATCH"), C = by("STATEMENT_CONFLICT"), K = by("CONSISTENT");
  const has = (s, t) => s.topics.includes(t);
  const anyConflict = (s) => has(s, "CONFLICTING_CUSTOMER_INFORMATION") || has(s, "PRODUCT_SELECTION_MISMATCH") || has(s, "EVIDENCE_DISCREPANCY");
  return {
    counts: { SELECTION_MISMATCH: S.length, STATEMENT_CONFLICT: C.length, CONSISTENT: K.length },
    selectionMismatchAsStatementConflict: rate(S.filter((s) => has(s, "CONFLICTING_CUSTOMER_INFORMATION")).length, S.length),
    selectionMismatchDetected: rate(S.filter((s) => has(s, "PRODUCT_SELECTION_MISMATCH")).length, S.length),
    statementConflictRecall: rate(C.filter((s) => has(s, "CONFLICTING_CUSTOMER_INFORMATION")).length, C.length),
    consistentFalseConflict: rate(K.filter(anyConflict).length, K.length),
    detail: [...S, ...C, ...K].map((s) => `${s.id}:${s.label}→${s.topics.filter((t) => ["CONFLICTING_CUSTOMER_INFORMATION", "PRODUCT_SELECTION_MISMATCH", "EVIDENCE_DISCREPANCY"].includes(t)).join("+") || "none"}`),
  };
}

/** Median, max and (n ≥ 20) p95 of a list of numbers. */
export function distribution(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const q = (p) => v[Math.min(v.length - 1, Math.ceil(p * v.length) - 1)];
  return { n: v.length, median: v.length % 2 ? v[(v.length - 1) / 2] : Math.round((v[v.length / 2 - 1] + v[v.length / 2]) / 2), max: v.at(-1), ...(v.length >= 20 ? { p95: q(0.95) } : {}) };
}

/** OpenAI list prices used throughout Phase 4 (USD per 1M tokens / per minute). */
export const PRICES = { input: 2, cachedInput: 0.1, output: 10, transcribePerMinute: 0.006 };
export const SANDBOX_PRICES = { cpuHour: 0.128, gbHour: 0.0212, perCreation: 0.6 / 1e6, vcpus: 2, memoryGb: 4 };

export function costOf(usage) {
  const tok = (p) => ({ input: usage[`${p}InputTokens`] ?? 0, cached: usage[`${p}CachedInputTokens`] ?? 0, output: usage[`${p}OutputTokens`] ?? 0 });
  const r = tok("openaiReport"), o = tok("openaiObserve");
  const llm = ((r.input - r.cached + o.input - o.cached) * PRICES.input + (r.cached + o.cached) * PRICES.cachedInput + (r.output + o.output) * PRICES.output) / 1e6;
  const transcribe = ((usage.openaiTranscribeSeconds ?? 0) / 60) * PRICES.transcribePerMinute;
  const hours = (usage.videoWorkerMs ?? 0) / 3_600_000;
  const sandbox = hours * SANDBOX_PRICES.vcpus * SANDBOX_PRICES.cpuHour + hours * SANDBOX_PRICES.memoryGb * SANDBOX_PRICES.gbHour + (usage.videoWorkerSessions ?? 0) * SANDBOX_PRICES.perCreation;
  return { openAiUsd: +(llm + transcribe).toFixed(5), sandboxUsdUpperBound: +sandbox.toFixed(5) };
}
