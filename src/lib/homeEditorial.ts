// Homepage editorial sections.
//
// Long-form copy that sits between the homepage's visual sections, carrying
// most of its organic search weight. Ported from the live site at
// swiftrooms.ae, which is built from a separate codebase that holds this text
// hard-coded rather than in Sanity — a search of the shared dataset returns no
// documents containing it.
//
// Kept as data rather than JSX so the copy is editable in one place and can be
// moved into Sanity later without touching the rendering. `anchor` positions
// each block relative to the existing sections in HomeClient.

export type EditorialSection = {
  /** Stable id, also used as the section's anchor. */
  id: string;
  /** Small uppercase label above the heading. */
  eyebrow: string;
  heading: string;
  /**
   * Heading level. The live site runs h2 down to h6 as the page progresses;
   * mirrored here so the document outline matches.
   */
  level: 2 | 3 | 4 | 5 | 6;
  /** One or two paragraphs of body copy. */
  body: string[];
  /** Supporting takeaways, rendered as a bulleted list. */
  points: string[];
  /** Visual treatment — `muted` sits on the grey band. */
  tone?: "default" | "muted";
};

export const homeEditorial: Record<string, EditorialSection> = {
  rethinkingGlazing: {
    id: "rethinking-glazing",
    eyebrow: "Why it's changing",
    heading: "UAE Homeowners Are Rethinking Their Glazing",
    level: 2,
    body: [
      "A decade ago, most villas got whatever aluminium the contractor had a relationship with, and owners rarely questioned the spec.",
      "That's changed. Rising energy costs and a few brutal summers have pushed more people to ask what's actually behind the frame, thermal break width, glass coating, gasket quality, before signing off on aluminium doors and windows in Dubai that'll be in place for the next twenty years.",
    ],
    points: [
      "Energy costs are the main driver behind more informed glazing decisions",
      "Homeowners increasingly ask for spec sheets rather than accepting a generic quote",
      "A twenty-year installation is worth the extra week of research upfront",
    ],
  },

  beyondTheFix: {
    id: "beyond-the-fix",
    eyebrow: "Beyond the fix",
    heading: "Aluminium Doors And Windows Dubai – From Solving Problems To Designing Possibilities",
    level: 3,
    body: [
      "Fixing heat penetration and poor sealing is really just the starting point. Once a home's envelope actually performs the way it should, the more interesting conversation opens up, what could this space become if the wall between inside and outside wasn't really a wall anymore.",
      "That's usually where garden rooms, full-width sliding walls, and reworked rear elevations enter the discussion.",
    ],
    points: [
      "Performance upgrades and design upgrades are often the same project",
      "A well-sealed home makes larger glazed openings practical, not riskier",
      "Rear elevation redesigns are commonly driven by a maintenance problem first",
    ],
    tone: "muted",
  },

  worthTransforming: {
    id: "worth-transforming",
    eyebrow: "Worth transforming",
    heading: "What Makes a Space Worth Transforming",
    level: 3,
    body: [
      "Not every unused corner of a plot is worth glazing over, the ones that actually get used afterward tend to share a few things in common. Direct access from a main living area, some natural shade for at least part of the day, and a view worth looking at.",
      "A garden room tacked onto a side wall nobody walks past usually ends up as expensive storage, not the living space it was meant to be.",
    ],
    points: [
      "Proximity to existing living areas is the strongest predictor of actual use",
      "Shade orientation matters as much as glazing spec for year-round comfort",
      "Worth walking the space at different times of day before committing to a design",
    ],
  },

  choosingASystem: {
    id: "choosing-a-system",
    eyebrow: "Choosing a system",
    heading: "How to Actually Think About the Right System",
    level: 4,
    body: [
      "Six product categories can feel like six decisions, but most projects really come down to one question first: what does this specific opening need to do. A wall that needs to fully disappear points toward bi-fold. A wide view that should stay mostly fixed points toward sliding.",
      "Ventilation-first rooms usually point toward standard casement or uPVC. Whichever category it lands on, the goal for any aluminium doors and windows in Dubai project is the same: match the system to the room, not the other way around.",
    ],
    points: [
      "Start from what the opening needs to do, not the product name",
      "Most villas end up mixing two or three systems across different rooms",
      "The right system is usually obvious once the room's purpose is clear",
    ],
    tone: "muted",
  },

  realProjects: {
    id: "real-projects",
    eyebrow: "Proven in the field",
    heading: "Real Projects, Real Conditions",
    level: 4,
    body: [
      "A spec sheet says one thing; a system that's been through three UAE summers says another. The projects below aren't showroom demonstrations, they're villas and commercial sites where aluminium doors and windows in Dubai have already dealt with sandstorms, extreme heat, and daily use for years, not weeks.",
      "That track record matters more than any published performance number when deciding who to trust with your own project.",
    ],
    points: [
      "Installed performance over years tells you more than a lab-rated figure",
      "Long-term client feedback surfaces issues a spec sheet never would",
      "Look for projects similar in scale and exposure to your own",
    ],
  },

  behindThePhotos: {
    id: "behind-the-photos",
    eyebrow: "Behind the photos",
    heading: "What the Portfolio Doesn't Show",
    level: 5,
    body: [
      "Photos of a finished installation don't show the site visit where a drainage issue got caught before fabrication, or the redesign after a structural engineer flagged a lintel that wouldn't carry the glass load.",
      "Every project in the portfolio had some version of that conversation happen first. It's the part that doesn't photograph well but is usually the reason the finished result works the way it does.",
    ],
    points: [
      "The planning stage catches most of the problems that would otherwise surface later",
      "Structural and drainage checks happen before a single frame is ordered",
      "A smooth-looking installation usually means the hard part happened earlier, unseen",
    ],
  },

  leadTime: {
    id: "the-lead-time",
    eyebrow: "The lead time",
    heading: "What Happens Between Contract and Installation",
    level: 5,
    body: [
      "There's a gap most people don't think about between signing off on drawings and the installation crew arriving, that's when fabrication actually happens, and it's not instant.",
      "Custom sizing, powder coating, and glass processing all run on their own lead times, and a rushed fabrication schedule is where quality shortcuts tend to creep in. A realistic timeline here is usually a sign of a supplier doing it properly, not slowly.",
    ],
    points: [
      "Fabrication lead times vary by system complexity and current order volume",
      "Custom sizing and finish colour both affect how long manufacturing takes",
      "An unrealistically fast quoted timeline is worth questioning, not celebrating",
    ],
    tone: "muted",
  },

  afterYearOne: {
    id: "after-year-one",
    eyebrow: "Beyond the warranty",
    heading: "What Happens After Year One",
    level: 5,
    body: [
      "Most of the attention in a glazing project goes into the install day, but the years after matter just as much.",
      "Track debris, gasket wear, and hardware adjustment are all normal, the difference is whether there's a real aftercare relationship in place when something needs attention, or whether the installer disappeared the moment the final invoice was paid.",
    ],
    points: [
      "Annual servicing prevents most of the issues that show up later",
      "A responsive aftercare relationship matters more once the warranty period is underway",
      "Ask what happens after year one before signing, not after something breaks",
    ],
  },

  askForTheNumbers: {
    id: "ask-for-the-numbers",
    eyebrow: "Ask for the numbers",
    heading: "Why Vague Spec Sheets Are Worth Questioning",
    level: 6,
    body: [
      "A lot of glazing quotes describe performance in general terms, \"high performance,\" \"energy efficient\", without the actual chamber count, U-value, or air permeability class behind the claim. That's usually not an accident; vague language makes it harder to compare one quote against another line by line.",
      "Whether you're comparing uPVC or aluminium doors and windows in Dubai, asking for the specific published figures, and checking they match the product's technical data sheet, is a reasonable thing to expect before signing anything.",
    ],
    points: [
      "Vague performance language is a common way lower-quality quotes hide gaps",
      "Specific figures (chamber count, U-value, air permeability class) can be checked independently",
      "A supplier willing to hand over the technical data sheet is worth taking seriously",
    ],
    tone: "muted",
  },

  showroomVisit: {
    id: "beyond-the-spec-sheet",
    eyebrow: "Beyond the spec sheet",
    heading: "What a Showroom Visit Actually Tells You",
    level: 6,
    body: [
      "A product page can list the sightline width, but it can't tell you how that width actually looks from where you'd be standing in your own living room.",
      "Sliding a full-size door open, hearing how quietly a multi-point lock engages, feeling the weight difference between a standard and slim profile, that's the kind of thing that only really lands in person, and it's often what settles a decision a spec sheet alone couldn't.",
    ],
    points: [
      "Sightline and frame proportions read differently in person than in a photo",
      "Testing lock and handle action reveals build quality a spec sheet won't show",
      "Comparing two systems side by side is far easier than switching browser tabs",
    ],
  },
};
