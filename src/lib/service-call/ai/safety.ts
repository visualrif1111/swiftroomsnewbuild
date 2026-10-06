// Deterministic safety checks for Service Call Reports.
//
// One layer among several (strict schema, semantic validation, human review).
// Keyword rules can't understand meaning: they catch the obvious forms of
// claims the AI must never make, and accept that unusual wording can slip
// past and that a careful sentence can occasionally be rejected. A rejected
// report fails processing safely; nothing is shown to the customer.
import type { UrgencyIndicator } from "./report-schema";

export type ForbiddenClaimRule =
  | "PRICE_OR_QUOTE"
  | "REPAIR_COMMITMENT"
  | "WARRANTY_CONFIRMATION"
  | "APPOINTMENT_COMMITMENT"
  | "MEASUREMENT"
  | "DEFINITIVE_DIAGNOSIS"
  | "LIABILITY"
  | "ELIGIBILITY_OR_APPROVAL"
  | "CAUSATION";

const RULES: { rule: ForbiddenClaimRule; pattern: RegExp }[] = [
  { rule: "PRICE_OR_QUOTE", pattern: /\b(aed|dhs?|dirhams?|usd|eur|gbp)\s?\d|\d[\d,.]*\s?(aed|dhs?|dirhams?|usd)\b|[$€£]\s?\d|\bfree of charge\b|\bat no (extra |additional )?(cost|charge)\b|\b(price|cost|quote|quotation|fee|charge)s?\s+(is|are|will be|would be)\s+(about|around|approximately|roughly|only)?\s*\d/i },
  { rule: "REPAIR_COMMITMENT", pattern: /\b(we|swift rooms|the team|our (team|engineers?|technicians?))\s+(will|shall|are going to)\s+(repair|fix|replace|resolve)\b|\b(is|are) guaranteed\b|\bwe guarantee\b|\bguaranteed (repair|fix|replacement)\b|\bwill (definitely|certainly) be (repaired|fixed|replaced)\b/i },
  { rule: "WARRANTY_CONFIRMATION", pattern: /\bcover(s|ed)? (by|under) (the |a |your )?(manufacturer'?s? )?warrant(y|ies)\b|\b(is|are|it's|remains?) (still )?(under|within|in) warranty\b|\bwarranty (covers|applies|will cover|is valid)\b|\b(eligible|qualif(y|ies)) (for|under) (the )?warranty\b/i },
  { rule: "APPOINTMENT_COMMITMENT", pattern: /\b(appointment|visit|inspection)\s+(is|has been|will be)\s+(booked|confirmed|scheduled|arranged)\b|\b(we|an engineer|a technician)\s+will\s+(visit|attend|come)\s+(on|at|tomorrow|today)\b/i },
  { rule: "MEASUREMENT", pattern: /\b\d+(\.\d+)?\s?(mm|cm|m|metres?|meters?|millimet(re|er)s?|centimet(re|er)s?|inch(es)?|ft|feet|foot|kg)\b|\b\d+(\.\d+)?\s?(["″]|°c)/i },
  { rule: "LIABILITY", pattern: /\b(our|swift rooms'?s?|the installer'?s?|installation|manufacturing|manufacturer'?s?) (fault|error|defect|mistake)\b|\b(you are|the customer is|the homeowner is|the owner is) (responsible|liable|at fault)\b|\b(caused by|due to|result of) (poor|incorrect|improper|faulty|bad|careless) (installation|workmanship|maintenance|use|handling)\b|\bnot (our|swift rooms'?s?) responsibility\b|\b(is|are) liable\b|\bliability (is|lies|rests)\b/i },
  { rule: "ELIGIBILITY_OR_APPROVAL", pattern: /\b(is|are|will be) (eligible|approved) for\b|\b(qualifies|qualify) for (a |an |the )?(repair|replacement|refund|compensation|free)\b|\b(replacement|repair|refund) (is|has been) (approved|authori[sz]ed)\b|\bwill be replaced (free|at no)\b/i },
  // Photo observations describe; they never explain (Phase 4D).
  { rule: "CAUSATION", pattern: /\b(caused by|due to|because of|as a result of|results? from|resulting from|owing to|attributable to)\b/i },
  { rule: "DEFINITIVE_DIAGNOSIS", pattern: /\b(has|have) (failed|broken down|worn out)\b|\b(is|are) (faulty|defective|failed)\b|\bthe (root )?cause (is|was)\b|\b(caused by|due to) (a |the )?(faulty|failed|broken|defective)\b|\b(needs?|requires?) (to be )?replac(ed|ing|ement)\b|\bmust be replaced\b|\bdefinitely\b/i },
];

export function scanForbiddenClaims(text: string, rules: ForbiddenClaimRule[] = RULES.map((r) => r.rule)) {
  const hits: { rule: ForbiddenClaimRule; match: string }[] = [];
  for (const { rule, pattern } of RULES) {
    if (!rules.includes(rule)) continue;
    const m = text.match(pattern);
    if (m) hits.push({ rule, match: m[0] });
  }
  return hits;
}

// ─── Instruction disclosure (Phase 4F) ───────────────────────────────────────
// A report must never repeat the instructions the model was given (a prompt
// injection may ask for them). Detected as any run of 14+ consecutive words
// copied from the instructions (14 — short enough to catch a leak, long enough
// that legitimately restating a criterion is not mistaken for one), plus fixed canary phrases that exist
// only in our instructions (kept in sync by a test).
export const INSTRUCTION_CANARIES = [
  "internal service call report",
  "output rules",
  "the json schema is enforced",
  "these rules are checked by software",
  "you examine one customer photograph",
];
const SHINGLE = 14;
const words = (s: string) => s.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
const shingles = (w: string[]) => new Set(w.length < SHINGLE ? [] : w.slice(0, w.length - SHINGLE + 1).map((_, i) => w.slice(i, i + SHINGLE).join(" ")));
const instructionCache = new Map<string, Set<string>>();

/** True when `text` reproduces our instructions (a canary phrase or ≥ 14 consecutive instruction words). */
export function disclosesInstructions(text: string, instructions: readonly string[] = []): boolean {
  const lower = text.toLowerCase().replace(/\s+/g, " ");
  if (INSTRUCTION_CANARIES.some((c) => lower.includes(c))) return true;
  const out = shingles(words(text));
  if (!out.size) return false;
  for (const ins of instructions) {
    let set = instructionCache.get(ins);
    if (!set) instructionCache.set(ins, (set = shingles(words(ins))));
    for (const s of out) if (set.has(s)) return true;
  }
  return false;
}

/** Hedging words expected in any observation that isn't CLEAR. */
export const HEDGE = /\b(appears?|apparent(ly)?|seems?|looks?( like)?|possibl[ey]|may|might|likely|suggests?|could)\b/i;

// ─── Safety keyword net over what the customer wrote/said ────────────────────
// Raises flags for staff regardless of what (or whether) the AI concluded, so
// an AI outage or mistake can't hide an obviously urgent report.
const SAFETY_PATTERNS: { indicator: UrgencyIndicator; pattern: RegExp }[] = [
  { indicator: "CANNOT_SECURE_PROPERTY", pattern: /\b(won'?t|can'?t|cannot|doesn'?t|does not|will not|unable to|not)\s+(lock|close|shut|secure)\b|\b(lock|latch)\s+(is\s+)?(broken|not working)\b/i },
  { indicator: "BROKEN_OR_UNSTABLE_GLASS", pattern: /\b(shatter(ed|ing)?|smashed)\b|\bbroken glass\b|\bglass\s+(is\s+|has\s+)?(broken|shattered|loose|falling)\b|\bsharp (pieces|edges|shards)\b/i },
  // Phase 4F: a crack alone is damage, not established danger. Still flagged
  // (so the AI can't rate it LOW), but never as broken/unstable glass.
  { indicator: "CONTAINED_DAMAGE", pattern: /\bglass\s+(is\s+|has\s+)?(cracked|chipped)\b|\bcrack(ed|s)?\s+(in\s+)?(the\s+)?(glass|pane|glazing)\b|\bcracked\s+(glass|pane|glazing)\b/i },
  { indicator: "ACTIVE_WATER_INGRESS", pattern: /\bwater\s+(is\s+)?(coming|leaking|pouring|getting|dripping|seeping)\s+(in|through)\b|\b(leak(s|ing)?|flood(ed|ing)?)\b/i },
  { indicator: "INJURY_RISK_LOOSE_COMPONENT", pattern: /\b(hanging|falling|fell)\s+(off|down|out)\b|\b(dangerous|unsafe|injur(y|ed)|hurt)\b/i },
  { indicator: "ELECTRICAL_OR_MOTOR_HAZARD", pattern: /\b(spark(s|ing)?|smok(e|ing)|burning smell|electric(al)? shock)\b/i },
];

export function detectSafetyFlags(text: string): UrgencyIndicator[] {
  return SAFETY_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ indicator }) => indicator);
}
