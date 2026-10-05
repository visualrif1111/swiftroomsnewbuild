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
  | "ELIGIBILITY_OR_APPROVAL";

const RULES: { rule: ForbiddenClaimRule; pattern: RegExp }[] = [
  { rule: "PRICE_OR_QUOTE", pattern: /\b(aed|dhs?|dirhams?|usd|eur|gbp)\s?\d|\d[\d,.]*\s?(aed|dhs?|dirhams?|usd)\b|[$€£]\s?\d|\bfree of charge\b|\bat no (extra |additional )?(cost|charge)\b|\b(price|cost|quote|quotation|fee|charge)s?\s+(is|are|will be|would be)\s+(about|around|approximately|roughly|only)?\s*\d/i },
  { rule: "REPAIR_COMMITMENT", pattern: /\b(we|swift rooms|the team|our (team|engineers?|technicians?))\s+(will|shall|are going to)\s+(repair|fix|replace|resolve)\b|\b(is|are) guaranteed\b|\bwe guarantee\b|\bguaranteed (repair|fix|replacement)\b|\bwill (definitely|certainly) be (repaired|fixed|replaced)\b/i },
  { rule: "WARRANTY_CONFIRMATION", pattern: /\bcover(s|ed)? (by|under) (the |a |your )?(manufacturer'?s? )?warrant(y|ies)\b|\b(is|are|it's|remains?) (still )?(under|within|in) warranty\b|\bwarranty (covers|applies|will cover|is valid)\b|\b(eligible|qualif(y|ies)) (for|under) (the )?warranty\b/i },
  { rule: "APPOINTMENT_COMMITMENT", pattern: /\b(appointment|visit|inspection)\s+(is|has been|will be)\s+(booked|confirmed|scheduled|arranged)\b|\b(we|an engineer|a technician)\s+will\s+(visit|attend|come)\s+(on|at|tomorrow|today)\b/i },
  { rule: "MEASUREMENT", pattern: /\b\d+(\.\d+)?\s?(mm|cm|m|metres?|meters?|millimet(re|er)s?|centimet(re|er)s?|inch(es)?|ft|feet|foot|kg)\b|\b\d+(\.\d+)?\s?(["″]|°c)/i },
  { rule: "LIABILITY", pattern: /\b(our|swift rooms'?s?|the installer'?s?|installation|manufacturing|manufacturer'?s?) (fault|error|defect|mistake)\b|\b(you are|the customer is|the homeowner is|the owner is) (responsible|liable|at fault)\b|\b(caused by|due to|result of) (poor|incorrect|improper|faulty|bad|careless) (installation|workmanship|maintenance|use|handling)\b|\bnot (our|swift rooms'?s?) responsibility\b|\b(is|are) liable\b|\bliability (is|lies|rests)\b/i },
  { rule: "ELIGIBILITY_OR_APPROVAL", pattern: /\b(is|are|will be) (eligible|approved) for\b|\b(qualifies|qualify) for (a |an |the )?(repair|replacement|refund|compensation|free)\b|\b(replacement|repair|refund) (is|has been) (approved|authori[sz]ed)\b|\bwill be replaced (free|at no)\b/i },
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

/** Hedging words expected in any observation that isn't CLEAR. */
export const HEDGE = /\b(appears?|apparent(ly)?|seems?|looks?( like)?|possibl[ey]|may|might|likely|suggests?|could)\b/i;

// ─── Safety keyword net over what the customer wrote/said ────────────────────
// Raises flags for staff regardless of what (or whether) the AI concluded, so
// an AI outage or mistake can't hide an obviously urgent report.
const SAFETY_PATTERNS: { indicator: UrgencyIndicator; pattern: RegExp }[] = [
  { indicator: "CANNOT_SECURE_PROPERTY", pattern: /\b(won'?t|can'?t|cannot|doesn'?t|does not|will not|unable to|not)\s+(lock|close|shut|secure)\b|\b(lock|latch)\s+(is\s+)?(broken|not working)\b/i },
  { indicator: "BROKEN_OR_UNSTABLE_GLASS", pattern: /\b(shatter(ed|ing)?|smashed)\b|\bbroken glass\b|\bglass\s+(is\s+|has\s+)?(broken|cracked|shattered|loose|falling)\b|\bcrack(ed)?\s+(glass|pane|glazing)\b/i },
  { indicator: "ACTIVE_WATER_INGRESS", pattern: /\bwater\s+(is\s+)?(coming|leaking|pouring|getting|dripping|seeping)\s+(in|through)\b|\b(leak(s|ing)?|flood(ed|ing)?)\b/i },
  { indicator: "INJURY_RISK_LOOSE_COMPONENT", pattern: /\b(hanging|falling|fell)\s+(off|down|out)\b|\b(dangerous|unsafe|injur(y|ed)|hurt)\b/i },
  { indicator: "ELECTRICAL_OR_MOTOR_HAZARD", pattern: /\b(spark(s|ing)?|smok(e|ing)|burning smell|electric(al)? shock)\b/i },
];

export function detectSafetyFlags(text: string): UrgencyIndicator[] {
  return SAFETY_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ indicator }) => indicator);
}
