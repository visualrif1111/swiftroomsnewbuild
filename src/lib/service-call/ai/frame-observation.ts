// Video frame observation (Phase 4E): one sampled still from a customer video,
// analysed exactly like a photo (po-1) plus the single-frame temporal rule.
//
// A still frame shows one instant. It can't establish movement, operation
// (opening/closing, sliding, sticking, catching, jamming), sequence
// (before/after, starts/stops), frequency (repeatedly, intermittently,
// always), progression (getting worse), active leakage, or anything about the
// whole video. Such wording is rejected, never softened: behaviour over time
// is an UNKNOWN that staff assess from the original video.
import { validatePhotoObservation, type PhotoValidation } from "./photo-observation-schema";

/** Claims about a whole video, which sampled frames can never support (also checked in reports). */
export const WHOLE_VIDEO = /\b(throughout|the (whole|entire|full) (video|clip|recording|footage)|(in|across) (all|every|each) (of the )?frames?|(across|during|over) the (video|clip|recording|footage)|the (video|clip|recording|footage) (shows|demonstrates|confirms|reveals|proves)|over the course)\b/i;

/**
 * Temporal wording, by rule. Product names that merely contain such words
 * ("sliding door", "door stop", "window catch", "door jamb", the "opening" of
 * a frame) are deliberately not matched; states visible in one instant
 * ("appears closed", "appears open") are allowed.
 */
export const TEMPORAL_RULES: { rule: string; pattern: RegExp }[] = [
  { rule: "MOVEMENT", pattern: /\b(moves?|moving|moved|movement|motion|in motion|slides|slid|swings?|swinging|rattl(e|es|ed|ing)|vibrat(e|es|ed|ing)|wobbl(e|es|ed|ing)|shak(e|es|ing)|shook)\b|\bsliding\b(?!\s+(door|doors|panel|panels|sash|sashes|window|windows|system|systems|track|tracks|unit|units|leaf|leaves|glass|glazing|frame|frames))/i },
  { rule: "OPERATION", pattern: /\b(opens|closes|is (being )?(opened|closed)|being (opened|closed)|operat(es|ing|ed)|in operation|(won'?t|doesn'?t|does not|will not|cannot|can'?t|unable to|fails? to|failing to|difficult to|hard to|struggles? to) (open|close|shut|lock|unlock|latch|slide|move|operate|turn)|(opening|closing) (and|or) (closing|opening)|(when|while|as) (it )?(is )?(opening|closing|opened|closed|operated|used))\b/i },
  { rule: "STICKING_OR_JAMMING", pattern: /\b(to|may|might|can|will|does|would) catch\b|\bcatch(es)? on\b|\b(sticks|sticking|stuck|catches|catching|caught|jams|jammed|jamming|binds|binding|grinds|grinding|scrap(es|ing)|drags|dragging|seiz(es|ed|ing))\b/i },
  { rule: "SEQUENCE", pattern: /\b(to|may|might|will|would) (stop|start)\b|\b(before|after|afterwards|then|later|earlier|subsequently|at first|initially|eventually|starts|started|starting|stops|stopped|stopping|begins|began|ends up)\b/i },
  { rule: "FREQUENCY", pattern: /\b(repeated(ly)?|intermittent(ly)?|occasional(ly)?|sometimes|keeps|kept|always|never|constant(ly)?|continuous(ly)?|every time|each time|again|recurr(ing|ent|s)|frequent(ly)?|periodic(ally)?)\b/i },
  { rule: "PROGRESSION", pattern: /\b(getting (worse|bigger|larger|wider)|worsening|increasing|decreasing|growing|spreading|progress(ing|ive|es|ed)|deteriorating|developing|over time)\b/i },
  { rule: "ACTIVE_LEAKAGE", pattern: /\b(leak(s|ing|ed)?|drip(s|ping|ped)?|flow(s|ing)|trickl(e|es|ing)|seep(s|ing)|pour(s|ing)|running water|actively|active (leak|water|ingress))\b|\bwater\b[^.;]{0,40}\b(entering|enters|coming in|getting in|coming through|penetrating|running)\b/i },
  { rule: "WHOLE_VIDEO", pattern: WHOLE_VIDEO },
];

/** Rule names whose wording appears in `text`. */
export function findTemporalClaims(text: string): string[] {
  return TEMPORAL_RULES.filter((r) => r.pattern.test(text)).map((r) => r.rule);
}

/** po-1 validation plus the single-frame temporal rule on observations and locations. */
export function validateFrameObservation(input: unknown): PhotoValidation {
  const base = validatePhotoObservation(input);
  const errors = base.ok ? [] : [...base.errors];
  const obs = (input as { observations?: unknown } | null)?.observations;
  if (Array.isArray(obs)) {
    obs.forEach((o, i) => {
      if (typeof o !== "object" || o === null) return;
      for (const field of ["observation", "location"] as const) {
        const v = (o as Record<string, unknown>)[field];
        if (typeof v === "string") findTemporalClaims(v).forEach((rule) => errors.push(`observations[${i}].${field}: temporal_claim_from_single_frame:${rule}`));
      }
    });
  }
  return errors.length ? { ok: false, errors: errors.slice(0, 40) } : base;
}
