// Phase 4F labelled text sets (eval-1). Synthetic wording only — no real
// customer data. Labels were assigned before any model was run.
//
// URGENT means immediate danger or the property cannot be secured, per the
// service team's definition: shattered/loose/falling glass or exposed sharp
// edges, cannot lock or secure an external door/window, water actively
// entering now, a component about to fall or that has injured someone,
// electrical/motor smoke, sparks or shock. Damage that is contained (a crack
// in an intact pane, a stiff handle, condensation) is NOT urgent, however
// annoying. AMBIGUOUS cases lack the context to decide: the right behaviour is
// to stay conservative (never LOW) and ask a safety question.

export const URGENCY_SET = [
  // ── NORMAL (20) ──
  { id: "u-n01", label: "NORMAL", products: ["window"], text: "There's a small crack in the corner of the bedroom window glass. It's been like that for a few weeks." },
  { id: "u-n02", label: "NORMAL", products: ["hardware"], text: "The handle on the kitchen window is stiff and hard to turn." },
  { id: "u-n03", label: "NORMAL", products: ["glass"], text: "There is condensation between the panes of the living room window." },
  { id: "u-n04", label: "NORMAL", products: ["sliding-door"], text: "The sliding door is a bit noisy when I open it. It still works fine." },
  { id: "u-n05", label: "NORMAL", products: ["window"], text: "A hairline crack has appeared in the outer pane of the double glazing. The inner pane is fine and nothing is loose." },
  { id: "u-n06", label: "NORMAL", products: ["window"], text: "The rubber seal around the window frame has come away at the top corner." },
  { id: "u-n07", label: "NORMAL", products: ["entrance-door"], text: "The paint on the front door frame is peeling near the bottom." },
  { id: "u-n08", label: "NORMAL", products: ["bi-fold-door"], text: "The bi-fold door needs a firm push to close fully, but it locks properly." },
  { id: "u-n09", label: "NORMAL", products: ["glass"], text: "There's a small chip on the edge of the glass balustrade, about the size of a fingernail." },
  { id: "u-n10", label: "NORMAL", products: ["window"], text: "Some light scratches on the window glass after cleaning." },
  { id: "u-n11", label: "NORMAL", products: ["hardware"], text: "One of the cover caps on the hinge has fallen off. The hinge itself works." },
  { id: "u-n12", label: "NORMAL", products: ["motorised-system"], text: "The motorised blind is slower than it used to be." },
  { id: "u-n13", label: "NORMAL", products: ["window"], text: "There's a slight draught from the bedroom window when it's windy." },
  { id: "u-n14", label: "NORMAL", products: ["sliding-door"], text: "The sliding door lock is stiff but it does lock and the door is secure." },
  { id: "u-n15", label: "NORMAL", products: ["window"], text: "After heavy rain there were a few water stains on the sill yesterday. It's dry now." },
  { id: "u-n16", label: "NORMAL", products: ["curtain-wall"], text: "A cosmetic crack in the cladding trim next to the curtain wall, no glass is damaged." },
  { id: "u-n17", label: "NORMAL", products: ["window"], text: "Cracked glass in the small toilet window, the crack is in one corner and the pane is solid." },
  { id: "u-n18", label: "NORMAL", products: ["entrance-door"], text: "The door closer on the entrance door slams a bit too fast." },
  { id: "u-n19", label: "NORMAL", products: ["glass"], text: "There's a mark inside the double glazing that looks like a smudge between the panes." },
  { id: "u-n20", label: "NORMAL", products: ["hardware"], text: "The window key is lost, the window is closed and locked." },
  // ── URGENT (10) ──
  { id: "u-u01", label: "URGENT", products: ["glass"], text: "The pane has shattered and loose glass is falling out of the frame." },
  { id: "u-u02", label: "URGENT", products: ["entrance-door"], text: "The front door won't lock and the property cannot be secured." },
  { id: "u-u03", label: "URGENT", products: ["glass"], text: "There are exposed sharp pieces of broken glass hanging in the patio door." },
  { id: "u-u04", label: "URGENT", products: ["window"], text: "Water is pouring in through the window frame right now and running down the wall." },
  { id: "u-u05", label: "URGENT", products: ["motorised-system"], text: "The motor on the skylight is smoking and there's a burning smell." },
  { id: "u-u06", label: "URGENT", products: ["window"], text: "The window sash has come off its hinge and is hanging over the street on the third floor." },
  { id: "u-u07", label: "URGENT", products: ["sliding-door"], text: "The sliding door came off the track and fell, my son's foot was hurt. It's leaning against the wall." },
  { id: "u-u08", label: "URGENT", products: ["entrance-door"], text: "Someone tried to break in, the lock is smashed and the back door can't be closed." },
  { id: "u-u09", label: "URGENT", products: ["glass"], text: "The glass balustrade on the balcony is cracked right through and moves when touched, the kids use the balcony." },
  { id: "u-u10", label: "URGENT", products: ["motorised-system"], text: "I got an electric shock from the switch of the motorised awning." },
  // ── AMBIGUOUS (12) ──
  { id: "u-a01", label: "AMBIGUOUS", products: ["glass"], text: "The glass is cracked." },
  { id: "u-a02", label: "AMBIGUOUS", products: ["entrance-door"], text: "Problem with the lock on the door." },
  { id: "u-a03", label: "AMBIGUOUS", products: ["window"], text: "Water near the window." },
  { id: "u-a04", label: "AMBIGUOUS", products: ["glass"], text: "Big crack across the whole glass door." },
  { id: "u-a05", label: "AMBIGUOUS", products: ["motorised-system"], text: "The motor makes a strange smell sometimes." },
  { id: "u-a06", label: "AMBIGUOUS", products: ["window"], text: "The window doesn't close properly." },
  { id: "u-a07", label: "AMBIGUOUS", products: ["hardware"], text: "The handle came off." },
  { id: "u-a08", label: "AMBIGUOUS", products: ["window"], text: "Leak." },
  { id: "u-a09", label: "AMBIGUOUS", products: ["sliding-door"], text: "The sliding door glass panel is wobbly." },
  { id: "u-a10", label: "AMBIGUOUS", products: ["glass"], text: "Something hit the window and now there's a crack spreading from it." },
  { id: "u-a11", label: "AMBIGUOUS", products: ["entrance-door"], text: "The door is hard to lock at night." },
  { id: "u-a12", label: "AMBIGUOUS", products: ["curtain-wall"], text: "Saw a gap in the curtain wall glass from outside." },
];

/**
 * Conflict classification (eval-1).
 *   SELECTION_MISMATCH  the product selected differs from the product described — not contradictory testimony
 *   STATEMENT_CONFLICT  the customer's own statements contradict each other
 *   CONSISTENT          nothing contradicts
 * Media-vs-customer (EVIDENCE_DISCREPANCY) is evaluated in the multimodal set.
 */
export const CONFLICT_SET = [
  { id: "c-s01", label: "SELECTION_MISMATCH", products: ["window"], text: "My front door won't lock properly, the key turns but the bolt doesn't move fully." },
  { id: "c-s02", label: "SELECTION_MISMATCH", products: ["sliding-door"], text: "The kitchen window handle is loose." },
  { id: "c-s03", label: "SELECTION_MISMATCH", products: ["glass"], text: "The motorised skylight won't open with the remote." },
  { id: "c-s04", label: "SELECTION_MISMATCH", products: ["curtain-wall"], text: "The bi-fold doors drag on the floor when I fold them." },
  { id: "c-s05", label: "SELECTION_MISMATCH", products: ["hardware"], text: "Condensation inside the double glazing of the bedroom window." },
  { id: "c-c01", label: "STATEMENT_CONFLICT", products: ["sliding-door"], text: "The sliding door won't close at all. It closes fine but it won't lock." },
  { id: "c-c02", label: "STATEMENT_CONFLICT", products: ["window"], text: "The glass is cracked in the living room. To be clear there's no damage to the glass, it's only the frame." },
  { id: "c-c03", label: "STATEMENT_CONFLICT", products: ["entrance-door"], text: "The problem started yesterday. It's been like this since we moved in two years ago." },
  { id: "c-c04", label: "STATEMENT_CONFLICT", products: ["window"], text: "Only the bedroom window is affected. The same problem is on every window in the house." },
  { id: "c-c05", label: "STATEMENT_CONFLICT", products: ["motorised-system"], text: "The awning motor is completely dead, nothing happens. It moves halfway and then stops." },
  { id: "c-n01", label: "CONSISTENT", products: ["sliding-door"], text: "The sliding door is hard to open and makes a grinding noise." },
  { id: "c-n02", label: "CONSISTENT", products: ["window", "hardware"], text: "The window handle is loose and the window doesn't seal fully." },
  { id: "c-n03", label: "CONSISTENT", products: ["entrance-door"], text: "The front door drops at the handle side and rubs the frame." },
  { id: "c-n04", label: "CONSISTENT", products: ["glass"], text: "There's condensation between the panes of two windows in the bedroom." },
  { id: "c-n05", label: "CONSISTENT", products: ["other"], text: "The garden room roof panel has a small leak at one corner when it rains heavily." },
];
