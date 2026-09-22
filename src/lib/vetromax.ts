// Vetromax brand area — content for /brands/vetromax and its five systems.
//
// Provenance, because it matters for accuracy:
//   • System names, categories, system codes, key-feature names and all
//     performance/test data were crawled from vetromax.com and are reproduced
//     exactly. Test standards and classes are quoted verbatim.
//   • Dimensional specifications (profile widths, maximum glass sizes, leaf
//     weights, glazing thickness) were supplied by the client brief. They are
//     not present in vetromax.com's crawlable markup — the source renders them
//     inside images — so they are marked `fromBrief` and should be checked
//     against the official brochures before launch.
//   • Feature descriptions are written for Swift Rooms. The source's own
//     descriptions sit inside images and could not be read, so these describe
//     the named feature without asserting figures beyond those above.
//
// Two source errors are deliberately NOT reproduced:
//   • vetromax.com/vetro-slide/ displays the system code "VF CW 35C", which is
//     the Vetro Façade code (VF = Vetro Façade, CW = curtain wall). Vetro Slide
//     has no published code of its own, so none is shown.
//   • vetromax.com/vetro-guillotine/ shows "VetroGuillotine" where a code would
//     sit; that is the product name, not a code, so none is shown.

export type Spec = {
  label: string;
  value: string;
  /** True when the figure comes from the client brief rather than vetromax.com. */
  fromBrief?: boolean;
};

export type PerfEntry = { label: string; value: string; standard: string };

export type VetromaxSystem = {
  slug: string;
  name: string;
  /** Category line shown under the name, as published by Vetromax. */
  category: string;
  /** Manufacturer system reference, where one is published. */
  systemCode?: string;
  /** One-line summary for cards and meta descriptions. */
  summary: string;
  intro: string[];
  features: { name: string; description: string }[];
  specs: Spec[];
  performance?: {
    european?: PerfEntry[];
    american?: PerfEntry[];
  };
  /** Configurations or applications, where published. */
  configurations?: { heading: string; items: string[] };
  /** Manufacturer render, downloaded and served locally (never hotlinked). */
  image?: { src: string; alt: string };
  /** Official Vetromax brochure. Linked, never mirrored. */
  brochureUrl?: string;
  related: string[];
  seo: { title: string; description: string };
  /** Comparison-table row values; "—" where Vetromax publishes nothing. */
  compare: {
    systemType: string;
    application: string;
    profile: string;
    maximumSize: string;
    glazing: string;
    operation: string;
    thermalBreak: string;
    keyUseCase: string;
  };
};

const BROCHURE = "https://vetromax.com/downloads/brochure";

export const vetromaxSystems: VetromaxSystem[] = [
  {
    slug: "vetro-facade",
    name: "Vetro Façade",
    category: "Minimal Curtain Wall Systems",
    systemCode: "VF CW 35C",
    summary:
      "A 35 mm minimal curtain wall system for conventional, structural and hybrid facades.",
    intro: [
      "Vetro Façade is a minimal curtain wall system built from aluminium mullions and transoms on a 35 mm face width. Profile depth varies with the span and wind load the elevation has to carry, so the visible grid stays consistent while the structure behind it changes to suit the building.",
      "The system accommodates conventional, structural and hybrid curtain wall configurations, which means a single platform can run across a facade that changes from captured glazing to structurally bonded and back again without a change of sightline.",
    ],
    features: [
      {
        name: "Thermal Performance",
        description:
          "Thermally broken construction separates the inner and outer aluminium, limiting heat transfer through the frame itself independently of the glazing specification.",
      },
      {
        name: "Minimal Profile",
        description:
          "A 35 mm face width keeps the visible grid tight across large elevations, so the facade reads as glass rather than framing.",
      },
      {
        name: "Maximum Glass",
        description:
          "Structural depth is carried behind the sightline rather than across it, allowing larger glazed panels within the same visible grid.",
      },
      {
        name: "Structural Stability",
        description:
          "Profile depth is selected against the span and wind load of each elevation, tested to the ASTM and CWCT standards listed below.",
      },
      {
        name: "Corner Mullion",
        description:
          "A dedicated corner mullion resolves the junction between two elevations without an additional post, keeping glazed corners continuous.",
      },
      {
        name: "Windows & Doors Integration",
        description:
          "Opening vents and door leaves integrate into the curtain wall grid, so ventilation and access do not interrupt the facade pattern.",
      },
      {
        name: "Frame Construction in 3 Levels",
        description:
          "Frame build-up is arranged across three levels, allowing the same system to suit conventional, structural and hybrid configurations.",
      },
    ],
    specs: [
      { label: "Profile face width", value: "35 mm" },
      { label: "Construction", value: "Aluminium mullions and transoms" },
      { label: "Profile depth", value: "Varies by span and wind load" },
      { label: "Configurations", value: "Conventional, structural, hybrid" },
      { label: "Frame construction", value: "3 levels" },
    ],
    performance: {
      american: [
        { label: "Air Infiltration", value: "Pressure = 300 pa", standard: "ASTM E283 / E283M-19" },
        { label: "Static Water Penetration", value: "Pressure = 720 pa", standard: "ASTM E 331-00 (2016)" },
        { label: "Dynamic Water Penetration", value: "Pressure = 720 pa", standard: "AAMA 501.1-17" },
        { label: "Structural Performance", value: "Load = ±2000 pa", standard: "ASTM E 330-14" },
        { label: "Seismic Test (Static)", value: "Horizontal movement = ±5 mm", standard: "AAMA 501.4 : 2018" },
        { label: "Structural Safety", value: "Load = ±3000 pa", standard: "ASTM E 330-14" },
      ],
      european: [
        { label: "Curtain wall testing", value: "CWCT SEC 5:2005", standard: "CWCT" },
        { label: "Static pressure", value: "CWCT SEC 6:2005", standard: "CWCT" },
        { label: "Dynamic pressure", value: "CWCT SEC 6:2005", standard: "CWCT" },
        { label: "Serviceability", value: "CWCT SEC 11:2005", standard: "CWCT" },
        { label: "Seismic", value: "CWCT SEC 17:2005", standard: "CWCT" },
      ],
    },
    configurations: {
      heading: "Curtain wall configurations",
      items: ["Conventional curtain wall", "Structural curtain wall", "Hybrid configurations"],
    },
    brochureUrl: `${BROCHURE}/VetroFacade_Brochure.pdf`,
    image: {
      src: "/brands/vetromax/vetro-facade.webp",
      alt: "Vetro Façade curtain wall render showing the mullion and transom junction with glazing on both axes",
    },
    related: ["vetro-casement", "vetro-slide"],
    seo: {
      title: "Vetromax Vetro Façade — Minimal Curtain Wall Systems",
      description:
        "Vetro Façade minimal curtain wall from Vetromax: 35 mm aluminium mullions and transoms, conventional, structural and hybrid configurations, ASTM and CWCT tested. Supplied and installed in the UAE by Swiftrooms.",
    },
    compare: {
      systemType: "Curtain wall",
      application: "Facades and full elevations",
      profile: "35 mm face width",
      maximumSize: "—",
      glazing: "—",
      operation: "Fixed, with integrated windows and doors",
      thermalBreak: "Yes",
      keyUseCase: "Continuous glazing across a whole elevation",
    },
  },

  {
    slug: "vetro-casement",
    name: "Vetro Casement",
    category: "Windows & Doors Hidden Sash System",
    systemCode: "HS 80P",
    summary:
      "A hidden-sash aluminium window and door system with a 45 mm fixed frame and concealed hinges.",
    intro: [
      "Vetro Casement is an aluminium window and door platform built around a concealed sash. The opening leaf sits behind the frame rather than in front of it, so a closed window reads as a single flush plane and fixed and opening units look identical from outside.",
      "One system covers fixed lights, side-hung, bottom-hung and tilt-and-turn windows alongside single and double-leaf doors, which keeps sightlines consistent across an elevation that mixes opening types.",
    ],
    features: [
      {
        name: "Thermal Performance",
        description:
          "A thermally broken profile limits conduction through the frame, tested to Class C5 for wind resistance and Class 4 for air permeability under the EN standards below.",
      },
      {
        name: "Minimal Profile",
        description:
          "A 45 mm fixed aluminium frame, with the openable profile reaching 60 mm including the frame — narrow enough that opening lights do not visually interrupt a run of fixed glazing.",
      },
      {
        name: "Concealed Hinge",
        description:
          "Hinges are hidden within the frame rebate, leaving no visible hardware on the outer face and nothing exposed to dust or wind-driven sand.",
      },
      {
        name: "Elegant Handles",
        description:
          "Handle options are matched to the profile so the operating hardware sits with the sightline rather than standing proud of it.",
      },
      {
        name: "Multi-lock Mechanism",
        description:
          "Multi-point locking distributes closing pressure along the leaf, which is what delivers the Class E1200 water tightness rating rather than a single central catch.",
      },
    ],
    specs: [
      { label: "Fixed aluminium frame", value: "45 mm", fromBrief: true },
      { label: "Openable profile (incl. frame)", value: "60 mm", fromBrief: true },
      { label: "Sash type", value: "Hidden / concealed" },
      { label: "System reference", value: "HS 80P" },
    ],
    performance: {
      european: [
        { label: "Air Infiltration", value: "Class 4", standard: "EN 1026:2016; EN 12207:2016" },
        { label: "Water Tightness", value: "Class E1200", standard: "EN 1027:2016; EN 12208:1999" },
        { label: "Wind Resistance", value: "Class C5", standard: "EN 12211:2016; EN 12210:2016" },
      ],
    },
    configurations: {
      heading: "Available configurations",
      items: [
        "Fixed windows",
        "Side-hung windows",
        "Bottom-hung windows",
        "Tilt-and-turn windows",
        "Single-leaf doors",
        "Double-leaf doors",
      ],
    },
    brochureUrl: `${BROCHURE}/VetroCasement%20Brochure.pdf`,
    image: {
      src: "/brands/vetromax/vetro-casement.webp",
      alt: "Vetro Casement hinged door render viewed from outside, showing the concealed sash and flush outer face",
    },
    related: ["vetro-facade", "vetro-pivot"],
    seo: {
      title: "Vetromax Vetro Casement — Hidden Sash Windows & Doors",
      description:
        "Vetro Casement HS 80P from Vetromax: concealed-sash aluminium windows and doors, 45 mm fixed frame, tilt-and-turn and door configurations, Class 4 / E1200 / C5 tested. Supplied and installed in the UAE by Swiftrooms.",
    },
    compare: {
      systemType: "Casement windows and doors",
      application: "Windows and hinged doors",
      profile: "45 mm fixed / 60 mm openable",
      maximumSize: "—",
      glazing: "—",
      operation: "Side-hung, bottom-hung, tilt-and-turn, hinged doors",
      thermalBreak: "Yes",
      keyUseCase: "Mixed fixed and opening lights on one sightline",
    },
  },

  {
    slug: "vetro-slide",
    name: "Vetro Slide",
    category: "Minimal Sliding Windows & Door Systems",
    summary:
      "A 22 mm minimal sliding system for large glazed openings, manual or motorised.",
    intro: [
      "Vetro Slide is a minimal sliding system built around a 22 mm profile, intended for openings where the glass should dominate and the frame should effectively disappear. Panels can be operated manually or motorised, and the frame is designed to be concealed within the surrounding structure.",
      "Multitrack configurations and a free-corner option mean the system suits a wide rear elevation that needs to open fully, as well as corner glazing where two runs meet without a post.",
    ],
    features: [
      {
        name: "Thermal Performance",
        description:
          "Thermally broken construction limits heat transfer through the frame, tested to Class B4 for wind resistance and Class 4 for air permeability under the EN standards below.",
      },
      {
        name: "Minimal Profile",
        description:
          "A sleek 22 mm slim aluminium profile designed to complement modern aesthetics while maximising natural light and providing unobstructed views.",
      },
      {
        name: "Maximum Glass",
        description:
          "Panels reach up to 3 m wide by 6 m high, so a full-height opening can be covered in fewer, larger panes with fewer visible joints.",
      },
      {
        name: "Structural Stability",
        description:
          "Hardware is rated to support up to 1,500 kg per leaf, which is what allows panels at the maximum size to run smoothly rather than sag over time.",
      },
      {
        name: "Concealed Frame",
        description:
          "The frame is designed to be built into the floor, ceiling and reveals, so a closed panel reads as glass meeting plaster rather than glass in a box.",
      },
      {
        name: "Durable Design",
        description:
          "Running gear and seals are specified for repeated daily operation on heavy panels, tested to Class 7A for water tightness.",
      },
      {
        name: "Unlimited Solutions",
        description:
          "Multitrack configurations run to as many as five channels, so the number of panels and the way they stack can be set by the opening rather than the system.",
      },
      {
        name: "Free Corner",
        description:
          "A free-corner configuration removes the corner post entirely, letting two glazed runs meet and slide clear of one another.",
      },
    ],
    specs: [
      { label: "Minimal profile", value: "22 mm" },
      { label: "Maximum glass width", value: "3,000 mm", fromBrief: true },
      { label: "Maximum glass height", value: "6,000 mm", fromBrief: true },
      { label: "Maximum leaf weight", value: "1,500 kg", fromBrief: true },
      { label: "Multitrack configurations", value: "Up to 5 channels", fromBrief: true },
      { label: "Operation", value: "Manual or motorised", fromBrief: true },
    ],
    performance: {
      european: [
        { label: "Air Infiltration", value: "Class 4", standard: "EN 12 207:2000" },
        { label: "Water Tightness", value: "Class 7A", standard: "EN 12 208:2000" },
        { label: "Wind Resistance", value: "Class B4", standard: "EN 12 210:2000" },
      ],
    },
    configurations: {
      heading: "Configurations",
      items: [
        "Manual operation",
        "Motorised operation",
        "Multitrack, up to five channels",
        "Free-corner configuration",
      ],
    },
    brochureUrl: `${BROCHURE}/VetroSlide_Brochure.pdf`,
    image: {
      src: "/brands/vetromax/vetro-slide.webp",
      alt: "Vetro Slide render in section, showing the sliding panels, concealed frame and floor track set into stone",
    },
    related: ["vetro-guillotine", "vetro-pivot"],
    seo: {
      title: "Vetromax Vetro Slide — Minimal Sliding Windows & Doors",
      description:
        "Vetro Slide from Vetromax: 22 mm minimal sliding system, glass to 3 m × 6 m, up to 1,500 kg per leaf, manual or motorised, multitrack and free corner. Supplied and installed in the UAE by Swiftrooms.",
    },
    compare: {
      systemType: "Sliding windows and doors",
      application: "Large glazed openings",
      profile: "22 mm",
      maximumSize: "3,000 × 6,000 mm per panel",
      glazing: "—",
      operation: "Manual or motorised, up to 5 tracks",
      thermalBreak: "Yes",
      keyUseCase: "Wide rear elevations that open fully",
    },
  },

  {
    slug: "vetro-pivot",
    name: "Vetro Pivot",
    category: "Minimal Pivot Door System",
    systemCode: "VP 75",
    summary:
      "A minimal pivot door carrying leaves to 2.5 m × 6 m on a floor pivot rated to 600 kg.",
    intro: [
      "Vetro Pivot is a pivot door system for entrances where the door itself is the architectural gesture. The leaf turns on a floor pivot rather than hanging from hinges, which is what allows it to be far larger and heavier than a conventional hinged door.",
      "Leaves can be finished in glass, aluminium, stainless steel, stone or wood, and the system supports single panels, pairs and multiple independently operating panels in inward, outward or double-action configurations.",
    ],
    features: [
      {
        name: "Slimmest Design",
        description:
          "The frame is reduced to the minimum the pivot mechanism needs, so the leaf reads as a single plane rather than a panel inside a surround.",
      },
      {
        name: "Threshold Details",
        description:
          "Threshold detailing is designed to keep the floor finish running through the opening rather than interrupting it with a raised track.",
      },
      {
        name: "Durable Floor Pivot",
        description:
          "The floor pivot supports leaves up to 600 kg, carrying the weight into the slab instead of into the surrounding frame.",
      },
      {
        name: "Structural Stability",
        description:
          "Leaf construction is engineered to stay flat and true at maximum size, where a conventional door of the same dimensions would distort.",
      },
      {
        name: "Maximum Leaf Size",
        description:
          "Leaves reach up to 2.5 m wide and 6 m high, making a full-height entrance possible as a single moving panel.",
      },
      {
        name: "Bespoke Handle",
        description:
          "Handles are specified to the project rather than the catalogue, matched to the leaf material and proportion.",
      },
      {
        name: "Multiple Material",
        description:
          "The leaf can be finished in glass, aluminium, stainless steel, stone or wood, so the door can match either the glazing or the surrounding facade.",
      },
      {
        name: "Thermal Performance",
        description:
          "Thermally broken construction limits heat transfer through the frame, which matters on an entrance this size.",
      },
      {
        name: "Unlimited Solutions",
        description:
          "Inward, outward and double-action opening, with single, paired or multiple independent panels, lets the configuration follow the entrance rather than the product.",
      },
    ],
    specs: [
      { label: "Floor pivot capacity", value: "Up to 600 kg", fromBrief: true },
      { label: "Glass combinations", value: "Up to 52 mm", fromBrief: true },
      { label: "Maximum leaf width", value: "2,500 mm", fromBrief: true },
      { label: "Maximum leaf height", value: "6,000 mm", fromBrief: true },
      { label: "System reference", value: "VP 75" },
    ],
    configurations: {
      heading: "Materials and configurations",
      items: [
        "Glass, aluminium, stainless steel, stone or wood leaves",
        "Inward or outward opening",
        "Double action",
        "Single panel, two panels, or multiple independent panels",
      ],
    },
    brochureUrl: `${BROCHURE}/VetroPivot_Brochure.pdf`,
    image: {
      src: "/brands/vetromax/vetro-pivot.webp",
      alt: "Vetro Pivot render in section, showing the door profile meeting a stone threshold over the slab",
    },
    related: ["vetro-casement", "vetro-slide"],
    seo: {
      title: "Vetromax Vetro Pivot — Minimal Pivot Door System",
      description:
        "Vetro Pivot VP 75 from Vetromax: floor pivot to 600 kg, leaves to 2.5 m × 6 m, glazing to 52 mm, in glass, aluminium, steel, stone or wood. Supplied and installed in the UAE by Swiftrooms.",
    },
    compare: {
      systemType: "Pivot door",
      application: "Entrances and feature doors",
      profile: "—",
      maximumSize: "2,500 × 6,000 mm per leaf",
      glazing: "Up to 52 mm",
      operation: "Inward, outward or double action",
      thermalBreak: "Yes",
      keyUseCase: "A single oversized entrance door",
    },
  },

  {
    slug: "vetro-guillotine",
    name: "Vetro Guillotine",
    category: "Minimal Vertical Sliding System",
    summary:
      "A 21 mm vertical sliding system that drops the glass away rather than sliding it sideways.",
    intro: [
      "Vetro Guillotine is a vertical sliding system: the panel travels up and down rather than across, so an opening can be cleared completely without any panel stacking to one side. That makes it suited to openings where there is no wall to slide into — a servery, a balcony return, or a run of glazing between two piers.",
      "The system uses a 21 mm profile and a concealed frame, and the source describes the movement as a smooth, effortless glide rather than the counterweighted action a traditional sash window relies on.",
    ],
    features: [
      {
        name: "Thermal Performance",
        description:
          "Thermally broken construction limits heat transfer through the frame, tested to Class B4 for wind resistance and Class 4 for air permeability under the EN standards below.",
      },
      {
        name: "Minimal Profile",
        description:
          "A 21 mm profile keeps the visible frame narrower than the sliding system, which matters when the panel sits at eye level in a servery or balcony opening.",
      },
      {
        name: "Maximum Glass",
        description:
          "Panels reach up to 3,000 mm wide by 6,000 mm high, so a full-height opening can be cleared with a single moving pane.",
      },
      {
        name: "Structural Stability",
        description:
          "Hardware is rated to 1,500 kg per leaf, which is what allows a pane of that size to be lifted and held safely in any position.",
      },
      {
        name: "Concealed Frame",
        description:
          "The frame and running gear build into the surrounding structure, so the raised panel disappears rather than sitting in a visible head box.",
      },
      {
        name: "Durable Design",
        description:
          "Running gear and seals are specified for repeated vertical operation under load, tested to Class 7A for water tightness.",
      },
      {
        name: "Unlimited Solutions",
        description:
          "Panel count and travel are set by the opening, so the system can suit a single servery window or a full-height glazed bay.",
      },
      {
        name: "Free Corner",
        description:
          "A free-corner configuration allows two vertical runs to meet without a corner post between them.",
      },
    ],
    specs: [
      { label: "Minimal profile", value: "21 mm", fromBrief: true },
      { label: "Maximum glass width", value: "3,000 mm", fromBrief: true },
      { label: "Maximum glass height", value: "6,000 mm", fromBrief: true },
      { label: "Maximum leaf weight", value: "1,500 kg", fromBrief: true },
    ],
    performance: {
      european: [
        { label: "Air Infiltration", value: "Class 4", standard: "EN 12 207:2000" },
        { label: "Water Tightness", value: "Class 7A", standard: "EN 12 208:2000" },
        { label: "Wind Resistance", value: "Class B4", standard: "EN 12 210:2000" },
      ],
    },
    image: {
      src: "/brands/vetromax/vetro-guillotine.webp",
      alt: "Vetro Guillotine render showing three stacked vertical sliding panels within a single frame",
    },
    related: ["vetro-slide", "vetro-facade"],
    seo: {
      title: "Vetromax Vetro Guillotine — Minimal Vertical Sliding System",
      description:
        "Vetro Guillotine from Vetromax: 21 mm vertical sliding system, glass to 3,000 × 6,000 mm, up to 1,500 kg per leaf, Class 4 / 7A / B4 tested. Supplied and installed in the UAE by Swiftrooms.",
    },
    compare: {
      systemType: "Vertical sliding",
      application: "Serveries, balconies, glazed bays",
      profile: "21 mm",
      maximumSize: "3,000 × 6,000 mm per panel",
      glazing: "—",
      operation: "Vertical sliding",
      thermalBreak: "Yes",
      keyUseCase: "Clearing an opening with nowhere to slide sideways",
    },
  },
];

export const vetromaxBySlug = new Map(vetromaxSystems.map((s) => [s.slug, s]));

export function vetromaxSystem(slug: string): VetromaxSystem | null {
  return vetromaxBySlug.get(slug) ?? null;
}

/** Rows for the landing-page comparison table. */
export const COMPARE_ROWS: { key: keyof VetromaxSystem["compare"]; label: string }[] = [
  { key: "systemType", label: "System type" },
  { key: "application", label: "Application" },
  { key: "profile", label: "Profile" },
  { key: "maximumSize", label: "Maximum size" },
  { key: "glazing", label: "Glazing" },
  { key: "operation", label: "Operation" },
  { key: "thermalBreak", label: "Thermal break" },
  { key: "keyUseCase", label: "Key use case" },
];

/** Landing-page copy. */
export const vetromaxBrand = {
  name: "Vetromax",
  strapline: "Minimalist Aluminium Systems",
  image: {
    src: "/brands/vetromax/home.webp",
    alt: "Contemporary villa facade with minimal-framed aluminium glazing across two storeys",
  },
  intro:
    "Vetromax builds minimalist aluminium systems for contemporary architecture — curtain wall, casement windows and doors, sliding and vertical sliding walls, and oversized pivot entrances. The common thread across the range is that structural depth is carried behind the sightline rather than across it, so the visible frame stays narrow while the glass gets larger.",
  why: [
    {
      name: "One platform, five system types",
      description:
        "Facade, casement, sliding, pivot and vertical sliding all come from the same manufacturer, so sightlines and finishes can be held consistent across an entire building rather than negotiated between suppliers.",
    },
    {
      name: "Tested to European and American standards",
      description:
        "Vetro Façade is tested to ASTM and AAMA alongside the CWCT sequence; the window and door systems carry EN classifications for air, water and wind. The published figures are set out in full on each system page.",
    },
    {
      name: "Specified for Gulf conditions",
      description:
        "Swiftrooms specifies and installs these systems in the UAE, checking thermal break, gasket and wind-load data against the actual site rather than passing on the catalogue figures.",
    },
  ],
  applications: [
    { name: "Villas", description: "Full-height sliding walls, pivot entrances and hidden-sash windows on a single sightline." },
    { name: "Towers and mixed-use", description: "Vetro Façade curtain wall across primary elevations, with integrated opening vents and doors." },
    { name: "Hospitality and retail", description: "Vertical sliding serveries, frameless corners and oversized entrance doors." },
  ],
};

/**
 * Cross-links from the existing Swiftrooms catalogue products to the dedicated
 * Vetromax area. Keyed by catalogue product slug.
 *
 * The two uPVC products map to the brand landing page rather than a system:
 * Vetromax's five published systems are all aluminium, so pointing a uPVC suite
 * at one of them would be wrong.
 */
const PRODUCT_TO_SYSTEM: Record<string, string> = {
  "vetro-casement": "vetro-casement",
  "vetromax-pivot-door": "vetro-pivot",
  "vetromax-vf35": "vetro-facade",
};

export type VetromaxCrossLink = { href: string; label: string; description: string };

/**
 * The Vetromax link for a catalogue product, or null when the product is not a
 * Vetromax one. Never replaces the product's own content — it is an addition.
 */
export function vetromaxCrossLink(
  productSlug: string,
  brand: string | undefined,
): VetromaxCrossLink | null {
  if (!brand || !/vetro/i.test(brand)) return null;

  const systemSlug = PRODUCT_TO_SYSTEM[productSlug];
  const system = systemSlug ? vetromaxSystem(systemSlug) : null;

  if (system) {
    return {
      href: `/brands/vetromax/${system.slug}`,
      label: `${system.name} — ${system.category}`,
      description:
        "Full manufacturer specification, tested performance figures and configuration options for this system.",
    };
  }

  return {
    href: "/brands/vetromax",
    label: "Vetromax — Minimalist Aluminium Systems",
    description:
      "The full Vetromax range, with manufacturer specifications and tested performance for each system.",
  };
}
