// Long-form editorial for the brand detail pages.
//
// Same provenance as the homepage and category copy: ported from the live site
// at swiftrooms.ae, which holds this text hard-coded in a separate codebase
// rather than in Sanity — a search of the shared dataset returns none of it.
//
// Keyed by the public URL segment (see BRAND_ROUTES), so each page carries only
// its own blocks. A brand with no entry renders the Sanity-driven layout alone.
import type { EditorialSection } from "@/lib/homeEditorial";

export type BrandEditorial = {
  /** Intro paragraph under the H1. */
  intro: string;
  sections: EditorialSection[];
  faqs: { q: string; a: string }[];
  /**
   * "Complete the system" strip. The live pages label and describe each linked
   * category in their own words rather than reusing the category tagline.
   */
  worksWith: { href: string; label: string; description: string }[];
};

/**
 * Page titles and meta descriptions as published on the live brand pages.
 * The Sanity `seo` on each brand document is the older index-scoped set
 * ("<Brand> Glazing Systems | Swiftrooms UAE"), so these take precedence.
 */
export const brandSeo: Record<string, { title: string; description: string }> = {
  "cortizo-aluminium-systems": {
    title: "Cortizo Aluminium Doors & Windows in Dubai",
    description: "Cortizo aluminium doors and windows by Swiftrooms for Dubai villas & penthouses, slim profiles, bi-fold doors and modern glazing systems. Get a free quote.",
  },
  "schuco-aluminium-windows": {
    title: "Schüco Aluminium Windows",
    description: "German-engineered Schüco aluminium windows by Swiftrooms, re-specified for Dubai heat with thermal breaks. Get a free quote today.",
  },
  "reynaers-aluminium-systems": {
    title: "Reynaers Aluminium Systems Dubai & UAE",
    description: "Reynaers aluminium systems for UAE villas and towers, windows, doors, sliding walls and curtain wall. Get a free quote and free site visit today.",
  },
  "gulf-extrusions-aluminium-systems": {
    title: "Gulf Extrusions Systems in Dubai",
    description: "Gulf Extrusions aluminium systems by Swiftrooms for Dubai villas, towers & commercial projects, TB600 windows, doors and CW facades. Get a free quote.",
  },
  "deceuninck-upvc-windows-doors": {
    title: "Deceuninck uPVC Windows and Doors",
    description: "Deceuninck uPVC windows and doors by Swiftrooms for Dubai villas & apartments, multi-chamber profiles and UV-stabilised performance. Get a free quote.",
  },
  "ultraframe-roof-systems": {
    title: "UltraFrame Roof Systems in Dubai",
    description: "UltraFrame roof systems by Swiftrooms for Dubai villas, with LivinROOF, Ultraroof and glass roof options adapted for Gulf heat. Get a free quote today.",
  },
};

export const brandEditorial: Record<string, BrandEditorial> = {
  "cortizo-aluminium-systems": {
    intro: "Cortizo covers windows, doors, sliding walls and curtain wall on one Spanish platform, Cor Vision, Cor 70, TP52, Alu-Steel, each built for a different opening and a different job.",
    sections: [
      {
        id: "why-cortizo-aluminium-systems-perform-in-dubai-s-extrem",
        eyebrow: "Spanish engineering. tested where it matters most.",
        heading: "Why Cortizo Aluminium Systems Perform in Dubai's Extreme Heat?",
        level: 2,
        body: [
          "Cortizo is manufactured in Galicia, in northern Spain, but the profiles that matter most to a Gulf project aren't the ones built for a mild Atlantic coast, they're the ones from Cortizo's own southern Spain and North Africa lines, climates already closer to what a Dubai facade actually sees. Even so, nothing gets specified here on catalogue faith alone.",
          "The thermal break, the gasket rubber, the powder coat batch, all of it gets checked against actual Gulf exposure before it goes on a job. A frame that performs well in Seville doesn't automatically perform the same way after five summers on a west-facing tower in Business Bay, and that gap is exactly what a proper technical review is meant to catch.",
        ],
        points: [
        ],
      },
      {
        id: "one-platform-built-for-different-openings",
        eyebrow: "System range",
        heading: "One Platform, Built for Different Openings",
        level: 2,
        body: [
          "Cortizo doesn't try to sell a single frame for every opening in a building. The window range runs from Cor 70 Hidden Sash through the Industrial profile and the Aluminium Casement line, up to Alu-Steel Classic & Modern for anyone after the narrow, heritage steel look without the maintenance steel actually needs. Sliding walls sit on the Cor Vision platform, and taller buildings move onto the TP52 curtain wall.",
          "The right system isn't really about which one looks best in a brochure, it's about what the opening is doing. A north-facing bedroom window and a full-height sliding wall onto a pool deck are not the same engineering problem, and pricing both the same way usually means one of them is wrong.",
        ],
        points: [
          "Cor 70 Hidden Sash and Casement suit most standard apartment and villa windows",
          "Cor 70 Industrial gives a slim, steel-look frame for a more architectural elevation",
          "Alu-Steel Classic & Modern replicates true steel sightlines in maintenance-free aluminium",
          "Cor Vision and TP52 scale up for larger openings and full building facades",
        ],
        tone: "muted",
      },
      {
        id: "reading-a-thermal-rating-without-the-jargon",
        eyebrow: "What the numbers mean",
        heading: "Reading a Thermal Rating Without the Jargon",
        level: 3,
        body: [
          "A \"thermally broken\" frame just means there's a strip of insulating material inside the profile, separating the outer face from the inner one so heat can't conduct straight through the aluminium. On Cortizo's window ranges that break typically delivers a Uf value in the region of 1.6 to 2.2 W/m²K depending on the specific system and glazing pocket, in plain terms, a frame that shouldn't feel warm to the touch even after hours of direct sun.",
          "The Cor 70 range and Alu-Steel line both use a widened thermal chamber to hold that figure down, but the number on a spec sheet is only useful once it's been checked against the glass actually going in the opening and the direction that opening faces.",
        ],
        points: [
          "Cor 70: wide thermal chamber keeps the frame face notably cooler than the exterior air",
          "Alu-Steel: matches the sightline of real steel while holding a proper insulation value",
          "The final performance in the room depends on the glass paired with the frame",
          "Published figures are re-checked against your actual orientation before we quote",
        ],
      },
      {
        id: "cortizo-cor-vision-lift-slide-door-solutions",
        eyebrow: "Wide openings",
        heading: "Cortizo Cor Vision: Lift & Slide Door Solutions",
        level: 3,
        body: [
          "For a full glass wall rather than a standard window, Cortizo's answer is the Cor Vision range. Cor Vision 4600 Lift & Slide is the standard configuration for garden and terrace openings, a slim-sightline panel that lifts fractionally off its seal before sliding, so there's no dragging on the gasket and no stiffness creeping in after a few years of daily use.",
          "Cor Vision 4700 Lift & Slide steps up for larger, heavier panels, and Cor Vision Plus is built where the priority is the narrowest possible sightline and the largest single pane of glass an opening can take.",
        ],
        points: [
          "Cor Vision 4600: the standard lift-slide for most garden and terrace doors",
          "Cor Vision 4700: heavier-duty option for larger panels and taller openings",
          "Cor Vision Plus: minimal sightline for the largest single glass panels",
          "Lift action on all three means far less seal wear than a standard slider",
        ],
        tone: "muted",
      },
      {
        id: "tp52-across-a-whole-facade",
        eyebrow: "For taller buildings",
        heading: "TP52 Across a Whole Facade",
        level: 3,
        body: [
          "On towers and larger mixed-use developments, the same engineering scales into TP52 curtain wall, the continuous glazed grid running down a building's face. TP52 covers standard stick and unitised facade work, and TP52 Equity is the variant built where a project needs a flush, structurally glazed finish with the mullions barely visible from street level.",
          "Running windows, doors and curtain wall from one manufacturer isn't just easier to procure, it keeps frame depth and finish consistent at the exact point where a building's podium windows meet the glazed tower above.",
        ],
        points: [
          "TP52 for standard commercial and mixed-use curtain wall facades",
          "TP52 Equity for a flush, structurally glazed finish with minimal visible mullion",
          "Matched frame depth against Cor Vision and Cor 70 on the same building",
          "Keeps podium and tower elevations reading as one consistent facade",
        ],
      },
      {
        id: "what-a-tested-locking-cycle-actually-means",
        eyebrow: "Security",
        heading: "What a Tested Locking Cycle Actually Means",
        level: 4,
        body: [
          "Every Cortizo window and door range is built around a multi-point locking cycle engineered into the profile itself, not bolted on as an afterthought, so the frame, glass pocket and hardware are designed to work as one resisting unit rather than three separately rated parts. The front entrance door range and Cor 70 Door both offer higher security hardware options where a ground-floor opening or a commercial entrance calls for it.",
          "As with any rated system, the certification only holds if the glass and hardware actually installed on site match what was specified.",
        ],
        points: [
          "Multi-point locking engineered into the frame across the core window and door ranges",
          "Higher-security hardware available on Cor 70 Door and the front entrance range",
          "Rating only holds when installed glass and hardware match the tested configuration",
          "Ask for written confirmation of the full specified configuration",
        ],
        tone: "muted",
      },
      {
        id: "colour-and-sightline-that-hold-up-in-the-sun",
        eyebrow: "Look and finish",
        heading: "Colour and Sightline That Hold Up in the Sun",
        level: 4,
        body: [
          "Cortizo's finish options run through the standard RAL palette and anodised options seen across most premium European brands, but the coating quality is what decides whether a frame still looks sharp after a decade of Gulf sun or starts to chalk within two or three summers. Anodised finishes generally hold their colour marginally better under constant UV, though the choice usually comes down to the look a project wants rather than longevity alone.",
          "The Alu-Steel range in particular is chosen for its sightline as much as its colour, a genuinely narrow steel-style profile that reads as heritage industrial without the rust, warping or upkeep real steel windows bring in a coastal, high-humidity climate.",
        ],
        points: [
          "Full RAL colour range through Qualicoat-standard powder coating",
          "Anodised finishes for slightly stronger long-term colour retention",
          "Alu-Steel profile gives a true narrow steel sightline without steel's maintenance",
          "Finish specified per elevation, since shaded and sun-facing walls age differently",
        ],
      },
      {
        id: "why-we-don-t-just-pass-on-the-catalogue-numbers",
        eyebrow: "Built for spain, rechecked for uae",
        heading: "Why We Don't Just Pass On the Catalogue Numbers",
        level: 4,
        body: [
          "Cortizo tests much of its range against southern European and North African conditions, which puts it closer to Gulf heat than most northern European manufacturers to begin with, but \"closer\" still isn't the same as tested here. A dark-coloured frame on a west-facing tower in direct Dubai sun runs past the surface temperatures most catalogue data accounts for, even Cortizo's warmer-climate figures.",
          "We recheck thermal performance, gasket compound and wind load data against the actual site before any quote goes out, rather than handing over the Spanish number as-is.",
        ],
        points: [
          "Southern European and North African thermal data cross-checked against UAE site conditions",
          "Gasket compound reviewed for sustained heat and low humidity, not seasonal swings",
          "Wind load recalculated for coastal or high-rise sites where exposure is higher",
          "This check is included as standard, not billed as an extra",
        ],
        tone: "muted",
      },
      {
        id: "a-local-team-fluent-in-the-full-range",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Fluent in the Full Range",
        level: 5,
        body: [
          "We don't quote \"Cortizo\" as one generic line item, we work in the actual systems, matched to what a specific room, elevation or building actually needs.",
          "As an authorised partner working from genuine profile stock, every installation carries factory-backed certification rather than a general warranty added on afterward.",
        ],
        points: [
          "Authorised access to the full Cortizo range, window through curtain wall",
          "Site-specific technical review against UAE heat, wind and coastal exposure",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
      },
    ],
    faqs: [
      {
        q: "What's the difference between Cor Vision 4600 and Cor Vision 4700?",
        a: "Cor Vision 4600 is the standard lift-slide configuration and covers most residential garden and terrace doors. Cor Vision 4700 is built for larger or heavier panels, so the choice generally comes down to the size of the opening and the glass weight involved rather than one being a straightforward upgrade of the other.",
      },
      {
        q: "Can I get matching windows and sliding doors from Cortizo?",
        a: "Yes. Cor Vision sliding and lift-slide doors are designed to sit alongside the Cor 70 window range, so frame depth and finish stay consistent where a window wall meets a sliding door on the same elevation.",
      },
      {
        q: "Is the Alu-Steel range actually as narrow as real steel windows?",
        a: "Very close. The Alu-Steel Classic & Modern profile is built specifically to replicate a true steel sightline, which is why it's often chosen for heritage-style or industrial-look projects, without the rust and upkeep steel brings in a coastal climate.",
      },
      {
        q: "Do Cortizo systems need adjusting for UAE heat, or is the Spanish spec good enough?",
        a: "Cortizo's warmer-climate data is a stronger starting point than most northern European brands, but it's still a starting point, not a finished UAE spec. We recheck thermal performance, gasket material and wind load against the actual site and orientation before finalising a quote.",
      },
    ],
    worksWith: [
      { href: "/catalogue/aluminium-doors", label: "Aluminium Doors", description: "Matched profile families for a consistent elevation." },
      { href: "/catalogue/curtain-wall", label: "Curtain Wall Systems", description: "Continuous glazing on primary building faces." },
      { href: "/catalogue/garden-rooms", label: "Garden Rooms & Skylights", description: "Extending living space with daylight brought straight in." },
    ],
  },

  "schuco-aluminium-windows": {
    intro: "Schüco systems are extruded to German certification tolerances and re-specified against Gulf summer data, thermal breaks, seals, and hardware built to hold their performance well past the point where standard profiles start to fail.",
    sections: [
      {
        id: "why-schüco-aluminium-windows-perform-better-in-dubai-s",
        eyebrow: "Engineered in germany. built for gulf heat.",
        heading: "Why Schüco Aluminium Windows Perform Better in Dubai's Climate?",
        level: 2,
        body: [
          "Schüco aluminium windows bring German engineering tolerances to a climate they weren't originally designed around, which is exactly why the thermal break and hardware specification matter more here than on a cooler-climate installation.",
          "For UAE villas and towers where a window has to survive 48°C summers without the seals or sightlines degrading within a couple of years, that engineering margin is the whole point of specifying the system by name.",
        ],
        points: [
        ],
      },
      {
        id: "precision-german-engineering-adapted-for-the-gulf",
        eyebrow: "Profile engineering",
        heading: "Precision German Engineering, Adapted for the Gulf",
        level: 2,
        body: [
          "Most window brands sold in the UAE were developed for a European market first and adapted for local conditions second. Schüco takes a similar route to Cortizo in that respect, extruded to tight European tolerances, but the profile depth and thermal break width on the ranges we install here are selected specifically against Gulf summer data rather than a European average.",
          "That distinction shows up less on a spec sheet and more after three or four summers, when a shallower, cheaper profile has already started to flex slightly under sustained heat while a properly specified frame hasn't moved.",
        ],
        points: [
          "European extrusion tolerances held across every production run",
          "Thermal break width matched to sustained 45–50°C exterior conditions",
          "Factory certification carried through to the UAE installation",
          "Genuine profile stock, not a re-badged equivalent",
        ],
        tone: "muted",
      },
      {
        id: "what-actually-shows-up-on-the-ac-bill",
        eyebrow: "Thermal performance",
        heading: "What Actually Shows Up on the AC Bill",
        level: 3,
        body: [
          "A window's U-value is only half the story until it's read alongside frame depth and glazing pairing. Schüco aluminium windows built on a thermally broken profile separate the interior and exterior aluminium faces with a polyamide insulating strip, which is what stops the frame itself from becoming a heat conductor straight into the room behind it.",
          "Paired with a Low-E coated double glazed unit, that combination is usually the single biggest factor in how much a room's cooling load drops after a window replacement, more so than most homeowners initially expect from a frame swap alone.",
        ],
        points: [
          "Thermally broken profile as standard, not an optional upgrade",
          "Low-E and solar control coatings tuned to elevation orientation",
          "Double glazing standard, triple glazing available for high-noise or west-facing plots",
          "U-value figures supplied against the matching glazing spec, not the frame alone",
        ],
      },
      {
        id: "choosing-the-right-schüco-aluminium-window-style",
        eyebrow: "System range",
        heading: "Choosing the Right Schüco Aluminium Window Style",
        level: 3,
        body: [
          "Schüco aluminium windows are available across casement, tilt-turn and sliding formats, and the right choice tends to come down to the wall it's going into rather than personal preference. Casements give the tightest seal and the best air permeability rating; tilt-turn adds an inward-swinging cleaning position most owners only appreciate once they've lived with it for a year; sliding formats suit balconies, kitchens over counters and anywhere a swing radius simply won't fit.",
          "Apartment towers across Dubai and Abu Dhabi lean toward sliding formats for exactly this reason, while villas typically mix all three depending on the room and its exposure.",
        ],
        points: [
          "Casement: strongest air-tightness, widest ventilation opening",
          "Tilt-turn: dual function, easier maintenance access from inside",
          "Sliding: zero swing clearance, suited to tight balconies and walkways",
          "Fixed lights combined with any format for larger, uninterrupted openings",
        ],
        tone: "muted",
      },
      {
        id: "locking-configurations-worth-specifying",
        eyebrow: "Security standards",
        heading: "Locking Configurations Worth Specifying",
        level: 3,
        body: [
          "The glass and frame get most of the attention in a spec conversation, but the locking hardware is usually what actually decides whether a break-in attempt gets anywhere. Multi-point espagnolette locking distributes pressure across several points along the sash rather than relying on a single catch at the handle, which matters most on ground-floor and easily accessed openings.",
          "Laminated glazing adds a further layer without the bulk of toughened glass, and it's increasingly requested on street-level installations across newer residential compounds in Dubai.",
        ],
        points: [
          "Multi-point espagnolette locking across casement and tilt-turn ranges",
          "Laminated glazing available for ground-floor and accessible openings",
          "Restrictor stays for a controlled, partial-open ventilation position",
          "Key-locking handles compatible across the full profile range",
        ],
      },
      {
        id: "what-actually-cuts-the-noise-frame-or-glass",
        eyebrow: "Acoustic performance",
        heading: "What Actually Cuts the Noise, Frame or Glass",
        level: 4,
        body: [
          "Sealing quality and glazing spec do most of the work on noise reduction, a well-sealed frame with the wrong glass still lets sound through, and premium glass in a poorly sealed frame performs no better.",
          "Schüco's multi-point locking compresses the sash evenly against the seal when closed, which matters as much for acoustic performance as it does for security, and it's why the two specs tend to move together rather than being priced separately.",
        ],
        points: [
          "Seal compression on closing affects noise transmission as much as the glass itself",
          "Acoustic-rated glazing is worth specifying on villas near main roads or under flight paths",
          "Multi-point locking systems support both security and acoustic sealing simultaneously",
        ],
        tone: "muted",
      },
      {
        id: "colour-that-holds-up-in-direct-sun",
        eyebrow: "Finishes",
        heading: "Colour That Holds Up in Direct Sun",
        level: 4,
        body: [
          "RAL powder coating covers most colour requests on a project, but the quality of the coating behind the colour is what determines whether a frame still looks new after five UAE summers or starts chalking after two. Anodised finishes hold up marginally better under constant direct sun and tend to suit a more minimal, industrial look than a painted frame.",
          "Anthracite grey and matte black have overtaken white as the most requested finish on villa projects across Dubai and Abu Dhabi over the last couple of years, generally specified alongside slimmer sightline profiles.",
        ],
        points: [
          "Qualicoat-standard RAL colour matching against existing doors and cladding",
          "Anodised finishes for superior long-term UV resistance",
          "Anthracite and matte black now the most requested tones",
          "Dual-tone options pairing a darker exterior with a lighter interior frame",
        ],
      },
      {
        id: "where-schüco-aluminium-windows-gets-applied",
        eyebrow: "Regional applications",
        heading: "Where Schüco Aluminium Windows Gets Applied",
        level: 4,
        body: [
          "Residential and commercial briefs pull the same underlying profile in different directions. On villas, the priority usually sits with sightline and finish, matching windows to an existing door and curtain wall palette across the elevation. On commercial fit-outs, cycle rating and compliance move to the front of the conversation instead, hardware that survives daily opening cycles without loosening, plus fire-rated glazing configurations where local code calls for it.",
          "Larger commercial projects across the UAE increasingly specify a single profile family across an entire building, often pairing window systems with a matching curtain wall on the primary elevations, to keep sightlines consistent floor to floor.",
        ],
        points: [
          "Villa elevations: statement sightlines matched to existing joinery",
          "Apartment towers: slim profiles suited to smaller floor plates",
          "Retail and hospitality: higher cycle-rated hardware for daily footfall",
          "Mixed-use developments: matched window and curtain wall profile families",
        ],
        tone: "muted",
      },
      {
        id: "maintenance-in-dust-and-coastal-air",
        eyebrow: "Upkeep",
        heading: "Maintenance in Dust and Coastal Air",
        level: 4,
        body: [
          "Even a well-specified system needs some seasonal attention in this environment. Dust settles into track channels faster here than in most markets these profiles were originally engineered for, and coastal properties see hardware wear noticeably quicker than inland sites because of the added salt content in the air.",
          "A short routine two or three times a year, checking seals before peak summer heat and lubricating hinges and tracks, keeps most issues from turning into a service call.",
        ],
        points: [
          "Track and hinge cleaning every few months in dust-heavy areas",
          "Seal inspection ahead of summer, when gaskets are under the most stress",
          "Hardware lubrication twice yearly on sliding and hinged formats",
          "Coastal installations benefit from more frequent gasket checks",
        ],
      },
      {
        id: "a-local-team-working-from-genuine-profile-stock",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Working From Genuine Profile Stock",
        level: 5,
        body: [
          "We've fitted windows across enough Dubai villas, Abu Dhabi developments and Sharjah renovations to know which specs actually hold up after a few summers and which ones only look good on a datasheet.",
          "As an authorised partner working with genuine Schüco, Cortizo, Vetro and Gulf Extrusions stock, we're not quoting off a grey-market equivalent, and every warranty we issue carries real factory backing behind it.",
        ],
        points: [
          "Authorised access to genuine Schüco aluminium windows profile stock",
          "In-house technical support for architects and consultants",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
        tone: "muted",
      },
    ],
    faqs: [
      {
        q: "Are Schüco aluminium windows suitable for coastal UAE properties?",
        a: "Yes, with the right specification. Coastal sites see faster hardware wear and gasket degradation from salt content in the air, so we typically recommend higher corrosion-resistant fittings and a slightly tighter maintenance schedule than an equivalent inland installation would need.",
      },
      {
        q: "How do Schüco aluminium windows compare with Cortizo on thermal performance?",
        a: "Both brands offer thermally broken profiles built to European certification standards, and the practical difference at UAE ambient temperatures comes down to the specific profile depth and glazing pairing chosen for the project rather than the badge on the frame. We spec each against the actual elevation exposure rather than assuming one brand universally outperforms the other.",
      },
      {
        q: "What opening types are available in the Schüco aluminium windows range?",
        a: "Casement, tilt-turn and sliding formats are all available, and most villa projects end up mixing formats room by room, casement where ventilation matters most, sliding on balconies and tight floor plans, tilt-turn where a dual cleaning-and-ventilation function is useful.",
      },
      {
        q: "Do Schüco aluminium windows need a different spec for commercial buildings?",
        a: "Commercial installations typically call for higher cycle-rated hardware given daily footfall, plus fire-rated glazing configurations where the building code requires them. Residential specification tends to prioritise sightline and finish instead, so the two briefs diverge even on the same underlying profile family.",
      },
    ],
    worksWith: [
      { href: "/catalogue/aluminium-doors", label: "Aluminium Doors", description: "Matched profile families for a consistent elevation." },
      { href: "/catalogue/skylights", label: "Skylights & Rooflights", description: "Daylight drawn straight into the room below" },
      { href: "/catalogue/insect-screens", label: "Insect Screens", description: "Integrated channels that sit flush with the frame." },
    ],
  },

  "reynaers-aluminium-systems": {
    intro: "Reynaers spans windows, doors, sliding walls and curtain wall on one Belgian platform, MasterLine 8, CS 77, CP 155, CW 50, each engineered to its own insulation and security rating.",
    sections: [
      {
        id: "why-reynaers-aluminium-systems-perform-in-dubai-s-extre",
        eyebrow: "Belgian engineering. rechecked for this climate.",
        heading: "Why Reynaers Aluminium Systems Perform in Dubai's Extreme Heat?",
        level: 2,
        body: [
          "Reynaers builds to some of the tightest tolerances in Europe, but a profile designed and tested for a Belgian winter doesn't automatically know what to do with a Dubai summer. The thermal break, the gasket compound, even the powder coat, all of it gets re-checked against Gulf conditions before we'll put it on a job here.",
          "That's really the difference between a UAE villa or tower. A frame that's only ever been proven against European data might look right on day one, but it's the recalibration for 48°C heat, year after year, that decides whether it still seals and holds its shape a decade in.",
        ],
        points: [
        ],
      },
      {
        id: "not-one-product-a-range-built-for-different-rooms",
        eyebrow: "System range",
        heading: "Not One Product — A Range Built for Different Rooms",
        level: 2,
        body: [
          "Reynaers doesn't make one window and call it done. The range runs from CS 68 through CS 77 up to the higher-insulation CS 86-HI, each a step up in how well it keeps heat, noise and draughts out, alongside the MasterLine 8 platform for larger openings and heavier glass that still keeps a slim, modern frame line.",
          "Picking between them isn't really about budget first, it's about what the room needs. A shaded bedroom window doesn't need the same spec as a west-facing living room wall taking direct afternoon sun, and putting the top-tier system everywhere just adds cost without adding comfort.",
        ],
        points: [
          "CS 68 and CS 77 suit the majority of standard home and apartment windows",
          "CS 86-HI is the step up for sun-facing rooms or where quiet matters most",
          "MasterLine 8 handles bigger openings and heavier glass without a bulky frame",
          "Every tier is independently tested, not a marketing label on the same profile",
        ],
        tone: "muted",
      },
      {
        id: "reading-a-thermal-rating-without-the-jargon",
        eyebrow: "What the numbers mean",
        heading: "Reading a Thermal Rating Without the Jargon",
        level: 3,
        body: [
          "\"Excellent insulation\" doesn't mean much without a number behind it, so here's what the number actually says. The MasterLine 8 platform, built around a 40mm thermal break (a strip inside the frame that stops heat conducting straight through the metal), achieves a Uf value of around 1.9 W/m²K, in plain terms, that's a well-insulated frame that shouldn't feel warm to the touch even in direct sun.",
          "Step up to CS 86-HI and that figure drops further, into territory that starts to matter for anyone chasing a genuinely low cooling bill, not just a slightly better one. These numbers are tested in Europe first, which is exactly why we recheck them against local glazing and orientation before quoting a figure a client, whether that's a developer or a family renovating a villa, can actually rely on.",
        ],
        points: [
          "MasterLine 8: strong thermal performance, frame stays cool even in direct sun",
          "CS 86-HI: the option worth asking about if your priority is lower AC running costs",
          "The final in-room performance depends on the glass paired with the frame, not the frame alone",
          "We check the published figures against your actual site before quoting a number",
        ],
      },
      {
        id: "reynaers-aluminium-systems-cp-130-cp-155-sliding-door-s",
        eyebrow: "Wide openings",
        heading: "Reynaers Aluminium Systems: CP 130 & CP 155 Sliding Door Solutions",
        level: 3,
        body: [
          "For a wide glass wall onto a garden or pool deck rather than a standard window, Reynaers moves into its CP range. CP 130 suits a flush, step-free threshold, with a corner option that drops the usual structural post so the view stays unbroken.",
          "CP 155 goes further: a lift-slide door that raises the panel off its seal before moving, rated for glass up to roughly 400kg, the weight a large, well-insulated garden door reaches in practice. Years on, it should still glide with one hand.",
        ],
        points: [
          "CP 130: flush threshold, optional open corner",
          "CP 155: lift-slide, panels up to ~400kg",
          "Lift action means less seal wear over time",
          "Both pair with CS 77 and MasterLine 8 windows",
        ],
        tone: "muted",
      },
      {
        id: "cw-50-to-cw-86-across-a-whole-facade",
        eyebrow: "For taller buildings",
        heading: "CW 50 to CW 86 Across a Whole Facade",
        level: 3,
        body: [
          "On towers and larger developments, the same engineering scales up into curtain wall, the continuous glass grid you see running down the face of a building. CW 50 covers standard commercial and mixed-use facades, while CW 86 is built for elevations under more structural or thermal load, bigger spans, higher wind exposure, buildings where the glass itself needs to work harder.",
          "Using windows, doors and curtain walls from the same manufacturer isn't just a procurement convenience, it keeps the frame depth and finish consistent where a building's lower windows meet the glazed tower above, a detail that's genuinely visible from street level on mixed-use developments across Dubai.",
        ],
        points: [
          "CW 50 for standard commercial and mixed-use facades",
          "CW 86 for larger spans and higher-exposure elevations",
          "Matched frame depth against Reynaers windows and doors on the same building",
          "Keeps podium and tower elevations looking like one building, not two",
        ],
      },
      {
        id: "what-rc2-actually-means-for-peace-of-mind",
        eyebrow: "Security",
        heading: "What \"RC2\" Actually Means for Peace of Mind",
        level: 4,
        body: [
          "Every core Reynaers aluminium systems window range carries a minimum RC2 burglar-resistance rating as standard, an independent test rating meaning the frame, glass and lock have been tried and tested together as a break-in-resistant unit, not just individually rated on paper. CS 77 goes further, with RC3 and even bullet-resistant options available, more relevant to specific commercial or ground-floor briefs than a typical family home.",
          "The rating only holds if the glass and hardware actually installed match what was tested. A frame rated RC2 fitted with ordinary glass isn't really RC2 anymore, so it's worth asking your supplier to confirm the full configuration in writing, whether you're a homeowner securing a ground-floor opening or a developer signing off a building-wide spec.",
        ],
        points: [
          "RC2 as standard across MasterLine 8, SL 38, CS 68 and CS 77",
          "RC3 and bullet-resistant options available on CS 77 where needed",
          "The rating covers frame, glass and lock together, not any single part",
          "Ask for written confirmation the installed glass matches the tested rating",
        ],
        tone: "muted",
      },
      {
        id: "colour-that-still-looks-new-in-a-decade",
        eyebrow: "Look and finish",
        heading: "Colour That Still Looks New in a Decade",
        level: 4,
        body: [
          "Colour choice runs through the same RAL and anodised options common across premium European brands, but the coating quality is what decides whether a frame still looks sharp after ten Gulf summers or starts to chalk and fade within two. Anodised finishes tend to hold up marginally better under constant sun, though most people choose based on the look they want rather than longevity alone, both hold up well when specified properly.",
          "Dual-tone frames, a different colour inside to outside, are increasingly popular on villa projects where the interior palette doesn't match the building's exterior material scheme.",
        ],
        points: [
          "Full RAL colour range through Qualicoat-standard powder coating",
          "Anodised finishes for slightly stronger long-term colour retention",
          "Dual-tone options for a different interior and exterior colour",
          "Finish chosen per elevation, since a shaded wall and a sun-facing one age differently",
        ],
      },
      {
        id: "why-we-don-t-just-pass-on-the-catalogue-numbers",
        eyebrow: "Built for europe, rechecked for here",
        heading: "Why We Don't Just Pass On the Catalogue Numbers",
        level: 4,
        body: [
          "Reynaers tests its published performance data primarily against European conditions, which is standard across almost every premium manufacturer, not a shortcoming unique to this brand. The gap that actually matters is between that catalogue figure and what happens once a frame sits through a full Dubai or Abu Dhabi summer, when a dark-coloured frame in direct sun runs well past the temperatures the original testing accounted for.",
          "We recheck thermal performance, gasket material and wind load data against the actual site before finalising any quote, rather than handing over the European number as-is. That extra step is really the difference between a generic reseller and a team that's actually specifying for this climate.",
        ],
        points: [
          "European thermal and wind figures cross-checked against UAE site conditions",
          "Gasket material reviewed for sustained heat and low humidity, not just European swings",
          "Wind load recalculated for coastal or high-rise sites where it matters",
          "This check is included as standard, not billed as an extra",
        ],
        tone: "muted",
      },
      {
        id: "a-local-team-fluent-in-the-full-range",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Fluent in the Full Range",
        level: 5,
        body: [
          "We don't quote \"Reynaers\" as one generic line item, we work in the actual systems, matched to what a specific room, elevation or building actually needs.",
          "As an authorised partner working from genuine profile stock, every installation carries factory-backed certification rather than a general warranty added on afterward.",
        ],
        points: [
          "Authorised access to the full Reynaers aluminium systems range, window through curtain wall",
          "Site-specific technical review against UAE heat, wind and coastal exposure",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
      },
    ],
    faqs: [
      {
        q: "What's the difference between CS 77 and MasterLine 8?",
        a: "CS 77 is the more established window range, tested across a wide set of European standards and available up to RC3 with bullet-resistant options. MasterLine 8 is built for larger openings and heavier glass while keeping a slim frame line, so the choice usually comes down to the size of the opening and the glass weight rather than one simply being better than the other.",
      },
      {
        q: "Can I get matching windows and sliding doors from Reynaers aluminium systems?",
        a: "Yes, that's one of the real advantages of the platform. CP 130 and CP 155 sliding and lift-slide doors are engineered to connect directly with CS 77 and MasterLine 8 windows, so the frame depth and look stay consistent where a window wall meets a sliding door on the same elevation.",
      },
      {
        q: "Is CP 155 strong enough for a really large garden sliding door?",
        a: "Yes. The CP 155 lift-slide mechanism is rated for glazed panels up to roughly 400kg, which covers most large residential garden openings, including heavier acoustic or triple-glazed builds where the panel weight adds up quickly.",
      },
      {
        q: "Do Reynaers systems need adjusting for UAE heat, or is the European spec good enough?",
        a: "The published European figures are a starting point, not a finished UAE spec. We recheck thermal performance, gasket material and wind load against the actual site and orientation before finalising a quote, since a system tested mainly for European conditions doesn't automatically account for sustained 48°C exterior heat.",
      },
    ],
    worksWith: [
      { href: "/catalogue/aluminium-doors", label: "Aluminium Doors", description: "Matched profile families for a consistent elevation." },
      { href: "/catalogue/curtain-wall", label: "Curtain Wall Systems", description: "Continuous glazing on primary building faces." },
      { href: "/catalogue/skylights", label: "Skylights & Rooflights", description: "Daylight drawn straight into the room below." },
    ],
  },

  "gulf-extrusions-aluminium-systems": {
    intro: "Gulf Extrusions delivers regionally engineered aluminium profiles, combining proven Gulf performance with advanced TB600 and CW systems for demanding architectural applications.",
    sections: [
      {
        id: "why-gulf-extrusions-doesn-t-need-the-european-recheck",
        eyebrow: "The one difference that actually matters",
        heading: "Why Gulf Extrusions Doesn't Need the European Recheck",
        level: 2,
        body: [
          "Almost every premium aluminium brand on the market gets designed and first tested somewhere with a very different climate to this one, then re-verified against UAE heat, humidity and dust before it's fit to spec here. Gulf Extrusions skips that step entirely, because there's no translation to do.",
          "The profiles are designed, extruded and tested in the region they're installed in, against the exact sun exposure, coastal humidity and sand-laden air a Dubai or Abu Dhabi facade actually deals with. That's not a marketing angle, it's a genuine engineering shortcut with a real consequence: less guesswork between a catalogue figure and what a frame actually does after five summers on site, because the catalogue figure was never generated somewhere else to begin with.",
        ],
        points: [
        ],
      },
      {
        id: "purpose-built-profiles-for-each-opening-type",
        eyebrow: "System range",
        heading: "Purpose-Built Profiles for Each Opening Type",
        level: 2,
        body: [
          "Gulf Extrusions organises its range around function rather than a single flagship product wearing different names. The TB600 series covers the brand's thermally broken window and door systems, sliding systems handle horizontal-opening windows where a swing sash isn't practical, and the CW range scales the same regional engineering up to full building facades.",
          "The right choice comes down to what the opening needs to do and how it's used day to day, not simply which system sounds more premium. A frequently opened bedroom window and a fixed facade panel thirty storeys up are solving completely different problems, and the range is built to reflect that rather than force one profile to do both jobs.",
        ],
        points: [
          "TB600 Tilt & Turn for windows needing both secure ventilation and full interior-side access",
          "TB600 Door for entrance and interior openings sharing the same thermal platform as the windows",
          "Aluminium Sliding Windows for horizontal-opening residential windows in space-limited layouts",
          "CW 50mm for scaling the same engineering up to commercial and mixed-use facades",
        ],
        tone: "muted",
      },
      {
        id: "what-tb-actually-stands-for",
        eyebrow: "Tb600: the platform behind the name",
        heading: "What \"TB\" Actually Stands For",
        level: 3,
        body: [
          "TB600 stands for thermally broken, with the thermal break interrupting the aluminium frame to reduce heat transfer from outside to inside. This matters in Gulf conditions, where direct sun can quickly heat conventional aluminium profiles.",
          "Engineered for regional exposure, the TB600 system is designed to improve thermal separation compared with older non-thermally-broken frames, helping maintain greater indoor comfort while supporting modern energy-conscious building design.",
        ],
        points: [
          "TB600's thermal break is engineered against regional sun exposure, not adapted from elsewhere",
          "The 600-series depth gives the frame enough structure to hold a proper break without added bulk",
          "Frame face temperature stays noticeably lower than older non-thermally-broken systems in direct sun",
          "Forms the shared platform behind both the TB600 Tilt & Turn window and TB600 Door",
        ],
      },
      {
        id: "two-functions-on-the-same-window",
        eyebrow: "Tb600 tilt & turn",
        heading: "Two Functions on the Same Window",
        level: 3,
        body: [
          "Tilt & Turn earns its place as a named speciality because it solves two different problems most single-function windows can't. Tilted, the sash opens inward from the top for controlled, secure ventilation, safe to leave open overnight without creating an easy access point. Turned, the same sash swings fully open on a side hinge for full interior-side cleaning of both faces of the glass.",
          "On upper floors of a tower or a villa's second storey, where getting outside safely to clean a window isn't realistic, that turn function tends to be the deciding reason a Tilt & Turn window gets specified over a standard casement, on top of the ventilation benefit it already offers.",
        ],
        points: [
          "Tilt position gives secure, restricted ventilation without opening the sash fully",
          "Turn position swings the sash open for full interior-side cleaning of both glass faces",
          "One handle and lock mechanism operates both functions, with nothing extra to specify",
          "Especially relevant above ground floor, where external cleaning access isn't practical",
        ],
        tone: "muted",
      },
      {
        id: "where-a-swinging-sash-isn-t-the-right-answer",
        eyebrow: "Sliding systems",
        heading: "Where a Swinging Sash Isn't the Right Answer",
        level: 3,
        body: [
          "Not every opening suits a hinged or tilting sash. Balconies, compact bedrooms and furniture-heavy spaces often benefit from horizontal sliding windows. Gulf Extrusions' Aluminium Sliding Windows use the same regionally engineered platform as the TB600 range, balancing thermal performance with practical operation.",
          "Their track and roller design is suited to sustained Gulf conditions, including regular dust exposure, helping support smooth, reliable movement and long-term everyday performance.",
        ],
        points: [
          "Same thermally broken platform as TB600, in a horizontal-slide configuration",
          "Suits balconies and space-limited rooms where a swinging sash isn't practical",
          "Track and roller design specified against sustained dust exposure, not just smooth first-year operation",
          "Pairs naturally with TB600 windows on the same elevation for a consistent frame line",
        ],
      },
      {
        id: "scaling-the-same-engineering-to-a-full-facade",
        eyebrow: "Cw 50mm: curtain wall for the region",
        heading: "Scaling the Same Engineering to a Full Facade",
        level: 4,
        body: [
          "On towers and larger mixed-use developments, Gulf Extrusions' engineering scales up into the CW 50mm curtain wall system, the continuous structural glazing grid running down a building's face. Because the underlying thermal and structural principles come from the same regionally tested base as the TB600 window and door range, a building's ground-floor windows and its glazed tower above can share a genuinely matched frame depth and finish, not just a similar colour.",
          "That consistency matters most at the specific point where a lower podium's window line meets a glazed tower rising above it, a junction that reads as either one considered building or two mismatched ones from street level, depending on whether the systems were actually engineered to sit together.",
        ],
        points: [
          "CW 50mm built on the same regionally engineered base as the TB600 window and door range",
          "Matched frame depth and finish between podium windows and tower-level curtain wall",
          "Structural and thermal performance calculated against actual building height and coastal exposure",
          "Suits standard commercial and mixed-use facades across Dubai and Abu Dhabi developments",
        ],
        tone: "muted",
      },
      {
        id: "regional-engineering-applied-to-the-lock-cycle",
        eyebrow: "Security",
        heading: "Regional Engineering Applied to the Lock Cycle",
        level: 4,
        body: [
          "A window or door's resistance to forced entry comes down to how the frame, glass and locking hardware perform together, not any one part in isolation, and Gulf Extrusions builds multi-point locking into the TB600 window and door hardware as standard rather than offering it as an upgrade. The lock cycle is engineered into the profile itself, so the frame contributes to security rather than simply holding a lock that was designed for a different system entirely.",
          "As with any rated system, the real-world security depends on the glass and hardware installed on site matching what was originally specified, which is worth confirming in writing on any ground-floor or publicly accessible opening.",
        ],
        points: [
          "Multi-point locking built into TB600 window and door hardware as standard",
          "Lock cycle engineered into the profile itself, not added as a separate component",
          "Real-world security depends on installed glass matching the specified configuration",
          "Recommended to confirm the full hardware and glass spec in writing for accessible openings",
        ],
      },
      {
        id: "coatings-tested-against-the-climate-they-re-sold-into",
        eyebrow: "Look and finish",
        heading: "Coatings Tested Against the Climate They're Sold Into",
        level: 4,
        body: [
          "Colour and finish options across the TB600 and CW ranges run through the standard RAL palette and anodised alternatives found on most premium systems, but the coating itself is where the regional testing shows up most clearly, checked against sustained UV and heat exposure at source rather than assumed to transfer directly from a cooler-climate result.",
          "Retractable Fly Screens, often specified alongside the sliding and Tilt & Turn ranges, are finished to match the surrounding frame rather than treated as a separate accessory, so a screened opening still reads as one considered frame line rather than a window with something bolted onto it afterward.",
        ],
        points: [
          "Full RAL colour range through Qualicoat-standard powder coating",
          "Anodised finishes available for a metallic, low-maintenance sightline",
          "Coating durability tested against regional UV and heat exposure at source",
          "Retractable Fly Screens finished to match the frame, not treated as a separate accessory",
        ],
        tone: "muted",
      },
      {
        id: "why-that-actually-changes-the-quoting-process",
        eyebrow: "Engineered here, verified here",
        heading: "Why That Actually Changes the Quoting Process",
        level: 4,
        body: [
          "Because Gulf Extrusions' published figures already reflect regional conditions, the review we run before quoting looks slightly different to how we'd approach a European or other imported brand. Rather than cross-checking a catalogue number generated somewhere else, we're confirming the published figure against your specific site, orientation and glass selection, closing the gap between a regional average and your particular elevation.",
          "It's a shorter step than the recheck an imported system needs, but it's not a step we skip, a coastal high-rise and an inland villa still see meaningfully different wind load and humidity conditions even within the same broad region.",
        ],
        points: [
          "Published thermal and structural figures already reflect regional testing conditions",
          "Site-specific review still run against your particular orientation, glass and exposure",
          "Wind load recalculated for coastal or high-rise sites where exposure differs materially",
          "This check is included as standard on every quote, not billed as an extra",
        ],
      },
      {
        id: "a-local-team-fluent-in-the-full-range",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Fluent in the Full Range",
        level: 5,
        body: [
          "We don't quote \"Gulf Extrusions\" as one generic line item, we work in the actual systems, TB600 windows and doors, sliding ranges, CW facades, matched to what a specific room, elevation or building actually needs.",
          "As an authorised partner working from genuine profile stock, every installation carries factory-backed certification rather than a general warranty added on afterward.",
        ],
        points: [
          "Authorised access to the full Gulf Extrusions range, window through curtain wall",
          "Site-specific technical review against orientation, glass selection and coastal exposure",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
        tone: "muted",
      },
    ],
    faqs: [
      {
        q: "Does \"regionally engineered\" actually mean better performance, or just local manufacturing?",
        a: "Both, in practice. Manufacturing here removes shipping lead time, but the more important part is that the thermal break, gasket compound and coatings are tested against Gulf heat and dust from the start, rather than tested elsewhere and rechecked afterward, so there's less gap between the catalogue figure and site reality.",
      },
      {
        q: "What does TB600 mean, and is it the same across the window and door range?",
        a: "TB stands for thermally broken and 600 refers to the profile's series depth. Both the TB600 Tilt & Turn window and TB600 Door share that same engineered platform, which is why they pair cleanly on the same elevation without a mismatch in frame depth or performance.",
      },
      {
        q: "Is a Tilt & Turn window worth it over a standard sliding window?",
        a: "It depends on the opening. Tilt & Turn adds secure ventilation and full interior-side cleaning access in one unit, genuinely useful above ground floor, while a sliding window suits space-limited rooms or balconies where a swinging sash isn't practical either way.",
      },
      {
        q: "Can CW 50mm curtain wall actually match TB600 windows on the same building?",
        a: "Yes, that's one of the real advantages of a single regional manufacturer, CW 50mm shares its engineering base with the TB600 range, so frame depth and finish stay consistent where a building's window line meets its curtain wall.",
      },
    ],
    worksWith: [
      { href: "/catalogue/aluminium-doors", label: "Aluminium Doors", description: "Matched profile families for a consistent elevation." },
      { href: "/catalogue/curtain-wall", label: "Curtain Wall Systems", description: "Continuous glazing on primary building faces." },
      { href: "/catalogue/insect-screens", label: "Insect Screens", description: "Ventilation without compromising on dust or pest control." },
    ],
  },

  "deceuninck-upvc-windows-doors": {
    intro: "A specialist in high-performance uPVC window and door profile systems. Deceuninck brings decades of Belgian profile engineering to a material built specifically to resist heat transfer, not just carry a colour and a shape.",
    sections: [
      {
        id: "why-deceuninck-performs-differently-to-a-standard-upvc",
        eyebrow: "Why a belgian upvc brand makes sense in gulf heat",
        heading: "Why Deceuninck Performs Differently to a Standard uPVC Frame",
        level: 2,
        body: [
          "uPVC is well suited to Gulf conditions because, unlike aluminium, it naturally resists transferring exterior heat into the room without relying solely on a deep thermal break. However, material choice alone does not guarantee performance. Profile quality, formulation and construction determine how well the system handles sustained heat and UV exposure.",
          "Deceuninck profiles are engineered in Belgium with multi-chamber construction and UV-stabilised compound formulations designed for long-term stability. This helps the frames maintain their shape, finish and performance under demanding sunlight. For UAE projects, the difference between properly engineered uPVC and lower-grade alternatives becomes particularly noticeable over years of continuous exposure.",
        ],
        points: [
        ],
      },
      {
        id: "a-profile-for-every-opening-not-one-frame-stretched-thi",
        eyebrow: "System range",
        heading: "A Profile for Every Opening, Not One Frame Stretched Thin",
        level: 2,
        body: [
          "Deceuninck doesn't sell a single uPVC profile and call it a complete range. Zendow and Zendow neo form the core casement and tilt-and-turn platform for standard residential windows and doors, Legend steps up with a deeper multi-chamber profile for larger openings or projects prioritising maximum insulation, and Elegant brings the same engineering to a slimmer, more contemporary sightline where the look matters as much as the performance.",
          "Choosing between them comes down to what the opening is actually being asked to do. A shaded utility window and a large west-facing bedroom window aren't the same specification problem, and treating every opening in a villa or apartment the same way usually means either overpaying on the shaded side or underspecifying the sun-facing one.",
        ],
        points: [
          "Zendow covers standard residential casement and tilt-and-turn windows and doors",
          "Zendow neo steps up insulation and structural depth within the same visual family",
          "Legend suits larger openings or projects where maximum thermal performance is the priority",
          "Elegant offers a slimmer, more contemporary sightline without giving up the multi-chamber build",
        ],
        tone: "muted",
      },
      {
        id: "reading-a-upvc-profile-without-the-jargon",
        eyebrow: "What multi-chamber construction actually means",
        heading: "Reading a uPVC Profile Without the Jargon",
        level: 3,
        body: [
          "Cut a Deceuninck profile in cross-section and instead of one hollow channel, you'll find several separate internal chambers running the length of the frame. Each chamber traps a pocket of still air, and still air is a genuinely poor conductor of heat, so more chambers, properly designed rather than just added for a marketing number, means better resistance to heat and sound both passing through the frame.",
          "Zendow neo and Legend both run deeper multi-chamber profiles than the entry Zendow line, which is where their extra thermal performance actually comes from, not from a thicker wall of plastic alone but from more internal air pockets doing the insulating work. It's worth understanding this distinction because a thicker-looking frame with poorly designed chambers can still underperform a slimmer, properly engineered one.",
        ],
        points: [
          "Multi-chamber construction traps still air inside the profile, which resists heat transfer",
          "More chambers matter only if they're properly designed, not simply added for a bigger number",
          "Zendow neo and Legend run deeper multi-chamber profiles for stronger insulation than entry Zendow",
          "Sound insulation improves alongside thermal performance, a genuine secondary benefit of the same design",
        ],
      },
      {
        id: "the-range-for-when-insulation-is-the-priority",
        eyebrow: "Legend",
        heading: "The Range for When Insulation Is the Priority",
        level: 3,
        body: [
          "Legend is Deceuninck's deepest residential profile, built for openings and projects where thermal and acoustic performance sit at the top of the brief, a bedroom on a busy road, a west-facing living wall taking hours of direct sun, or simply a client who wants the lowest realistic cooling load a uPVC window can deliver in this market.",
          "The trade-off, as with any deeper profile in any material, is frame width. Legend carries a slightly heavier sightline than Zendow or Elegant, so it tends to get specified where performance is genuinely the deciding factor rather than defaulted to across an entire project regardless of what each opening actually needs.",
        ],
        points: [
          "Deepest multi-chamber profile in the range, built for maximum thermal and acoustic performance",
          "Suited to sun-facing elevations, road-facing bedrooms, and performance-first briefs",
          "Carries a slightly wider visible sightline than the slimmer Zendow and Elegant lines",
          "Specified selectively per opening, not defaulted across a full project regardless of exposure",
        ],
        tone: "muted",
      },
      {
        id: "contemporary-sightline-same-underlying-engineering",
        eyebrow: "Elegant",
        heading: "Contemporary Sightline, Same Underlying Engineering",
        level: 3,
        body: [
          "Elegant answers the most common objection raised against uPVC in premium residential projects, that it looks bulkier than a slim aluminium frame. It doesn't abandon the multi-chamber construction the rest of the range relies on, it repackages it into a narrower, more contemporary profile that reads closer to what a client expects from a modern aluminium window while retaining uPVC's thermal advantage.",
          "It suits villa and apartment projects where the brief calls for a clean, minimal frame line but the budget or thermal priority still points toward uPVC over aluminium, a combination that's increasingly common as clients become more aware of the running-cost difference a well-insulated frame makes over a decade of Gulf summers.",
        ],
        points: [
          "Narrower, more contemporary sightline than the standard Zendow profile",
          "Retains the same multi-chamber thermal construction as the rest of the range",
          "Suits projects wanting a modern look without moving up to aluminium",
          "A genuine middle ground between visual slimness and uPVC's thermal advantage",
        ],
      },
      {
        id: "reinforcement-built-into-the-chamber-not-bolted-on",
        eyebrow: "Security",
        heading: "Reinforcement Built Into the Chamber, Not Bolted On",
        level: 4,
        body: [
          "A fair question with uPVC is whether a plastic-based frame can hold hardware as securely as aluminium or timber. Deceuninck's profiles are designed with internal steel reinforcement running through the main structural chamber specifically to answer that, giving the frame the rigidity to carry multi-point locking hardware properly rather than relying on the uPVC shell alone.",
          "As with any window or door system, the real security outcome depends on the glass and hardware actually installed matching the specified configuration, worth confirming in writing on any ground-floor or easily accessible opening regardless of frame material.",
        ],
        points: [
          "Internal steel reinforcement runs through the main structural chamber on core ranges",
          "Multi-point locking hardware specified as standard across the residential range",
          "Reinforcement gives the frame rigidity closer to what aluminium hardware expects",
          "Recommended to confirm the full installed hardware and glass configuration in writing",
        ],
        tone: "muted",
      },
      {
        id: "why-colour-retention-matters-more-on-upvc-than-aluminiu",
        eyebrow: "Look and finish",
        heading: "Why Colour Retention Matters More on uPVC Than Aluminium",
        level: 4,
        body: [
          "uPVC's finish works differently to aluminium's powder coat or anodising, colour and texture come from the compound itself or from a foil laminate applied over it, rather than a coating layer added afterward. That distinction matters in direct Gulf sun, because a poorly formulated compound doesn't just fade, it can chalk, discolour unevenly or become brittle over time in a way a well-formulated one, like Deceuninck's UV-stabilised range, is specifically engineered to resist.",
          "Foiled woodgrain and dual-colour finishes, a different tone inside to outside, are both available across the range, increasingly popular on villa projects where the interior palette differs from the exterior material scheme, the same reason dual-tone finishes have grown popular on aluminium projects.",
        ],
        points: [
          "UV-stabilised compound formulation resists chalking and colour fade under sustained sun",
          "Foiled woodgrain finishes available where a timber look is wanted without timber's upkeep",
          "Dual-colour options for a different interior and exterior tone on the same frame",
          "Finish quality matters more on uPVC than aluminium, since colour comes from the material itself",
        ],
      },
      {
        id: "why-we-don-t-just-pass-on-the-european-numbers",
        eyebrow: "Built for belgium, rechecked for the gulf",
        heading: "Why We Don't Just Pass On the European Numbers",
        level: 4,
        body: [
          "Deceuninck tests its published performance data primarily against European conditions, standard practice across almost every premium uPVC manufacturer and not a shortcoming unique to this brand. The gap that actually matters is between that catalogue figure and a full Dubai or Abu Dhabi summer, where sustained heat, low humidity and intense UV exposure sit well outside what most European testing regimes account for.",
          "We recheck compound performance, reinforcement sizing and glazing bead behaviour against actual UAE site conditions before finalising any quote, rather than handing over the European figure as-is, the same standard we apply across every imported system we specify.",
        ],
        points: [
          "European thermal and UV performance data cross-checked against UAE site conditions",
          "Compound and foil finish reviewed specifically for sustained heat, not seasonal European swings",
          "Reinforcement sizing confirmed against the actual glass weight being installed",
          "This check is included as standard, not billed as an extra",
        ],
        tone: "muted",
      },
      {
        id: "a-local-team-fluent-in-the-full-range",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Fluent in the Full Range",
        level: 5,
        body: [
          "We don't quote \"Deceuninck\" as one generic uPVC line item, we work in the actual profiles, Zendow, Zendow neo, Legend or Elegant, matched to what a specific room, elevation or budget actually needs.",
          "As an authorised partner working from genuine profile stock, every installation carries factory-backed certification rather than a general warranty added on afterward.",
        ],
        points: [
          "Authorised access to the full Deceuninck uPVC range",
          "Site-specific technical review against UAE heat, UV exposure and glass weight",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
      },
    ],
    faqs: [
      {
        q: "Does uPVC actually hold up in Dubai heat, or does it degrade faster than aluminium?",
        a: "It depends entirely on compound quality. A well-formulated, UV-stabilised profile like Deceuninck's is specifically engineered to resist the chalking, discolouration and softening that give cheaper uPVC its poor reputation in this market, but the material category alone doesn't guarantee that, the compound does.",
      },
      {
        q: "What's the difference between Zendow, Zendow neo and Legend?",
        a: "Zendow is the standard residential casement and tilt-and-turn platform, Zendow neo steps up insulation and structural depth within the same visual family, and Legend runs the deepest profile in the range for openings where maximum thermal and acoustic performance is the priority.",
      },
      {
        q: "Is Elegant as strong as the standard Zendow range, given the slimmer frame?",
        a: "Yes, it retains the same multi-chamber construction and steel reinforcement as the rest of the range, just repackaged into a narrower, more contemporary sightline, so the reduction is visual rather than structural.",
      },
      {
        q: "Can uPVC windows be specified alongside aluminium doors on the same project?",
        a: "Yes, that's a common approach, uPVC where thermal performance and budget are the priority, aluminium where a slimmer sightline or larger opening is needed, and we detail the transition where the two meet so the elevation still reads as one considered scheme.",
      },
    ],
    worksWith: [
      { href: "/catalogue/upvc", label: "uPVC Windows & Doors", description: "The full uPVC catalogue, alongside Vetromax's uPVC range." },
      { href: "/catalogue/aluminium-doors", label: "Aluminium Doors", description: "Matched entrance options where a project mixes materials by opening." },
      { href: "/catalogue/insect-screens", label: "Insect Screens", description: "Ventilation without compromising on dust or pest control." },
    ],
  },

  "ultraframe-roof-systems": {
    intro: "A manufacturer of conservatory, orangery and glazed roof systems. UltraFrame brings decades of UK roof engineering to structures whose single biggest job in this climate is keeping the sun's heat out, not just keeping the rain off.",
    sections: [
      {
        id: "why-ultraframe-needs-a-genuine-regional-rework-not-just",
        eyebrow: "A roof brand built for a different problem, solved the same way",
        heading: "Why UltraFrame Needs a Genuine Regional Rework, Not Just a Recheck",
        level: 2,
        body: [
          "UltraFrame's engineering heritage comes from a UK market where a conservatory's job is mostly about capturing scarce sunlight and holding onto heat. In the Gulf, the brief flips completely, the same roof structure now has to reject sustained solar gain for most of the year while still delivering the light-filled room a conservatory or orangery is meant to be. That's a genuinely different design problem, not a smaller version of the same one.",
          "Every UltraFrame roof system we install gets specified against that reversed priority, glazing specification, ventilation strategy and roof pitch all reconsidered for a climate where the sun is the primary load for eight or nine months of the year, not the two or three the original UK engineering assumed.",
        ],
        points: [
        ],
      },
      {
        id: "three-ways-to-roof-an-extension-built-around-light-vers",
        eyebrow: "System range",
        heading: "Three Ways to Roof an Extension, Built Around Light Versus Shade",
        level: 2,
        body: [
          "UltraFrame offers several roof configurations, allowing the structure to be matched to the amount of daylight, shade and insulation a room requires. The Classic Glass Roof maximises natural light for a bright, traditional conservatory feel. LivinROOF combines insulated solid sections with glazed panels, giving greater control over where daylight enters.",
          "Ultraroof provides a fully tiled roof with integrated rooflights, creating a more solid, house-extension feel. For projects with a more architectural character, Orangery & Skyroom systems introduce flat or lantern-style glazed roof options.",
        ],
        points: [
          "Classic Glass Roof for maximum daylight and open views",
          "LivinROOF balances glazing with insulated solid sections",
          "Ultraroof offers a fully tiled roof with rooflights",
          "Orangery & Skyroom suit distinctive architectural extensions",
        ],
        tone: "muted",
      },
      {
        id: "what-actually-determines-heat-gain-through-a-glass-roof",
        eyebrow: "Reading a roof glazing spec without the jargon",
        heading: "What Actually Determines Heat Gain Through a Glass Roof",
        level: 3,
        body: [
          "A glass roof receives significantly more direct solar exposure than a vertical window, making the glazing specification critical to indoor comfort. The solar heat gain coefficient (SHGC) indicates how much solar energy passes through the glass and contributes to heat inside the room. Standard UK roof glazing is often selected to maximise daylight and warmth, while UAE projects require a different approach.",
          "UltraFrame roofs should therefore be specified with solar-control glazing suited to the building's orientation and exposure. Where appropriate, shading and ventilation can further reduce heat build-up, helping maintain a comfortable space throughout the hotter months.",
        ],
        points: [
          "Solar exposure is greater on roof glazing",
          "SHGC directly influences heat gain",
          "Solar-control glazing suits UAE conditions",
          "Orientation should guide the final specification",
        ],
      },
      {
        id: "controlling-light-and-shade-in-the-same-structure",
        eyebrow: "Livinroof",
        heading: "Controlling Light and Shade in the Same Structure",
        level: 3,
        body: [
          "LivinROOF combines glazed panels with solid, insulated roof sections, giving homeowners greater control over daylight and solar exposure within one structure. Rather than choosing between a completely glazed or fully solid roof, glazing can be positioned where it provides useful natural light while insulated sections help limit overhead heat gain.",
          "This makes LivinROOF particularly practical for UAE extensions facing strong afternoon sun, where a full glass roof may become uncomfortable. The design can be planned around the room's orientation, layout and intended use, creating a better balance between brightness, insulation and year-round comfort.",
        ],
        points: [
          "Combines glazing with insulated solid roof sections",
          "Glazing placement can suit the room's orientation",
          "Helps manage intense overhead solar exposure",
          "Balances daylight with thermal comfort",
        ],
        tone: "muted",
      },
      {
        id: "when-the-room-should-feel-like-part-of-the-house",
        eyebrow: "Ultraroof",
        heading: "When the Room Should Feel Like Part of the House",
        level: 3,
        body: [
          "Ultraroof takes a different approach again, a fully tiled, solid roof structure with glazed rooflights set into specific locations rather than glass forming the majority of the ceiling. The result reads less like a traditional conservatory and more like a genuine extension of the house, insulated to a level closer to the main roof, with daylight brought in deliberately through rooflights rather than across the entire structure.",
          "It's the strongest option where year-round comfort matters more than maximum glass, a home office, a family room used daily rather than occasionally, or any space where the client has been disappointed by an older, fully glazed conservatory that's too hot to use for half the year.",
        ],
        points: [
          "Fully tiled, solid structure with rooflights placed deliberately rather than glass throughout",
          "Insulation performance closer to a standard house roof than a traditional conservatory",
          "Suits daily-use rooms where year-round comfort outweighs maximum glass and view",
          "Often specified as a retrofit answer to an older, underperforming glazed conservatory",
        ],
      },
      {
        id: "a-more-architectural-brief-still-built-around-the-same",
        eyebrow: "Orangery & skyroom systems",
        heading: "A More Architectural Brief, Still Built Around the Same Principle",
        level: 4,
        body: [
          "Where the brief calls for a more architectural alternative to a traditional conservatory, UltraFrame's Orangery and Skyroom systems combine solid roof structures with carefully positioned glazing. A flat or lantern-style glazed section can introduce natural light into the centre of the room, while the surrounding solid roof and taller perimeter walls provide greater control over solar exposure.",
          "This creates a space that feels closer to a permanent room extension than a seasonal garden addition. The approach works particularly well for larger UAE villa projects where the extension needs to support year-round living, entertaining and relaxation while complementing the home's existing architecture.",
        ],
        points: [
          "Flat or lantern-style glazing creates a stronger architectural statement",
          "Solid roof sections help control direct solar exposure",
          "Taller perimeter walls create a more substantial room-like appearance",
          "Well suited to larger villa extensions and year-round living",
          "Roof glazing is specified according to orientation and solar gain",
        ],
        tone: "muted",
      },
      {
        id: "a-roof-structure-still-needs-to-close-the-building-off",
        eyebrow: "Security",
        heading: "A Roof Structure Still Needs to Close the Building Off",
        level: 4,
        body: [
          "A glazed roof extension forms part of the building's overall security envelope, so its structure must work alongside the doors and windows below. UltraFrame's roof framework is designed to support the required roof loads without relying on the glazing for structural rigidity.",
          "Where the roof connects with bi-fold doors or glazed walls, the security specification should be coordinated across the complete opening rather than treated as separate elements. The final result depends on the glass, locks, hardware and surrounding structure all matching the specified configuration.",
        ],
        points: [
          "Roof framework supports structural loads independently of the glazing",
          "Door and window hardware provides the primary opening security",
          "Roof and wall systems should be specified together",
          "Full glass and hardware configuration should be confirmed before installation",
        ],
      },
      {
        id: "a-roof-frame-that-still-needs-to-handle-direct-overhead",
        eyebrow: "Look and finish",
        heading: "A Roof Frame That Still Needs to Handle Direct Overhead Sun",
        level: 4,
        body: [
          "UltraFrame's structural roof components are finished through the same RAL colour range and coating standards used across premium aluminium systems, but a roof frame faces a harsher version of the same UV exposure a vertical frame deals with, closer to direct overhead sun for most of the day rather than the more oblique angle a wall-mounted window sees. Coating durability matters more here for exactly that reason.",
          "Internally, the roof's finish also affects how the room actually feels day to day, a solid LivinROOF or Ultraroof section finished in a lighter tone reflects more heat back out than a dark one, worth discussing at spec stage alongside the glazing choice rather than as a purely aesthetic decision afterward.",
        ],
        points: [
          "Full RAL colour range through the same coating standards as premium aluminium systems",
          "Roof-facing coatings checked against more direct overhead UV exposure than vertical frames see",
          "Lighter external roof tones reflect more heat than dark finishes on solid roof sections",
          "Colour and glazing spec discussed together, not treated as separate decisions",
        ],
        tone: "muted",
      },
      {
        id: "why-we-don-t-just-pass-on-the-uk-specification",
        eyebrow: "Built for the uk, rebuilt for the sun",
        heading: "Why We Don't Just Pass On the UK Specification",
        level: 4,
        body: [
          "UltraFrame tests its published performance data against UK conditions, a market where solar gain is something to capture, not resist, which makes the standard UK specification the wrong starting point for a Gulf roof rather than simply an imperfect one. This isn't a minor recheck the way it might be for a window brand already close to Gulf conditions, it's closer to a full respecification of the glazing and shading strategy for every project.",
          "We rebuild the glazing spec, review roof pitch and orientation against the actual sun path over the specific site, and where useful, bring in additional shading or ventilation strategy before finalising any quote, rather than adjusting a UK-standard design after the fact.",
        ],
        points: [
          "UK solar-gain-optimised glazing specification rebuilt for Gulf solar-rejection needs",
          "Roof pitch and orientation reviewed against the actual sun path over the specific site",
          "Additional shading or ventilation strategy considered where the roof design allows it",
          "This rework is included as standard on every quote, not billed as an extra",
        ],
      },
      {
        id: "a-local-team-fluent-in-the-full-range",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team Fluent in the Full Range",
        level: 5,
        body: [
          "We don't quote \"UltraFrame\" as one generic conservatory roof, we work in the actual systems, Classic Glass Roof, LivinROOF, Ultraroof or Orangery, matched to what the room's orientation and use actually demand.",
          "As an authorised partner working from genuine profile stock, every installation carries factory-backed certification rather than a general warranty added on afterward.",
        ],
        points: [
          "Authorised access to the full UltraFrame roof system range",
          "Full glazing and shading respecification against UAE sun path and orientation",
          "Free site survey and written specification within 24 hours",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
        tone: "muted",
      },
    ],
    faqs: [
      {
        q: "Will a fully glazed conservatory roof actually be usable in a Dubai summer?",
        a: "It can be, but only with a solar control glazing specification matched to the room's orientation, and even then a west or south-facing full-glass roof will need more careful shading or ventilation planning than a north-facing one, worth discussing honestly at spec stage rather than after installation.",
      },
      {
        q: "What's the real difference between LivinROOF and Ultraroof?",
        a: "LivinROOF combines glazed and solid sections within one structure so you can control exactly where light comes in, while Ultraroof is a fully solid, tiled roof with rooflights placed deliberately, closer to a genuine house extension than a traditional glazed conservatory.",
      },
      {
        q: "Can an UltraFrame roof sit above a full sliding or bi-fold glass wall?",
        a: "Yes, that's a common combination, and we specify the roof and the wall-level doors together so the room's overall security and thermal performance is coordinated, rather than treating the roof as a separate scope from what's underneath it.",
      },
      {
        q: "Is UK-spec glazing simply upgraded for UAE projects, or is it a different design altogether?",
        a: "Closer to a different design. UK glazing is chosen to capture and hold heat, the opposite priority to a Gulf project, so we rebuild the glazing and often the shading strategy around solar rejection rather than adjusting the UK specification incrementally.",
      },
    ],
    worksWith: [
      { href: "/catalogue/aluminium-sliding-doors", label: "Aluminium Sliding Doors", description: "A full-width opening beneath the roof line for genuine indoor-outdoor flow." },
      { href: "/catalogue/skylights", label: "Skylights & Rooflights", description: "Additional daylight control alongside a solid or part-glazed roof." },
      { href: "/catalogue/garden-rooms", label: "Garden Rooms", description: "A complete structure where the roof is only one part of the brief." },
    ],
  },

};

/** Editorial for a brand page, or null when it has none. */
export function brandEditorialFor(routeSlug: string): BrandEditorial | null {
  return brandEditorial[routeSlug] ?? null;
}
