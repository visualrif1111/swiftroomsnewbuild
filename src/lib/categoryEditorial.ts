// Long-form editorial for catalogue category pages.
//
// Same shape and provenance as the homepage copy in `homeEditorial.ts`: ported
// from the live site at swiftrooms.ae, which holds this text hard-coded in a
// separate codebase rather than in Sanity — a search of the shared dataset
// returns no documents containing it.
//
// Keyed by category slug, then by the slot it occupies in CategoryClient, so a
// category only carries the blocks it actually has. Categories with no entry
// render exactly as before.
import type { EditorialSection } from "@/lib/homeEditorial";

export type CategoryEditorial = {
  /** Between the hero and the product grid. */
  beforeProducts?: EditorialSection[];
  /** Between the comparison table and "Works well with". */
  afterCompare?: EditorialSection[];
  /** Between "Works well with" and the FAQ. */
  afterWorksWellWith?: EditorialSection[];
  /** After the FAQ, before "Other product ranges". */
  afterFaq?: EditorialSection[];
};

/**
 * Page-specific H1s. The live site sets a longer, search-facing heading on
 * some category pages while leaving the breadcrumb and schema on the
 * category's real name — mirrored here. Falls back to the category name.
 */
const CATEGORY_HEADINGS: Record<string, string> = {
  "aluminium-windows": "Aluminium Windows Dubai",
};

/** H1 for a category page. */
export function categoryHeading(slug: string, fallback: string): string {
  return CATEGORY_HEADINGS[slug] ?? fallback;
}

export const categoryEditorial: Record<string, CategoryEditorial> = {
  "aluminium-windows": {
    beforeProducts: [
      {
        id: "the-heat-issues",
        eyebrow: "The heat issues",
        heading: "Aluminium Windows UAE – Why Standard Windows Don't Hold Up Here",
        level: 2,
        body: [
          "Most window systems on the market were never designed with a 48°C summer in mind. Frames warp, seals harden and crack within a couple of seasons, and single-chamber profiles let heat straight through the metal itself, glazing aside.",
          "That's the reason demand for aluminium windows Dubai buyers actually trust has shifted so heavily toward thermally broken profiles over the last five years, the gap between a \"window\" and a window built for this specific climate is wider than most people expect until they've lived through one bad summer with the wrong one.",
        ],
        points: [
          "Thermal break profiles as standard, not an upgrade",
          "UV-stable powder coating that won't chalk or fade",
          "Hardware rated for sand and dust exposure",
          "Seals tested against repeated thermal expansion",
        ],
      },
    ],

    afterCompare: [
      {
        id: "choosing-a-window-system",
        eyebrow: "Choosing a system",
        heading: "Aluminium Windows Sharjah – Casement, Tilt-Turn or Sliding",
        level: 2,
        body: [
          "The right opening type depends on the wall it's going into more than personal taste. Casements give a tighter seal and better ventilation control; tilt-turn adds a cleaning-friendly inward swing; aluminium windows Abu Dhabi suit tight floor plans where a casement's swing radius simply won't fit, balconies, kitchens over counters, anywhere space is at a premium.",
          "Apartment towers across the UAE lean toward sliding formats for exactly this reason, while villas mix all three depending on the room.",
        ],
        points: [
          "Casements: best air-tightness and locking configuration",
          "Tilt-turn: dual function, easier maintenance access",
          "Aluminium windows: low swing clearance, space-efficient",
          "Fixed lights: combined with any of the above for larger openings",
        ],
        tone: "muted",
      },
      {
        id: "profile-systems",
        eyebrow: "Profile systems",
        heading: "Cortizo Windows – What Sits Behind the Cortizo Name",
        level: 3,
        body: [
          "Not every aluminium profile on the market is manufactured to the same tolerance, and that matters more once a window's been sitting in direct sun for three or four years.",
          "Cortizo windows are extruded in Spain to European certification standards, which is part of why the profile depth and thermal break performance hold up better than lower-cost alternatives after prolonged UAE heat exposure. It's also why genuine Cortizo stock, rather than a look-alike profile, tends to come up early in technical conversations with architects.",
        ],
        points: [
          "European extrusion tolerances on every profile run",
          "Certified thermal break performance, independently tested",
          "Factory warranty carried through to the UAE installation",
          "Wide finish range without compromising structural spec",
        ],
      },
    ],

    afterWorksWellWith: [
      {
        id: "regional-projects",
        eyebrow: "Regional projects",
        heading: "Dubai, Abu Dhabi, Sharjah — Different Briefs",
        level: 3,
        body: [
          "Specification habits shift slightly from emirate to emirate, usually driven by building age and proximity to the coast rather than anything dramatic. Aluminium windows Abu Dhabi projects often call for heavier wind-load ratings given some of the exposed coastal sites out that way, while aluminium windows Sharjah enquiries more frequently involve retrofit work on older low-rise buildings than new-build villas.",
          "Dubai sits somewhere in between, with a mix of new-build towers and villa renovation work driving most of our volume.",
        ],
        points: [
          "Coastal sites: higher corrosion resistance specified as standard",
          "Retrofit projects: frame replacement without disturbing existing openings",
          "New-build towers: slim sightlines prioritised over ornamentation",
          "Inland villas: dust and sand sealing given more weight",
        ],
        tone: "muted",
      },
      {
        id: "thermal-performance",
        eyebrow: "Thermal performance",
        heading: "Reading a U-Value Correctly",
        level: 4,
        body: [
          "A lower U-value means less heat moving through the frame, but the number on a spec sheet only tells half the story without context on frame depth and glazing pairing.",
          "A 70mm thermally broken profile paired with double glazing will outperform a shallower system even if the glass itself is identical, simply because more of the heat transfer path runs through metal than glass on a window this size. It's a detail worth asking about before comparing two quotes on price alone.",
        ],
        points: [
          "U-value figures compared against matching glazing specs",
          "Frame depth as a direct driver of thermal performance",
          "Double glazing standard, triple glazing available on request",
          "Solar control coatings reduce glare without darkening the room",
        ],
      },
      {
        id: "security-standards",
        eyebrow: "Security standards",
        heading: "Locking Configurations Worth Specifying",
        level: 4,
        body: [
          "A window's security rating comes down to the locking hardware as much as the glass. Espagnolette multi-point locks distribute pressure across several points along the frame rather than relying on a single catch, which matters most on ground-floor and easily accessible openings.",
          "Laminated glazing adds a further layer without the bulk of toughened glass, and it's increasingly requested on aluminium windows UAE developers install at street level across newer residential compounds.",
        ],
        points: [
          "Multi-point espagnolette locking on casement and tilt-turn ranges",
          "Laminated glazing for ground-floor and accessible openings",
          "Restrictor stays for controlled partial opening",
          "Key-locking handles compatible with most profile systems",
        ],
        tone: "muted",
      },
      {
        id: "finishes",
        eyebrow: "Finishes",
        heading: "Colour, Coating and Long-Term Fade",
        level: 4,
        body: [
          "RAL powder coating covers most colour requests, but the coating quality behind the colour matters more once a frame's faced five or six UAE summers. Anodised finishes hold up slightly better under constant direct sun and suit a more minimal, industrial look than a painted frame.",
          "Anthracite grey and matte black have overtaken white as the most requested finish on aluminium windows Dubai villa projects over the past couple of years, generally paired with slimmer sightline profiles.",
        ],
        points: [
          "RAL colour matching against existing doors and cladding",
          "Anodised finishes for superior long-term UV resistance",
          "Anthracite and matte black now the most requested tones",
          "Dual-tone options, different interior and exterior colours",
        ],
      },
      {
        id: "commercial-projects",
        eyebrow: "Commercial projects",
        heading: "Offices, Retail and Mixed-Use Buildings",
        level: 4,
        body: [
          "Commercial specification differs from residential mainly in cycle rating and compliance requirements rather than aesthetics. Office fit-outs and retail units need hardware that survives daily opening cycles without loosening, plus fire-rated glazing options where local code requires it.",
          "Larger commercial jobs across the UAE increasingly specify a single profile family across the whole building, often Cortizo windows on the primary elevations paired with a matching curtain wall system, to keep sightlines consistent floor to floor.",
        ],
        points: [
          "Higher cycle-rated hardware for daily commercial use",
          "Fire-rated glazing configurations available where required",
          "Matched profile families across window and curtain wall",
          "Acoustic glazing options for street-facing commercial units",
        ],
        tone: "muted",
      },
      {
        id: "upkeep",
        eyebrow: "Upkeep",
        heading: "Maintenance in Dust and Salt Air",
        level: 5,
        body: [
          "Even a well-specified aluminium window needs some upkeep in this environment. Dust builds up in track channels faster here than in most markets these systems were originally engineered for, and coastal properties see hardware wear noticeably quicker than inland sites because of salt content in the air.",
          "A short seasonal routine, checking seals before summer, lubricating hinges and tracks twice a year, keeps most issues from ever turning into a service call.",
        ],
        points: [
          "Track and hinge cleaning every few months in dusty areas",
          "Seal inspection before peak summer heat",
          "Hardware lubrication twice yearly on sliding and hinged systems",
          "Coastal properties benefit from more frequent gasket checks",
        ],
      },
      {
        id: "from-survey-to-fit",
        eyebrow: "From survey to fit",
        heading: "What Happens Before Installation Day",
        level: 5,
        body: [
          "A physical site survey happens before manufacturing starts on every job, even when architectural drawings already exist, measurements taken off a plan rarely match what's actually on site once render and finishing tolerances are accounted for.",
          "Shop drawings go to the client for sign-off, then profiles are cut and pre-assembled before the installation crew arrives. Standard casement and sliding orders typically run a few weeks; bespoke sizes or non-standard finishes add to that.",
        ],
        points: [
          "Site survey confirms exact opening dimensions before fabrication",
          "Shop drawings issued for sign-off ahead of manufacturing",
          "Pre-assembly completed off-site to reduce installation time",
          "Bespoke sizes and finishes extend standard lead times",
        ],
        tone: "muted",
      },
      {
        id: "pricing",
        eyebrow: "Pricing",
        heading: "What Actually Moves the Price",
        level: 5,
        body: [
          "Two windows that look near-identical in a brochure can land far apart in price once profile depth, glazing build-up and hardware grade are factored in. Sliding systems generally cost less than an equivalent-sized casement or tilt-turn because of the simpler mechanism, though larger multi-track sliders narrow that gap.",
          "Custom RAL colours, acoustic glazing and oversized non-standard openings are the three additions most likely to push a quote up beyond what a client initially expected.",
        ],
        points: [
          "Profile depth and thermal break spec as the base cost driver",
          "Glazing type – double, triple, laminated or acoustic",
          "Opening mechanism – sliding generally lower cost than hinged",
          "Custom colours and oversized openings priced separately",
        ],
      },
      {
        id: "specification-mistakes",
        eyebrow: "Specification mistakes",
        heading: "What Goes Wrong at the Brief Stage",
        level: 5,
        body: [
          "Most window problems trace back to decisions made before manufacturing rather than anything wrong with the install itself.",
          "Choosing a profile purely on appearance without checking the U-value, mismatching glazing to a security-rated frame, or underestimating lead time on a bespoke order are the three issues that come up most often when we're asked for a second opinion on someone else's aluminium windows UAE project.",
        ],
        points: [
          "Selecting by appearance without checking thermal performance data",
          "Mismatching glazing spec against the frame's rated performance",
          "Underestimating lead time on bespoke sizes or finishes",
          "Skipping a proper site survey before ordering",
        ],
        tone: "muted",
      },
      {
        id: "windows-technical-check",
        eyebrow: "Before you finalise drawings",
        heading: "A Quick Technical Check Saves Rework Later",
        level: 5,
        body: [
          "A short conversation with a technical team before drawings are locked in catches sizing, wind-load and glazing mismatches while they're still cheap to fix.",
          "It's a habit worth building into any project involving aluminium windows Dubai, Abu Dhabi or Sharjah developers are increasingly used to seeing on architect-led jobs, whatever the scale of the build.",
        ],
        points: [
          "Free technical consultation before final drawing sign-off",
          "Site-specific advice on orientation, exposure and wind load",
          "Guidance on matching windows with existing or planned doors",
          "Support for single-unit replacements through to full developments",
        ],
      },
    ],

    afterFaq: [
      {
        id: "windows-why-swiftrooms",
        eyebrow: "Why Swiftrooms",
        heading: "A Team That Specifies for This Climate, Not a Generic One",
        level: 6,
        body: [
          "We've fitted windows across enough Dubai villas, Abu Dhabi developments and Sharjah renovations to know which specs actually hold up after a few summers and which ones only look good on a datasheet.",
          "As an authorised Cortizo, Vetro and Gulf Extrusions partner, we're working from genuine profile stock rather than grey-market equivalents, with factory backing behind every warranty we issue.",
        ],
        points: [
          "Authorised partner for Cortizo, Vetro, Vetromax and Gulf Extrusions",
          "Free site survey and written specification within 24 hours",
          "In-house technical support for architects and consultants",
          "Track record across villas, towers and commercial fit-outs UAE-wide",
        ],
        tone: "muted",
      },
    ],
  },

  "aluminium-sliding-doors": {
    beforeProducts: [
      {
        id: "sightline-design",
        eyebrow: "Sightline design",
        heading: "Ultra Slim Sliding Doors – Why Slim Frames Matter More Than People Think",
        level: 2,
        body: [
          "Most homeowners judge a door by the glass, not the metal around it. That's backwards. The thinner the frame, the more glass you actually see, which is the whole point of installing slim sliding doors in the first place.",
          "Comparing a 28mm central sightline against a bulky 60mm frame completely changes how an interior room connects visually with outdoor patios, pool decks, or landscaped gardens across UAE villas. Some of the ultra slim sliding doors now on the market push that sightline down further still, though there's a real cost trade-off attached to every extra millimetre shaved off.",
        ],
        points: [
          "Narrower interlock sections mean less visual interruption across wide openings.",
          "Slim profiles pair naturally with floor-to-ceiling sliding doors for uninterrupted views.",
          "Reduced frame mass doesn't mean reduced strength, reinforced steel inserts carry the load.",
        ],
      },
      {
        id: "structural-planning",
        eyebrow: "Structural planning",
        heading: "Floor To Ceiling Sliding Doors – Going Floor To Ceiling: What Actually Changes",
        level: 2,
        body: [
          "Dropping the head height down and running glass from slab to slab isn't just an aesthetic call, it affects structural loading, drainage detailing, and how the lintel above the opening is designed.",
          "Floor to ceiling sliding doors need the supporting structure calculated properly before the frame ever gets ordered, particularly on upper floors of villas in Dubai or Abu Dhabi where wind loading is significantly higher than at ground level. Wider openings compound the problem, a run of large sliding glass doors carries more weight per linear metre than most contractors expect.",
        ],
        points: [
          "Full-height glazing requires engineer sign-off on lintel and header loads.",
          "Taller panels mean heavier glass, which changes roller and track selection.",
          "Sub-sill drainage has to handle a longer run without pooling at the base.",
        ],
        tone: "muted",
      },
      {
        id: "minimal-hardware",
        eyebrow: "Minimal hardware",
        heading: "Minimal Sliding Doors – The Case for Minimal Hardware",
        level: 3,
        body: [
          "A lot of \"minimal\" marketing is just paint on the same old frame. Genuine minimal sliding doors reduce hardware at the design stage, concealed handles, flush-mounted locks, hidden rollers, rather than hiding bulk behind trim.",
          "It's a different manufacturing approach, not a finishing touch, and it shows up most clearly in how the door looks when it's fully open and the panels are stacked. Buyers chasing slim sliding doors often assume narrow sightlines automatically mean minimal hardware too, they don't; the two are separate design decisions that happen to overlap a lot.",
        ],
        points: [
          "Concealed multi-point locking keeps the frame face clean when closed.",
          "Flush handle options sit level with the frame rather than protruding.",
          "Fewer visible fixings means fewer places for dust and salt air to collect.",
        ],
      },
    ],

    afterCompare: [
      {
        id: "profile-selection",
        eyebrow: "Profile selection",
        heading: "Inside the Cortizo Range",
        level: 3,
        body: [
          "Not all \"Cortizo\" doors on the market are the same series, and the differences matter. Our Cortizo sliding doors span the Cor Vision 4600 through to the flagship 4700, each built on different chamber depths and thermal break widths.",
          "Buyers sometimes assume any Cortizo badge means the same performance, it doesn't, and the spec sheet is where that gets sorted out. Ask a handful of aluminium sliding door suppliers in Dubai which series they're actually quoting and you'll get surprisingly different answers.",
        ],
        points: [
          "4600 series suits mid-size residential openings with strong thermal performance.",
          "The 4700 series is built for larger villa openings and heavier panel weights.",
          "Genuine Cortizo profiles carry factory certification, unlike re-badged extrusions.",
        ],
        tone: "muted",
      },
      {
        id: "material-strength",
        eyebrow: "Material strength",
        heading: "Ultra Slim Doesn't Mean Fragile",
        level: 3,
        body: [
          "There's a reasonable worry that ultra slim sliding doors trade strength for looks. In practice, the opposite is usually true, the alloys used in high-end slim systems are graded specifically to carry more load through less material, using 6063-T6 structural tempers with reinforced internal chambers.",
          "The trade-off isn't strength, it's cost: tighter manufacturing tolerances and precision extrusion push the price above standard sliding frames. That's a big part of why Cortizo sliding doors at the top of the range cost noticeably more than their mid-tier siblings, and it's a fair trade if the opening genuinely calls for it.",
        ],
        points: [
          "High-grade alloy chambers replace bulk with engineered rigidity.",
          "Reinforced steel inserts sit inside the aluminium where loads concentrate.",
          "Tighter manufacturing tolerances are the real reason slim systems cost more.",
        ],
      },
      {
        id: "large-format-glazing",
        eyebrow: "Large format glazing",
        heading: "Sizing Up: When You Need Large Format Glass",
        level: 4,
        body: [
          "Some openings just don't suit a standard two- or three-panel layout. For rear elevations wider than eight metres, large sliding glass doors with fewer, bigger panels usually look better and let in more light than splitting the same run into narrow sections.",
          "The trade-off is weight, bigger panels need heavier-duty rollers and, often, a motorised assist for daily use. Architects chasing a single unbroken scene tend to land here anyway, since panoramic sliding doors and large-format layouts are usually the same conversation by a different name.",
        ],
        points: [
          "Fewer, larger panels reduce the number of visible frame joints.",
          "Panel weights above 300kg typically call for motorised or lift-assist tracks.",
          "Wider spans need a structural engineer to confirm lintel capacity beforehand.",
        ],
        tone: "muted",
      },
      {
        id: "supplier-due-diligence",
        eyebrow: "Supplier due diligence",
        heading: "What to Ask Before Choosing a Supplier",
        level: 4,
        body: [
          "The UAE market has no shortage of companies claiming Cortizo or Vetro partnerships, but not all of them are authorised to sell factory-warrantied stock.",
          "When comparing aluminium sliding door suppliers across Dubai, Sharjah, or Abu Dhabi, ask for the actual distributor certificate, not just a logo on the website, grey-market profiles look identical until the warranty claim gets rejected two years in. This gets more important, not less, once budgets stretch to premium sliding doors UAE villas typically specify for statement rear elevations.",
        ],
        points: [
          "Ask to see written proof of authorised distributor status, not just branding.",
          "Confirm whether warranty coverage is backed by the manufacturer or just the installer.",
          "Request an on-site survey before any quote, measurements on paper aren't reliable.",
        ],
      },
    ],

    afterWorksWellWith: [
      {
        id: "climate-engineering",
        eyebrow: "Climate engineering",
        heading: "Built for the Climate, Not Just the Look",
        level: 4,
        body: [
          "A door spec'd for a European showroom doesn't automatically hold up here. Sliding doors UAE buyers choose need thermal breaks wide enough for sustained 45–50°C exterior temperatures, gaskets rated for fine airborne desert sand, and glass coatings that cut solar gain without darkening the room.",
          "Skipping any one of these shows up within a year as sticking tracks or a spike in AC running costs, and the bigger the installation, the more expensive that mistake gets, particularly on a full run of large sliding glass doors.",
        ],
        points: [
          "Thermal break width should be matched to Gulf summer temperatures, not European averages.",
          "Dust-rated gaskets stop fine sand ingress that jams standard seals over time.",
          "Solar-control coatings reduce glare and heat without visibly tinting the glass.",
        ],
        tone: "muted",
      },
      {
        id: "glass-specifications",
        eyebrow: "Glass specifications",
        heading: "Glass Build-Ups Explained",
        level: 4,
        body: [
          "The frame gets most of the attention, but the glass make-up does most of the thermal and acoustic work. Aluminium sliding glass doors are only as good as what's sealed inside them, double or triple units, Low-E coatings, and acoustic interlayers all change performance in ways that aren't visible once installed.",
          "It's worth asking for the exact glass spec, not just \"double glazed.\" A US-based consultant reviewing the same project might spec it as aluminium sliding glass doors in their notes, different spelling, identical requirements.",
        ],
        points: [
          "Low-E coatings reflect solar heat while keeping the glass visually clear.",
          "Acoustic interlayers cut traffic and neighborhood noise more than glass thickness alone.",
          "Triple glazing adds cost and weight, usually only justified on high-noise plots.",
        ],
      },
      {
        id: "panoramic-visions",
        eyebrow: "Panoramic visions",
        heading: "Framing the View, Not Blocking It",
        level: 5,
        body: [
          "There's a specific reason architects push for wide, unbroken glass runs on garden-facing elevations: the goal is a single uninterrupted scene, not a series of framed rectangles.",
          "Panoramic sliding doors achieve this by minimising the number of vertical interlocks across the run, sometimes using pocket systems where panels disappear entirely into the side wall when open. Pair that with floor to ceiling sliding doors and there's no horizontal break in the view either, just glass, floor to sky.",
        ],
        points: [
          "Pocket-slide configurations let panels vanish into the wall cavity when open.",
          "Fewer interlocks across a run means a cleaner, wider sightline outward.",
          "Best suited to elevations with a genuine view worth preserving unobstructed.",
        ],
        tone: "muted",
      },
      {
        id: "system-mechanics",
        eyebrow: "System mechanics",
        heading: "Lift-and-Slide vs Standard Sliding: The Practical Difference",
        level: 5,
        body: [
          "Lift-and-slide systems physically raise the panel off its seal before it moves, then lower it back down to compress against the frame when closed, that's why they seal better than a standard slider, which just drags along a fixed gasket.",
          "Most aluminium sliding glass doors sold as premium systems use some version of this mechanism now, and it's usually what decides whether a large panoramic sliding doors installation still operates smoothly at ten years old.",
        ],
        points: [
          "Lift mechanism reduces wear on gaskets compared to constant-drag standard sliders.",
          "Better compression seal means improved weather resistance in exposed elevations.",
          "Handle action is heavier, worth testing in a showroom before committing.",
        ],
      },
      {
        id: "hardware-and-tracks",
        eyebrow: "Hardware & tracks",
        heading: "Rollers and Tracks: The Part Nobody Sees",
        level: 5,
        body: [
          "Everything about how a sliding door feels five years from now comes down to the rollers, not the glass. Stainless steel ball-bearing rollers rated well above the actual panel weight give headroom against wear, sand ingress, and the slight settling that happens in most new-build villas.",
          "Under-rated rollers are the single most common complaint we hear from sliding doors UAE homeowners, and no amount of frame quality fixes a roller that's simply too light for the panel.",
        ],
        points: [
          "Roller load rating should sit comfortably above actual panel weight, not match it exactly.",
          "Stainless steel resists the corrosion risk from coastal humidity better than mild steel.",
          "Track cleaning twice a year prevents most of the sticking complaints we see.",
        ],
        tone: "muted",
      },
      {
        id: "perimeter-protection",
        eyebrow: "Perimeter protection",
        heading: "Security Beyond the Glass",
        level: 5,
        body: [
          "Glass strength gets the headlines, but the locking hardware decides whether a break-in attempt actually gets anywhere.",
          "Multi-point shootbolts anchored into both top and bottom tracks, combined with anti-lift blocks that stop a panel being jimmied off its rail, are what separates a genuinely secure system from one that just looks heavy-duty.",
        ],
        points: [
          "Anti-lift track blocks stop panels being levered upward off the rail.",
          "Multi-point locking distributes force across several anchor points, not just the handle.",
          "Laminated glass options add a physical barrier beyond the lock itself.",
        ],
      },
      {
        id: "before-you-finalise-drawings",
        eyebrow: "Before you finalise drawings",
        heading: "A Quick Technical Check Saves Rework Later",
        level: 5,
        body: [
          "On most villa jobs, the door itself is rarely the problem, the opening around it is. Lintel height, floor build-up, and drainage falls all need confirming before an order goes in, because a system built for a slab-level threshold won't retrofit cleanly into a raised one.",
          "A proper site survey catches this before it becomes a costly change order.",
        ],
        points: [
          "Confirm floor finish level before ordering, thresholds are rarely adjustable after fabrication.",
          "Lintel height must clear the head track plus any curtain box allowance.",
          "Drainage falls need checking on ground-floor openings facing exposed gardens.",
        ],
        tone: "muted",
      },
      {
        id: "warranty-and-aftercare",
        eyebrow: "Warranty & aftercare",
        heading: "After Installation: Warranty and Support",
        level: 6,
        body: [
          "A door system is only as good as the backup behind it once it's installed. Genuine factory warranties on frames and hardware typically run five to ten years, but that's void the moment non-authorised parts get used in a repair.",
          "Keeping the original spec sheet on file makes future servicing, or a future extension to the same run, far more straightforward.",
        ],
        points: [
          "Factory warranties are voided by non-authorised replacement parts or hardware.",
          "Keep the original specification sheet for any future servicing or matching work.",
          "Annual roller and track servicing extends functional life well beyond the warranty period.",
        ],
      },
    ],

    afterFaq: [
      {
        id: "why-swiftrooms",
        eyebrow: "Why Swiftrooms",
        heading: "Slim Sliding Systems Specified for Gulf Climates, Not Generic Imports",
        level: 6,
        body: [
          "We’ve supplied, engineered, and installed sliding doors across thousands of projects in Dubai villas, Abu Dhabi coastal estates, and Sharjah developments over the last 14 years.",
          "We know which stainless steel roller bearings, polyamide thermal breaks, and sub-sill drainage tracks actually survive 50°C summer heat and fine desert sand. As an authorised partner for Cortizo, VetroSlide, and Gulf Extrusions, we supply genuine European and local systems directly from certified profile stock.",
        ],
        points: [
          "Authorised partner for Cortizo, VetroSlide, Vetromax, and Gulf Extrusions systems",
          "High-grade thermal-break profiles specified and tested for extreme Gulf heat",
          "Precision options ranging from manual whisper-quiet operation to fully motorized systems",
          "Free on-site survey, threshold-leveling assessment, and written technical spec within 24 hours",
          "Dedicated in-house technical support for architects, consultants, and contractors",
        ],
        tone: "muted",
      },
    ],
  },
};

/** Editorial for a category, or an empty set when it has none. */
export function editorialFor(slug: string): CategoryEditorial {
  return categoryEditorial[slug] ?? {};
}
