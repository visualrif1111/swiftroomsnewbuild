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
  "aluminium-bi-folding-doors": "Aluminium Bi-Fold Doors",
  "aluminium-doors": "Aluminium Doors Dubai",
  "upvc": "UPVC Doors & Windows in Dubai",
  "garden-rooms": "Garden Rooms Dubai",
};

/** H1 for a category page. */
export function categoryHeading(slug: string, fallback: string): string {
  return CATEGORY_HEADINGS[slug] ?? fallback;
}

export const categoryEditorial: Record<string, CategoryEditorial> = {
  "aluminium-bi-folding-doors": {
    beforeProducts: [
      {
        id: "aluminium-folding-doors-redefining-living-spaces-with-a",
        eyebrow: "Modern home extensions",
        heading: "Aluminium Folding Doors – Redefining Living Spaces with Architectural Glazing",
        level: 2,
        body: [
          "Tearing down a solid brick back wall alters how a house functions daily. Retrofitting high-grade aluminium doors converts rigid kitchen and lounge layouts into expansive, flexible zones that open directly onto rear decking or garden patios.",
          "Rather than feeling boxed inside during cooler winter months, UAE homeowners get uninterrupted garden views and direct outdoor access with a simple push of the lead panel.",
        ],
        points: [
          "Track sets fold panels back against side walls to clear 90% of the structural gap.",
          "Narrow 73mm aluminium sightlines maximize glass area when closed.",
          "Engineered frame extrusions support heavy double glass units without sagging over time.",
        ],
      },
    ],

    afterCompare: [
      {
        id: "precision-alloy-frames-and-heavy-duty-hardware",
        eyebrow: "Cortizo system engineering",
        heading: "Precision Alloy Frames and Heavy-Duty Hardware",
        level: 2,
        body: [
          "Smooth door movement depends entirely on metal thickness and roller bearing quality. Our range of aluminium bi fold doors uses genuine Cortizo profiles, extruded from tough 6063-T6 alloy, paired with bottom-hung stainless steel rollers that hold strict structural tolerances.",
          "Proper European extrusion geometry prevents frame twist, keeping multi-panel setups gliding easily year after year.",
        ],
        points: [
          "Extruded alloy wall thicknesses hit up to 1.8mm for high wind resistance.",
          "Hardened steel hinges keep heavy glass panels aligned through thousands of cycles.",
          "Sealed stainless roller bearings run inside reinforced track channels without jumping.",
        ],
        tone: "muted",
      },
      {
        id: "aluminium-bi-fold-doors-harnessing-natural-light-for-br",
        eyebrow: "Daylight maximisation",
        heading: "Aluminium Bi Fold Doors – Harnessing Natural Light For Brighter Interior Living",
        level: 3,
        body: [
          "Dim interiors make compact floor plans feel cramped and uninviting. Swapping heavy timber frames or masonry walls for floor-to-ceiling glass draws bright sunlight deep into central living zones throughout the day.",
          "Maximizing the glass surface area boosts internal light levels significantly without risking frame instability or compromising perimeter security.",
        ],
        points: [
          "Slim mullions mean less visible frame and bigger overall glass panes.",
          "Maximum light penetration cuts daytime electric lighting needs.",
          "High-transmittance double glazing brightens dark rooms naturally.",
        ],
      },
      {
        id: "thermal-break-technology-prevents-energy-loss",
        eyebrow: "Climate and insulation",
        heading: "Thermal Break Technology Prevents Energy Loss",
        level: 3,
        body: [
          "Large glass spans become major heat sources if the metal frames aren't isolated properly. Modern door profiles feature thick polyamide thermal breaks that physically separate the outer aluminium casing from the inner frame, stopping heat transfer before it reaches your living space.",
          "Pairing thermal frame barriers with solar-control glass keeps indoor temperatures stable, even when summer heat hits 50°C outside.",
        ],
        points: [
          "24mm to 34mm polyamide strips stop thermal conduction through metal profiles.",
          "Low-E coated double or triple glass blocks direct solar radiation.",
          "Lower heat transfer reduces indoor AC loads and keeps electricity bills manageable.",
        ],
        tone: "muted",
      },
      {
        id: "level-transitions-with-flush-bottom-tracks",
        eyebrow: "Threshold design",
        heading: "Level Transitions with Flush Bottom Tracks",
        level: 3,
        body: [
          "Standard door thresholds create awkward step-overs that trip up family members and visually break interior spaces from exterior patios. Mounting aluminium bi fold doors on recessed tracks sinks the bottom frame flush with finished floor tiles.",
          "Aligning indoor floor levels with outdoor paving creates one continuous surface that feels balanced underfoot while managing water drainage.",
        ],
        points: [
          "Sunken tracks remove step-over risks between kitchen and patio zones.",
          "Integrated sub-sill drainage tracks channel heavy rainwater away from interior floors.",
          "Level floor transitions allow easy stroller, wheelchair, and foot traffic.",
        ],
      },
      {
        id: "custom-panel-configurations-to-fit-your-floor-plan",
        eyebrow: "Flexible layout planning",
        heading: "Custom Panel Configurations to Fit Your Floor Plan",
        level: 4,
        body: [
          "Every residential project presents different structural opening sizes and internal furniture layouts. Custom-built aluminium folding doors configure from 2 to 13 panels, folding inward, outward, or splitting down the center to match your exact room dimensions.",
          "Tailored panel arrangements ensure parked door leaves stay out of walking paths without blocking garden seating or indoor furniture layouts.",
        ],
        points: [
          "Flexible configurations fit structural openings from 1.5 meters up to 12 meters wide.",
          "Panels stack neatly to the left, right, or divide across both sides.",
          "Outward-folding options preserve internal floor space and furniture clearance.",
        ],
        tone: "muted",
      },
      {
        id: "integrated-traffic-doors-for-quick-garden-entry",
        eyebrow: "Convenient daily access",
        heading: "Integrated Traffic Doors for Quick Garden Entry",
        level: 4,
        body: [
          "Unlocking an entire multi-panel door run just to let a pet outside or grab something from the garden is inefficient. Adding a primary traffic door gives you standard hinged entry right inside the main folding track mechanism.",
          "This practical feature gives household members quick access for daily errands while keeping the rest of the folding wall locked securely in place.",
        ],
        points: [
          "Primary master leaf operates via standard latch and lever handle.",
          "Quick entry and exit without unlatching main panel shootbolts.",
          "Main folding panels stay locked, keeping conditioned AC air inside.",
        ],
      },
      {
        id: "multi-point-shootbolt-locks-ensure-total-peace-of-mind",
        eyebrow: "Advanced perimeter protection",
        heading: "Multi-Point Shootbolt Locks Ensure Total Peace of Mind",
        level: 4,
        body: [
          "Expansive rear glass openings require heavy-duty locking systems to prevent forced entry. Modern folding setups feature hardened steel shootbolts that extend deep into both top and bottom tracks when you lift the main handle.",
          "Combined with toughened or laminated glass units, these physical locking components provide real security for ground-floor living spaces.",
        ],
        points: [
          "Heavy steel shootbolts lock panels firmly into top and bottom guide tracks.",
          "Anti-lift track blocks prevent panels from being levered off the frame from outside.",
          "Anti-snap, anti-drill key cylinders stop physical lock manipulation attacks.",
        ],
        tone: "muted",
      },
      {
        id: "high-performance-gaskets-resist-extreme-wind-and-heavy",
        eyebrow: "Weather sealing integrity",
        heading: "High-Performance Gaskets Resist Extreme Wind and Heavy Rain",
        level: 4,
        body: [
          "Exposed patio doors facing open gardens must hold up against driving rain and heavy wind pressure. High-density EPDM rubber gaskets run around every panel edge and frame joint, compressing tight under lock pressure.",
          "These durable rubber seals compress evenly when handles latch, keeping indoor living spaces dry, dust-free, and quiet during unexpected weather shifts.",
        ],
        points: [
          "Class 4 air permeability gaskets stop fine desert dust and wind drafts.",
          "E900 rated water tightness prevents rain penetration during heavy storms.",
          "Certified structural frames resist severe wind loads up to 2000 Pa.",
        ],
      },
      {
        id: "tailored-finishes-with-durable-powder-coated-colors",
        eyebrow: "Architectural coatings",
        heading: "Tailored Finishes with Durable Powder-Coated Colors",
        level: 5,
        body: [
          "Exterior metal finishes need to suit your property's style while standing up to intense sun exposure and humidity. Our range of aluminium bi fold doors comes with Qualicoat-certified powder coatings available in over 300 RAL shades.",
          "Thermally baked powder coatings bond directly with the underlying alloy, ensuring frame surfaces stay clean and scratch-free without needing periodic repainting.",
        ],
        points: [
          "Marine-grade powder coats resist UV fading, chalking, and coastal air corrosion.",
          "Dual-color frames let you match dark outdoor profiles with lighter interior trim.",
          "Anodized and wood-grain metallic options offer distinct architectural finishes.",
        ],
        tone: "muted",
      },
      {
        id: "high-acoustic-insulation-blocks-urban-sound",
        eyebrow: "Noise reduction properties",
        heading: "High Acoustic Insulation Blocks Urban Sound",
        level: 5,
        body: [
          "Busy street traffic, loud neighbors, and local construction ruin quiet home environments. Specifying acoustic double-glazed units within heavy metal frames forms a solid barrier against unwanted exterior sound transmission.",
          "Closing the doors cuts exterior noise levels by up to 42 dB, keeping your indoor lounge quiet regardless of outdoor activity.",
        ],
        points: [
          "Asymmetric glass pane thicknesses disrupt low-frequency traffic noise waves.",
          "Acoustic PVB interlayers absorb high-pitch sound vibrations effectively.",
          "Tight perimeter gasket seals close off tiny air gaps where sound travels.",
        ],
      },
      {
        id: "why-structural-alloy-outperforms-upvc-and-timber-frames",
        eyebrow: "Material comparison",
        heading: "Why Structural Alloy Outperforms UPVC and Timber Frames",
        level: 5,
        body: [
          "Choosing the right frame material determines how often your doors need repairs or adjustments. Selecting aluminium folding doors over UPVC or wood delivers massive structural advantages, particularly in environments with severe temperature shifts.",
          "Unlike wood that absorbs moisture or UPVC that softens under direct sun, structural alloy holds its exact shape, keeping your panels sliding smoothly across seasons.",
        ],
        points: [
          "High metal strength allows ultra-thin frame profiles with massive glass areas.",
          "Zero frame twisting, expanding, or bowing under 50°C summer heat.",
          "Low maintenance needs compared to timber that requires sanding and varnish.",
        ],
        tone: "muted",
      },
    ],

    afterWorksWellWith: [
      {
        id: "adaptable-glazing-for-residential-and-commercial-buildi",
        eyebrow: "Versatile applications",
        heading: "Adaptable Glazing for Residential and Commercial Buildings",
        level: 5,
        body: [
          "Large folding glass walls suit far more than residential kitchen extensions. Their modular design fits luxury villa rear patios, restaurant dining terraces, and internal office conference rooms equally well.",
          "Whether you are remodeling a home lounge or upgrading a commercial shopfront, folding frames adapt easily to your specific layout requirements.",
        ],
        points: [
          "Residential patio doors create flexible indoor-outdoor hosting spaces.",
          "Restaurant fronts open wide to encourage walk-in street traffic.",
          "Internal room partitions split wide office floors into private meeting spaces.",
        ],
      },
      {
        id: "essential-care-guidelines-keep-systems-gliding-smoothly",
        eyebrow: "Simple maintenance routines",
        heading: "Essential Care Guidelines Keep Systems Gliding Smoothly",
        level: 5,
        body: [
          "No one wants high-maintenance building fixtures that require constant attention. Taking care of your aluminium bi fold doors takes just a few basic maintenance steps each year to preserve track bearings and frame finishes.",
          "Keeping track grooves clear of debris stops roller bearing wear, ensuring your door panels slide effortlessly with a light touch for years.",
        ],
        points: [
          "Vacuum bottom track channels monthly to clear out sand, grit, and dirt.",
          "Wash powder-coated alloy frames with mild soapy water and a soft cloth.",
          "Apply light silicone spray to stainless steel roller bearings once a year.",
        ],
        tone: "muted",
      },
      {
        id: "heavy-duty-load-ratings-support-large-glass-spans",
        eyebrow: "Structural capacity",
        heading: "Heavy-Duty Load Ratings Support Large Glass Spans",
        level: 6,
        body: [
          "Carrying heavy double or triple glass units requires serious bottom-roller engineering. Our stainless roller assemblies distribute glass weight evenly along the lower track, preventing panels from dragging or sticking.",
          "Robust roller engineering lets you install tall glass panels with total confidence that the door mechanism will operate smoothly without binding.",
        ],
        points: [
          "Heavy-duty trolley rollers carry individual panel weights up to 120 kg.",
          "Tall frame options handle structural wall openings up to 3000 mm high.",
          "Individual panel widths expand up to 1200 mm per leaf for wider views.",
        ],
      },
      {
        id: "long-term-market-appeal-for-renovations-and-builds",
        eyebrow: "Property value elevation",
        heading: "Long-Term Market Appeal for Renovations and Builds",
        level: 6,
        body: [
          "Upgrading key architectural elements improves daily living quality while raising your property's resale appeal. Installing high-grade folding glass walls modernizes older home layouts, creating an attractive feature buyers look for.",
          "Replacing a solid rear wall with an open glass layout creates instant visual impact, adding real financial value to your real estate investment.",
        ],
        points: [
          "Clean modern lines elevate your home's exterior curb appeal instantly.",
          "Open-plan garden connections rank high among desirable house features.",
          "Energy-efficient thermal frames reassure buyers on long-term running costs.",
        ],
        tone: "muted",
      },
    ],

    afterFaq: [
      {
        id: "bifold-systems-specified-for-gulf-climates-not-generic",
        eyebrow: "Why swiftrooms",
        heading: "Bifold Systems Specified for Gulf Climates, Not Generic Imports",
        level: 6,
        body: [
          "We've supplied and installed aluminium folding doors across enough Dubai villas, Abu Dhabi coastal properties, and Sharjah developments to know which roller tracks, thermal breaks, and powder coats actually survive intense summer heat and sandstorms.",
          "As an authorised partner for Cortizo, Vetro, and Gulf Extrusions, we supply heavy systems built from genuine factory stock, backed by real warranties.",
        ],
        points: [
          "Authorised partner for Cortizo, Vetro, Vetromax, and Gulf Extrusions systems.",
          "High-grade thermal-break profiles built specifically for extreme Gulf heat.",
          "Free site survey, track-leveling checks, and written specs within 24 hours.",
          "Direct technical support for architects, contractors, and project managers.",
        ],
      },
    ],
  },

  "aluminium-doors": {
    beforeProducts: [
      {
        id: "aluminium-doors-dubai-built-for-the-gulf-climate",
        eyebrow: "The climate problem",
        heading: "Aluminium Doors Dubai – Built For The Gulf Climate",
        level: 2,
        body: [
          "Dubai summers push surface temperatures on dark-framed doors well past 60°C, and that heat has to go somewhere, usually into the room behind it if the frame isn't engineered correctly.",
          "Aluminium doors in Dubai are specified with thermal break profiles for exactly this reason, separating the interior and exterior metal sections so heat transfer slows down. Homeowners in Arabian Ranches, Emirates Hills and along the Dubai coastline are increasingly asking for this spec by name rather than leaving it to chance.",
        ],
        points: [
          "Reduces heat transfer through the frame, not just the glass",
          "Cuts down on condensation around the door edge in cooler months",
          "Keeps interior surface temperatures more comfortable to the touch",
          "Works alongside double or triple glazing for compounded benefit",
        ],
        tone: "muted",
      },
    ],

    afterCompare: [
      {
        id: "residential-projects-across-the-emirates",
        eyebrow: "Regional projects",
        heading: "Residential Projects Across the Emirates",
        level: 2,
        body: [
          "Villa developers and independent homeowners approach door specification differently, and that shows in the projects we see. Aluminium doors in UAE villas tend to favour pivot or panelled front entrances with a strong street presence, while apartment towers lean toward slim-sightline casement or sliding systems that suit smaller floor plates.",
          "Both categories share one requirement: hardware that survives coastal humidity without seizing up after a year or two.",
        ],
        points: [
          "Villa entrances: pivot doors, oversized panels, statement hardware",
          "Apartments and townhouses: casement and sliding systems with slim frames",
          "Renovation projects: frame replacement without disturbing existing structural openings",
          "Boutique developments: matched door and window systems for a unified facade",
        ],
      },
      {
        id: "aluminium-doors-in-uae-commercial-and-hospitality-appli",
        eyebrow: "Commercial projects",
        heading: "Aluminium Doors In UAE – Commercial And Hospitality Applications",
        level: 3,
        body: [
          "Retail units, boutique hotels and office lobbies in Dubai place different demands on a door than a private residence does, daily footfall, ADA-style accessibility, and hardware rated for thousands of open-close cycles a year.",
          "Aluminium doors in Dubai's commercial sector are usually specified with heavier-duty closers and higher cycle-rated hinges than residential equivalents, plus finishes that hold their colour under constant sun exposure on west-facing shop fronts.",
        ],
        points: [
          "Higher cycle-rated hardware for frequent daily use",
          "Options for automatic or semi-automatic opening",
          "Fire-rated configurations available for compliant commercial entrances",
          "Powder coat finishes selected for UV stability on exposed elevations",
        ],
        tone: "muted",
      },
    ],

    afterWorksWellWith: [
      {
        id: "reading-a-door-s-technical-spec-sheet",
        eyebrow: "Spec sheets",
        heading: "Reading a Door's Technical Spec Sheet",
        level: 3,
        body: [
          "Most enquiries we get start with a photo and a rough size, which is a fine starting point, but the spec sheet is where the real decisions happen. Profile depth, U-value, and locking configuration tell you more about how a door will actually perform than the render does.",
          "Anyone comparing aluminium doors in UAE suppliers should ask for these three figures before comparing price, since a cheaper door with a shallower profile rarely performs the same over a five-year period.",
        ],
        points: [
          "Profile depth: deeper generally means better thermal and structural performance",
          "U-value: lower figures indicate better insulation",
          "Locking points: three-point minimum recommended for external doors",
          "Wind load rating: relevant for higher floors and exposed sites",
        ],
      },
      {
        id: "finishes-colours-and-hardware-choices",
        eyebrow: "Finishes",
        heading: "Finishes, Colours and Hardware Choices",
        level: 4,
        body: [
          "A door is rarely chosen in isolation, it usually needs to sit alongside existing window frames, cladding, or a client's interior palette. RAL powder coating gives near-unlimited colour matching, while anodised finishes suit a more industrial or minimalist look.",
          "Handle styles range from discrete flush pulls on pivot doors to statement bar handles on full-height glazed entrances.",
        ],
        points: [
          "RAL colour matching for bespoke facade coordination",
          "Anodised and dual-tone finish options",
          "Handle styles from flush pull to full-length bar handle",
          "Matching options across doors, windows and curtain wall on the same project",
        ],
        tone: "muted",
      },
      {
        id: "security-standards-worth-knowing",
        eyebrow: "Security standards",
        heading: "Security Standards Worth Knowing",
        level: 4,
        body: [
          "Security is one of the more overlooked parts of a door brief until something goes wrong. RC2 burglar-resistant ratings, multi-point locking and laminated glazing all play a role, but they need to be specified together rather than picked individually.",
          "A door frame rated RC2 with standard float glass isn't actually RC2 anymore, the glazing has to match the frame's rating for the certification to hold.",
        ],
        points: [
          "RC2 rating requires matched frame, glass and locking hardware",
          "Multi-point locking reduces reliance on a single lock point",
          "Laminated or toughened glazing recommended for ground-floor entrances",
          "Smart lock and biometric hardware compatible with most modern profiles",
        ],
      },
      {
        id: "maintenance-in-a-coastal-dusty-climate",
        eyebrow: "Upkeep",
        heading: "Maintenance in a Coastal, Dusty Climate",
        level: 4,
        body: [
          "Salt air near the coast and fine dust further inland both take a toll on hardware over time, even on good-quality aluminium doors.",
          "UAE humidity swings between a dry winter and a humid summer, and that cycle is harder on seals and gaskets than steady heat alone would be. A short maintenance routine two or three times a year keeps most issues from ever becoming a service call.",
        ],
        points: [
          "Wipe tracks and hinges clear of dust monthly in high-traffic entrances",
          "Lubricate locking mechanisms twice a year",
          "Check gaskets and weather seals before and after summer",
          "Avoid abrasive cleaners on anodised or powder-coated finishes",
        ],
        tone: "muted",
      },
      {
        id: "aluminium-vs-upvc-vs-timber",
        eyebrow: "Frame material",
        heading: "Aluminium vs uPVC vs Timber",
        level: 4,
        body: [
          "Clients weighing up frame material usually land on aluminium for a specific reason rather than following trends.",
          "Aluminium doors in Dubai projects tend to win out where slim sightlines, larger panel sizes or heavier daily use are involved, uPVC still has its place on budget-conscious residential jobs, and timber remains a niche choice for heritage-style properties where the maintenance trade-off is accepted upfront.",
        ],
        points: [
          "Aluminium: slimmer frames, higher load capacity, longer lifespan in this climate",
          "uPVC: lower upfront cost, good insulation, less suited to very large panels",
          "Timber: strong aesthetic appeal, higher maintenance demand in UAE conditions",
          "Mixed-material builds are common, aluminium doors with uPVC secondary windows",
        ],
      },
      {
        id: "what-drives-the-cost-of-a-door",
        eyebrow: "Pricing",
        heading: "What Drives the Cost of a Door",
        level: 5,
        body: [
          "Two doors that look identical in a brochure photo can sit far apart on price once profile depth, glazing spec and hardware grade are factored in. Sizing plays a role too, oversized pivot doors and anything requiring structural steel reinforcement will always cost more than a standard-width casement door.",
          "Getting a written, itemised quote rather than a single lump figure makes it much easier to compare suppliers of aluminium doors in UAE fairly.",
        ],
        points: [
          "Profile system and thermal break specification",
          "Glass type, single, double or laminated/toughened combinations",
          "Size and any structural reinforcement required",
          "Hardware grade and finish (standard vs RAL custom colour)",
        ],
        tone: "muted",
      },
      {
        id: "from-site-survey-to-installation",
        eyebrow: "From survey to fit",
        heading: "From Site Survey to Installation",
        level: 5,
        body: [
          "A rushed measurement is one of the most common causes of on-site delays, so most reputable suppliers insist on a physical survey before manufacturing begins, even when architectural drawings already exist.",
          "Lead times for standard profiles typically run several weeks; bespoke pivot doors or oversized openings take longer given the additional engineering involved.",
        ],
        points: [
          "Site survey confirms exact opening dimensions and structural condition",
          "Shop drawings issued for client sign-off before manufacturing starts",
          "Manufacturing lead time varies by profile and finish complexity",
          "Installation typically completed within a day for standard-sized openings",
        ],
      },
      {
        id: "energy-efficiency-and-dewa-considerations",
        eyebrow: "Energy efficiency",
        heading: "Energy Efficiency and DEWA Considerations",
        level: 5,
        body: [
          "Cooling accounts for a large share of household electricity use in the UAE, and doors with poor thermal performance quietly add to that load every single day, not just during peak summer months.",
          "A well-specified thermally broken door, paired with the right glazing, can measurably reduce heat gain around entrances compared to older single-glazed aluminium systems still common in older Dubai properties.",
        ],
        points: [
          "Thermal break profiles reduce heat gain around door openings",
          "Double glazing compounds the insulation benefit of the frame",
          "Lower cooling load can translate to reduced DEWA consumption over time",
          "Relevant for both new-build specification and retrofit projects",
        ],
        tone: "muted",
      },
      {
        id: "design-trends-shaping-2026-entrances",
        eyebrow: "2026 trends",
        heading: "Design Trends Shaping 2026 Entrances",
        level: 5,
        body: [
          "Slim-sightline profiles and full-height glazed panels continue to dominate new villa briefs, replacing the heavier, more segmented door designs common a decade ago.",
          "Dual-tone finishes, a darker exterior colour paired with a lighter interior frame, are also gaining traction among Dubai's design-forward homeowners, alongside a steady move toward matte and textured powder coat finishes over high-gloss options.",
        ],
        points: [
          "Slim sightlines and larger uninterrupted glass panels",
          "Dual-tone (different interior/exterior colour) finishes",
          "Matte and textured powder coats replacing high-gloss finishes",
          "Integrated smart locks specified at design stage rather than retrofitted",
        ],
      },
      {
        id: "getting-the-right-advice-before-you-buy",
        eyebrow: "Before you finalise drawings",
        heading: "Getting the Right Advice Before You Buy",
        level: 5,
        body: [
          "Every project brief is different, and the right door for a beachfront villa in Palm Jumeirah isn't necessarily right for a mid-rise apartment in Business Bay.",
          "A short conversation with a technical team before finalising drawings often catches sizing, ventilation or compliance issues that are far cheaper to fix on paper than after manufacturing. It's a habit worth building into any project involving aluminium doors in UAE, regardless of scale.",
        ],
        points: [
          "Free technical consultations available before final drawings are locked in",
          "Site-specific recommendations based on orientation, exposure and building height",
          "Guidance on matching doors with existing or planned window systems",
          "Support available for both single-door replacements and full development rollouts",
        ],
        tone: "muted",
      },
    ],

    afterFaq: [
      {
        id: "working-with-an-established-supplier",
        eyebrow: "Why swiftrooms",
        heading: "Working with an Established Supplier",
        level: 6,
        body: [
          "Sourcing aluminium doors in Dubai from a supplier with an established track record matters more than it might seem at the enquiry stage.",
          "Brand partnerships with manufacturers like Cortizo, Vetromax and Gulf Extrusions mean access to genuine profile systems, factory-backed warranties and spare parts availability years down the line, something that's harder to guarantee with unbranded or grey-market alternatives.",
        ],
        points: [
          "Genuine profile systems from recognised manufacturers",
          "Factory-backed warranty coverage on hardware and finish",
          "Spare parts and hardware availability after installation",
          "Local technical support for servicing and adjustments",
        ],
      },
    ],
  },

  "upvc": {
    beforeProducts: [
      {
        id: "upvc-doors-dubai-what-low-maintenance-actually-means-da",
        eyebrow: "Low maintenance reality",
        heading: "uPVC Doors Dubai – What \"Low Maintenance\" Actually Means Day to Day",
        level: 2,
        body: [
          "Unlike painted timber, uPVC doesn't need sanding, repainting, or sealant touch-ups, a wipe with mild soapy water a few times a year keeps the frame looking new.",
          "This is one of the clearest practical advantages of uPVC doors in Dubai villas and apartments, where dust accumulation is constant and most owners don't want a recurring maintenance schedule for their window frames.",
        ],
        points: [
          "No repainting or resealing required across the frame's working life",
          "Occasional soapy water wipe-down handles dust and light surface grime",
          "Hardware (hinges, locks) still needs light annual lubrication regardless of frame material",
        ],
        tone: "muted",
      },
      {
        id: "how-much-difference-does-upvc-actually-make",
        eyebrow: "Thermal performance",
        heading: "How Much Difference Does uPVC Actually Make?",
        level: 2,
        body: [
          "Frame material conducts heat far more slowly through plastic than through metal, which is the core reason uPVC windows UAE homeowners choose it perform noticeably better on U-values than a comparable aluminium frame without a thermal break.",
          "The gap narrows once you compare against thermally-broken aluminium, but against standard aluminium sections the difference in indoor surface temperature is easy to feel by hand on a summer afternoon.",
        ],
        points: [
          "U-values on quality 5-chamber uPVC typically beat non-thermal-break aluminium significantly",
          "Frame surface stays cooler to the touch even at peak external heat",
          "Reduced heat transfer through the frame lowers AC load on the room",
        ],
      },
    ],

    afterCompare: [
      {
        id: "upvc-doors-dubai-why-the-number-of-chambers-actually-ma",
        eyebrow: "Chamber engineering",
        heading: "uPVC Doors Dubai – Why the Number of Chambers Actually Matters",
        level: 3,
        body: [
          "A 5-chamber profile isn't a spec-sheet flourish, each internal chamber is a dead-air pocket that slows heat transfer through the frame.",
          "Cheaper uPVC windows Dubai buyers sometimes get talked into using two or three chambers, which cuts material cost but also cuts thermal performance. More chambers means a stiffer, better-insulated frame without adding visible bulk to the sightline.",
        ],
        points: [
          "Each additional chamber adds a thermal break, not just material",
          "Chamber count affects rigidity as much as insulation value",
          "Cheaper 2–3 chamber frames flex more under wind load over time",
        ],
        tone: "muted",
      },
      {
        id: "the-steel-you-never-see-is-doing-the-work",
        eyebrow: "Internal reinforcement",
        heading: "The Steel You Never See Is Doing the Work",
        level: 3,
        body: [
          "uPVC on its own isn't rigid enough to hold a large door or window flat over years of heat cycling, that's what the internal galvanised steel reinforcement is for.",
          "Quality uPVC doors in Dubai installers run a full steel core through the main frame and sash sections, not just at the corners, which is the difference between a door that stays square and one that starts dragging within two summers.",
        ],
        points: [
          "Galvanised steel resists corrosion inside the sealed profile cavity",
          "Full-length reinforcement prevents sagging on wider door and window sashes",
          "Corner-only reinforcement is a common shortcut worth asking suppliers about directly",
        ],
      },
      {
        id: "multi-point-locking-explained-simply",
        eyebrow: "Locking systems",
        heading: "Multi-Point Locking Explained Simply",
        level: 3,
        body: [
          "A single-point lock only secures the door at the handle, a multi-point system engages several steel bolts into the frame at once, spread across the height of the door.",
          "This matters more on ground-floor uPVC windows UAE homeowners install, where a single-point lock leaves the top and bottom of the sash more vulnerable to forced entry.",
        ],
        points: [
          "Multi-point locks typically engage 3–5 points along the frame simultaneously",
          "Ground-floor openings benefit most from the added resistance to forced entry",
          "Locking hardware should be rated separately from the frame's general durability spec",
        ],
        tone: "muted",
      },
      {
        id: "getting-a-timber-look-without-timber-upkeep",
        eyebrow: "Finishes and foils",
        heading: "Getting a Timber Look Without Timber Upkeep",
        level: 4,
        body: [
          "Woodgrain foils have improved enough that most people can't tell a foiled uPVC frame from painted timber at arm's length, without any of the sanding or repainting timber eventually needed.",
          "Combined with a wide RAL colour range for solid finishes, uPVC doors in Dubai buyers now have far more design flexibility than the plain white frames the material was known for a decade ago.",
        ],
        points: [
          "Woodgrain foils replicate timber texture without the ongoing maintenance",
          "Dual-colour options allow a different shade inside versus outside",
          "Full RAL colour matching is available beyond standard white and grey",
        ],
      },
      {
        id: "do-upvc-doors-and-windows-dubai-fade-or-yellow-in-gulf",
        eyebrow: "Colour stability",
        heading: "Do uPVC Doors and Windows Dubai Fade or Yellow in Gulf Sun?",
        level: 4,
        body: [
          "Lower-grade uPVC can chalk or yellow within a few years under intense UV exposure, which is the main hesitation people have before choosing it here.",
          "Quality profiles used in uPVC windows Dubai projects include UV stabilisers built into the extrusion itself, not just a surface coating, so the colour holds even on south- and west-facing elevations that take the harshest afternoon sun.",
        ],
        points: [
          "UV stabilisers are compounded into the material, not sprayed on afterward",
          "South and west-facing frames take the most cumulative UV exposure",
          "Ask for the manufacturer's UV warranty period, not just a general colour guarantee",
        ],
        tone: "muted",
      },
      {
        id: "why-fly-screen-channels-are-worth-specifying-upfront",
        eyebrow: "Insect protection",
        heading: "Why Fly Screen Channels Are Worth Specifying Upfront",
        level: 4,
        body: [
          "Retrofitting an insect screen after installation almost always looks bolted-on, a channel built into the frame during manufacture sits flush and integrates with the sightline properly.",
          "It's a small spec detail that's far easier to include when ordering uPVC windows Dubai suppliers fabricate to order than to add after the fact.",
        ],
        points: [
          "Integrated channels keep the screen flush rather than surface-mounted",
          "Far cheaper to specify at order stage than retrofit later",
          "Removable screens still allow full glass cleaning access when needed",
        ],
      },
      {
        id: "the-seal-matters-as-much-as-the-frame",
        eyebrow: "Gasket and seal quality",
        heading: "The Seal Matters as Much as the Frame",
        level: 4,
        body: [
          "A well-engineered profile with a poor-quality gasket will still let in dust and draughts, the two need to be assessed together, not separately.",
          "EPDM rubber gaskets hold their compression and flexibility far longer than cheaper alternatives that harden and crack within a couple of years in sustained heat, which is exactly the condition most UAE-installed frames face year-round.",
        ],
        points: [
          "EPDM gaskets resist hardening and cracking under sustained heat exposure",
          "Double or triple gasket lines improve both draught and dust resistance",
          "Gasket quality is rarely mentioned in basic quotes, worth asking about directly",
        ],
        tone: "muted",
      },
      {
        id: "casement-tilt-turn-or-sliding-which-fits-where",
        eyebrow: "Choosing a system type",
        heading: "Casement, Tilt-Turn, or Sliding – Which Fits Where?",
        level: 5,
        body: [
          "The three main uPVC systems suit different rooms for different reasons: casement opens fully for maximum ventilation, tilt-turn allows a secure night-vent position plus full opening for cleaning, and sliding suits tight spaces where an outward-opening sash would clash with furniture or walkways.",
          "Matching the system to the room matters more than most buyers initially assume.",
        ],
        points: [
          "Casement gives the widest full opening for cross-ventilation",
          "Tilt-turn allows safe ventilation without fully opening the sash",
          "Sliding suits balconies and tight spaces where swing clearance is limited",
        ],
      },
      {
        id: "where-upvc-actually-saves-money-over-time",
        eyebrow: "Value comparison",
        heading: "Where uPVC Actually Saves Money Over Time",
        level: 5,
        body: [
          "The upfront cost of uPVC sits close to mid-range aluminium, but the gap opens up over the ownership period, no repainting, generally lower servicing needs, and thermal performance that can measurably reduce AC running costs in a well-sealed room.",
          "It's rarely the cheapest option at quote stage, but it's often the cheaper one across a ten-year view.",
        ],
        points: [
          "Lower ongoing maintenance costs offset a comparable upfront price",
          "Thermal efficiency can reduce cooling costs in well-insulated rooms",
          "Value comparison should be run over years owned, not just install cost",
        ],
        tone: "muted",
      },
    ],

    afterWorksWellWith: [
      {
        id: "where-upvc-tends-to-make-the-most-sense",
        eyebrow: "Residential applications",
        heading: "Where uPVC Tends to Make the Most Sense",
        level: 5,
        body: [
          "uPVC suits bedrooms, apartments, and secondary elevations particularly well, where large-format glazing and ultra-slim sightlines aren't the priority and thermal and acoustic performance are.",
          "It's a common combination on UAE projects to run uPVC across bedroom and apartment openings while reserving aluminium for the statement openings, living rooms, pool-facing walls, where sightline matters more.",
        ],
        points: [
          "Well suited to bedrooms and secondary rooms prioritising quiet over sightline",
          "Common in apartment developments where budget and thermal spec both matter",
          "Frequently combined with aluminium on the same project for different rooms",
        ],
      },
      {
        id: "why-upvc-frames-quiet-a-room-differently",
        eyebrow: "Acoustic performance",
        heading: "Why uPVC Frames Quiet a Room Differently",
        level: 5,
        body: [
          "Sound doesn't just travel through glass, it travels through the frame too, and a hollow-chambered plastic profile dampens vibration differently than a solid metal one.",
          "Paired with the right glass build-up, uPVC doors and windows Dubai apartments near main roads can cut perceived traffic noise substantially, particularly in the lower frequency range that metal frames tend to transmit more readily.",
        ],
        points: [
          "Multi-chamber profiles interrupt sound transmission through the frame itself",
          "Works best combined with acoustic-rated glass, not as a standalone fix",
          "Especially noticeable on lower-frequency noise like traffic and generators",
        ],
        tone: "muted",
      },
      {
        id: "what-to-check-before-ordering",
        eyebrow: "Supplier selection",
        heading: "What to Check Before Ordering",
        level: 5,
        body: [
          "Not every fabricator offering uPVC doors and windows Dubai-wide is working from the same base profile, asking specifically which system and chamber count is being quoted, not just \"uPVC,\" since pricing and performance vary considerably between entry-level and premium profile brands.",
          "A written spec sheet before deposit avoids the most common source of dispute later.",
        ],
        points: [
          "Ask for the specific profile brand and chamber count, not just \"uPVC\"",
          "Get chamber count, steel reinforcement, and glass spec in writing before deposit",
          "Compare quotes on identical specification, not just headline price",
        ],
      },
      {
        id: "how-long-should-upvc-actually-last",
        eyebrow: "Warranty and lifespan",
        heading: "How Long Should uPVC Actually Last?",
        level: 6,
        body: [
          "A properly fabricated and installed uPVC system should perform reliably for 20 to 25 years with only routine hardware servicing, assuming a quality profile and correct installation.",
          "Warranty terms vary significantly between suppliers of uPVC windows UAE-wide, so it's worth checking what's covered on the profile itself versus the hardware and glass separately, since these are often warrantied differently.",
        ],
        points: [
          "Quality profiles are typically rated for 20–25 years of structural performance",
          "Frame, hardware, and glass warranties often run on separate terms",
          "Ask what voids the warranty before signing, not after a repair is needed",
        ],
        tone: "muted",
      },
    ],

    afterFaq: [
      {
        id: "upvc-systems-specified-for-gulf-climates",
        eyebrow: "Why swiftrooms",
        heading: "uPVC Systems Specified for Gulf Climates",
        level: 6,
        body: [
          "We’ve engineered and fitted uPVC windows and doors across Dubai villas and Abu Dhabi apartments for 14 years. We know which multi-chamber profiles, EPDM gaskets, and UV stabilisers endure 50°C summer heat and desert sand.",
          "As an authorised partner for premier European extruders, we supply genuine certified profiles backed by real factory warranties.",
        ],
        points: [
          "Authorised partner for UV-stabilised European uPVC systems",
          "High-efficiency 5-chamber and 7-chamber thermal profiles",
          "Full-length galvanised steel cores and tropical-grade EPDM seals",
          "Free site survey and written specification within 24 hours",
          "Proven track record across residential and commercial projects UAE-wide",
        ],
      },
    ],
  },

  "curtain-wall": {
    beforeProducts: [
      {
        id: "curtain-wall-in-dubai-non-load-bearing-by-design",
        eyebrow: "Built for height",
        heading: "Curtain Wall in Dubai – Non-Load-Bearing by Design",
        level: 2,
        body: [
          "An aluminium curtain wall carries no structural load of its own, it hangs off the slab edge, floor by floor, which is why it's the default choice for towers across Dubai, Abu Dhabi and Sharjah rather than block-and-glaze construction.",
          "For developers working to fixed completion dates, that speed matters as much as the finish.",
        ],
        points: [
          "Non-load-bearing, so floor plates stay lighter",
          "Faster erection on tight UAE handover schedules",
          "Consistent module sizing across long Downtown Dubai or Business Bay elevations",
          "Glass types swapped without reworking the frame",
        ],
        tone: "muted",
      },
    ],

    afterCompare: [
      {
        id: "stick-unitised-or-semi-unitised",
        eyebrow: "Build methods",
        heading: "Stick, Unitised or Semi-Unitised",
        level: 2,
        body: [
          "Curtain wall systems are built one of three ways, and the right method depends on site access and programme rather than building height alone.",
          "On dense sites in Business Bay or Al Reem Island, unitised builds often win because they cut hours spent working at height.",
        ],
        points: [
          "Stick systems, assembled piece by piece on site",
          "Unitised panels, pre-glazed off site and craned into place",
          "Semi-unitised hybrids for tighter budgets",
          "Method chosen per floor height, crane access and site congestion",
        ],
      },
      {
        id: "aluminium-curtain-wall-curtain-wall-vs-window-wall",
        eyebrow: "Framing logic",
        heading: "Aluminium Curtain Wall – Curtain Wall vs Window Wall",
        level: 3,
        body: [
          "An aluminium frame curtain wall runs as a continuous grid in front of the slab edge, while a window wall sits within each individual floor. That difference changes cost, waterproofing detail and how a tower reads from Sheikh Zayed Road.",
          "Below that height, a window wall or storefront system is usually the more economical route than a full aluminium frame curtain wall.",
        ],
        points: [
          "Continuous mullion grid runs past floor slabs",
          "Waterproofing detailed once per elevation, not per floor",
          "Cleaner sightlines on multi-storey UAE elevations",
          "Typically specified above four or five storeys",
        ],
        tone: "muted",
      },
      {
        id: "more-than-cladding",
        eyebrow: "Building envelope",
        heading: "More Than Cladding",
        level: 3,
        body: [
          "A façade is the building's thermal and acoustic boundary, not just its finish. Aluminium façade systems built for UAE conditions balance three things at once, daylight in, heat out, and joints that survive a decade of Gulf sun and coastal salt air.",
          "We spec each façade against the block's real exposure, whether that's Downtown Dubai or Ras Al Khaimah.",
        ],
        points: [
          "Low-E and solar control coatings tuned to elevation orientation",
          "Acoustic seals rated for Dubai's road and construction noise",
          "Gasket materials chosen for UV and heat resistance",
          "Joint design tested against thermal movement in 45°C summers",
        ],
      },
    ],

    afterWorksWellWith: [
      {
        id: "residential-use",
        eyebrow: "Residential use",
        heading: "Not Just for Towers",
        level: 4,
        body: [
          "Boutique villas in Emirates Hills, Al Barari and Jumeirah increasingly ask for the same frameless, floor-to-ceiling look as commercial towers, scaled down to a residential setting.",
          "A well-detailed aluminium glass curtain wall can turn a flat villa elevation into its focal point.",
        ],
        points: [
          "Frameless corner glazing for villa living spaces",
          "Reduced sightlines compared with standard window systems",
          "Acoustic upgrades near main roads or flight paths",
          "Compatible with sliding and pivot door integration",
        ],
      },
      {
        id: "built-for-dubai-s-climate",
        eyebrow: "Local compliance",
        heading: "Built for Dubai's Climate",
        level: 4,
        body: [
          "Curtain wall Dubai projects must meet Dubai Municipality's Green Building Regulations on thermal transmittance, alongside wind load and safety testing specific to the emirate, a system built for milder climates elsewhere can underperform on a curtain wall Dubai installation without the right thermal break.",
          "Sorting this paperwork out early avoids a costly redesign at the approval stage.",
        ],
        points: [
          "U-values checked against current Dubai Municipality thresholds",
          "Wind load data referenced for local, coastal-adjacent conditions",
          "Higher corrosion resistance specified for Jumeirah and Palm-area sites",
          "Submission documentation prepared for consultant and authority approval",
        ],
        tone: "muted",
      },
      {
        id: "getting-the-glazing-right",
        eyebrow: "Glass that works harder",
        heading: "Getting the Glazing Right",
        level: 4,
        body: [
          "The glass make-up decides most of what an aluminium glass curtain wall achieves, and it matters more than frame colour ever will.",
          "Sample panels help clients see how a coating actually looks on an aluminium glass curtain wall under real Dubai daylight.",
        ],
        points: [
          "Double glazed units for thermal separation in Gulf heat",
          "Laminated inner pane for occupant safety",
          "Ceramic frit or spandrel panels to mask structure",
          "Tinted or reflective outer glass for glare control on west-facing towers",
        ],
      },
      {
        id: "one-elevation-several-build-ups",
        eyebrow: "Glazing options",
        heading: "One Elevation, Several Build-Ups",
        level: 4,
        body: [
          "Choosing aluminium curtain wall glazing means matching the glass build-up to sun exposure and interior use, not just picking the thickest pane on offer.",
          "Mixing build-ups across one elevation for aluminium curtain wall glazing is standard UAE practice, not a compromise.",
        ],
        points: [
          "Vision glass for occupied, daylight-facing zones",
          "Spandrel or opaque panels to conceal slab edges and services",
          "Acoustic laminated units near busy road frontages",
          "Solar control coatings varied by facade orientation, a core part of any aluminium curtain wall glazing brief",
        ],
        tone: "muted",
      },
      {
        id: "where-the-cooling-load-comes-from",
        eyebrow: "Energy & comfort",
        heading: "Where the Cooling Load Comes From",
        level: 4,
        body: [
          "Heat gain through glazing drives most of the cooling load in Gulf buildings, which is why thermal performance sits at the top of nearly every UAE specification brief.",
          "A well-detailed curtain wall façade system reduces solar gain sharply compared with older single-glazed elevations.",
        ],
        points: [
          "Thermally broken aluminium profiles as standard",
          "Low-E coated glass to reduce solar heat gain",
          "Shadow boxes to mask spandrel zones from view",
          "U-value and SHGC data supplied for Al Sa'fat, Estidama and LEED submissions",
        ],
      },
      {
        id: "tested-against-real-wind-loads",
        eyebrow: "Structural safety",
        heading: "Tested Against Real Wind Loads",
        level: 5,
        body: [
          "Every curtain wall façade system on a UAE mid- or high-rise must prove it can handle wind pressure without deflecting past safe limits, this isn't a paperwork formality.",
          "On exposed sites like Dubai Marina or Al Reem Island, wind load figures can reshape the entire mullion spacing plan.",
        ],
        points: [
          "Structural calculations run per building height and coastal exposure",
          "Deflection limits checked against glass bite tolerances",
          "Air and water penetration testing to international standards",
          "Anchor design reviewed against substrate condition on-site",
        ],
        tone: "muted",
      },
      {
        id: "facade-choices-that-affect-your-rating",
        eyebrow: "Green building",
        heading: "Facade Choices That Affect Your Rating",
        level: 5,
        body: [
          "Abu Dhabi's Estidama Pearl Rating and Dubai's Al Sa'fat system both weigh facade glazing heavily, since it's one of the larger contributors to a building's energy score.",
          "Aluminium's long service life is one more reason aluminium façade systems keep coming up in sustainability briefs.",
        ],
        points: [
          "Recycled content documentation available on request",
          "Solar control glass to reduce mechanical cooling demand",
          "Daylighting calculations to support wellbeing credits",
          "End-of-life recyclability of aluminium framing",
        ],
      },
      {
        id: "built-to-last-not-set-and-forget",
        eyebrow: "Aftercare",
        heading: "Built to Last, Not Set and Forget",
        level: 5,
        body: [
          "An aluminium curtain wall is built to last decades in UAE conditions, but gaskets age faster in Gulf heat and drainage channels can silt up with blown sand.",
          "A basic maintenance plan agreed at handover tends to save far more than it costs to run.",
        ],
        points: [
          "Annual inspection of gaskets and sealant joints",
          "Drainage channels checked and cleared of sand and debris",
          "Powder coat touch-ups on coastal or Marina-facing elevations",
          "Glass cleaning schedules tailored to building height and dust exposure",
        ],
        tone: "muted",
      },
      {
        id: "offices-hotels-and-retail-podiums",
        eyebrow: "Commercial use",
        heading: "Offices, Hotels and Retail Podiums",
        level: 5,
        body: [
          "Offices, hotels, retail podiums and mixed-use towers each ask something different of a facade. Curtain wall Dubai developments increasingly mix daylight-focused and drama-focused glazing within one building.",
          "Matching the glazing spec to each use, floor by floor, tends to outperform one blanket specification.",
        ],
        points: [
          "Office towers prioritising daylight and glare control",
          "Hotel and hospitality frontages built for visual impact",
          "Retail podiums with larger structural glazing spans",
          "Mixed-use towers blending vision and spandrel zones",
        ],
      },
      {
        id: "what-actually-drives-the-price",
        eyebrow: "Budgeting",
        heading: "What Actually Drives the Price",
        level: 5,
        body: [
          "Curtain wall pricing in the UAE varies more than most clients expect, and the biggest swings come from build method and glass build-up rather than the aluminium itself.",
          "A clear brief at concept stage lets us give a realistic budget range for aluminium façade systems rather than a guess.",
        ],
        points: [
          "Unitised systems cost more upfront, less in site labour",
          "Glass build-up often outweighs framing cost",
          "Complex geometries and curves add fabrication time",
          "Access and crane requirements affect site pricing",
        ],
        tone: "muted",
      },
      {
        id: "survey-to-handover",
        eyebrow: "How we work",
        heading: "Survey to Handover",
        level: 6,
        body: [
          "Every curtain wall façade system we install follows the same sequence, whether it's a single villa elevation or a full tower.",
          "Clients get a written specification before any material is ordered, so there are no surprises at delivery.",
        ],
        points: [
          "Site survey and structural verification",
          "Shop drawings issued for consultant and authority approval",
          "Fabrication and pre-glazing where applicable",
          "On-site installation, testing and snagging",
        ],
      },
    ],

    afterFaq: [
      {
        id: "manufacturer-backed-not-just-contractor-built",
        eyebrow: "Why swiftrooms",
        heading: "Manufacturer-Backed, Not Just Contractor-Built",
        level: 6,
        body: [
          "We're an authorised UAE partner for Cortizo, Vetromax, Vetro and Gulf Extrusions, which means our aluminium curtain wall and aluminium frame curtain wall installations carry manufacturer-backed warranties.",
          "For anyone comparing curtain wall systems suppliers, that manufacturer backing is usually the detail worth checking first.",
        ],
        points: [
          "Direct access to Cortizo TP52, Equity, Gulf Extrusions and Vetromax ranges",
          "In-house technical team for U-value and wind load queries",
          "Free site survey and written specification within 24 hours",
          "Track record across residential and commercial projects across the UAE",
        ],
        tone: "muted",
      },
    ],
  },

  "garden-rooms": {
    beforeProducts: [
      {
        id: "garden-room-built-for-gulf-weather",
        eyebrow: "",
        heading: "Garden Room Built for Gulf Weather",
        level: 2,
        body: [
          "A glass room Dubai homeowners can actually use year-round needs more than large windows facing the garden. It needs insulated glazing, real ventilation, and a frame that's rated for extreme heat rather than borrowed from a milder climate.",
          "That's the gap between a decorative sunroom and a genuine garden room built to last. Get the fundamentals wrong and the space sits unused for half the year.",
        ],
        points: [
          "Insulated glazing to manage solar heat gain",
          "Aluminium frames that won't warp or discolour in high UV",
          "Integrated ventilation for use across all seasons",
          "Structural design rated for shamal wind conditions",
        ],
      },
    ],

    afterCompare: [
      {
        id: "aluminium-garden-rooms-why-aluminium-outperforms-timber",
        eyebrow: "Frame material",
        heading: "Aluminium Garden Rooms – Why Aluminium Outperforms Timber Here",
        level: 2,
        body: [
          "Timber swells. It sticks in the heat, needs repainting every couple of years, and rarely survives a decade near the coast without real upkeep.",
          "Aluminium garden rooms don't carry that baggage. Most builds we quote now use aluminium as standard, even when the client's original mood board shows a timber-look conservatory.",
        ],
        points: [
          "No warping, swelling or rot in high heat",
          "Powder-coated finish resists UV fading over years, not months",
          "Slimmer frames allow more glass per elevation",
          "Lower long-term maintenance than timber or uPVC alternatives",
        ],
        tone: "muted",
      },
      {
        id: "glass-rooms-dubai-victorian-charm-or-contemporary-lines",
        eyebrow: "Style options",
        heading: "Glass Rooms Dubai – Victorian Charm or Contemporary Lines",
        level: 3,
        body: [
          "Not every UAE villa wants the same silhouette. Some clients want a traditional Victorian conservatory Dubai buyers associate with period-style homes; others want a flat-roofed, minimal-frame aluminium glass room that reads as pure contemporary architecture.",
          "Both are achievable on the same underlying aluminium platform, which keeps performance consistent regardless of which look a client chooses for their villa.",
        ],
        points: [
          "Victorian and Edwardian conservatory profiles",
          "Flat-roof, box-style modern glass garden rooms",
          "Lean-to designs for tighter garden footprints",
          "Custom roof pitch to match the main house",
        ],
      },
      {
        id: "the-glass-decides-the-comfort-level",
        eyebrow: "Glazing build-up",
        heading: "The Glass Decides the Comfort Level",
        level: 3,
        body: [
          "An aluminium glass room lives or dies on its glazing spec, and this is where most budget conservatories fall short in the UAE.",
          "Double glazed units with solar control coatings cut heat gain dramatically compared with single glazing, which matters most between May and September when surface temperatures on unshaded glass can climb well past what's comfortable indoors.",
        ],
        points: [
          "Double glazed units as standard across all models",
          "Solar control coatings to reduce glare and heat",
          "Laminated glass options for added security",
          "Tinted roof glazing to soften overhead sun",
        ],
        tone: "muted",
      },
    ],

    afterWorksWellWith: [
      {
        id: "keeping-the-space-usable-in-summer",
        eyebrow: "Ventilation & airflow",
        heading: "Keeping the Space Usable in Summer",
        level: 4,
        body: [
          "A modern glass garden room without proper ventilation turns into a greenhouse by midday, no matter how good the glazing is. Integrated roof vents, opening panels and optional mechanical cooling keep the space genuinely comfortable rather than something that only photographs well.",
          "This is one of the most commonly underspecified details on budget builds, and it's the single biggest complaint we hear about older glass room Dubai installations that were never designed for this climate in the first place.",
        ],
        points: [
          "Automated roof vents for passive heat release",
          "Opening glazed panels for cross-ventilation",
          "Optional split AC integration for peak summer months",
          "Ceiling fans specified into the design from the outset",
        ],
      },
      {
        id: "what-uae-municipalities-require",
        eyebrow: "Permits & approvals",
        heading: "What UAE Municipalities Require",
        level: 4,
        body: [
          "Garden rooms Dubai homeowners want built usually need approval before construction starts, and the process differs slightly depending on whether the villa sits within a freehold community or falls under direct Dubai Municipality jurisdiction.",
          "Getting this sorted early keeps the build on schedule and avoids a stalled project halfway through fabrication.",
        ],
        points: [
          "Structural drawings prepared for consultant sign-off",
          "Submission handled through Dubai Municipality or the relevant community authority",
          "Freehold community developer NOCs arranged where required",
          "Approval timelines factored into the overall project schedule",
        ],
        tone: "muted",
      },
      {
        id: "built-for-shamal-season",
        eyebrow: "Weather resilience",
        heading: "Built for Shamal Season",
        level: 4,
        body: [
          "A conservatory Dubai residents rely on has to survive shamal winds and blown sand without losing structural integrity or letting dust into the space.",
          "Frame tolerance, seal design and drainage detailing carry most of that load, and it's usually the first thing that fails on a poorly specified structure once the winds pick up.",
        ],
        points: [
          "Wind load calculations specific to UAE conditions",
          "Sealed drainage channels to resist sand ingress",
          "Reinforced glazing beads for higher wind pressure zones",
          "Weatherstripping tested against repeated dust exposure",
        ],
      },
      {
        id: "not-just-a-summer-space",
        eyebrow: "Year-round use",
        heading: "Not Just a Summer Space",
        level: 4,
        body: [
          "The best-specified glass room Dubai clients ask for stays comfortable in January as much as it does in July.",
          "Insulation and glazing choice are what determine whether a garden room becomes a genuine all-season living space or a seasonal extra that gets shut off for half the year once the heat sets in.",
        ],
        points: [
          "Thermally broken frames to reduce heat transfer",
          "Insulated roof panels alongside glazed sections",
          "Underfloor heating options for cooler winter evenings",
          "Blinds or shading integrated for summer glare control",
        ],
        tone: "muted",
      },
      {
        id: "maintenance-in-desert-conditions",
        eyebrow: "Upkeep",
        heading: "Maintenance in Desert Conditions",
        level: 5,
        body: [
          "Even a well-built aluminium glass room needs occasional attention in a desert climate. Dust accumulates faster here than in most markets this system was originally designed for, and coastal properties see noticeably faster wear on seals and hardware than inland villas do, simply from the added salt content in the air.",
          "Any conservatory Dubai buyers install near the coast should budget for slightly more frequent checks than an inland equivalent.",
        ],
        points: [
          "Glass cleaning schedules to manage dust build-up",
          "Seal and gasket checks ahead of summer heat",
          "Hardware lubrication for sliding or opening panels",
          "Powder coat inspection on coastal-facing installations",
        ],
      },
      {
        id: "home-office-gym-or-family-room",
        eyebrow: "How the space gets used",
        heading: "Home Office, Gym or Family Room",
        level: 5,
        body: [
          "Clients rarely build a garden room for one single purpose anymore.",
          "Modern glass garden rooms flex between a home office by day, a family lounge in the evening, and an overflow entertaining space on weekends, which shapes the layout brief from day one far more than the exterior style does.",
        ],
        points: [
          "Home offices with garden views and natural light",
          "Home gyms with ventilation built into the design",
          "Majlis or family lounge extensions off the main villa",
          "Playrooms with durable, low-maintenance flooring options",
        ],
        tone: "muted",
      },
      {
        id: "what-changes-the-price",
        eyebrow: "Budgeting",
        heading: "What Changes the Price",
        level: 5,
        body: [
          "Garden room and conservatory pricing swings mainly on size, glazing spec and roof design rather than on the aluminium frame itself.",
          "A simple lean-to structure costs considerably less than a bespoke box-glazed room with a fully glazed roof, and most quotes vary more on those two factors than clients initially expect.",
        ],
        points: [
          "Footprint and ceiling height as the biggest cost drivers",
          "Roof glazing costing more than polycarbonate alternatives",
          "Bespoke shapes requiring custom fabrication time",
          "Ventilation and cooling add-ons priced separately",
        ],
      },
      {
        id: "from-site-visit-to-handover",
        eyebrow: "Our process",
        heading: "From Site Visit to Handover",
        level: 5,
        body: [
          "Every garden room and conservatory we build follows the same sequence, regardless of size or style, so tolerances stay tight and there are no surprises once the crew arrives on site. Clients get a written specification before anything is fabricated, not just a verbal estimate.",
        ],
        points: [
          "Free site survey and initial design consultation",
          "Structural drawings and municipality submission where required",
          "Fabrication and pre-assembly of aluminium components",
          "On-site installation, glazing and final snagging",
        ],
        tone: "muted",
      },
      {
        id: "designed-to-feel-like-part-of-the-villa",
        eyebrow: "Integration with the main house",
        heading: "Designed to Feel Like Part of the Villa",
        level: 5,
        body: [
          "A garden rooms Dubai project only really succeeds when it stops looking like an add-on.",
          "Matching sightlines, floor levels and frame colour to the existing villa is what separates a well-integrated extension from something that visibly doesn't belong, and it's usually worth the extra design time it takes to get right.",
        ],
        points: [
          "Frame colours matched to existing window and door systems",
          "Floor level transitions kept flush where possible",
          "Roofline pitch coordinated with the main structure",
          "Sliding or bi-fold connections between house and garden room",
        ],
      },
      {
        id: "what-uae-clients-are-asking-for-now",
        eyebrow: "Design trends",
        heading: "What UAE Clients Are Asking For Now",
        level: 6,
        body: [
          "Demand has shifted noticeably toward slimmer sightlines and larger single panes over the last few years",
          "Modern glass garden rooms with minimal framing and flush glazed corners are now requested more often than traditional conservatory profiles, particularly on newer villa developments across Dubai and Abu Dhabi.",
        ],
        points: [
          "Slim-sightline aluminium frames for maximum glass area",
          "Flush corner glazing without visible corner posts",
          "Flat or low-pitch roof profiles over traditional gables",
          "Neutral frame finishes (anthracite, matte black) over bright white",
        ],
        tone: "muted",
      },
    ],

    afterFaq: [
      {
        id: "a-local-team-that-builds-for-this-climate",
        eyebrow: "Why swiftrooms",
        heading: "A Local Team That Builds for This Climate",
        level: 6,
        body: [
          "We've installed aluminium garden rooms and conservatories across Dubai villas and townhouses long enough to know which details matter in Gulf heat, and which manufacturer specs actually hold up after a few summers rather than just on a datasheet.",
        ],
        points: [
          "Authorised partner for Cortizo, Vetromax, Vetro and Gulf Extrusions",
          "In-house design and structural approval support",
          "Free site survey and written specification within 24 hours",
          "Proven track record on garden rooms Dubai villa communities rely on",
        ],
      },
    ],
  },

  "aluminium-glass-doors": {
    beforeProducts: [
      {
        id: "what-makes-aluminium-glass-doors-built-to-last-in-dubai",
        eyebrow: "The material that actually holds up",
        heading: "What Makes Aluminium Glass Doors Built to Last in Dubai's Climate?",
        level: 2,
        body: [
          "An aluminium glass door does one job well: hold the largest possible pane of glass in the smallest possible frame, without bending, sagging, or losing its seal after a few UAE summers.",
          "That balance of strength and slenderness is why aluminium has become the default choice over timber or uPVC on any opening where glass area actually matters, the frame carries real structural load while staying nearly invisible against the glass it holds.",
        ],
        points: [
          "Slimmer frames without sacrificing structural load-bearing capacity",
          "Won't warp, swell, or rot the way timber does in this climate",
          "Outperforms uPVC on large-format panels and heavier daily use",
        ],
        tone: "muted",
      },
      {
        id: "why-a-slim-frame-still-needs-to-carry-real-weight",
        eyebrow: "Frame engineering",
        heading: "Why a Slim Frame Still Needs to Carry Real Weight",
        level: 2,
        body: [
          "A door built mostly of glass puts more structural demand on its frame, not less, every kilogram of glass has to be carried by hinges, rollers, or a pivot mechanism that can't be bulked up without ruining the sightline the door was specified for in the first place.",
          "Aluminium glass doors solve this with reinforced internal chambers rather than added external bulk, keeping the frame slim while still rated for genuinely heavy panels.",
        ],
        points: [
          "Reinforced internal chambers carry structural load without increasing visible frame width",
          "Hinge and roller specification is matched to actual glass weight, not a generic default",
          "A slimmer sightline is a manufacturing decision, not just a design preference",
        ],
      },
      {
        id: "where-aluminium-glass-doors-actually-affect-the-ac-bill",
        eyebrow: "Thermal performance",
        heading: "Where Aluminium Glass Doors Actually Affect the AC Bill",
        level: 3,
        body: [
          "Glass gets the attention in a thermal conversation, but an unbroken aluminium frame conducts heat straight through the metal regardless of how good the glazing is.",
          "A thermally broken profile separates the interior and exterior aluminium faces with an insulating strip, which is what stops the frame itself from working against the glass rather than alongside it.",
        ],
        points: [
          "Thermal break profiles separate interior and exterior aluminium faces",
          "Reduces heat transfer through the frame independently of the glazing spec",
          "Most noticeable on larger doors, where frame surface area is proportionally greater",
        ],
        tone: "muted",
      },
      {
        id: "matching-the-door-to-the-opening-not-the-other-way-arou",
        eyebrow: "Design flexibility",
        heading: "Matching the Door to the Opening, Not the Other Way Around",
        level: 3,
        body: [
          "Not every opening calls for the same door format.",
          "Hinged and pivot doors create a striking entrance, while sliding and bi-fold options use the same high-performance aluminium engineering to maximise rear openings, connect indoor and outdoor spaces, and prioritise wide, unobstructed access instead of making a bold front entrance statement.",
        ],
        points: [
          "Hinged and pivot formats suit statement entrances with available swing clearance",
          "Sliding and bi-fold formats suit wide rear elevations prioritising an open connection",
          "Finish, colour, and hardware style are consistent across formats on the same profile family",
        ],
      },
      {
        id: "locking-hardware-matched-to-a-glass-heavy-opening",
        eyebrow: "Security",
        heading: "Locking Hardware Matched to a Glass-Heavy Opening",
        level: 3,
        body: [
          "A large glazed opening is often assumed to be a weak point security-wise, but the locking hardware, not the glass area, usually determines how it actually performs.",
          "Multi-point locking distributes force across several anchor points along the frame rather than relying on a single handle-mounted catch, which matters most on ground-floor doors and easily accessed openings.",
        ],
        points: [
          "Multi-point locking spreads resistance across several points along the frame",
          "Laminated or toughened glazing adds a further physical barrier beyond the lock",
          "Ground-floor and easily accessed doors warrant the highest-spec hardware available",
        ],
        tone: "muted",
      },
      {
        id: "why-a-door-s-glass-spec-differs-from-a-window-s",
        eyebrow: "Glass selection",
        heading: "Why a Door's Glass Spec Differs From a Window's",
        level: 4,
        body: [
          "Doors get walked through, leaned on, and occasionally bumped into in a way windows never are, which is why toughened or laminated glass is standard at a lower height threshold on doors than on fixed windows in most specifications.",
          "The glass decision on a door isn't purely about thermal or acoustic performance, impact safety at the height people actually interact with the door matters just as much, especially across a full-height glazed panel.",
        ],
        points: [
          "Toughened or laminated glazing is standard on doors below a lower height threshold than windows",
          "Impact safety at hand and body height is a door-specific consideration",
          "Full-height glass doors need this factored in across the entire panel, not just the lower section",
        ],
      },
      {
        id: "reducing-outside-noise-without-losing-the-glass-area",
        eyebrow: "Acoustic comfort",
        heading: "Reducing Outside Noise Without Losing the Glass Area",
        level: 4,
        body: [
          "Sound transmission through a door depends on seal quality and glass build-up working together, neither one alone fixes a noisy opening.",
          "Acoustic-rated glazing paired with a properly compressed gasket seal noticeably cuts road and construction noise, which matters more on aluminium doors than on smaller windows simply because there's more opening for sound to travel through if the seal isn't right.",
        ],
        points: [
          "Seal compression on closing matters as much as glazing thickness for noise reduction",
          "Acoustic-rated glass is worth specifying near main roads or construction-heavy areas",
          "Larger glass area means seal quality has proportionally more impact on performance",
        ],
        tone: "muted",
      },
      {
        id: "what-a-slim-frame-actually-buys-you",
        eyebrow: "Maximising natural light",
        heading: "What a Slim Frame Actually Buys You",
        level: 4,
        body: [
          "Every millimetre of visible frame is a millimetre of glass area lost, which is why sightline width matters more on a door than almost any other spec once structural safety is accounted for.",
          "A well-engineered slim frame increases daylight penetration into the room behind it without any change to the room's actual footprint.",
        ],
        points: [
          "Narrower sightlines directly increase usable glass area within the same opening",
          "More daylight typically reduces reliance on artificial lighting during the day",
          "Visual connection to an outdoor space improves as frame width decreases",
        ],
      },
      {
        id: "residential-and-commercial-applications",
        eyebrow: "Where they get specified",
        heading: "Residential and Commercial Applications",
        level: 4,
        body: [
          "Aluminium glass doors show up across villa rear extensions, apartment balconies, and renovation projects on the residential side, and office entrances, retail frontages, and hospitality developments on the commercial side.",
          "The performance requirements shift by project type, a retail frontage prioritises cycle rating and daily durability, while a villa extension prioritises sightline and thermal performance.",
        ],
        points: [
          "Residential: villa extensions, apartment balconies, and renovation replacements",
          "Commercial: office entrances and retail frontages needing higher-cycle hardware",
          "Hospitality: developments where finish quality and acoustic comfort both matter",
        ],
        tone: "muted",
      },
      {
        id: "the-size-gap-that-catches-people-out",
        eyebrow: "Before you order",
        heading: "The Size Gap That Catches People Out",
        level: 5,
        body: [
          "The structural opening in a wall is never the same size as the finished door that goes into it, there's a tolerance gap for the frame itself, packing, and movement allowance, and that gap varies by format and manufacturer.",
          "Ordering a door sized to the exact structural opening measurement, rather than the finished frame size the fabricator actually needs, is one of the most common causes of an on-site fit problem.",
        ],
        points: [
          "Structural opening and finished door size are never identical measurements",
          "Tolerance gaps vary by format, manufacturer, and installation method",
          "A site survey against the actual opening avoids ordering to the wrong dimension",
        ],
      },
      {
        id: "what-keeping-the-system-running-actually-involves",
        eyebrow: "Maintenance",
        heading: "What Keeping the System Running Actually Involves",
        level: 5,
        body: [
          "Aluminium doesn't need repainting or sealing the way timber does, but that doesn't mean zero upkeep.",
          "Track and hinge channels collect dust faster in this climate than in the markets these systems were originally engineered for, and coastal properties see hardware wear more quickly from salt content in the air.",
        ],
        points: [
          "Track and hinge cleaning every few months prevents most stiffness complaints",
          "Seal inspection before peak summer heat catches wear before it becomes a leak",
          "Coastal installations benefit from a tighter hardware-checking schedule than inland sites",
        ],
        tone: "muted",
      },
    ],

    afterFaq: [
      {
        id: "fabrication-and-installation-matched-to-this-climate",
        eyebrow: "Why swiftrooms",
        heading: "Fabrication and Installation Matched to This Climate",
        level: 5,
        body: [
          "A well-engineered aluminium profile still depends on correct fabrication and installation to perform the way its spec sheet promises, that responsibility, from initial consultation through to after-sales support, is what we handle on every project rather than treating supply and installation as separate concerns.",
        ],
        points: [
          "Local fabrication under our own quality control",
          "Structural assessments and technical drawings prepared before manufacturing begins",
          "Genuine profile stock backed by manufacturer warranty, not grey-market equivalents",
          "After-sales support available once the system is installed and in use",
        ],
      },
    ],
  },

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
