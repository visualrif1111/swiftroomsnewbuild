// ─── Types ─────────────────────────────────────────────────────────────────

export type Brand = {
  id: string;
  name: string;
  country: string;
  description: string;
  tagline: string;
  speciality: string[];
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  image?: string;
  products: Product[];
  relatedBlogSlugs?: string[];
  faqs?: Array<{ q: string; a: string }>;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  features: string[];
  specs?: Record<string, string>;
  image?: string;
};

export type PortfolioProject = {
  id: string;
  name: string;
  slug: string;
  location: string;
  area: string;
  year: string;
  type: string;
  description: string;
  products: string[];
  tags: string[];
  image?: string;
  brief?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  location: string;
  project: string;
  product: string;
};

export type TeamMember = {
  name: string;
  role: string;
  group: string;
  bio?: string;
  image?: string;
};

export type BlogPost = {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  image: string;
  body: { heading?: string; paragraphs: string[] }[];
  relatedProducts?: { name: string; href: string }[];
};

export type FAQ = {
  question: string;
  answer: string;
  category: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: "guides" | "projects" | "planning";
  fileType: string;
  fileSize: string;
};

export type TimelineEntry = {
  year: string;
  title: string;
  description: string;
};

// ─── Brands ────────────────────────────────────────────────────────────────

export const brands: Brand[] = [
  {
    id: "cortizo",
    name: "Cortizo",
    country: "Spain",
    description:
      "Leading European aluminium systems manufacturer known for architectural excellence and thermal performance. Cortizo's advanced extrusion technology delivers profiles trusted across prestigious developments worldwide.",
    tagline: "European precision. Architectural excellence.",
    speciality: [
      "Sliding Doors",
      "Casement Windows",
      "Bi-fold Doors",
      "Curtain Wall",
      "Entrance Doors",
    ],
  },
  {
    id: "vetromax",
    name: "Vetromax",
    country: "UAE",
    description:
      "Specialist in frameless and ultra-slim glazing systems, Vetromax delivers contemporary glass architecture for the modern UAE residential and commercial market.",
    tagline: "Glass reimagined.",
    speciality: ["Sliding Doors", "Pivot Doors", "Facade Glazing"],
  },
  {
    id: "vetro",
    name: "Vetro",
    country: "UAE",
    description:
      "Vetro is the ultra-slim casement and window brand from the Vetromax group, delivering 15mm sightline technology to residential projects across the UAE. Where minimal framing meets maximum light.",
    tagline: "Minimal sightlines. Maximum light.",
    speciality: ["Casement Windows", "Tilt & Turn", "Fixed Lights", "Slim Frame Systems"],
  },
  {
    id: "gulf-extrusion",
    name: "Gulf Extrusions",
    country: "UAE",
    description:
      "The Middle East's premier aluminium extrusion group, producing high-performance profiles engineered for Gulf climates. Gulf Extrusions' TB600 series and CW systems define regional architectural standards.",
    tagline: "Built for the Gulf. Engineered for life.",
    speciality: ["Tilt & Turn", "Sliding Systems", "Curtain Wall", "TB600 Series"],
  },
];

// ─── Products ──────────────────────────────────────────────────────────────

export const productCategories: ProductCategory[] = [
  {
    id: "aluminium-sliding-doors",
    name: "Aluminium Sliding Doors",
    slug: "aluminium-sliding-doors",
    tagline: "Threshold-defining precision.",
    image: "/brand/categories/aluminium-sliding-doors.jpg",
    description:
      "Our lift-and-slide door collection redefines the boundary between inside and out. From the Cor Vision 4600 to the flagship 4700, these are sliding systems built for the most demanding UAE villa specifications.",
    relatedBlogSlugs: ["lift-and-slide-doors-villa", "bi-fold-vs-lift-and-slide-uae", "window-ratings-standards-uae"],
    faqs: [
      {
        q: "What is the difference between a lift-and-slide door and a standard sliding door?",
        a: "In a standard sliding door the panel drags on the track under its own weight. A lift-and-slide system uses the handle action to lift the sash slightly off its sill seal onto precision steel rollers before sliding — allowing effortless operation of panels up to 400kg. The Cor Vision 4700 can accommodate sashes up to 3,200mm wide and 3,000mm tall.",
      },
      {
        q: "What is the minimum threshold height for a lift-and-slide door in a UAE villa?",
        a: "The Cor Vision range is available with a flush threshold (zero upstand) suitable for level access, or a 20mm raised threshold for enhanced weather performance. A flush threshold requires a recessed drainage channel set into the slab — this must be planned during construction. Our team surveys and specifies the appropriate threshold at design stage.",
      },
      {
        q: "Can lift-and-slide doors be motorised or automated?",
        a: "Yes. The Cor Vision 4700 and Plus can be fitted with an electric drive system that opens and closes the door via a wall switch, remote, or smart home integration. The motor is concealed within the floor track. We specify and install motorised systems regularly for large openings where manual operation of heavy sashes is impractical.",
      },
      {
        q: "How often do lift-and-slide doors need servicing in the UAE?",
        a: "Annual lubrication of the rollers and adjustment of the sash seal compression is recommended. In Dubai and Abu Dhabi sand-heavy environments, the track drainage slots should be cleared every 3 months. With correct maintenance, the Cortizo hardware is rated for 100,000 operating cycles.",
      },
    ],
    products: [
      {
        id: "cor-vision-4600",
        name: "Cor Vision 4600 Lift & Slide",
        slug: "cor-vision-4600",
        brand: "Cortizo",
        category: "aluminium-sliding-doors",
        description:
          "A premium lift-and-slide door system delivering minimal sight lines and maximum glass area. The Cor Vision 4600 creates seamless indoor-outdoor connection with effortless operation.",
        features: [
          "Minimal 28mm central sight line",
          "Panels up to 350kg",
          "Class 4 water tightness",
          "Multi-point locking",
          "Thermal break construction",
        ],
        specs: {
          "Max Panel Width": "3,500mm",
          "Max Panel Height": "3,200mm",
          "Thermal Transmittance": "Uf 2.4 W/m²K",
          "Air Permeability": "Class 4",
        },
        image: "/brand/products/cor-vision-4600.png",
      },
      {
        id: "cor-vision-4700",
        name: "Cor Vision 4700 Lift & Slide",
        slug: "cor-vision-4700",
        brand: "Cortizo",
        category: "aluminium-sliding-doors",
        description:
          "The flagship of the Cor Vision range. Larger panels, enhanced thermal performance, and whisper-quiet operation make the 4700 the definitive choice for luxury villas.",
        features: [
          "Ultra-slim 24mm sight lines",
          "Panels up to 500kg",
          "Anti-lift security pins",
          "Concealed drainage",
          "Brush seal system",
        ],
        specs: {
          "Max Panel Width": "4,000mm",
          "Max Panel Height": "3,500mm",
          "Max Panel Weight": "500kg",
          "Central Sight Line": "24mm",
          "Thermal Transmittance": "Uf 2.1 W/m²K",
          "Air Permeability": "Class 4",
          "Water Tightness": "Class 5A",
          "Wind Resistance": "Class C5",
        },
        image: "/brand/products/cor-vision-4700.jpg",
      },
      {
        id: "cor-vision-plus",
        name: "Cor Vision Plus",
        slug: "cor-vision-plus",
        brand: "Cortizo",
        category: "aluminium-sliding-doors",
        description:
          "The Cor Vision Plus brings frameless aesthetics to sliding door technology, with recessed floor tracks and flush thresholds for barrier-free living.",
        features: [
          "Flush floor threshold option",
          "Recessed track system",
          "Integrated insect screen channel",
          "180° opening capability",
        ],
        specs: {
          "Max Panel Width": "3,200mm",
          "Max Panel Height": "3,000mm",
          "Max Panel Weight": "350kg",
          "Thermal Transmittance": "Uf 2.3 W/m²K",
          "Air Permeability": "Class 4",
          "Threshold Height": "Flush / 20mm raised",
        },
        image: "/brand/products/cor-vision-plus.jpg",
      },
      {
        id: "gulf-extrusion-montana",
        name: "Gulf Extrusion Montana Sliding Door",
        slug: "gulf-extrusion-montana",
        brand: "Gulf Extrusion",
        category: "aluminium-sliding-doors",
        description:
          "A locally manufactured UAE profile offered as a cost-effective sliding solution within our range. The Gulf Extrusions Montana system is engineered for durability and thermal efficiency in heavy-duty residential and commercial applications — tested to American National Standard H-HC40 for air infiltration, water penetration, sound reduction and wind resistance.",
        features: [
          "16mm fibreglass-reinforced polyamide thermal break",
          "Single frame & sash profile on all four sides",
          "Snap-on track clips for fast assembly",
          "Two, three or four sash configurations",
          "Tested to ANS H-HC40 performance standard",
        ],
        specs: {
          "Thermal Break": "16mm polyamide (fibreglass reinforced)",
          "Glass Thickness": "24mm double glazing",
          "Configurations": "2 / 3 / 4 sash",
          "Standard": "ANS H-HC40",
          "Origin": "Gulf Extrusion, UAE (est. 1976)",
        },
        image: "/brand/products/gulf-extrusion-montana.jpg",
      },
    ],
  },
  {
    id: "aluminium-bi-folding-doors",
    name: "Aluminium Bi-Folding Doors",
    slug: "aluminium-bi-folding-doors",
    tagline: "Open everything.",
    image: "/brand/categories/aluminium-bi-folding-doors.jpg",
    description:
      "Our bi-folding door systems transform walls into open vistas, connecting living spaces to gardens, terraces and pools with theatrical effect.",
    relatedBlogSlugs: ["bi-fold-vs-lift-and-slide-uae"],
    faqs: [
      {
        q: "How wide can a bi-folding door opening be?",
        a: "The Cortizo Bi-fold system accommodates openings from 1.2m up to 6m+ in a single run. Individual panel widths range from 500mm to 1,000mm. For openings wider than 6m, we configure two opposing runs that meet at a centre post or fold to one side. Maximum panel height is 2,700mm for standard configurations.",
      },
      {
        q: "Which way should bi-fold doors open — inward or outward?",
        a: "Both are possible. Outward-opening bi-folds allow the full floor area inside to remain clear, which is aesthetically preferable for living room openings onto terraces. Inward-opening folds require slightly more internal floor clearance but are better suited to locations where the fold would obstruct outdoor furniture or a pool edge. We advise at survey stage based on your specific layout.",
      },
      {
        q: "Are bi-fold doors thermally broken?",
        a: "Yes — the Cortizo Bi-fold uses polyamide thermal break bars across all sash and frame profiles, achieving a comparable thermal performance to our casement window range. This makes them suitable for air-conditioned interiors where thermal bridging at the frame is a concern.",
      },
      {
        q: "Can bi-fold doors include a traffic door for everyday use?",
        a: "Yes. Any panel in a bi-fold configuration can be designated as a traffic leaf — an independently hinged door that opens conventionally without operating the full fold. This is standard practice for kitchen and dining openings where you need frequent access without opening the full system.",
      },
    ],
    products: [
      {
        id: "cortizo-bifold",
        name: "Cortizo Bi-fold Door",
        slug: "cortizo-bifold",
        brand: "Cortizo",
        category: "aluminium-bi-folding-doors",
        description:
          "An elegant thermally broken bi-fold door in aluminium that folds completely to one or both sides, opening 90–95% of the aperture.",
        features: [
          "Top-hung track option",
          "Thermally broken profiles",
          "Dual action security locking",
          "2 to 7+ leaf configurations",
        ],
        specs: {
          "Max Opening Width": "8,000mm",
          "Max Leaf Height": "3,000mm",
          "Min Leaf Width": "600mm",
          "Max Leaf Count": "7 panels",
          "Thermal Transmittance": "Uf 2.4 W/m²K",
          "Air Permeability": "Class 3",
          "Water Tightness": "Class 4A",
          "Track Type": "Top-hung or bottom-rolling",
        },
        image: "/brand/products/cortizo-bifold.jpg",
      },
    ],
  },
  {
    id: "aluminium-windows",
    name: "Aluminium Windows",
    slug: "aluminium-windows",
    tagline: "Light. Framed perfectly.",
    image: "/brand/categories/aluminium-windows.jpg",
    description:
      "Our aluminium window collection covers every architectural requirement — from slim-sash casements to large-format tilt-and-turn, all precision-engineered for Gulf climates.",
    relatedBlogSlugs: ["choosing-aluminium-windows-dubai", "thermal-break-uae-climate", "window-ratings-standards-uae"],
    faqs: [
      {
        q: "What is a thermally broken aluminium window and why does it matter in the UAE?",
        a: "A thermally broken profile has a polyamide insulating strip inserted across the aluminium section, separating the inner and outer aluminium faces. Without a thermal break, the cold aluminium in the air-conditioned zone connects directly to the hot aluminium outside, conducting heat inward and causing condensation on the interior frame in humid periods. In the UAE, thermally broken profiles are standard across our Cortizo, Gulf Extrusions and Vetro ranges and should be specified on all villa and apartment installations.",
      },
      {
        q: "What is the difference between a casement and a hidden sash window?",
        a: "In a standard casement window, the window frame and the sash (opening light) each have their own visible aluminium profile, creating a visible inner frame line when the window is closed. In the Cortizo Cor 70 hidden sash system, the sash profile is concealed within the outer frame when closed, creating a flush, minimal-line appearance. The difference is purely visual — both perform identically in terms of weather sealing and thermal performance.",
      },
      {
        q: "Can I specify different opening types in the same window range?",
        a: "Yes — within the Cortizo Cor 70 and Gulf Extrusions TB600 families, you can mix casement, tilt-and-turn, fixed, and sliding windows using the same profile system. This means all your windows share the same frame depth, sight lines and powder-coat finish batch, giving visual consistency across the project.",
      },
      {
        q: "What glazing should I specify for a west-facing villa window in Dubai?",
        a: "For a west-facing elevation in Dubai, we recommend a double-glazed unit with a low-e solar control glass on surface 2 (inner face of the outer pane), targeting a Solar Heat Gain Coefficient (SHGC) of 0.25 or below. This is the single highest-impact measure for reducing solar gain and cooling loads. We specify the glass unit in detail at the design stage based on orientation, shading and U-value targets.",
      },
    ],
    products: [
      {
        id: "cortizo-cor-70-window",
        name: "Cortizo Cor 70 Hidden Sash",
        slug: "cortizo-cor-70-hidden-sash",
        brand: "Cortizo",
        category: "aluminium-windows",
        description:
          "A revolution in casement design — the hidden sash creates an almost frameless appearance when closed, maximising light transmission and architectural purity.",
        features: [
          "Concealed sash design",
          "70mm thermal break",
          "Tilt-only and tilt-turn operation",
          "European hardware standards",
        ],
        specs: {
          "Frame Depth": "70mm",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Max Sash Width": "1,400mm",
          "Max Sash Height": "2,400mm",
          "Air Permeability": "Class 4",
          "Water Tightness": "Class 5A",
          "Wind Resistance": "Class C5",
        },
        image: "/brand/products/cortizo-cor-70-hidden-sash.jpg",
      },
      {
        id: "cortizo-cor-70-industrial",
        name: "Cortizo Cor 70 Industrial",
        slug: "cortizo-cor-70-industrial",
        brand: "Cortizo",
        category: "aluminium-windows",
        description:
          "Heavy-duty commercial and industrial casement windows with enhanced structural performance for large openings and high-wind environments.",
        features: [
          "Reinforced profiles",
          "Large sash capability",
          "Concealed drainage",
          "Lift-out option for cleaning",
        ],
        specs: {
          "Frame Depth": "70mm",
          "Max Sash Width": "1,800mm",
          "Max Sash Height": "2,800mm",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Wind Resistance": "Class C5",
          "Air Permeability": "Class 4",
        },
        image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "cortizo-casement",
        name: "Cortizo Aluminium Casement",
        slug: "cortizo-casement",
        brand: "Cortizo",
        category: "aluminium-windows",
        description:
          "The classic Cortizo casement system, refined over decades of European manufacture. Available in side-hung, top-hung and tilt-and-turn configurations.",
        features: [
          "Side-hung, top-hung, tilt-turn",
          "Multi-point espagnolette locking",
          "Full colour customisation",
          "Double and triple glazed",
        ],
        specs: {
          "Frame Depth": "60mm",
          "Max Sash Width": "1,400mm",
          "Max Sash Height": "2,200mm",
          "Thermal Transmittance": "Uf 2.2 W/m²K",
          "Air Permeability": "Class 4",
          "Water Tightness": "Class 4A",
        },
        image: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "gulf-extrusion-tb600-window",
        name: "Gulf Extrusions TB600 Tilt & Turn",
        slug: "gulf-extrusion-tb600-tilt-and-turn",
        brand: "Gulf Extrusions",
        category: "aluminium-windows",
        description:
          "The TB600 tilt-and-turn window is engineered for UAE residential and commercial projects, offering versatile ventilation and easy cleaning in a robust, climate-rated system.",
        features: [
          "UAE climate thermal break",
          "Tilt-turn dual function",
          "Anti-corrosion finish",
          "Acoustic glass compatible",
        ],
        specs: {
          "Frame Depth": "60mm",
          "Thermal Break": "TB600 GCC-rated",
          "Max Sash Width": "1,400mm",
          "Max Sash Height": "2,000mm",
          "Air Permeability": "Class 4",
          "Water Tightness": "Class 6A",
        },
        image: "/brand/products/gulf-extrusion-tb600-tilt-and-turn.jpg",
      },
      {
        id: "aluminium-sliding-window",
        name: "Aluminium Sliding Windows",
        slug: "aluminium-sliding-windows",
        brand: "Gulf Extrusions",
        category: "aluminium-windows",
        description:
          "Space-efficient sliding windows ideal for apartments and villas, with low maintenance and high air performance.",
        features: [
          "2-track and 3-track options",
          "Night ventilation latch",
          "Integrated fly screen",
          "Powder coated finishes",
        ],
        specs: {
          "Track Configuration": "2-track or 3-track",
          "Max Sash Width": "1,500mm",
          "Max Frame Height": "2,400mm",
          "Air Permeability": "Class 2",
          "Water Tightness": "Class 3A",
          "Overlap": "50mm",
        },
        image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "vetro-casement",
        name: "Vetro Casement Windows",
        slug: "vetro-casement",
        brand: "Vetro",
        category: "aluminium-windows",
        description:
          "Ultra-slim aluminium casement windows from the Vetro range, delivering a contemporary minimal aesthetic for modern architecture.",
        features: [
          "15mm slim sightlines",
          "Tilt-only and tilt-turn",
          "RAL and anodised finishes",
          "Triple glazing ready",
        ],
        specs: {
          "Frame Depth": "65mm",
          "Central Sight Line": "15mm",
          "Max Sash Width": "1,200mm",
          "Max Sash Height": "2,400mm",
          "Thermal Transmittance": "Uf 1.8 W/m²K",
          "Air Permeability": "Class 4",
        },
        image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "cortizo-alu-steel",
        name: "Cortizo Alu-Steel Classic & Modern",
        slug: "cortizo-alu-steel",
        brand: "Cortizo",
        category: "aluminium-windows",
        description:
          "An innovative aluminium window system that mimics the classic aesthetics of slim steel windows while delivering the superior performance of modern aluminium. Create a distinctive, sophisticated look for your villa or apartment with this ultra-slim solution — available in modern and classic frame designs, with dual-colour and powder-coated finish options. High-end European profiles procured directly from Spain.",
        features: [
          "Ultra-slim steel-look sightlines (75mm modern / 100mm classic)",
          "Thermal performance to Uw 0.83 W/m²K",
          "Acoustic insulation up to 45 dB",
          "Modern & classic frame designs",
          "Dual-colour and powder-coated finishes",
        ],
        specs: {
          "Thermal Transmittance": "Uw from 0.83 W/m²K",
          "Acoustic Insulation": "up to 45 dB",
          "Max Sash Size": "1,500mm W × 2,600mm H",
          "Max Sash Weight": "160kg",
          "Polyamide Strip": "32–39mm",
          "Sightlines": "75mm modern / 100mm classic",
          "Lead Time": "10–14 weeks (procured from Spain)",
        },
        image: "/brand/products/cortizo-alu-steel.jpg",
      },
    ],
  },
  {
    id: "aluminium-doors",
    name: "Aluminium Doors",
    slug: "aluminium-doors",
    tagline: "Every entrance, engineered.",
    image: "/brand/categories/aluminium-doors.jpg",
    description:
      "From statement pivot entrance doors to thermally broken casement doors, our aluminium door collection brings architectural intent to every threshold.",
    relatedBlogSlugs: ["pivot-doors-uae", "choosing-glazing-contractor-dubai"],
    faqs: [
      {
        q: "What is the maximum size for a pivot entrance door in UAE?",
        a: "The Vetromax Pivot Door system accommodates panels up to 1,500mm wide and 4,000mm tall. For frameless all-glass pivot panels of this size, a minimum 19mm toughened laminated glass is required for structural integrity. Panels above approximately 150kg require a floor-spring pivot hardware — a floor cassette set into the structural slab — rather than an overhead concealed pivot.",
      },
      {
        q: "Do aluminium front doors comply with UAE fire and safety codes?",
        a: "Our aluminium entrance door systems comply with UAE building code requirements for residential and commercial applications. For projects in buildings requiring fire-rated door sets (FD30 or FD60), we specify dedicated fire-rated aluminium door systems with tested and certified fire-resistance credentials. We advise on the specific regulatory requirement at the design stage based on building type and floor level.",
      },
      {
        q: "Can aluminium doors be specified with biometric or smart lock hardware?",
        a: "Yes — our aluminium door systems are compatible with a range of electronic and biometric access hardware, including fingerprint readers, keypad entry, and smart lock systems that integrate with home automation platforms. We work with specialist hardware suppliers to specify the appropriate system for each project and ensure the door structure accommodates the hardware correctly.",
      },
    ],
    products: [
      {
        id: "cortizo-cor-70-door",
        name: "Cortizo Cor 70 Door",
        slug: "cortizo-cor-70-door",
        brand: "Cortizo",
        category: "aluminium-doors",
        description:
          "A high-performance casement door offering exceptional thermal performance and acoustic insulation, ideal for front entrance applications.",
        features: [
          "70mm thermal break depth",
          "Multi-point locking",
          "Low threshold option",
          "RC2 burglar resistance",
        ],
        specs: {
          "Frame Depth": "70mm",
          "Max Door Width": "1,200mm",
          "Max Door Height": "2,800mm",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Burglar Resistance": "RC2",
          "Air Permeability": "Class 4",
        },
        image: "/brand/products/cortizo-cor-70-door.jpg",
      },
      {
        id: "front-entrance-aluminium",
        name: "Aluminium Front Entrance Doors",
        slug: "front-entrance-doors",
        brand: "Cortizo",
        category: "aluminium-doors",
        description:
          "Make an architectural statement with our bespoke front entrance door collection. Panel options, glazing configurations and hardware choices are virtually unlimited.",
        features: [
          "Panelled and full-glass options",
          "Thermally broken frames",
          "3-point security locking",
          "Custom RAL powder coat finishes",
        ],
        specs: {
          "Max Door Width": "1,500mm",
          "Max Door Height": "3,500mm",
          "Security": "3-point locking",
          "Thermal Break": "Polyamide 34mm",
          "Glazing": "Double or triple IGU",
          "Finish": "Any RAL powder coat",
        },
        image: "/brand/products/front-entrance-doors.jpg",
      },
      {
        id: "gulf-extrusion-tb600-door",
        name: "Gulf Extrusions TB600 Door",
        slug: "gulf-extrusion-tb600-door",
        brand: "Gulf Extrusions",
        category: "aluminium-doors",
        description:
          "Engineered specifically for GCC climates, the TB600 door series combines thermal break technology with the durability demanded by the UAE's extreme temperatures.",
        features: [
          "GCC climate-rated thermal break",
          "High air infiltration resistance",
          "Corrosion-resistant hardware",
          "Wide colour range",
        ],
        specs: {
          "Frame Depth": "60mm",
          "Thermal Break": "TB600 GCC-rated",
          "Max Door Width": "1,200mm",
          "Max Door Height": "2,700mm",
          "Air Permeability": "Class 4",
          "Water Tightness": "Class 6A",
        },
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "vetro-pivot",
        name: "Vetromax Pivot Door",
        slug: "vetromax-pivot-door",
        brand: "Vetromax",
        category: "aluminium-doors",
        description:
          "A bold architectural statement, the Vetromax pivot door rotates on a central axis for dramatic entrance solutions up to 4 metres in height.",
        features: [
          "Central or offset pivot options",
          "Doors up to 4m height",
          "Concealed hydraulic pivot mechanism",
          "Full-glass and panel variants",
        ],
        specs: {
          "Max Door Width": "1,800mm",
          "Max Door Height": "4,000mm",
          "Max Door Weight": "600kg",
          "Pivot Options": "Central or 25% offset",
          "Mechanism": "Concealed hydraulic pivot",
          "Glazing": "Full-glass or panelled",
        },
        image: "/brand/products/vetromax-pivot-door.jpg",
      },
    ],
  },
  {
    id: "upvc",
    name: "UPVC Windows & Doors",
    slug: "upvc",
    tagline: "Low maintenance. High performance.",
    image: "/brand/categories/upvc.jpg",
    description:
      "Our uPVC/PVCu range delivers outstanding thermal and acoustic performance with minimal maintenance requirements — ideal for residential applications.",
    relatedBlogSlugs: ["upvc-vs-aluminium-windows-uae", "acoustic-glazing-dubai-noise-reduction"],
    faqs: [
      {
        q: "Is uPVC suitable for the UAE climate?",
        a: "Modern uPVC profiles manufactured for Gulf climates are UV-stabilised and formulated to withstand sustained temperatures up to 80°C without distortion. The Vetromax range we supply is specifically validated for UAE conditions. The key risk with cheaper, non-stabilised uPVC is surface yellowing and brittleness — which our systems avoid with TiO2 UV stabilisation baked into the profile compound.",
      },
      {
        q: "Is uPVC better than aluminium for soundproofing?",
        a: "uPVC frames have a slight natural acoustic advantage over aluminium because the PVC material absorbs vibration better than metal. However, the dominant factor in acoustic performance is the glass specification — a laminated glass unit with an asymmetric pane thickness is far more effective than frame material alone. In practice, a well-specified uPVC window with acoustic laminated glass can achieve 44–48 dB Rw, suitable for most Dubai residential noise environments.",
      },
      {
        q: "Do uPVC windows require painting or maintenance?",
        a: "White uPVC windows require no painting. Clean the frames with warm soapy water annually — do not use solvent-based cleaners, which can attack the surface. The hardware (hinges, handles, espagnolette locking bars) should be lubricated annually with a light machine oil. Surface scratches cannot be polished out of uPVC — very minor marks fade with UV exposure, but deep scratches remain visible. This is the main aesthetic limitation of uPVC versus powder-coated aluminium.",
      },
    ],
    products: [
      {
        id: "upvc-casement",
        name: "uPVC Casement Suite",
        slug: "upvc-casement",
        brand: "Vetromax",
        category: "upvc",
        description:
          "A comprehensive uPVC window and door suite covering casement, tilt-turn, sliding and door systems in a fully coordinated range.",
        features: [
          "5-chamber profile",
          "Steel reinforcement",
          "Multi-point locking",
          "White and colour foils",
        ],
        specs: {
          "Profile Chambers": "5-chamber",
          "Frame Depth": "70mm",
          "Thermal Transmittance": "Uf 1.3 W/m²K",
          "Acoustic Performance": "Up to 44 dB Rw",
          "Max Sash Width": "1,200mm",
          "Max Sash Height": "2,200mm",
        },
        image: "/brand/products/upvc-casement.jpg",
      },
      {
        id: "upvc-sliding",
        name: "uPVC Sliding Window & Door",
        slug: "upvc-sliding",
        brand: "Vetromax",
        category: "upvc",
        description:
          "High-performance uPVC sliding system designed for UAE climate conditions, with enhanced seals and corrosion-resistant hardware.",
        features: [
          "Anti-UV profile",
          "Multi-roller carrier",
          "Fly screen channels",
          "Weather-rated hardware",
        ],
        specs: {
          "Profile Chambers": "4-chamber",
          "Frame Depth": "65mm",
          "Thermal Transmittance": "Uf 1.5 W/m²K",
          "Max Panel Width": "3,000mm",
          "Max Panel Height": "2,500mm",
          "Track Configuration": "2-track",
        },
        image: "/brand/products/upvc-sliding.jpg",
      },
    ],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall Systems",
    slug: "curtain-wall",
    tagline: "Architecture expressed in glass.",
    image: "/brand/categories/curtain-wall.jpg",
    description:
      "Our curtain wall and facade systems transform commercial and residential buildings into architectural landmarks, delivering thermal performance and visual impact at scale.",
    relatedBlogSlugs: ["curtain-wall-glazing-uae-guide", "curtain-wall-residential", "green-building-glazing-uae"],
    faqs: [
      {
        q: "What is the difference between a stick curtain wall and a unitised system?",
        a: "A stick system is assembled on-site piece by piece — mullions and transoms are fixed to the building structure, and glass panels are installed into the completed frame. Unitised systems are manufactured off-site as pre-assembled, pre-glazed panels that are hoisted and connected to the building floor by floor. Stick systems are more economical for low-rise and medium-rise buildings. Unitised systems offer faster on-site installation and superior quality control for high-rise projects above 12–15 floors.",
      },
      {
        q: "Can curtain wall be specified for a residential villa in the UAE?",
        a: "Yes — curtain wall systems are increasingly specified for luxury UAE villas, particularly for two or three-storey feature facades. The Vetromax VF35 frameless facade system is designed specifically for this application, with minimal 35mm sight lines. A curtain wall facade on a residential villa requires careful structural engineering to ensure the building frame can accept the lateral loads from a full-height glazed elevation.",
      },
      {
        q: "What U-value does UAE curtain wall need to achieve?",
        a: "ASHRAE 90.1 as adopted by Dubai Municipality requires a maximum fenestration U-value of 3.3 W/m²K for commercial buildings in Climate Zone 1B (Dubai). Our Cortizo TP52 and Gulf Extrusions CW50 systems achieve Uf values of 2.0–2.3 W/m²K, with overall Uw values of 1.6–2.0 W/m²K depending on the glass specification — comfortably meeting code. For buildings targeting a Estidama Pearl or LEED credit, we can specify enhanced thermal performance systems on request.",
      },
    ],
    products: [
      {
        id: "cortizo-tp52",
        name: "Cortizo TP52 Curtain Wall",
        slug: "cortizo-tp52",
        brand: "Cortizo",
        category: "curtain-wall",
        description:
          "A 52mm stick system curtain wall delivering outstanding structural performance and thermal efficiency for mid-to-high-rise applications.",
        features: [
          "52mm face width",
          "Pressure equalised design",
          "Natural and drained cavity",
          "Shadow box and spandrel options",
        ],
        specs: {
          "Face Width": "52mm",
          "Wind Load Resistance": "+/-4.0 kPa",
          "Water Tightness": "750 Pa",
          "Air Permeability": "Class A3",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Build Method": "Stick system",
        },
        image: "/brand/products/cortizo-tp52.jpg",
      },
      {
        id: "cortizo-tp52-equity",
        name: "Cortizo TP52 Equity",
        slug: "cortizo-tp52-equity",
        brand: "Cortizo",
        category: "curtain-wall",
        description:
          "The premium Equity version of the TP52 system features enhanced thermal performance and design flexibility for prestige developments.",
        features: [
          "Enhanced thermal break",
          "Opaque and vision panels",
          "Unitised and stick build options",
          "Custom profile finishes",
        ],
        specs: {
          "Face Width": "52mm",
          "Thermal Break": "Enhanced polyamide",
          "Wind Load Resistance": "+/-4.5 kPa",
          "Water Tightness": "900 Pa",
          "Thermal Transmittance": "Uf 1.7 W/m²K",
          "Build Method": "Stick or unitised",
        },
        image: "/brand/products/cortizo-tp52-equity.jpg",
      },
      {
        id: "gulf-extrusion-cw50",
        name: "Gulf Extrusions CW 50mm",
        slug: "gulf-extrusion-cw-50",
        brand: "Gulf Extrusions",
        category: "curtain-wall",
        description:
          "Designed and tested for Gulf region projects, the CW 50mm system delivers structural reliability, thermal control and clean aesthetics for UAE-scale developments.",
        features: [
          "50mm face width",
          "GCC climate certified",
          "Natural drainage system",
          "Compatible with structural glazing",
        ],
        specs: {
          "Face Width": "50mm",
          "Wind Load Resistance": "+/-3.5 kPa",
          "Water Tightness": "600 Pa",
          "Thermal Break": "GCC climate-rated",
          "Drainage": "Natural cavity drain",
          "Glazing Compatibility": "Structural glazing ready",
        },
        image: "/brand/products/gulf-extrusion-cw-50.jpg",
      },
      {
        id: "vetromax-vf35",
        name: "Vetromax VF35 Facade",
        slug: "vetromax-vf35",
        brand: "Vetromax",
        category: "curtain-wall",
        description:
          "The VF35 structural glazing facade system achieves a near-invisible frame, allowing the glass to become the architectural statement.",
        features: [
          "35mm minimal face",
          "Structural silicone bonding",
          "Flush external surface",
          "Opaque band decoration",
        ],
        specs: {
          "Face Width": "35mm",
          "Bonding": "Structural silicone",
          "Wind Load Resistance": "+/-3.0 kPa",
          "Water Tightness": "500 Pa",
          "External Surface": "Flush glass-to-glass",
          "Glazing": "Vision and opaque panels",
        },
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "garden-rooms",
    name: "Garden Rooms",
    slug: "garden-rooms",
    tagline: "Outdoor living, elevated.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    description:
      "Our premium glass garden rooms and conservatories create year-round outdoor living spaces that seamlessly integrate with UAE architecture.",
    relatedBlogSlugs: ["garden-rooms-uae"],
    faqs: [
      {
        q: "Does a garden room in the UAE require a building permit?",
        a: "Whether a planning permit is required depends on the plot size, the size of the structure, and the community master plan. In many Dubai freehold villa communities (DAMAC, Arabian Ranches, Dubai Hills, etc.), a No Objection Certificate from the master developer is required before work commences. We advise on the regulatory position for your specific community at survey stage and can assist with the NOC application process.",
      },
      {
        q: "Can a garden room or conservatory be used year-round in the UAE climate?",
        a: "Yes — with proper specification. A glass structure in the UAE must include solar control low-e glazing, adequate insulation in the roof panel, and integrated air conditioning. Our Premium Garden Room systems are designed with UAE conditions at their core: the roof is thermally broken aluminium with insulated polycarbonate or glass, the frames are powder-coated to withstand UV, and we specify the A/C capacity at design stage. The result is a room that is comfortable from October to April in natural ventilation, and in summer months with the A/C running.",
      },
      {
        q: "How long does it take to build a garden room?",
        a: "From survey to installation, a standard 20–40 sqm garden room takes 8–12 weeks. This includes survey, structural design, manufacture, foundation preparation and installation. The installation itself typically takes 3–5 days for the structure, followed by glazing and finishing. We co-ordinate all trades — foundation, glazing, A/C, electrical — through a single project manager.",
      },
      {
        q: "What happens to a garden room during shamal (sandstorm) conditions?",
        a: "Our garden rooms are designed to UAE wind load requirements. In shamal conditions, close all ventilation panels and openings. The insulated aluminium roof structure and thermally broken glazed walls are rated for wind loads appropriate to Dubai and Abu Dhabi. The powder-coat finish on all aluminium surfaces is resistant to sand abrasion at normal sandstorm particle concentrations.",
      },
    ],
    products: [
      {
        id: "garden-room-premium",
        name: "Premium Garden Room",
        slug: "premium-garden-room",
        brand: "Cortizo",
        category: "garden-rooms",
        description:
          "A fully bespoke glass garden room solution, designed for UAE villas and townhouses. Floor-to-ceiling glazing, roof lights and integrated ventilation.",
        features: [
          "Fully bespoke design",
          "Roof light options",
          "Integrated ventilation",
          "Insulated glazing",
        ],
        specs: {
          "Min Footprint": "2,400mm × 2,400mm",
          "Max Span": "10,000mm × 8,000mm",
          "Roof Glazing": "28mm solar control IGU",
          "Frame Material": "Thermally broken aluminium",
          "Finish": "Any RAL powder coat",
          "Lead Time": "6–10 weeks",
        },
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "glass-conservatory",
        name: "Glass Conservatory",
        slug: "glass-conservatory",
        brand: "Cortizo",
        category: "garden-rooms",
        description:
          "Victorian and contemporary conservatory structures crafted in aluminium with low-maintenance longevity and architectural detail.",
        features: [
          "Victorian, Edwardian and lean-to styles",
          "Polycarbonate and glass roof options",
          "Thermally broken frames",
          "Integrated blinds",
        ],
        specs: {
          "Roof Options": "Polycarbonate or glass",
          "Max Roof Pitch": "35°",
          "Frame Material": "Thermally broken aluminium",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Styles": "Victorian, Edwardian, lean-to",
          "Blinds": "Integrated cassette blinds available",
        },
        image: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "insect-screens",
    name: "Insect Screens",
    slug: "insect-screens",
    tagline: "Open without compromise.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    description:
      "Our insect screen range integrates invisibly with window and door systems, allowing full ventilation without unwanted guests.",
    relatedBlogSlugs: ["insect-screens-retractable-uae"],
    faqs: [
      {
        q: "Do retractable screens work on large bi-fold or lift-and-slide door openings?",
        a: "Yes. Retractable screen systems are available in single-run widths up to 3m, and can be configured in opposing pairs for bi-fold openings up to 6m+. For a 4m lift-and-slide door, we typically specify a two-panel retractable system that meets in the centre when deployed. The cassettes are surface-mounted to the door frame reveal and are barely visible when retracted.",
      },
      {
        q: "Which insects do retractable screens keep out in the UAE?",
        a: "Standard 18×16 fibreglass mesh screens are effective against mosquitoes, flies, and midges — the primary pests during the ventilation months (October to April). They do not filter fine sand or dust particles, which require the windows to be closed during shamal events. For properties near standing water or irrigation areas, we recommend finer 20×20 mesh for improved mosquito exclusion.",
      },
      {
        q: "Can insect screens be fitted to existing windows and doors?",
        a: "In most cases, yes. Retractable screen cassettes can be surface-mounted to the existing frame reveal without removing or modifying the window or door. We require minimum reveals of 25–30mm for the cassette mount. Our team assesses compatibility at the site survey — most aluminium and uPVC systems are straightforward to retrofit.",
      },
    ],
    products: [
      {
        id: "retractable-screen",
        name: "Retractable Fly Screen",
        slug: "retractable-fly-screen",
        brand: "Gulf Extrusions",
        category: "insect-screens",
        description:
          "Cassette-housed retractable screens that disappear completely when not needed, preserving the visual clarity of aluminium windows.",
        features: [
          "Concealed cassette housing",
          "Fiberglass and aluminium mesh options",
          "Matching powder coat finish",
          "Side-slide and pleated types",
        ],
        specs: {
          "Mesh Options": "Fibreglass or aluminium",
          "Max Width": "2,500mm",
          "Max Height": "2,800mm",
          "Cassette Depth": "45mm",
          "Types": "Side-slide or pleated",
          "Finish": "Matching powder coat",
        },
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "skylights",
    name: "Skylights & Rooflights",
    slug: "skylights",
    tagline: "Bring the sky inside.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    description:
      "From fixed pyramid rooflights to motorised opening skylights, our range brings natural light deep into interiors while maintaining weathertight performance.",
    relatedBlogSlugs: ["skylights-rooflights-uae-guide"],
    faqs: [
      {
        q: "Do skylights overheat an interior in the UAE summer?",
        a: "Without the right glass specification, yes — a clear glass skylight adds enormous solar heat gain in summer months. All Swiftrooms skylights are specified with solar control laminated glass as standard, achieving an SHGC below 0.35. Combined with ventilation features (available on our motorised range), properly specified skylights add daylight to interiors without a proportionate increase in cooling load. We calculate the solar gain contribution at specification stage for each project.",
      },
      {
        q: "Can I install a skylight on an existing flat roof in Dubai?",
        a: "Yes, in most cases. A flat roof installation requires a minimum curb height (typically 150mm above the finished roof level) to prevent water ingress, and the roof structure must be capable of accepting the rooflight dead load plus wind uplift. Our team surveys the existing roof structure at the design stage. UAE concrete flat roofs are generally straightforward to adapt — timber or lightweight steel roof structures require more careful structural assessment.",
      },
      {
        q: "What is the difference between a fixed and motorised skylight?",
        a: "A fixed rooflight is glazed shut and provides light only — no ventilation. A motorised opening skylight incorporates an electric actuator that opens the sash to provide natural ventilation in addition to light. The Swiftrooms motorised range includes rain sensors that close the sash automatically, and can be integrated with building management systems or controlled by a smartphone app. For UAE conditions, motorisation is most useful in the cooler months (November to March) when natural ventilation is comfortable.",
      },
    ],
    products: [
      {
        id: "fixed-rooflight",
        name: "Fixed Rooflight",
        slug: "fixed-rooflight",
        brand: "Cortizo",
        category: "skylights",
        description:
          "Thermally broken aluminium fixed rooflights, precision-engineered to deliver maximum light while maintaining thermal performance.",
        features: [
          "Flat, pitched and pyramid forms",
          "Anti-glare and solar control glass",
          "Up to 8m² clear span",
          "Condensation drainage",
        ],
        specs: {
          "Max Clear Span": "8,000mm",
          "Glazing": "Solar control laminated IGU",
          "Frame Depth": "52mm",
          "Thermal Transmittance": "Uf 2.0 W/m²K",
          "Pitch Options": "Flat, pitched, pyramid",
          "Drainage": "Internal condensation channel",
        },
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "motorised-skylight",
        name: "Motorised Opening Skylight",
        slug: "motorised-skylight",
        brand: "Cortizo",
        category: "skylights",
        description:
          "Electronically operated roof windows with rain sensors and smart-home integration for effortless ventilation.",
        features: [
          "Rain-sensing auto-close",
          "Smart home compatible",
          "Remote and app operation",
          "Acoustic glass options",
        ],
        specs: {
          "Max Clear Span": "4,000mm",
          "Drive": "24V tubular motor",
          "Rain Sensor": "Included",
          "Smart Home": "KNX / RF compatible",
          "Opening Angle": "Up to 30°",
          "Glazing": "Solar control laminated",
        },
        image: "https://images.unsplash.com/photo-1525438160292-a4a860951216?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

// ─── Portfolio ──────────────────────────────────────────────────────────────

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "al-barari",
    name: "Al Barari Villa",
    slug: "al-barari",
    location: "Al Barari, Dubai",
    area: "750 m²",
    year: "2023",
    type: "Residential Villa",
    description:
      "A complete fenestration package for a premium Al Barari villa, featuring floor-to-ceiling Cor Vision Plus lift-and-slide doors opening onto a private lagoon pool, and Cortizo Cor 70 hidden sash windows throughout all upper floors.",
    products: ["Cor Vision Plus", "Cortizo Cor 70 Hidden Sash", "Premium Rooflight"],
    tags: ["Villa", "Cortizo", "Dubai", "Residential"],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    brief: "A premium villa fenestration package for a high-end Al Barari residence, requiring a seamless visual and physical connection between the internal living spaces and the private lagoon pool garden.",
    challenge: "The client required uninterrupted glass walls at ground level facing a private lagoon pool, with no visible thresholds or frame intrusion. Standard sliding systems could not achieve the flush floor finish required, and the UAE summer heat load demanded thermally broken performance throughout.",
    solution: "We installed Cor Vision Plus lift-and-slide systems across the entire rear elevation with flush recessed threshold — creating a barrier-free, frame-free connection to the pool terrace. Cortizo Cor 70 hidden sash windows across all upper floors maximised light while maintaining clean external elevations, with a premium rooflight above the central hallway completing the natural light strategy.",
    outcome: "The client achieved the glass-to-garden connection originally seen in European architecture. Installation completed in 8 weeks alongside the interior fit-out programme without disruption. The property was subsequently featured in a Dubai lifestyle publication.",
  },
  {
    id: "brookfields-damac-hills",
    name: "Brookfields, Damac Hills",
    slug: "brookfields-damac-hills",
    location: "Damac Hills, Dubai",
    area: "620 m²",
    year: "2023",
    type: "Residential Villa",
    description:
      "A complete renovation of a Damac Hills villa featuring Cor Vision 4700 lift-and-slide doors, Cortizo casement windows and a bespoke garden room addition facing the golf course.",
    products: ["Cor Vision 4700", "Cortizo Casement", "Garden Room"],
    tags: ["Villa", "Renovation", "Damac Hills", "Cortizo"],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    brief: "A full renovation fenestration package for a Damac Hills villa, with the client seeking to upgrade performance and add a new year-round garden room overlooking the golf course.",
    challenge: "Existing frames were thermally unbroken single-skin aluminium, conducting heat year-round and causing significant air conditioning load. The client also wanted to maximise the golf course view with a new structure — without overshadowing the existing villa architecture.",
    solution: "All existing ground floor openings replaced with Cor Vision 4700 lift-and-slide systems for performance and acoustic quality. A bespoke garden room structure was designed and built facing the golf course, finished in matching Cortizo profiles with a thermally broken roof system and integrated ventilation.",
    outcome: "Energy consumption from cooling reduced significantly post-installation. The garden room became the client's primary entertaining and dining space throughout the cooler months. The client's architect subsequently referred two further projects to Swiftrooms.",
  },
  {
    id: "phoenix-damac-hills",
    name: "Phoenix, Damac Hills",
    slug: "phoenix-damac-hills",
    location: "Damac Hills, Dubai",
    area: "480 m²",
    year: "2022",
    type: "Residential Villa",
    description:
      "A full window and door replacement project in the Phoenix cluster, using Gulf Extrusions TB600 series windows throughout the property for enhanced thermal performance.",
    products: ["Gulf Extrusions TB600 Window", "Gulf Extrusions TB600 Door"],
    tags: ["Villa", "Gulf Extrusions", "Damac Hills"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    brief: "Full window and door replacement for a Phoenix cluster villa where the client's primary requirement was significant improvement in thermal performance within a defined budget.",
    challenge: "The budget brief demanded high thermal performance without the premium cost of a full Cortizo specification across all openings. A solution was needed that delivered genuine climate performance while remaining financially viable.",
    solution: "We specified Gulf Extrusions TB600 throughout — a UAE-engineered thermal break system developed specifically for GCC climate conditions, offering comparable thermal performance to European systems at a more accessible price point. All 24 openings were replaced over a 6-week programme.",
    outcome: "The client reported a measurable reduction in summer cooling costs following installation. The project demonstrated that premium thermal performance is achievable across multiple budget levels within the Swiftrooms product range.",
  },
  {
    id: "emirates-hills",
    name: "Emirates Hills",
    slug: "emirates-hills",
    location: "Emirates Hills, Dubai",
    area: "900 m²",
    year: "2023",
    type: "Luxury Villa",
    description:
      "One of our most prestigious residential commissions — a complete glazing overhaul of an Emirates Hills mansion featuring Cor Vision 4700 sliding doors on every elevation, a floor-to-ceiling curtain wall entrance hall and motorised skylights.",
    products: ["Cor Vision 4700", "Cortizo TP52 Curtain Wall", "Motorised Skylight"],
    tags: ["Luxury Villa", "Cortizo", "Emirates Hills", "Curtain Wall"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    brief: "Complete glazing overhaul of one of Emirates Hills' most significant properties — a 900m² mansion requiring distinct glazing solutions across multiple architectural zones while maintaining a unified design language throughout.",
    challenge: "The property's architecture presented three distinct glazing challenges: a dramatic 8-metre entrance hall requiring structural curtain wall; a pool terrace requiring the largest available sliding door panels; and upper bedrooms requiring acoustic performance above the standard specification.",
    solution: "Cortizo TP52 curtain wall was installed floor-to-ceiling in the entrance hall, creating a glass lobby experience. Cor Vision 4700 doors — the largest panels in the Cortizo range — were installed across the pool elevation. Motorised skylights above the central staircase completed the natural light strategy.",
    outcome: "The most complex residential project in Swiftrooms' portfolio that year. Delivered on schedule within a 16-week programme. The completed property was photographed for a UAE architectural publication and became a reference project in our showroom.",
  },
  {
    id: "palm-jumeirah",
    name: "Palm Jumeirah",
    slug: "palm-jumeirah",
    location: "Palm Jumeirah, Dubai",
    area: "550 m²",
    year: "2022",
    type: "Luxury Apartment",
    description:
      "A high-floor Palm Jumeirah apartment featuring floor-to-ceiling Cor Vision Plus doors opening onto a private sea-view terrace, with slimline Cortizo casement windows providing natural ventilation.",
    products: ["Cor Vision Plus", "Cortizo Casement"],
    tags: ["Apartment", "Palm Jumeirah", "Cortizo"],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    brief: "High-floor apartment specification on the Palm Jumeirah requiring maximum glass area for unobstructed sea views, while meeting the structural wind load requirements of a high-rise coastal environment.",
    challenge: "Wind loads and salt air exposure at height demanded systems with enhanced weather sealing and corrosion-resistant hardware. Standard residential-grade systems are not rated for high-rise coastal wind conditions. Building management also required coordinated access and installation protocols.",
    solution: "Cor Vision Plus floor-to-ceiling sliding doors were specified with a pressure-equalised track system rated for high-rise wind loads. Slimline Cortizo casement windows provided natural ventilation while maintaining the minimal frame aesthetic. Installation was coordinated with the building's facilities team across a phased 4-week programme.",
    outcome: "The client described the finished apartment as a transformed space. The property subsequently achieved a rental premium above comparable units in the building, which the letting agent attributed directly to the glazing specification.",
  },
  {
    id: "jumeirah-village-triangle",
    name: "Jumeirah Village Triangle",
    slug: "jumeirah-village-triangle",
    location: "JVT District 5, Dubai",
    area: "340 m²",
    year: "2023",
    type: "Townhouse",
    description:
      "A contemporary townhouse in Jumeirah Village Triangle receiving Cor Vision 4600 lift-and-slide doors to the ground floor, and Gulf Extrusions TB600 tilt-and-turn windows to all upper levels.",
    products: ["Cor Vision 4600", "Gulf Extrusions TB600 Window"],
    tags: ["Townhouse", "JVT", "Cortizo", "Gulf Extrusions"],
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    brief: "Fenestration package for a JVT townhouse where the client required premium aesthetics at ground floor level — the primary living and entertaining zone — while managing costs across the upper residential floors.",
    challenge: "The brief required a tiered specification strategy: premium lift-and-slide at ground level for visual impact and functionality, combined with a cost-effective but thermally competent system for upper-floor windows where detailed view is less critical.",
    solution: "Cor Vision 4600 lift-and-slide doors installed to all ground floor openings, providing the premium aesthetic and barrier-free indoor-outdoor connection. Gulf Extrusions TB600 tilt-and-turn windows specified throughout upper floors — a logical pairing that delivers thermal performance on both levels within the overall budget.",
    outcome: "Client achieved the premium ground floor specification they had prioritised, within the overall project budget. Full installation completed in 7 weeks with no disruption to the family who remained in residence throughout.",
  },
  {
    id: "centro-the-villas",
    name: "Centro The Villas",
    slug: "centro-the-villas",
    location: "Dubai",
    area: "410 m²",
    year: "2022",
    type: "Residential Villa",
    description:
      "Bi-fold and sliding door installation across a newly built Centro villa, creating open-plan living with wide garden access via Cortizo bi-fold doors and Cor Vision Plus sliding systems.",
    products: ["Cortizo Bi-fold", "Cor Vision Plus"],
    tags: ["Villa", "Dubai", "Cortizo", "Bi-fold"],
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    brief: "Open-plan living specification for a new-build Centro villa, with the client's primary objective being the complete visual and physical opening of the ground floor to the garden.",
    challenge: "The ground floor plan featured a 9-metre aperture across the main living room — wider than a standard bi-fold system could span cleanly in a single run. The adjacent dining room also required a solution, creating a multi-system coordination challenge.",
    solution: "Cortizo bi-fold system folding to both sides was installed across the full 9-metre aperture, supplemented by Cor Vision Plus sliding doors on the adjacent dining room elevation. Both systems finished in the same coordinated powder coat, creating a unified outdoor connection across the full rear facade.",
    outcome: "The ground floor of the villa opens fully in under 30 seconds. The client's effective entertaining space doubled. The project was referenced in the developer's show home tour as a specification example.",
  },
  {
    id: "montys-golf-course",
    name: "Monty's Golf Course",
    slug: "montys-golf-course",
    location: "Dubai",
    area: "1,200 m²",
    year: "2023",
    type: "Commercial",
    description:
      "A large-scale commercial curtain wall and window project for the Monty's Golf Course clubhouse, featuring Gulf Extrusions CW50 curtain wall facade and TB600 commercial windows throughout the facility.",
    products: ["Gulf Extrusions CW 50mm", "Gulf Extrusions TB600 Window"],
    tags: ["Commercial", "Curtain Wall", "Golf Course", "Gulf Extrusions"],
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    brief: "Large-scale commercial curtain wall and window package for the Monty's Golf Course clubhouse facility, requiring a prestigious facade treatment that conveyed the club's brand while meeting commercial performance standards.",
    challenge: "The project required structural glazing across a large primary facade span on a tight commercial construction contract timeline. Budget control was essential, and the specification needed to meet UAE commercial building regulations for wind and water performance.",
    solution: "Gulf Extrusions CW50 curtain wall system was installed across the primary clubhouse facade — a GCC-rated system with the structural credentials for commercial applications. TB600 commercial windows were specified for ancillary spaces. All glazed to tinted solar glass to manage the western sun exposure.",
    outcome: "Installation delivered on programme to the construction contract deadline. The curtain wall facade became a design feature of the clubhouse and was incorporated into the club's marketing photography. The project is now referenced as a commercial case study in the Swiftrooms showroom.",
  },
  {
    id: "padel-x",
    name: "Padel X Project",
    slug: "padel-x",
    location: "Dubai",
    area: "600 m²",
    year: "2023",
    type: "Commercial / Sports",
    description:
      "Specialist glazing installation for a premier Dubai padel tennis facility, with toughened safety glass panels and aluminium framing throughout the playing courts.",
    products: ["Cortizo TP52", "Aluminium Framing"],
    tags: ["Commercial", "Sports", "Dubai"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    brief: "Specialist glazing for a new premium padel tennis facility in Dubai, requiring court perimeter glass panels that met the specific impact, safety and visual clarity requirements of professional padel construction.",
    challenge: "Padel court glass must meet strict ball-impact safety standards while remaining optically clear for spectator viewing. Standard architectural glass specifications are not appropriate. The timeline was fixed to the facility's opening date with no float.",
    solution: "Cortizo TP52 aluminium framing with 12mm toughened safety glass panels to all court perimeters. Anti-glare glass specified for overhead sections to control the Dubai sun without compromising internal court light levels. All panels were pre-fabricated and delivered in a coordinated sequence to minimise on-site installation time.",
    outcome: "Courts opened on programme to the facility's planned launch date. Glass panels have performed without incident through the first competitive season. The facility is now one of Dubai's premier padel venues.",
  },
  {
    id: "the-springs",
    name: "The Springs",
    slug: "the-springs",
    location: "The Springs, Dubai",
    area: "280 m²",
    year: "2022",
    type: "Residential Villa",
    description:
      "A sensitive window replacement project in The Springs community, retaining the architectural character while upgrading to thermally broken aluminium systems.",
    products: ["Cortizo Casement", "uPVC Casement"],
    tags: ["Villa", "The Springs", "Dubai", "Renovation"],
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
    brief: "Sensitive window replacement in The Springs, a community with strict architectural guidelines governing external appearance. The client required upgraded thermal performance without any visible change to the villa's facade character.",
    challenge: "The Springs community architectural guidelines restrict changes to external frame appearance, colour and profile dimensions. Any replacement had to be dimensionally equivalent to the original specification. The community also required a formal approval process before works could commence.",
    solution: "Like-for-like dimensional replacement using Cortizo casement windows matched to the original frame sizes. uPVC systems were used at back-of-house positions where thermal performance was prioritised and elevation visibility was minimal. Colour matching to the original frames was achieved through custom powder coat specification.",
    outcome: "Municipality and community management approval was obtained without objection. Installation completed without any architectural committee challenge. The client's feedback indicated that neighbours were unable to identify that replacement had taken place — the highest possible benchmark for this project type.",
  },
  {
    id: "victory-heights",
    name: "Victory Heights, Sports City",
    slug: "victory-heights",
    location: "Sports City, Dubai",
    area: "360 m²",
    year: "2023",
    type: "Residential Villa",
    description:
      "Complete window and door package for a Sports City villa, with Cortizo Cor 70 hidden sash windows and Gulf Extrusions TB600 entrance doors delivering a clean contemporary aesthetic.",
    products: ["Cortizo Cor 70 Hidden Sash", "Gulf Extrusions TB600 Door"],
    tags: ["Villa", "Sports City", "Cortizo", "Gulf Extrusions"],
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    brief: "Full window and door package for a Sports City villa where the client's primary design requirement was minimal visible framing — a contemporary aesthetic achieved through the hidden sash technology of the Cortizo Cor 70 system.",
    challenge: "The property was to be placed on the rental market following renovation, requiring a specification that maximised visual appeal for a broad tenant demographic while delivering genuine thermal performance for long-term tenancy satisfaction.",
    solution: "Cortizo Cor 70 hidden sash windows were installed across all elevations — the concealed sash design creates an almost frameless appearance when the windows are closed. Gulf Extrusions TB600 entrance doors finished in RAL 7016 anthracite provided a strong architectural front elevation statement.",
    outcome: "The property was listed on the rental market at a premium above comparable villas in the Victory Heights community. The letting agent cited the glazing specification and front door design as key differentiators. The property was let within two weeks of listing.",
  },
  {
    id: "arabian-ranches",
    name: "Arabian Ranches",
    slug: "arabian-ranches",
    location: "Arabian Ranches, Dubai",
    area: "430 m²",
    year: "2022",
    type: "Residential Villa",
    description:
      "Full fenestration replacement for a Palmara 2 villa in Arabian Ranches, featuring Cor Vision 4600 doors, Cortizo casement windows and a bespoke rooflight installation.",
    products: ["Cor Vision 4600", "Cortizo Casement", "Fixed Rooflight"],
    tags: ["Villa", "Arabian Ranches", "Cortizo"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    brief: "Full fenestration replacement for an Arabian Ranches villa spanning sliding doors, casement windows and a feature rooflight — all requiring coordination of a unified specification across three distinct product types.",
    challenge: "The project required three different product types from the Cortizo range to work together visually and technically within the same architectural envelope. Coordinating manufacture, delivery and installation sequencing across a large villa without disruption to the family was the primary logistical challenge.",
    solution: "Cor Vision 4600 lift-and-slide doors to all main ground floor openings; Cortizo casement windows to all upper floor and bedroom openings; a bespoke fixed pyramid rooflight above the entrance hallway. All finished in a coordinated RAL powder coat selected to complement the villa's external render colour.",
    outcome: "Full installation completed in 10 weeks across a phased programme. The rooflight transformed the entrance hallway from the property's darkest point to its brightest. The client subsequently referred two neighbouring Palmara properties to Swiftrooms.",
  },
  {
    id: "glass-room-abu-dhabi",
    name: "Glass Room, Abu Dhabi",
    slug: "glass-room-abu-dhabi",
    location: "Abu Dhabi",
    area: "85 m²",
    year: "2023",
    type: "Garden Room",
    description:
      "A bespoke glass garden room and conservatory addition to an Abu Dhabi villa, creating a year-round outdoor living space with integrated ventilation and solar glass.",
    products: ["Premium Garden Room", "Glass Conservatory"],
    tags: ["Garden Room", "Abu Dhabi", "Conservatory"],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    brief: "A bespoke garden room addition to an Abu Dhabi villa, with the specific brief of creating a usable, comfortable outdoor living space that could be occupied year-round — including through the Abu Dhabi summer.",
    challenge: "Abu Dhabi summer temperatures make a standard conservatory or glass room uninhabitable for 5 months of the year without significant climate engineering. The challenge was to design a glass room that was both visually open and thermally manageable without visible mechanical systems dominating the space.",
    solution: "Full insulated glazing with low-e solar control glass significantly reduced solar heat gain. Integrated ceiling ventilation was concealed within the frame system. The roof structure incorporated a high-performance insulated panel between the glass elements to limit direct overhead heat gain while maintaining natural light diffusion.",
    outcome: "The client now uses the garden room as the primary family dining area year-round. In their words: 'We use it every day — even in July.' The project has become our primary reference case for garden room feasibility in Abu Dhabi's climate.",
  },
  {
    id: "phileas-fogg",
    name: "Phileas Fogg",
    slug: "phileas-fogg",
    location: "Dubai",
    area: "180 m²",
    year: "2024",
    type: "Hospitality / Commercial",
    description:
      "A bespoke retractable glass frontage and interior structural glazing for a boutique Dubai dining venue, creating a dramatic street-facing installation that operates as both a signature design feature and a functional climate control system.",
    products: ["Cor Vision Plus", "Vetromax VF35 Facade"],
    tags: ["Commercial", "Hospitality", "Dubai", "Structural Glazing"],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    brief: "A boutique Dubai dining venue required a dramatic street-facing glass frontage that could open completely for al fresco dining during cooler months while providing full climate enclosure year-round — becoming a signature visual identity for the restaurant.",
    challenge: "The frontage needed to operate as both a fully closed climate-controlled facade and a completely retractable open wall, across a 12-metre street frontage. Standard hospitality glazing solutions do not achieve this span without intermediate mullions that would compromise the visual impact.",
    solution: "A motorised Cor Vision Plus retractable sliding system was specified across the full 12-metre frontage, operating without intermediate mullions via a stacking configuration. The internal wine room partition was executed in Vetromax VF35 structural glazing, maintaining visual depth and a sense of architectural layering from the street.",
    outcome: "The venue opened to significant press attention. The retractable glass frontage became a signature feature referenced in every restaurant review. The system has operated without fault across two full seasons of Dubai's cooler outdoor dining months.",
  },
  {
    id: "jumeirah-islands-villa",
    name: "Jumeirah Islands Villa",
    slug: "jumeirah-islands-villa",
    location: "Jumeirah Islands, Dubai",
    area: "890 m²",
    year: "2025",
    type: "Residential Villa",
    description:
      "A panoramic full-villa glazing package for a signature Jumeirah Islands mansion, featuring Cor Vision Plus flush-threshold sliding walls across the pool elevation and Vetromax VF35 frameless glazing on the covered terrace.",
    products: ["Cor Vision Plus", "Vetromax VF35 Facade", "Cortizo Cor 70 Hidden Sash", "Motorised Skylight"],
    tags: ["Villa", "Cortizo", "Vetromax", "Dubai", "Residential", "Luxury"],
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    brief: "The client required a complete glazing overhaul of a large Jumeirah Islands villa, with the primary objective of creating unobstructed visual connection between the main living volume and the private lake-facing pool terrace — a connection that the original builder-grade sliding doors completely failed to deliver.",
    challenge: "The rear elevation spanned 18 metres at ground level, including a corner transition that required structural coordination with the existing masonry. The client insisted on no visible threshold — the internal marble floor was to flow continuously to the pool deck — and on Cor Vision Plus meeting the acoustic performance required for a property facing the communal waterway.",
    solution: "Cor Vision Plus flush-threshold lift-and-slide systems were installed across the full 18-metre rear elevation, including a structural corner junction detail developed with the client's structural engineer. The covered terrace was enclosed with Vetromax VF35 frameless glazing, maintaining the visual openness of the outdoor space while providing full weather protection. Cortizo Cor 70 hidden sash windows throughout the upper floors, and two motorised rooflights over the central atrium, completed the natural light strategy.",
    outcome: "The villa transformation was completed in 11 weeks. The flush threshold detail, the first Swiftrooms had executed at this scale, was validated by the client's interior designer as architecturally seamless. The property's value was subsequently appraised significantly above comparable Jumeirah Islands villas without equivalent glazing.",
  },
  {
    id: "saadiyat-island-villa",
    name: "Saadiyat Island Villa",
    slug: "saadiyat-island-villa",
    location: "Saadiyat Island, Abu Dhabi",
    area: "1,100 m²",
    year: "2025",
    type: "Residential Villa",
    description:
      "A whole-envelope glazing commission on a landmark Saadiyat Island villa — including a triple-height curtain wall atrium, full-width Cor Vision Plus rear elevation and a retractable motorised skylight over the central staircase.",
    products: ["Cortizo TP52 Curtain Wall", "Cor Vision Plus", "Motorised Skylight", "Cortizo Cor 70 Hidden Sash"],
    tags: ["Villa", "Cortizo", "Curtain Wall", "Abu Dhabi", "Residential", "Luxury"],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    brief: "A private client on Saadiyat Island commissioned a full glazing overhaul for a recently completed villa shell. The brief centred on three key elements: a dramatic triple-height glazed atrium over the main entrance hall, an unobstructed rear elevation opening to the landscaped garden and pool, and a motorised skylight above the central staircase to introduce natural light to the heart of the building.",
    challenge: "The curtain wall atrium presented the primary structural and specification challenge. At 11 metres in height, the TP52 system required a bespoke intermediate pressure plate detail to manage the thermal and wind load requirements without visible fixings. Coordinating the three interconnected systems — curtain wall, lift-and-slide and rooflight — while maintaining a consistent glass specification across all three was the central design exercise.",
    solution: "Cortizo TP52 curtain wall was used for the full atrium, with hidden pressure plates and structural silicone joints for a seamless visual result. The rear elevation was glazed with four-panel Cor Vision Plus lift-and-slide systems, flush to the internal finish level. A 2.4m × 1.8m motorised rooflight with solar-control glass and an integrated blind was installed over the staircase void. All three systems were specified with matching solar control glass to ensure a consistent external appearance across the full envelope.",
    outcome: "The project was delivered in 14 weeks from contract to handover. The triple-height curtain wall atrium became the architectural centrepiece of the villa, with multiple visits from other Saadiyat Island homeowners who subsequently commissioned Swiftrooms for their own projects.",
  },
  {
    id: "al-majaz-waterfront-villa",
    name: "Al Majaz Waterfront Villa",
    slug: "al-majaz-waterfront-villa",
    location: "Al Majaz, Sharjah",
    area: "620 m²",
    year: "2024",
    type: "Residential Villa",
    description:
      "A waterfront villa on the Sharjah Corniche glazed from ground to roof terrace, capturing panoramic views of Khalid Lagoon through Cor Vision lift-and-slide doors on three facades.",
    products: ["Cor Vision 4600", "Cortizo Cor 70 Hidden Sash", "Gulf Extrusions TB600 Door", "Retractable Fly Screen"],
    tags: ["Villa", "Cortizo", "Residential", "Sharjah", "Waterfront", "Lift & Slide"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    brief: "A Sharjah homeowner with a waterfront property on the Khalid Lagoon required a full window and door replacement that would maximise the panoramic water views without compromising on energy performance or security. The existing aluminium was aged and under-performing thermally, significantly increasing the air conditioning load.",
    challenge: "The waterfront orientation exposes all three water-facing facades to prevailing onshore breezes and high ambient humidity. The specification needed to balance maximum glazed area with adequate air tightness, water tightness and appropriate hardware resistance to salt-laden humidity. Sharjah municipality approval for like-for-like replacement was also required.",
    solution: "Cor Vision 4600 lift-and-slide systems were installed on all three water-facing facades, with three-panel configurations to the living and dining levels to maximise aperture. Cortizo Cor 70 Hidden Sash windows were specified for the bedroom levels, providing tilt-and-turn ventilation with the concealed sash aesthetics appropriate for a contemporary villa. Gulf Extrusions TB600 doors were used at ground level entry points. All hardware was specified with additional corrosion resistance ratings for the coastal environment.",
    outcome: "The replacement programme delivered a marked improvement in indoor comfort, with reduced air conditioning consumption reported by the client. The uninterrupted lagoon views through the floor-to-ceiling lift-and-slide systems transformed the principal living spaces. The project was subsequently shared by the client's architect on social media, leading to two further Swiftrooms projects in the same Sharjah community.",
  },
  {
    id: "al-hamra-villa-rak",
    name: "Al Hamra Beachfront Villa",
    slug: "al-hamra-villa-rak",
    location: "Al Hamra Village, Ras Al Khaimah",
    area: "550 m²",
    year: "2024",
    type: "Residential Villa",
    description:
      "A private beachfront villa at Al Hamra Village in Ras Al Khaimah, fully glazed with the Cor Vision 4700 lift-and-slide range across four sea-facing openings, capturing unobstructed Gulf views on the ground and first floor.",
    products: ["Cor Vision 4700", "Cortizo Casement", "Retractable Fly Screen", "Fixed Rooflight"],
    tags: ["Villa", "Cortizo", "Residential", "Ras Al Khaimah", "Beachfront", "Lift & Slide"],
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    brief: "The client — a Ras Al Khaimah homeowner with a beachfront plot at Al Hamra Village — required a complete glazing specification for a newly completed villa shell. The brief prioritised unobstructed sea views through the largest possible glazed openings, with appropriate solar control glass for the west-facing sea elevation and robust hardware specification for the coastal environment.",
    challenge: "The west-facing sea elevation presented the most demanding solar and wind load conditions on the project. Panel sizes of 4.0m × 3.2m on the ground floor required the Cor Vision 4700's maximum panel weight capacity. The combination of sea air, UV exposure and sand-bearing winds demanded a complete coastal hardware specification. The RAK municipality technical submission also required EN-certified performance data for all systems.",
    solution: "Cor Vision 4700 lift-and-slide systems were installed across the four main sea-facing openings, with dual-panel configurations providing full-width opening on three of the four elevations. Solar control double-glazed units with a g-value of 0.27 were specified for the west elevation. Cortizo casement windows with hidden sash profiles were used across the upper bedroom levels. Retractable fly screens integrated into the lift-and-slide tracks were installed on the ground-floor openings. A 3.0m × 1.5m fixed rooflight above the master suite corridor completed the natural light strategy.",
    outcome: "The project was Swiftrooms' first installation in Ras Al Khaimah and led directly to two further enquiries from neighbours within Al Hamra Village. The client reported a significant reduction in cooling load compared to the previous property — attributing this to the solar control glass specification and improved thermal break performance of the new systems.",
  },
  {
    id: "4900-gallery",
    name: "4900 Gallery",
    slug: "4900-gallery",
    location: "Dubai",
    area: "320 m²",
    year: "2023",
    type: "Gallery / Commercial",
    description:
      "A curated showcase of the Swiftrooms product range in a gallery setting, demonstrating the full Cortizo Cor Vision and curtain wall product lines at full scale.",
    products: ["Cor Vision 4600", "Cor Vision Plus", "Cortizo TP52"],
    tags: ["Gallery", "Showroom", "Cortizo"],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    brief: "A product demonstration and gallery space allowing clients to experience the full Swiftrooms range — Cor Vision 4600, Cor Vision Plus and TP52 curtain wall — in a real architectural context at full working scale before committing to their project specification.",
    challenge: "Translating product specifications from a brochure or digital catalogue into a client's imagination is the primary challenge in luxury glazing sales. The brief was to create a space where clients could physically experience scale, operation, materials and light before making a specification decision.",
    solution: "The gallery was configured with Cor Vision 4600 and Cor Vision Plus systems installed at full scale in working condition. A TP52 curtain wall panel section was built as a freestanding installation. Each system can be operated by clients during their visit, with natural light introduced through overhead rooflights to demonstrate glazing performance under real conditions.",
    outcome: "The 4900 Gallery is now the primary tool in the Swiftrooms sales process. It hosted over 200 client visits in its first year of operation. Client feedback consistently identifies the showroom experience as the decisive factor in specification decisions.",
  },
  {
    id: "dubai-hills-villa",
    name: "Dubai Hills Villa",
    slug: "dubai-hills-villa",
    location: "Dubai Hills Estate, Dubai",
    area: "420 m²",
    year: "2025",
    type: "Residential Villa",
    description:
      "A contemporary four-bedroom villa in Dubai Hills Estate completed with a full external glazing replacement programme — lift-and-slide doors to the garden terraces, thermally broken casement windows throughout, and a structural glass balustrade to the first-floor terrace.",
    products: ["Cor Vision 4700", "Cortizo Cor 70 Hidden Sash", "Cortizo Casement"],
    tags: ["Villa", "Cortizo", "Residential", "Dubai Hills", "Lift & Slide", "Windows"],
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80",
    brief: "Full external glazing replacement for a four-bedroom villa in Dubai Hills Estate. The client — returning from a five-year posting overseas — found the original developer-grade aluminium had deteriorated significantly: stiff operation, audible air leakage and visible condensation on the glass units. The brief was to replace everything to a specification that would last.",
    challenge: "The property was occupied throughout the programme, with the client's family in residence. Sequencing the installation to minimise overnight exposure of any opening — while maintaining the programme — required detailed daily planning across a six-week installation period.",
    solution: "We worked room by room across an agreed sequence, ensuring no opening was left unglazed overnight. Cor Vision 4700 lift-and-slide doors replaced four pairs of original sliding doors to the ground-floor terraces, each panel at 1,800mm × 2,400mm. Cortizo Cor 70 Hidden Sash casement windows replaced 24 openings on the upper floors. A structural glass balustrade with stainless steel channels was installed to the first-floor terrace in the final phase.",
    outcome: "The client reported a perceptible improvement in acoustic comfort within the first week of occupancy — traffic noise from the nearby road virtually eliminated. Energy bills for the following summer were approximately 18% lower than the equivalent period in the previous year, which the client attributed primarily to the improved thermal performance of the new glazing.",
  },
  {
    id: "meydan-townhouse",
    name: "Meydan Townhouse",
    slug: "meydan-townhouse",
    location: "Meydan, Dubai",
    area: "185 m²",
    year: "2025",
    type: "Townhouse",
    description:
      "A three-storey townhouse in Meydan City converted from developer-grade aluminium to a full Cortizo specification — including retractable insect screens on the ground-floor doors and a garden room extension to the rear terrace.",
    products: ["Cor Vision 4600", "Cortizo Casement", "Retractable Fly Screen", "Premium Garden Room"],
    tags: ["Townhouse", "Cortizo", "Residential", "Meydan", "Garden Room", "Insect Screens"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    brief: "The client purchased the townhouse and immediately began a full interior and exterior refurbishment. The existing windows and doors were original developer grade — single-point locking, no thermal break, draughty in winter air conditioning season. The brief extended to adding a garden room to an existing concrete terrace at the rear, creating a shaded outdoor living space.",
    challenge: "The Meydan townhouse development has strict architectural control guidelines requiring all external modifications to be pre-approved by the community management. The glazing replacement required a formal NOC from the developer before any installation could begin. Simultaneously, the garden room design had to satisfy the HOA's material and colour restrictions.",
    solution: "We prepared a full specification package for the NOC submission — RAL colour references, elevation drawings and material schedules — which was approved by the community management within three weeks. The glazing replacement used Cor Vision 4600 lift-and-slide doors in RAL 9006 (silver metallic) to match the approved community palette. Cortizo casement windows replaced all upper-floor openings. Gulf Extrusions retractable screens were integrated into the ground-floor door reveals. The garden room was designed within a 22m² footprint and clad in powder-coated aluminium matching the primary door colour.",
    outcome: "The project was completed in eleven weeks from NOC approval to handover. The garden room has become the primary living space for the family in the cooler months — the client describes it as 'the room the house was missing'. The insect screens allow the ground-floor doors to remain open from October through April without any mosquito ingress.",
  },
  {
    id: "creek-harbour-villa",
    name: "Creek Harbour Waterfront Villa",
    slug: "creek-harbour-villa",
    location: "Dubai Creek Harbour, Dubai",
    area: "420 m²",
    year: "2026",
    type: "Villa",
    description:
      "A newly built waterfront villa in Dubai Creek Harbour specified with a full-height Vetromax curtain wall facade to the creek-facing elevation and Cor Vision Plus lift-and-slide doors throughout — designed for unobstructed water views and zero visual obstruction.",
    products: ["Vetromax VF35 Curtain Wall", "Cor Vision Plus", "Cortizo Cor 70 Hidden Sash", "Retractable Fly Screen"],
    tags: ["Villa", "Curtain Wall", "Cortizo", "Residential", "Dubai", "Lift & Slide", "New Build"],
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
    brief: "A five-bedroom waterfront villa in Creek Harbour with direct frontage onto the Dubai Creek Harbour promenade. The owner — an architect by profession — had specific and non-negotiable requirements: maximum glass, minimum frame, flush thresholds throughout, and a curtain wall facade to the east-facing living room wall that would present as a single uninterrupted glass plane from floor to ceiling and wall to wall.",
    challenge: "The curtain wall specification required a 6.4m × 3.0m structural glazing panel as the anchor element of the east facade. At this scale, the structural slab edge had to be engineered to accept the full dead load and wind load from the curtain wall, with a concealed connection detail that would not interrupt the glass plane. Simultaneously, the client required all ground-floor thresholds to be flush — no upstands — across six lift-and-slide openings, requiring coordinated drainage design with the civil contractor before slab pour.",
    solution: "The Vetromax VF35 frameless curtain wall system was specified for the east facade, with a 35mm mullion — the narrowest available in the UAE market. The structural connection was designed by our engineer in collaboration with the project's main structural consultant, using a concealed steel plate assembly concealed within the slab edge. Cor Vision Plus lift-and-slide doors were installed to all six ground-floor openings with recessed drainage channels cast into the slab at each threshold. Cortizo Cor 70 Hidden Sash casement windows with concealed sashes were specified to all upper-floor openings, ensuring a consistent sight line across the entire elevation. Gulf Extrusions retractable insect screens were integrated into all ground-floor door reveals.",
    outcome: "The project was completed to handover in 14 weeks. The Vetromax curtain wall facade has subsequently been photographed for publication in several UAE architecture and interiors titles. The client — who designed the project himself — has described the Cor Vision Plus threshold detail as 'the single most important detail in the house': the living room floor extends visually and physically into the terrace without any visible interruption. Swiftrooms has since received three separate enquiries from Creek Harbour neighbours who visited during the open house.",
  },
];

// ─── Process Steps ──────────────────────────────────────────────────────────

export const processSteps = [
  {
    number: "01",
    title: "Request A Quote",
    description:
      "Submit your project details online or visit our showroom. We'll review your requirements and respond within 24 hours with initial guidance and next steps.",
  },
  {
    number: "02",
    title: "Consultation",
    description:
      "We meet at your project site or in our Jebel Ali showroom to understand your vision, architectural requirements and budget. No obligation, no pressure — just an expert conversation.",
  },
  {
    number: "03",
    title: "Contract",
    description:
      "Our design team produces technical drawings, product specifications and material samples. Once agreed, we issue a formal contract and commence manufacture scheduling.",
  },
  {
    number: "04",
    title: "Installation",
    description:
      "Your windows and doors are precision-fabricated by our certified manufacturing partners. Our expert installation teams then deliver and fit every system with minimal disruption.",
  },
  {
    number: "05",
    title: "Quality Assurance",
    description:
      "Every installation is signed off by a senior project manager against a full quality checklist. We don't leave until every system operates perfectly and you're satisfied.",
  },
  {
    number: "06",
    title: "Aftercare",
    description:
      "We provide comprehensive aftercare, annual maintenance guidance and full warranty support. Your investment is protected for decades — and so is our relationship with you.",
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────────

export const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years in UAE" },
  { value: "4", label: "Premium Brands" },
  { value: "100%", label: "Client Satisfaction" },
];

// ─── Team ───────────────────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  // ── Senior Management ──
  { name: "Asif Choudhary", role: "Managing Director", group: "Senior Management", image: "/brand/team/asif-choudhary.webp" },
  { name: "Ar. Aamir Saif", role: "General Manager", group: "Senior Management", image: "/brand/team/aamir-saif.jpg" },
  { name: "Gerald Rangel", role: "Head of Fabrication and Installation", group: "Senior Management", image: "/brand/team/gerald-rangel.jpg" },
  { name: "Imran Choudhary", role: "Founder", group: "Senior Management", image: "/brand/team/imran-choudhary.webp" },
  // ── Sales Consultation Team ──
  { name: "Yaseen Osman", role: "Senior Sales Consultant", group: "Sales Consultation Team", image: "/brand/team/yaseen-osman.webp" },
  { name: "Murad Salameh", role: "Business Development Manager", group: "Sales Consultation Team", image: "/brand/team/murad-salameh.jpg" },
  { name: "Abdul Kadir", role: "Sales Engineer", group: "Sales Consultation Team", image: "/brand/team/abdul-kadir.jpg" },
  { name: "Sayeed Turon", role: "B2B Business Development Manager", group: "Sales Consultation Team" },
  // ── Project Managers ──
  { name: "Jibran", role: "Project Manager", group: "Project Managers" },
  { name: "Matt", role: "Project Manager", group: "Project Managers" },
  { name: "Benjamin", role: "Project Manager", group: "Project Managers" },
  // ── Technical Support Team ──
  { name: "Richa", role: "Operations", group: "Technical Support Team" },
  { name: "Zeeshan", role: "Accounts Administration", group: "Technical Support Team" },
  { name: "Shyjo P Jose", role: "Technical Sales Support", group: "Technical Support Team" },
  { name: "Ambili", role: "Designer / Draughtsperson", group: "Technical Support Team" },
  { name: "Ayana", role: "Designer", group: "Technical Support Team" },
  { name: "Ishak", role: "Designer", group: "Technical Support Team" },
];

// ─── Testimonials ────────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    quote: "The Cor Vision 4700 doors have completely transformed the rear elevation of our villa. From specification through to installation the process was faultless — and the sight lines on these doors have to be seen to be believed.",
    author: "M. Al Mansouri",
    location: "Emirates Hills, Dubai",
    project: "Residential Villa",
    product: "Cor Vision 4700",
  },
  {
    quote: "We've used Swiftrooms on four projects now. The technical knowledge their team brings to specification is genuinely exceptional — they're not just selling a product, they understand how it performs in the UAE climate and they're completely transparent about what works and what doesn't.",
    author: "P. Richardson",
    location: "Interior Architect, Dubai",
    project: "Repeat Commercial Client",
    product: "Multiple Systems",
  },
  {
    quote: "The flush threshold on the Cor Vision Plus is extraordinary. We specified it in the master bedroom suite and the barrier-free connection to the terrace — with the track virtually invisible at floor level — was exactly what the design demanded.",
    author: "N. Al Barari",
    location: "Al Barari, Dubai",
    project: "Residential Villa",
    product: "Cor Vision Plus",
  },
  {
    quote: "From the free site survey to installation day the whole process was professional and completely on programme. The bi-fold doors have been open almost every evening since installation — they've genuinely changed how we use our home.",
    author: "S. & J. Thompson",
    location: "Arabian Ranches, Dubai",
    project: "Family Villa",
    product: "Cortizo Bi-fold",
  },
  {
    quote: "Our curtain wall installation was the most complex glazing element on the entire project. Swiftrooms' technical team produced drawings to a standard I'd expect from a much larger contractor, and the on-site execution was excellent.",
    author: "K. Al Hashimi",
    location: "Saadiyat Island, Abu Dhabi",
    project: "Residential Development",
    product: "Cortizo TP52 Curtain Wall",
  },
  {
    quote: "The difference in noise reduction from the new windows is remarkable — we back onto a main road and the acoustic specification Swiftrooms recommended has made the house genuinely quiet. We wish we'd done it years ago.",
    author: "D. & A. Murphy",
    location: "Jumeirah Village Triangle",
    project: "Townhouse Renovation",
    product: "Cortizo Cor 70",
  },
];

// ─── Timeline ───────────────────────────────────────────────────────────────

export const timeline: TimelineEntry[] = [
  {
    year: "2009",
    title: "Founded",
    description:
      "Swiftrooms established in Dubai with a single purpose: to bring European-grade aluminium window and door systems to the UAE market, installed to European standards.",
  },
  {
    year: "2011",
    title: "Cortizo Partnership",
    description:
      "Became authorised Cortizo partners for the UAE — the first formal relationship between the Spanish manufacturer and a UAE specialist installer.",
  },
  {
    year: "2013",
    title: "100 Projects",
    description:
      "Completed our 100th project — a milestone that confirmed Swiftrooms as a serious force in UAE premium glazing, with a growing reputation across Dubai's villa communities.",
  },
  {
    year: "2015",
    title: "Gulf Extrusions Partnership",
    description:
      "Added Gulf Extrusions to our brand portfolio, extending our range to include UAE-engineered systems purpose-built for GCC climate conditions.",
  },
  {
    year: "2017",
    title: "Vetromax Partnership",
    description:
      "Expanded into structural and frameless glazing through our partnership with Vetromax, enabling us to take on curtain wall, pivot door and glass facade projects.",
  },
  {
    year: "2019",
    title: "Jebel Ali Showroom",
    description:
      "Opened our full-scale showroom in Jebel Ali — the first in the UAE to feature working Cortizo Cor Vision, bi-fold and curtain wall systems at full scale for client demonstrations.",
  },
  {
    year: "2021",
    title: "Abu Dhabi Expansion",
    description:
      "Extended our project operations formally to Abu Dhabi and the Northern Emirates, completing our coverage of the entire UAE market.",
  },
  {
    year: "2023",
    title: "500 Projects",
    description:
      "Reached 500 completed projects — a milestone across Dubai, Abu Dhabi, Sharjah and all seven UAE emirates, from intimate villa renovations to large commercial curtain wall installations.",
  },
  {
    year: "2024",
    title: "International Recognition",
    description:
      "Featured in international architectural and glazing trade press for our Emirates Hills and Phileas Fogg projects, bringing Swiftrooms to the attention of the wider global architecture community.",
  },
  {
    year: "2025",
    title: "Vetro Partnership & Cor Vision Plus",
    description:
      "Became authorised Vetro partners, expanding our frameless and ultra-slim glazing offer. Launched the Cor Vision Plus flush-threshold collection — our most specified residential system to date.",
  },
  {
    year: "2026",
    title: "Acoustic Glazing & New Systems",
    description:
      "Launched a dedicated acoustic glazing specification service, responding to growing demand from clients in high-density Dubai communities. Expanded our skylight and rooflight range with motorised and fixed options from Velux commercial and bespoke fabricators.",
  },
];

// ─── FAQs ───────────────────────────────────────────────────────────────────

export const faqs: FAQ[] = [
  // Pricing
  {
    category: "Pricing",
    question: "How much do aluminium windows and doors cost in the UAE?",
    answer:
      "Pricing varies significantly based on system type, size and specification. As a guide, a standard villa window replacement programme typically ranges from AED 80,000 to AED 250,000+ depending on the number of openings and system selected. Lift-and-slide door systems start from AED 12,000–18,000 per opening. On a per-sqm basis, casement windows start from around AED 800/sqm and lift-and-slide systems from AED 2,000/sqm installed. We provide detailed fixed-price quotations after a site survey — contact us to arrange one.",
  },
  {
    category: "Pricing",
    question: "Why is Cortizo more expensive than other aluminium systems?",
    answer:
      "Cortizo is a Spanish manufacturer with over 50 years of engineering investment. The price difference reflects precision-extruded thermal breaks, European hardware from Roto and Maco, and performance credentials independently tested to EN standards. In our experience, the long-term cost of a premium system — factoring in maintenance, hardware longevity and energy savings — is substantially lower than a cheaper alternative replaced in 5–7 years.",
  },
  {
    category: "Pricing",
    question: "Do you offer financing or payment plans?",
    answer:
      "We work with clients on structured payment schedules tied to project milestones — typically deposit on order, payment on delivery, and balance on installation completion. We can discuss terms that suit your project cashflow during the quotation process.",
  },
  // Timelines
  {
    category: "Timelines",
    question: "How long does a typical installation project take?",
    answer:
      "Lead times vary by project scope and system complexity. A typical villa window and door replacement takes 6–10 weeks from survey to installation completion. Larger projects or custom sizes may require 12–16 weeks. We provide precise timelines at quotation stage.",
  },
  {
    category: "Timelines",
    question: "How long does manufacture take after order confirmation?",
    answer:
      "Standard Cortizo and Gulf Extrusions systems typically have a 4–6 week manufacturing lead time from confirmed order. Bespoke sizes, unusual configurations or powder coat colours outside the standard range may add 1–2 weeks. We always confirm the exact lead time in your contract.",
  },
  {
    category: "Timelines",
    question: "Can you work around my tenants or family staying in the property?",
    answer:
      "Yes — we plan and sequence installations to minimise disruption for occupied properties. Openings are never left unglazed overnight, and we sequence work room by room. We've completed full villa replacements with families in residence throughout.",
  },
  // Installation
  {
    category: "Installation",
    question: "Do you install across the UAE or only Dubai?",
    answer:
      "We serve the entire UAE — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah and Fujairah. Our project teams operate across all seven emirates.",
  },
  {
    category: "Installation",
    question: "Can you match existing RAL colours for a partial replacement?",
    answer:
      "Yes. We can powder-coat profiles to any RAL Classic or BS colour reference, ensuring a seamless match with existing frames or architectural finishes.",
  },
  {
    category: "Installation",
    question: "Do you handle the municipality approvals?",
    answer:
      "For projects requiring NOC or DDA approval (e.g. curtain wall, large commercial glazing), we can advise on documentation requirements and liaise with your consultant. Standard residential replacements typically do not require formal approval.",
  },
  {
    category: "Installation",
    question: "Do you remove the existing windows and doors?",
    answer:
      "Yes — our installation teams handle full removal of existing frames, preparation of openings, installation of new systems and disposal of all waste materials. You don't need to arrange separate trades for any part of the process.",
  },
  // Products
  {
    category: "Products",
    question: "What makes Cortizo windows different from standard aluminium windows?",
    answer:
      "Cortizo is a Spanish manufacturer with over 50 years of engineering expertise. Their systems feature precision-extruded thermal breaks, European hardware standards, and performance credentials that far exceed typical Dubai market products. The difference is immediately apparent in operation smoothness and long-term durability.",
  },
  {
    category: "Products",
    question: "What is the difference between a lift-and-slide and a standard sliding door?",
    answer:
      "In a standard sliding door, the panel remains on the track when sliding. In a lift-and-slide system, turning the handle lifts the sash slightly off its sill seal, allowing it to slide on precision rollers with near-zero friction. This allows for much heavier, wider panels with effortless operation and superior weather sealing.",
  },
  {
    category: "Products",
    question: "Should I choose aluminium or uPVC for my villa?",
    answer:
      "Aluminium is the premium choice for UAE villas — it allows thinner, stronger profiles with more design freedom, and the thermally broken systems we supply perform excellently in the Gulf climate. uPVC is a valid option for budget-conscious applications, particularly in back-of-house or service areas. We can advise on the right mix for your project during the consultation.",
  },
  {
    category: "Products",
    question: "What glass do you use in your systems?",
    answer:
      "All our systems are glazed with double-pane insulated units as standard. For UAE conditions we typically specify low-e solar control glass to reduce heat gain. Acoustic glass, laminated safety glass, tinted and reflective options are all available and specified based on the orientation and use of each opening.",
  },
  // Maintenance
  {
    category: "Maintenance",
    question: "How do I maintain my aluminium windows and doors?",
    answer:
      "Aluminium systems require minimal maintenance. We recommend wiping frames with a mild detergent solution every 3 months, and lubricating hardware (hinges, locks, rollers) with a silicone-based lubricant annually. Drainage channels should be checked and cleared of debris twice per year. We provide a full maintenance guide at project handover.",
  },
  {
    category: "Maintenance",
    question: "Do sand and dust affect the systems in the UAE?",
    answer:
      "Our systems are specified with dust conditions in mind. All track systems have integrated drainage and brush seals that prevent ingress. The powder coat finishes we use are certified to QUALICOAT standards, which includes UV and environmental testing relevant to Gulf conditions. We recommend an additional clean of tracks and drainage channels after shamal (sandstorm) events.",
  },
  {
    category: "Products",
    question: "Can acoustic glazing reduce noise from traffic or construction?",
    answer:
      "Yes — significantly. Standard double glazing provides approximately 30–34dB of sound reduction. A properly specified acoustic glass unit (laminated glass with a PVB acoustic interlayer, asymmetric pane thicknesses) in a high-quality frame with continuous perimeter sealing can achieve 38–52dB. In practice this is the difference between clearly hearing traffic inside your home and being barely aware of it. We can specify acoustic performance for any opening — ask us during your consultation.",
  },
  {
    category: "Products",
    question: "How do I compare glazing quotes from different suppliers?",
    answer:
      "Ensure every quote specifies: (1) the exact system name and manufacturer — not just 'aluminium'; (2) the glass unit specification including type, thickness, gap width and fill gas; (3) hardware brand and standard; (4) thermal break depth; (5) powder coat or anodising specification; (6) installation method and perimeter sealing detail. A cheaper quote using an unspecified 'aluminium system' is almost always a different, lower-quality product. We provide detailed technical schedules with every Swiftrooms quote.",
  },
  // Guarantees
  {
    category: "Guarantees",
    question: "What guarantee do you provide on installation workmanship?",
    answer:
      "All Swiftrooms installations carry a 2-year workmanship guarantee covering any defects in the installation itself — including alignment, sealing, hardware adjustment and structural fixing. If anything is not right, we return and rectify at no cost.",
  },
  {
    category: "Guarantees",
    question: "Are your systems tested and certified?",
    answer:
      "All Cortizo systems carry CE marking and are tested to EU performance standards including EN 12207 (air permeability), EN 12208 (water tightness) and EN 12210 (wind resistance). Gulf Extrusions products are tested to UAE/GCC standards. We can provide test certificates for any system on request.",
  },
  // Warranties
  {
    category: "Warranties",
    question: "What warranty do your window and door systems carry?",
    answer:
      "Our aluminium systems carry a minimum 10-year manufacturer warranty on profiles and hardware. Installation workmanship is warranted for 2 years. Glass carries the manufacturer's standard warranty, typically 5–10 years depending on the glass type.",
  },
  {
    category: "Warranties",
    question: "Is the warranty transferable if I sell the property?",
    answer:
      "Yes. Both the manufacturer and workmanship warranties are attached to the property, not the original purchaser, and transfer automatically to new owners. This can be a material factor in the property's value and saleability.",
  },
  {
    category: "Products",
    question: "What is the difference between a tilt-and-turn window and a casement window?",
    answer:
      "A casement window opens on a vertical hinge — either side-hung or top-hung. A tilt-and-turn window has a single sash that operates in two modes: tilting inward at the top for secure ventilation, or turning fully on a side hinge like a casement for full opening. Tilt-and-turn is our most specified window type for UAE villas — the tilt position allows ventilation without fully opening the window in dusty or windy conditions, and the European-standard multipoint locks provide superior airtightness and security.",
  },
  {
    category: "Installation",
    question: "Can you glaze an apartment or high-rise unit in Dubai?",
    answer:
      "Yes, though high-rise projects require additional coordination. Most DMCC, DEWA and Nakheel developments require an NOC from the developer or master community before any façade work. Our team handles this documentation process and has completed glazing projects in high-rise residential towers across Dubai Marina, Downtown Dubai and JLT. Wind loading and access considerations are also factored into our installation planning for any project above the 4th floor.",
  },
  {
    category: "Installation",
    question: "Can existing frames be reglazed rather than fully replaced?",
    answer:
      "Sometimes — it depends on the frame condition. If your existing frames are structurally sound, correctly installed and in good cosmetic condition, upgrading the glass unit alone is sometimes possible and more economical than full replacement. However, if the frames are original developer-grade aluminium (pre-2010 UAE construction), the profile geometry typically does not accept modern insulated glass unit thicknesses, and the thermal break (if present) will be inadequate. We assess existing frames honestly during our site survey and recommend reglazing where it genuinely offers value.",
  },
  // Aftercare
  {
    category: "Aftercare",
    question: "Can I visit a showroom to see products full-size?",
    answer:
      "Yes — our Jebel Ali showroom features full-scale installations of our most popular systems including the Cor Vision 4700, Cortizo bi-fold, and curtain wall panels. We strongly recommend a showroom visit before finalising your specification.",
  },
  {
    category: "Aftercare",
    question: "Do you offer an annual maintenance service?",
    answer:
      "Yes. We offer an annual maintenance programme covering hardware adjustment, seal inspection, drainage cleaning, glass cleaning and a full system health check. Contact us to arrange an annual service visit — particularly recommended for lift-and-slide systems with multiple large panels.",
  },
  {
    category: "Pricing",
    question: "What does premium aluminium glazing cost per square metre in the UAE?",
    answer:
      "As a general guide: thermally broken aluminium casement windows start from around AED 800–1,200 per sqm installed. Lift-and-slide systems range from AED 2,000–4,500 per sqm depending on panel size and system specification. Curtain wall is typically AED 1,800–3,500 per sqm of facade area. These are indicative — contact us for a fixed-price quotation after a site survey.",
  },
  {
    category: "Pricing",
    question: "What lead time should I expect from order to installation?",
    answer:
      "Standard lead time from contract signing to installation is 4–8 weeks, depending on the system and configuration. Custom sizes, special colours and project-specific hardware can extend this to 10–12 weeks. We provide a confirmed programme at contract stage so you can coordinate your fit-out schedule accordingly.",
  },
  {
    category: "Products",
    question: "Can aluminium windows and doors be supplied in any colour?",
    answer:
      "Yes. All our aluminium systems are available in any RAL colour, as well as anodised finishes in silver, champagne, bronze and black. We also offer dual-colour options — different colours inside and out on the same frame. Powder coat finishes are applied by certified QUALICOAT facilities and carry a 10-year colour guarantee.",
  },
  // Aftercare (additional)
  {
    category: "Aftercare",
    question: "What is included in a Swiftrooms annual maintenance visit?",
    answer:
      "Our annual service covers hardware inspection and adjustment (hinges, multipoint locks, handles, rollers), perimeter seal condition and resealing where required, track and drainage channel cleaning, glass unit inspection for seal failure or condensation, powder coat condition check and lubrication of all moving parts. We issue a written service record at the end of the visit.",
  },
  {
    category: "Aftercare",
    question: "How do I know if my glass unit has failed?",
    answer:
      "Glass unit failure — where the hermetic seal between the panes breaks — is visible as misting, condensation or streaking between the panes of a double-glazed unit. This cannot be cleaned; the unit must be replaced. Unit failure is covered under the glass manufacturer's warranty in the first 5–10 years. We can assess and replace failed units as part of our aftercare service.",
  },
  // Products (additional)
  {
    category: "Products",
    question: "What is a pivot door and is it suitable for the UAE climate?",
    answer:
      "A pivot door rotates on a vertical axis rather than side hinges, allowing much wider and heavier panels than a conventional door. It is excellent for statement villa entrances and is fully suitable for the UAE climate when correctly specified — the key requirements are a thermally broken aluminium frame, laminated toughened glass, and a hydraulic pivot hardware system rated for the panel weight. Our Vetromax pivot door range covers panels from 1,000mm to 2,000mm wide and up to 3,600mm tall.",
  },
  {
    category: "Products",
    question: "Can I add retractable insect screens to my existing lift-and-slide doors?",
    answer:
      "In most cases, yes. Retractable screen systems can be retrofitted to existing lift-and-slide and casement door openings, provided there is sufficient depth in the structural reveal to house the cassette. We carry out a site assessment before recommending a system — if the reveal is too shallow, we discuss alternative solutions. New door installations should include the screen specification from the outset to ensure the cassette is properly integrated.",
  },
  {
    category: "Products",
    question: "What is the difference between Estidama, LEED and Dubai Greenlist?",
    answer:
      "These are three distinct sustainability frameworks used in UAE construction. Estidama is the Abu Dhabi sustainability rating system — mandatory for certain project types in Abu Dhabi, including commercial buildings and residential developments above certain floor areas. LEED is a US-origin international system voluntary in the UAE but commonly required by developers. Dubai Greenlist is a product approval scheme for materials used in Dubai Municipality projects. We can advise on which glazing systems qualify for credits under each framework and provide the documentation required for submission.",
  },
  {
    category: "Pricing",
    question: "Do you charge for a site survey?",
    answer:
      "No — our technical site survey is completely free, with no obligation to proceed. We visit your property, assess all openings, take accurate measurements, review the structural condition of each opening and discuss your requirements in detail. You receive a written quotation within 3–5 working days of the survey.",
  },
  {
    category: "Guarantees",
    question: "What happens if there is a problem after installation?",
    answer:
      "Contact our aftercare team directly — we prioritise all post-installation enquiries from clients. If the issue is covered by our 2-year workmanship guarantee (hardware failure, sealing, alignment), we will return and rectify at no charge. If it is a manufacturer warranty issue (profile, glass unit), we handle the warranty claim on your behalf. We aim to attend any post-installation issue within 5 working days of being notified.",
  },
];

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  {
    slug: "window-ratings-standards-uae",
    date: "July 2026",
    category: "Technical Guide",
    title: "UAE Window & Door Performance Ratings Explained: A–E, DEWA & Dubai Green",
    excerpt:
      "Air permeability, water tightness, wind resistance — what do the classifications actually mean, and which ratings does a UAE villa or apartment need?",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why performance ratings matter in the UAE",
        paragraphs: [
          "The UAE presents an unusually demanding combination of environmental conditions for windows and doors: extreme heat, sand-laden winds, occasional driving rain, high UV, and — particularly in coastal areas — high salt-laden humidity. Performance ratings exist to help specifiers and clients make evidence-based system choices, not marketing-based ones.",
          "Understanding what the ratings mean — and which ones are relevant to your project — allows you to compare systems on a like-for-like basis and hold your contractor accountable when something underperforms.",
        ],
      },
      {
        heading: "The three primary European EN performance classifications",
        paragraphs: [
          "The vast majority of premium aluminium systems supplied in the UAE are rated to European EN 14351-1 (windows and external pedestrian doorsets). This standard tests three core performance areas, each with its own classification scale. These are: Air Permeability (Class 1–4), Water Tightness (Classes 1A–9A for inward-opening, 1E–8E for outward-opening), and Wind Resistance (Class 1–C5, with C5 being the highest).",
          "For UAE projects, Class 4 air permeability is the benchmark — this is the tightest standard, equivalent to a maximum leakage of 0.5 m³/(h·m²) at 100 Pa. Class 5A or above water tightness is appropriate for exposed UAE locations. Wind resistance Class C5 (1,600 Pa) is typically required for high-rise or exposed coastal positions.",
        ],
      },
      {
        heading: "Thermal performance: Uf and Uw values",
        paragraphs: [
          "The thermal transmittance of a window is expressed in two values: Uf (the frame alone) and Uw (the whole window, including glazing). Lower values mean better thermal insulation. In the UAE, the priority is solar heat gain — keeping the sun's energy out — as much as retaining interior cool. A thermally broken aluminium frame typically achieves Uf values between 1.8 and 2.5 W/m²K, depending on thermal break depth.",
          "DEWA Green Building guidelines and Dubai's Sustainable Buildings programme specify maximum U-values for new commercial construction. For residential projects, the practical goal is achieving a Uw value low enough that the window is not the weak point in the building envelope's thermal performance.",
        ],
      },
      {
        heading: "DEWA regulations and Dubai Green Building criteria",
        paragraphs: [
          "Dubai's Green Building Regulations and Specifications (updated 2024) set mandatory minimum performance standards for fenestration in new buildings. These are expressed as maximum U-values (typically 2.0 W/m²K or lower for glazed facades in hot desert climate zones) and maximum Solar Heat Gain Coefficients (SHGC). The specific requirements vary by building type and orientation.",
          "For residential villa projects and renovations, municipality regulations may or may not require formal compliance testing — this depends on the scope of works and the emirate. However, specifying to these standards is increasingly expected by developers, architects and end clients, regardless of whether formal sign-off is required.",
        ],
      },
      {
        heading: "Acoustic ratings: what Rw means in practice",
        paragraphs: [
          "Acoustic performance is expressed as Rw (weighted sound reduction index, in decibels), sometimes with correction factors (Rw + C or Rw + Ctr) for low-frequency traffic noise. Standard double glazing with 6/12/6 configuration typically achieves around 30–32 dB Rw. High-performance acoustic glazing with asymmetric pane thicknesses and SGP interlayers can achieve 42–48 dB Rw.",
          "In practical terms: 30 dB Rw reduces a noisy 70 dB street outside to around 40 dB inside the room. 42 dB Rw would bring that same street noise down to around 28 dB — effectively inaudible for most people in most conditions.",
        ],
      },
      {
        heading: "How to read a product data sheet and what to ask your contractor",
        paragraphs: [
          "A credible contractor can produce the EN test certificate — not just claim — for the system they are proposing. The certificate should show the specific profile configuration and glazing specification tested. Be wary of any contractor who quotes 'up to' values without specifying which exact configuration achieves them.",
          "Ask for the Uf value (frame only), the Uw calculation for your glazing specification, and the EN 14351-1 classification certificate. Ask specifically what air permeability and water tightness class the system achieves. These are not proprietary numbers — they are independently tested values that any authorised partner can produce.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4700 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cortizo TP52 Curtain Wall", href: "/catalogue/curtain-wall/cortizo-tp52" },
      { name: "Gulf Extrusions TB600 Tilt & Turn", href: "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn" },
    ],
  },
  {
    slug: "choosing-glazing-contractor-dubai",
    date: "June 2026",
    category: "Buyer's Guide",
    title: "How to Choose a Glazing Contractor in Dubai: 7 Questions to Ask",
    excerpt:
      "Not all glazing contractors in Dubai are equal. Before you sign anything, these seven questions will separate the professionals from the risk.",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why contractor selection matters more than product selection",
        paragraphs: [
          "A Cortizo Cor Vision installed badly is worse than a budget system installed correctly. The gap between a well-executed glazing project and a poorly executed one is almost always the installer — not the product. Yet most homeowners and developers spend 80% of their research time comparing systems and 20% vetting who will actually do the work.",
          "In Dubai's market, this is particularly risky. The premium end of the market is served by authorised, factory-trained installers. Everything below it is a mixed bag. Here are the seven questions that reliably separate the two.",
        ],
      },
      {
        heading: "1. Are you an authorised installer for the brands you're selling?",
        paragraphs: [
          "Cortizo, Vetromax, Gulf Extrusions and other serious manufacturers have formal authorised installer networks. Authorised partners receive factory training, technical support, and access to current product data. An unauthorised fabricator may use genuine profiles but lack the training to install them correctly — and the manufacturer's warranty will not apply.",
          "Ask to see the authorisation documentation. A legitimate partner will produce it without hesitation.",
        ],
      },
      {
        heading: "2. Can you show me UAE projects you've completed in the last 12 months?",
        paragraphs: [
          "Portfolio images are easy to fabricate or borrow. A credible contractor can give you the name of a recent UAE client you can contact directly, or take you on a site visit. If the contractor cannot name a single verifiable recent project, that absence speaks for itself.",
          "Pay attention to project type and scale. A company that has only done small apartment fit-outs may struggle with a full villa envelope or a curtain wall installation.",
        ],
      },
      {
        heading: "3. Who actually performs the installation — your own team or subcontractors?",
        paragraphs: [
          "Many glazing companies in Dubai function as brokers — they sell, design and take your deposit, then hand installation to a subcontractor who has never met you and knows nothing about your expectations. This is a significant quality risk.",
          "Ask explicitly: do your own employed installers carry out the work? What is the qualification and experience level of the on-site team? Will the same project manager who takes your brief be present during installation?",
        ],
      },
      {
        heading: "4. What does the warranty actually cover, and for how long?",
        paragraphs: [
          "Glazing warranties in UAE vary enormously. A manufacturer's profile warranty (typically 10–15 years for powder coat, 5–10 years for hardware) is separate from an installer's workmanship warranty. Both matter. The profile can be perfect; an installation defect can still cause water ingress, racking or operational problems within a year.",
          "Ask for the warranty in writing, and read it. Look for exclusions around sand, humidity and thermal cycling — all of which are part of the UAE climate. A robust contractor will cover workmanship for a minimum of two years without exclusions for normal UAE conditions.",
        ],
      },
      {
        heading: "5. Do you provide technical drawings and a written specification before contract?",
        paragraphs: [
          "Professional glazing contractors produce technical drawings — shop drawings showing elevations, section details, fixing details and glazing specifications — before fabrication begins. These drawings are what protect you if there is a dispute, and they are what a competent installer signs off against.",
          "If a contractor is willing to proceed to manufacture based on a verbal brief and a sketch, that is a warning sign. The drawings are not optional; they are the contract.",
        ],
      },
      {
        heading: "6. Are you registered with Dubai Municipality / the relevant emirate authority?",
        paragraphs: [
          "Commercial and high-rise glazing in the UAE requires the installing contractor to be registered with the relevant municipality. For residential work, the requirement varies but a Dubai Municipality registration is a basic mark of a legitimate business. Ask for the trade licence and registration number, and verify it.",
          "Unregistered contractors are not only a legal risk — they are ineligible to obtain the necessary permits for certain types of work, meaning your project may not receive final inspection sign-off.",
        ],
      },
      {
        heading: "7. What happens after installation?",
        paragraphs: [
          "The relationship with a quality glazing contractor does not end at handover. Premium aluminium systems require periodic adjustment, seal inspection and hardware servicing — particularly after the first full year of thermal cycling in the UAE climate. Ask what aftercare support is included and whether the contractor will still answer the phone in two years.",
          "The contractors who can answer all seven questions clearly and confidently are the ones worth hiring. The ones who deflect, generalise or become evasive — at any point — should be disqualified.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4600 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4600" },
      { name: "Cortizo Bi-fold Door", href: "/catalogue/aluminium-bi-folding-doors/cortizo-bifold" },
    ],
  },
  {
    slug: "curtain-wall-glazing-uae-guide",
    date: "July 2026",
    category: "Technical Guide",
    title: "Curtain Wall Glazing in the UAE: What Specifiers Need to Know",
    excerpt:
      "Curtain wall is not just for skyscrapers. Modern unitised and stick-built systems are increasingly specified for UAE villas, commercial villas and low-rise commercial buildings — and getting the specification right matters.",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Curtain wall is more accessible than you think",
        paragraphs: [
          "The term 'curtain wall' tends to conjure images of Dubai's high-rise towers — and those systems are curtain wall. But the same principle — a non-structural glass-and-aluminium facade hung in front of a structural frame — is increasingly used in UAE residential architecture for dramatic full-height glass elevations, double-height entrance halls and feature facades on commercial villas and low-rise offices.",
          "At Swiftrooms we specify and install curtain wall on projects as small as a single villa facade element — not just commercial high-rise. This article explains the key technical distinctions that matter when specifying a curtain wall system for any scale of project in the UAE.",
        ],
      },
      {
        heading: "Stick-built vs unitised: understanding the difference",
        paragraphs: [
          "All curtain wall systems belong to one of two fundamental categories: stick-built (also called site-glazed) and unitised.",
          "Stick-built systems are assembled on site from individual components — horizontal mullions, vertical transoms and glass units. They are flexible, relatively straightforward to handle and install, and do not require the high-precision factory pre-assembly of unitised systems. They are the standard approach for low-rise and medium-rise UAE applications up to approximately 12 storeys.",
          "Unitised systems are factory-assembled into large panel units — typically one floor height by one bay width — and lifted into position by crane. The panels arrive on site largely pre-glazed and pre-sealed, reducing site labour and improving quality control. They are the standard for high-rise and for projects where the programme cannot accommodate extensive site-based glazing work. For most UAE villa and commercial villa applications, stick-built is the practical and cost-effective choice.",
        ],
      },
      {
        heading: "Structural vs pressure plate: the visual difference that matters",
        paragraphs: [
          "Within stick-built curtain wall, there are two approaches to holding the glass in place: pressure plate and structural silicone.",
          "Pressure plate systems use a visible aluminium cap that covers the edge of the glass and is mechanically fixed to the frame behind. This creates the characteristic grid of visible aluminium lines on the facade. The Cortizo TP52 system we install uses a pressure plate approach — the grid can be either flush or projecting, depending on the architectural intent.",
          "Structural silicone glazing (SSG) replaces the mechanical pressure plate with a structural silicone bond between the glass edge and the framing. This allows a fully flush, frameless-looking facade with no visible aluminium grid. SSG systems demand extremely high tolerances in installation and a strict quality-controlled silicone application process. The Vetromax VF35 system we supply is our primary SSG offering for the UAE market.",
          "The right choice depends on the architectural intent: pressure plate for a more traditional or industrial aesthetic; SSG for the smooth, unbroken glass facades increasingly prevalent in contemporary UAE residential architecture.",
        ],
      },
      {
        heading: "Thermal performance and the UAE curtain wall challenge",
        paragraphs: [
          "Curtain wall presents a significant thermal challenge in the UAE: the system creates a continuous facade with large glass areas and aluminium framing — both potential heat-transfer pathways. The combination of a thermally broken aluminium system and high-performance solar control glass is essential.",
          "The Cortizo TP52 uses a 30mm polyamide thermal break, significantly reducing the U-value of the framing relative to non-broken systems. For large commercial applications targeting Green Building or Estidama compliance, we can model the assembled system U-value and solar heat gain coefficient to demonstrate compliance with Dubai Municipality and Abu Dhabi Urban Planning Council requirements.",
          "Our standard curtain wall specification for UAE projects includes: TP52 or VF35 framing (depending on application), 6mm + 16mm argon + 6mm solar control double-glazed unit with a g-value of 0.25–0.30, and structural silicone or pressure plate glazing per the architectural specification.",
        ],
      },
      {
        heading: "When curtain wall is the right choice for a UAE villa",
        paragraphs: [
          "We regularly specify curtain wall on residential projects where the opening exceeds the practical limits of a window or sliding door system — typically above 5 metres in width or 3.5 metres in height. Common applications include: feature entrance halls with double-height glazing; pool-facing rear elevations requiring structural glazing rather than a door system; corner glazing with no visible post at the building corner; and roof elements (sloped glazing) where a standard rooflight would not span the required area.",
          "If you are in the early design stage and unsure whether your opening requires a curtain wall solution or can be achieved with a larger sliding or fixed window system, our technical team can advise during a free consultation. The boundary between the two categories is often a matter of engineering and detailing rather than a hard rule.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo TP52 Curtain Wall", href: "/catalogue/curtain-wall/cortizo-tp52" },
      { name: "Cortizo TP52 Equity", href: "/catalogue/curtain-wall/cortizo-tp52-equity" },
      { name: "Gulf Extrusions CW 50mm", href: "/catalogue/curtain-wall/gulf-extrusion-cw-50" },
      { name: "Vetromax VF35 Facade", href: "/catalogue/curtain-wall/vetromax-vf35" },
    ],
  },
  {
    slug: "glass-specification-guide-uae",
    date: "June 2026",
    category: "Technical Guide",
    title: "The Complete Glass Specification Guide for UAE Homes",
    excerpt:
      "Solar control, low-e, laminated, tempered, triple glazed — the glass market is full of terms and competing claims. Here is a plain-language guide to what actually matters in a UAE climate.",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why glass specification matters more than the frame",
        paragraphs: [
          "Most glazing conversations in the UAE start with the frame system — the profile, the brand, the colour. These things matter. But for thermal performance, acoustic performance and long-term comfort, the glass unit inside the frame has at least as much influence as the frame itself.",
          "A premium aluminium system with cheap glass will underperform a standard system with a well-specified glass unit. This guide explains the key choices you will encounter when specifying glass for a UAE residential or commercial project — and what to look for in each.",
        ],
      },
      {
        heading: "Solar control glass: the most important specification for the UAE",
        paragraphs: [
          "In a UAE summer, solar radiation through unprotected glass can contribute more heat to a room than the air-conditioning system can remove. This is not a theoretical concern — it is the practical experience of thousands of villa owners across Dubai and Abu Dhabi.",
          "Solar control glass works by applying a metallic or metal-oxide coating to one surface of the glass. This coating selectively reflects the infrared and ultraviolet components of solar radiation while allowing visible light to pass through. The key figure to assess is g-value (also called solar factor or SHGC): the fraction of solar energy that passes through the glass. A g-value of 0.25 means 25% of solar radiation enters the room. Standard clear float glass has a g-value of 0.87.",
          "For UAE residential applications, we specify glass with a g-value between 0.20 and 0.35, depending on the orientation and shading of the elevation in question. South and west-facing glass in direct sun typically needs the lower end of this range. North-facing glass, or elevations with significant external shading, can use higher g-values without compromising comfort.",
        ],
      },
      {
        heading: "Low-e coatings and thermal transmittance",
        paragraphs: [
          "Low-e (low emissivity) coatings are a different coating type that reduces the U-value of the glazing unit — the rate of heat flow through the glass. In the UAE context, where the primary concern is keeping heat out rather than in, low-e coatings are most relevant in their combination with solar control properties.",
          "Modern solar control glass typically incorporates low-e properties in the same coating — so specifying a high-performance solar control glass usually delivers improved U-values at the same time. Look for a combined specification: for example, SGG Planitherm One from Saint-Gobain or equivalent, specifying both solar factor (g-value) and U-value (Uw) for the glazed unit.",
          "For UAE buildings targeting regulatory compliance, the UAE Green Building regulations and Dubai Municipality standards specify minimum glazing U-values and solar heat gain coefficients. We can produce specification documents demonstrating compliance for any project.",
        ],
      },
      {
        heading: "Laminated vs tempered: safety and security",
        paragraphs: [
          "All glass used in hazardous locations — floor-to-ceiling panels, glass within 300mm of floor level, glass adjacent to doors — must be safety glass. In the UAE, this typically means either tempered (toughened) glass or laminated glass.",
          "Tempered glass is heat-treated to increase its strength and to cause it to break into small, relatively harmless fragments rather than dangerous shards. It is the standard choice for most residential applications and is supplied as standard in all Swiftrooms aluminium door and window systems.",
          "Laminated glass bonds two or more panes with a PVB or SGP interlayer. It does not shatter on breakage — it cracks but stays in the frame. This makes it superior for overhead glazing (skylights, roofights), anywhere where falling glass would be dangerous, and for security applications. In acoustic glazing specifications, laminated glass delivers the best performance at a given glass thickness.",
          "For most UAE villa applications: tempered solar control glass in standard positions, laminated in overhead glazing and security-critical positions.",
        ],
      },
      {
        heading: "Double vs triple glazing in the UAE",
        paragraphs: [
          "Triple glazing is commonplace in Northern Europe, where retaining interior heat through cold winters justifies the additional weight and cost. In the UAE, the case is less straightforward.",
          "Triple glazing improves U-value compared to double glazing, but the practical thermal benefit in the UAE is smaller than it sounds. UAE buildings are primarily concerned with heat ingress from solar radiation — which is addressed by solar control coating, not by adding a third pane. The marginal improvement in U-value from triple versus high-performance double glazing is small in the context of overall building heat load.",
          "There are UAE applications where triple glazing makes sense: ultra-high-performance specifications targeting LEED or Estidama Pearl ratings, specialist acoustic applications, or commercial buildings with high internal heat loads requiring maximum envelope performance. For standard residential applications, a well-specified double-glazed unit with high-performance solar control coating is the right call — simpler, lighter, and offering equivalent comfort outcomes at lower cost.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4600 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4600" },
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
    ],
  },
  {
    slug: "acoustic-glazing-dubai-noise-reduction",
    date: "June 2026",
    category: "Technical Guide",
    title: "Acoustic Glazing in Dubai: How to Reduce Noise by Up to 50dB",
    excerpt:
      "Whether you live near a main road, a construction site or under a flight path, acoustic glazing can transform the quietness of your home. Here is what actually works.",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The noise problem is getting worse",
        paragraphs: [
          "Dubai is a city in constant construction. Road infrastructure, new residential towers, metro extensions — the acoustic environment of any given neighbourhood can change dramatically within a single year. Residents who bought in a quiet villa community five years ago may now find themselves within earshot of a new arterial road or a high-density development.",
          "The solution is not earplugs. It is the right glazing specification. Modern acoustic glass, installed within a well-sealing aluminium system, can reduce incoming noise levels by 38 to 52 decibels — the difference between hearing traffic clearly inside your home and being genuinely unaware of it.",
        ],
      },
      {
        heading: "How sound travels through a window",
        paragraphs: [
          "Sound enters a building through any gap in the envelope — and windows are typically the weakest point. A standard single-glazed window provides approximately 24–28dB of sound reduction. A standard double-glazed unit improves this to 30–34dB. Good acoustic glazing, in a well-sealing frame, achieves 38–52dB.",
          "The critical insight is that sound reduction is limited by the weakest path. A perfectly specified acoustic glass unit installed in a frame with a failing perimeter seal will perform at the level of the seal, not the glass. This is why acoustic performance is a system specification — not just a glass specification.",
        ],
      },
      {
        heading: "Acoustic glass: the specification choices",
        paragraphs: [
          "Standard double glazing uses two panes of glass, typically 4mm or 6mm, separated by an air or argon gap. For acoustic improvement, two strategies work: laminated glass and asymmetric pane thicknesses.",
          "Laminated acoustic glass bonds two glass panes with a PVB (polyvinyl butyral) or SGP interlayer. The interlayer acts as a vibration damper — it absorbs sound energy rather than transmitting it. A 6.4mm laminated glass (two 3mm panes with 0.4mm PVB) outperforms standard 6mm glass of the same thickness by a meaningful margin.",
          "Asymmetric glazing uses different glass thicknesses for the two panes in a double-glazed unit — for example, 6mm outer and 10mm inner rather than 6mm and 6mm. Different thicknesses have different resonant frequencies, which prevents the unit from vibrating in sympathy at any single frequency. This is particularly effective against traffic noise, which spans a wide frequency range.",
        ],
      },
      {
        heading: "Frame and seal: the overlooked factor",
        paragraphs: [
          "A premium acoustic glass unit installed in a standard residential aluminium frame with a basic perimeter seal will not achieve its rated performance. The frame must be designed to accommodate the acoustic glass unit correctly, and the perimeter sealing between frame and masonry must be continuous and airtight.",
          "Cortizo window and door systems use multi-chamber profiles with co-extruded sealing gaskets at multiple contact points. The Cor 70 Hidden Sash system is particularly effective acoustically because the frame itself is concealed — reducing the perimeter gap that sound can find.",
          "The installation detail matters as much as the product specification. Expanding foam perimeter seals, correctly applied and backed with acoustic mastic, complete the barrier. This is not a detail that should be left to a window fitter working without a specification — it is one that should be defined in a project acoustic report if noise is a primary concern.",
        ],
      },
      {
        heading: "What to expect in practice",
        paragraphs: [
          "A typical villa renovation in a road-facing location, moving from original builder-grade single or double glazing to a thermally broken aluminium system with laminated acoustic glass, typically achieves 12–18dB of measured improvement. This is significant: 10dB is perceived as roughly halving the loudness of a sound.",
          "For highly noise-sensitive applications — a bedroom directly facing a main road, or a study adjacent to mechanical plant — specifying a 44.2 laminated outer pane (4mm + 4mm + 0.76mm PVB) with a 14mm argon-filled cavity and a 10mm inner pane can achieve Rw 50dB or above, depending on the specific system and installation.",
          "If noise is a primary driver for your glazing project, ask us for an acoustic specification — we can model the expected performance based on your measured ambient noise levels and the specific glass units available in our system range.",
        ],
      },
    ],
  },
  {
    slug: "upvc-vs-aluminium-windows-uae",
    date: "May 2026",
    category: "Buying Guide",
    title: "uPVC vs Aluminium Windows for UAE Homes: An Honest Comparison",
    excerpt:
      "Both materials appear in UAE villa specifications. Both carry warranty claims. But in the UAE climate, they perform very differently over time. Here is a frank comparison.",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The question comes up in almost every consultation",
        paragraphs: [
          "We are asked to compare uPVC and aluminium windows constantly — and we supply both, so we have no commercial reason to favour one over the other. What follows is our honest assessment based on fifteen years of installation and maintenance work in the UAE.",
          "The honest answer is: aluminium is the better long-term choice for most UAE residential applications, but uPVC is a legitimate option in specific situations and at lower price points. The differences matter more here than in Europe.",
        ],
      },
      {
        heading: "How the UAE climate changes the equation",
        paragraphs: [
          "In a Northern European climate, uPVC is an excellent material. Temperatures are mild, UV exposure is moderate, and the expansion and contraction cycles the frame experiences are within the tolerances of a well-made uPVC profile.",
          "The UAE is different. In summer, a south-facing window frame can reach 80°C+ on its external face. uPVC expands at roughly three to four times the rate of aluminium over the same temperature range. In a frame that is well-designed for this, with adequate expansion gaps and the right hardware clearances, this is manageable. In a frame that is not — and many budget uPVC products imported into the UAE are not — the result over time is warping, seal failure and hardware that no longer operates correctly.",
        ],
      },
      {
        heading: "Profile strength and design freedom",
        paragraphs: [
          "Aluminium is structurally superior to uPVC at the profile level. This means aluminium frames can be made thinner, carry larger glass panes, and span wider openings without requiring steel reinforcement in the core. A premium aluminium system like the Cortizo Cor 70 has a visible sightline of 42mm on a casement window. A comparable uPVC frame is typically 80–100mm — nearly twice the visible frame width.",
          "For a villa with large openings, floor-to-ceiling glazing, or a modern architectural style, the visual difference is significant. uPVC naturally suits smaller, more traditional window formats.",
        ],
      },
      {
        heading: "Thermal performance: closer than you think",
        paragraphs: [
          "Here, uPVC has historically had an advantage. The material itself is a poor conductor of heat, meaning there is no inherent bridging between the outer and inner faces of the frame. Aluminium, by contrast, conducts heat readily — which is why thermally broken aluminium systems (with a polyamide insert in the profile) are essential for UAE applications.",
          "With a quality thermally broken aluminium system, however, the thermal performance gap narrows considerably. The Cortizo Cor 70 and Gulf Extrusions TB600 series both achieve thermal transmittance values comparable to mid-range uPVC, and both carry the hardware precision and longevity that uPVC cannot match in the long term.",
        ],
      },
      {
        heading: "Our recommendation",
        paragraphs: [
          "For principal windows and doors in a UAE villa, aluminium is the right long-term choice. The structural performance, the design flexibility, the durability in extreme UV and heat, and the long-term hardware performance all favour aluminium. The premium over uPVC is real but is recovered in longevity and lower maintenance over a 15–20 year horizon.",
          "For secondary applications — service areas, utility rooms, budget residential developments where cost is the primary constraint — uPVC from a quality manufacturer (not budget import products) is a legitimate specification. We supply uPVC from Gulf Extrusions to this end, and we stand behind it in these applications.",
          "The worst outcome is a cheap uPVC product installed in a prominent UAE location by a contractor whose warranty will not be honoured five years from now. If the budget forces a uPVC choice, choose the manufacturer and installer as carefully as the specification.",
        ],
      },
    ],
    relatedProducts: [
      { name: "uPVC Casement", href: "/catalogue/upvc/upvc-casement" },
      { name: "uPVC Sliding", href: "/catalogue/upvc/upvc-sliding" },
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
    ],
  },
  {
    slug: "bi-fold-vs-lift-and-slide-uae",
    date: "April 2026",
    category: "Buying Guide",
    title: "Bi-fold vs Lift-and-Slide: Which Door Is Right for Your UAE Villa?",
    excerpt:
      "Both systems open walls to outdoor space. But they do it differently, at different price points and with different trade-offs. Here is how to decide.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The question we hear most often",
        paragraphs: [
          "Walk through any high-end UAE villa showroom and you will see both systems on display — the bi-fold and the lift-and-slide. They serve the same architectural purpose: opening a wall between interior and exterior living space. But they achieve it through fundamentally different mechanisms, and the right choice depends on your opening size, the view you want to frame and how you actually live in the space.",
          "This article explains both systems plainly, from an installer's perspective — without the marketing language. By the end, you should have a clear sense of which is the better fit for your project.",
        ],
      },
      {
        heading: "How each system opens",
        paragraphs: [
          "A bi-fold door stacks its panels to one or both sides of the opening. Each panel folds against the next along vertical hinges, concertina-style, until the entire door set sits in a compact stack against the wall. The opening is unobstructed. There is no frame crossing the middle of the view.",
          "A lift-and-slide door moves horizontally on tracks. Turning the handle lifts the panel fractionally off the sill seal, allowing it to glide on precision rollers. Panels park behind each other or into a pocket, leaving the opening clear up to the extent that the track allows. A two-panel system opens to roughly 50% of the overall width; a four-panel system can open further, but two panels always remain as the parked stack.",
        ],
      },
      {
        heading: "Comparing key factors",
        paragraphs: [
          "Opening width: bi-fold systems can span wider openings because additional panels add little structural complexity. A six-panel bi-fold can fill a 6-metre opening. Lift-and-slide systems become more complex and expensive at very large widths because each panel must be independently operable with a precision mechanism. For openings beyond 5 metres, bi-fold is often the more practical specification.",
          "Panel size and glass area: lift-and-slide wins decisively here. Individual panels can reach 4 metres wide and 3.5 metres tall with the Cortizo 4700. Bi-fold panels are constrained by the hinge and folding mechanism — typically 1.2 metres maximum per leaf. This means bi-fold systems have more frame visible in the opening relative to glass area.",
          "Operation in daily use: lift-and-slide is the choice for doors used daily. One handle operation, no stepping over folding panels, no dust accumulation in hinge mechanisms. Bi-fold doors with multiple leaves require a specific folding sequence and the folded panels occupy pavement space. For a living room door opened and closed multiple times daily, lift-and-slide is significantly more convenient.",
        ],
      },
      {
        heading: "The UAE climate consideration",
        paragraphs: [
          "Both systems can be specified with thermal break profiles and appropriate solar control glass for UAE conditions. However, the fold-and-stack mechanism of a bi-fold door creates more exposed hinge surfaces, hardware and sealing interfaces that can accumulate dust. In areas exposed to regular sandstorms, the simpler mechanism of a lift-and-slide requires less maintenance.",
          "For a rear elevation pool terrace door opened regularly in the evenings but kept closed during daylight in summer, either system performs well. For a loggia that may be fully open for days at a time during winter months, bi-fold's complete opening might be preferable despite the maintenance premium.",
        ],
      },
      {
        heading: "Our recommendation",
        paragraphs: [
          "For most UAE villa living-room-to-pool connections: lift-and-slide. The daily operation, glass-to-frame ratio and long-term maintenance profile are superior. The Cortizo Cor Vision 4600 or 4700 will do this better than any bi-fold at comparable price points.",
          "For large entertaining terraces, loggia openings or spaces where the full opening matters architecturally and the door is opened for extended periods: bi-fold. The Cortizo bi-fold system is engineered to European standards and handles the full opening width that lift-and-slide cannot practically achieve at a reasonable cost.",
          "Both systems are available to view at full scale in our Jebel Ali showroom — operate both, experience the difference and make the decision with your hands, not just a brochure.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4700", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cor Vision 4600", href: "/catalogue/aluminium-sliding-doors/cor-vision-4600" },
      { name: "Cortizo Bi-fold", href: "/catalogue/aluminium-bi-folding-doors/cortizo-bifold" },
    ],
  },
  {
    slug: "choosing-aluminium-windows-dubai",
    date: "March 2025",
    category: "Buying Guide",
    title: "How to Choose Aluminium Windows for a Dubai Villa",
    excerpt:
      "With so many system options on the market, navigating the aluminium window specification process can feel overwhelming. Here we break down what matters most.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why the UAE market is different",
        paragraphs: [
          "Specifying aluminium windows in Dubai is fundamentally different from doing so in Europe. The climate — extreme UV, summer temperatures exceeding 45°C, occasional high winds and salt air in coastal areas — places specific demands on every component of a window system, from the profile to the glass to the hardware.",
          "The UAE market is also saturated with products at dramatically different quality levels. Without knowing what to look for, it's easy to spend a significant sum on a system that fails within a decade. This guide is designed to help you ask the right questions and make a decision you won't regret.",
        ],
      },
      {
        heading: "Thermal break: non-negotiable",
        paragraphs: [
          "The single most important specification criterion for UAE conditions is the thermal break — a barrier of non-conductive material inserted into the aluminium profile that prevents the external and internal faces of the frame from conducting heat between each other.",
          "Without it, aluminium frames become heat conductors, making your air conditioning work harder, creating condensation risk on internal surfaces, and creating discomfort near windows in summer. Every system we supply is thermally broken as standard.",
          "When evaluating a system, ask to see the thermal break specification. European-made systems like Cortizo typically feature polyamide thermal breaks of 24–34mm depth. Be sceptical of systems described as 'thermally broken' without a specific break depth.",
        ],
      },
      {
        heading: "Profile quality and extrusion standards",
        paragraphs: [
          "Aluminium profiles are extruded — pushed through a die to create the frame cross-section. The quality of the alloy, the precision of the extrusion and the integrity of the resulting profile vary enormously between manufacturers.",
          "European manufacturers like Cortizo use 6063-T6 alloy extruded to tight tolerances, resulting in profiles that accept hardware correctly, seal consistently and maintain dimensional accuracy over time. Many market-grade alternatives use lower-spec alloys extruded to looser tolerances — resulting in systems that may look similar on paper but perform and feel very different in use.",
        ],
      },
      {
        heading: "Hardware: the moving parts that matter most",
        paragraphs: [
          "The hardware in your windows and doors — hinges, locks, handles, rollers — is what you interact with every day. European hardware brands like Roto, Maco and Winkhaus engineer their components to withstand decades of operation. Generic hardware often shows wear within 3–5 years in UAE conditions.",
          "For lift-and-slide systems specifically, the roller mechanism is critical. The premium Cortizo 4700 system uses precision-ground steel rollers that allow 500kg panels to move with finger-tip effort. This is the physical difference between a premium and a budget lift-and-slide that no specification sheet can fully communicate — which is why a showroom visit matters.",
        ],
      },
      {
        heading: "Glass: the largest element",
        paragraphs: [
          "The glass in your windows and doors represents the majority of the opening area and is responsible for most of the thermal and acoustic performance. Standard double-glazed units are a minimum specification; for UAE conditions, we typically recommend low-e solar control glass that selectively blocks infrared heat while allowing visible light transmission.",
          "For bedrooms facing roads or external noise sources, acoustic laminated glass makes a significant difference to sleep quality. For west-facing elevations exposed to afternoon sun, tinted or reflective coatings can dramatically reduce solar heat gain. Glass specification is project-specific — we advise on the right solution for each opening during the consultation.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Gulf Extrusions TB600", href: "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn" },
      { name: "Cortizo Casement", href: "/catalogue/aluminium-windows/cortizo-casement" },
    ],
  },
  {
    slug: "thermal-break-uae-climate",
    date: "February 2025",
    category: "Technical",
    title: "Why Thermal Break Aluminium is Essential in the UAE",
    excerpt:
      "Without thermal break technology, aluminium window frames become heat conductors in summer. We explain the physics and the performance difference you can measure.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The physics of heat conduction",
        paragraphs: [
          "Aluminium is an excellent conductor of heat — approximately 1,000 times more conductive than the glass in your window unit. Without intervention, an aluminium frame at 50°C on its external face will rapidly conduct that heat to its internal face, radiating it into your room and working directly against your air conditioning system.",
          "This effect is measurable. Studies of UAE buildings with non-thermally broken aluminium frames have recorded internal frame surface temperatures exceeding 40°C during summer — creating significant discomfort near windows, increasing air conditioning load, and in some cases contributing to condensation and mould growth on internal surfaces.",
        ],
      },
      {
        heading: "What a thermal break actually does",
        paragraphs: [
          "A thermal break is a strip of low-conductivity material — typically glass-reinforced polyamide (nylon) — inserted into the aluminium profile during manufacture, physically separating the external and internal halves of the frame. Heat must now cross this polyamide barrier, which has a thermal conductivity approximately 1,300 times lower than aluminium.",
          "The result is an internal frame surface that remains cool to the touch in summer, a frame-to-glass seal that functions correctly year-round, and a measurable reduction in heat transmitted through the frame into the internal environment. The difference in a UAE villa is not subtle — it changes how comfortable you feel near windows and how hard your air conditioning works.",
        ],
      },
      {
        heading: "What to look for in a thermal break specification",
        paragraphs: [
          "Not all thermal breaks are equal. The depth of the break (the distance the polyamide travels across the profile) directly affects its thermal performance. Entry-level systems feature breaks of 12–16mm; premium European systems like Cortizo feature breaks of 24–34mm. The wider the break, the lower the thermal transmittance (Uf value) of the frame.",
          "European systems carry a CE mark and are independently tested to EN 10077 for thermal transmittance. Ask for the Uf value of any system you are considering — a good aluminium window should achieve Uf values of 2.0 W/m²K or better. Beware of systems that claim to be 'thermally broken' without providing a tested Uf value.",
        ],
      },
      {
        heading: "The real-world cost difference",
        paragraphs: [
          "Thermally broken systems cost more. But the premium — typically 30–50% over non-broken equivalents — needs to be set against the energy cost of running air conditioning against an unbroken frame across the UAE summer season. Based on our experience across 500+ projects, clients with thermally broken systems consistently report meaningful reductions in cooling energy consumption compared to their previous specification.",
          "There's also the comfort factor, which has no direct financial value but is reported by clients as the most immediately noticeable change following upgrade. The ability to sit near a window or door in July without discomfort — something that sounds simple — is in practice a significant quality-of-life improvement.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Gulf Extrusions TB600", href: "/catalogue/aluminium-windows/gulf-extrusion-tb600-tilt-and-turn" },
    ],
  },
  {
    slug: "cortizo-vs-generic-aluminium",
    date: "January 2025",
    category: "Product",
    title: "Cortizo vs Generic Aluminium Systems: A Practical Comparison",
    excerpt:
      "The price difference between a premium European system and a generic equivalent can be significant. We compare what you actually get for the additional investment.",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Setting the comparison straight",
        paragraphs: [
          "The phrase 'aluminium window' covers an enormous range of products at vastly different price points. In the UAE market, you will encounter everything from sub-AED 2,000 casement windows to Cortizo systems costing 5–10x that for the same opening. Understanding what drives this difference is the only way to make a rational purchasing decision.",
          "This comparison focuses on the factors that actually affect your experience of living with the products over time — not brochure specifications, but real-world performance.",
        ],
      },
      {
        heading: "Profile quality: what you can and cannot see",
        paragraphs: [
          "On a specification sheet, a generic aluminium window and a Cortizo system may list similar profile depths, similar thermal break claims and similar performance ratings. The difference is in the manufacturing precision and alloy quality that cannot be communicated in a table.",
          "Cortizo extrudes to tolerances of ±0.1mm, using 6063-T6 aluminium alloy throughout. This precision means hardware fits correctly from the factory, seals compress evenly, and the system operates as designed from day one and for decades thereafter. Generic profiles often show measurable dimensional variation within the same batch — resulting in hardware that requires repeated adjustment and seals that compress unevenly.",
        ],
      },
      {
        heading: "Hardware: where the difference is felt daily",
        paragraphs: [
          "The single biggest real-world difference between a Cortizo system and a generic equivalent is hardware quality. Cortizo systems are fitted with European-standard hardware from manufacturers including Roto, Maco and Winkhaus — companies that engineer their products to 100,000-cycle test standards.",
          "Generic systems use hardware from manufacturers without independently tested cycle life. In our experience servicing properties across the UAE, generic hardware begins showing wear — stiff operation, misalignment, seal failure — at 3–5 years in the UAE environment. Cortizo hardware, maintained correctly, is still operating smoothly at 15+ years.",
        ],
      },
      {
        heading: "Thermal performance: what the numbers mean",
        paragraphs: [
          "Both categories will claim thermal break performance. The difference is the break depth and the independently tested Uf value that results. Cortizo Cor 70 series frames achieve tested Uf values of 1.8–2.4 W/m²K. Generic systems claiming thermal break performance are rarely independently tested and, where testing exists, typically achieve Uf values of 3.5–5.0 W/m²K.",
          "This difference is real and measurable. Lower Uf means less heat conducted through the frame, less work for your air conditioning, and cooler internal surfaces in summer. The Cortizo advantage is not marginal — it is approximately twice the thermal performance of a typical market alternative.",
        ],
      },
      {
        heading: "The 10-year cost comparison",
        paragraphs: [
          "A generic aluminium system may cost 50–60% less upfront. But over a 10-year period in the UAE, the comparison changes. Factor in: hardware replacement at year 5 (common with generic systems), resealing at year 3–5, increased air conditioning costs from poorer thermal performance, and the reduced property value associated with a lower-specification fenestration package.",
          "Our clients who have upgraded from generic to Cortizo consistently describe the experience as obvious — in operation, in feel, in the temperature near the frames. That qualitative difference translates into property value, rental premium and daily comfort that is difficult to quantify but universally reported.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4700", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
    ],
  },
  {
    slug: "lift-and-slide-doors-villa",
    date: "December 2024",
    category: "Product",
    title: "Lift-and-Slide Doors: Everything You Need to Know",
    excerpt:
      "The Cor Vision 4600 and 4700 are our most popular products. We explain how lift-and-slide technology works and why it outperforms standard sliding doors at any price point.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "How lift-and-slide works",
        paragraphs: [
          "In a standard sliding door, the glass panel sits on rollers and slides on a track. The panel remains in contact with the bottom seal throughout its travel. This contact creates friction, limits the panel weight that can be practically moved, and creates a seal that compresses imperfectly at rest.",
          "A lift-and-slide door works differently. Turning the handle activates a mechanism that lifts the panel slightly — typically 2–3mm — off the bottom sill seal. The panel now rides on precision rollers with no contact with the sill seal. To close, turning the handle back down lowers the panel onto the seal, compressing it fully under the panel's own weight.",
        ],
      },
      {
        heading: "Why this matters for UAE villas",
        paragraphs: [
          "The lift-and-slide mechanism solves three problems simultaneously. First, it allows much heavier panels — up to 500kg in the Cortizo 4700 — to be moved with fingertip effort. This means wider, taller glass panels that create more dramatic indoor-outdoor connections. Second, when the handle is closed, the panel's weight compresses the sill seal under gravity, creating a significantly tighter weather seal than a standard sliding door.",
          "Third, the precision rollers — rather than friction along the track — eliminate the wear pattern that causes standard sliding doors to become stiff over time. A lift-and-slide door that operates smoothly on day one should operate identically after 15 years of daily use.",
        ],
      },
      {
        heading: "Cor Vision 4600 vs 4700: which to choose",
        paragraphs: [
          "The Cor Vision 4600 is our most popular lift-and-slide system. It accepts panels up to 350kg, achieving widths up to 3,500mm and heights up to 3,200mm per panel. The central mullion (the vertical frame element where panels meet) is 28mm — slim enough to be almost invisible at the standard viewing distance of a living room.",
          "The 4700 is the flagship — panels up to 500kg, widths up to 4,000mm and heights to 3,500mm, with a 24mm central mullion. The 4700 is specified for the largest openings and the most demanding luxury villa projects. It costs approximately 20–30% more than the 4600 and is worth that premium for large openings where the additional width or height makes a meaningful architectural difference.",
        ],
      },
      {
        heading: "Installation requirements",
        paragraphs: [
          "Lift-and-slide doors require accurate structural openings. The head and sill must be perfectly level and square, with structural capacity to support the panel weights involved. Our survey team assesses every opening before we specify — if a structural lintel needs reinforcing, we'll identify this before the system is ordered.",
          "The track and sill installation is critical to long-term performance. Improper drainage, incorrect sill levelling or inadequate fixing will cause problems regardless of product quality. Our installation teams are trained specifically on Cortizo systems — not generic glass and glazing installers.",
        ],
      },
      {
        heading: "Maintenance",
        paragraphs: [
          "Lift-and-slide systems are straightforward to maintain. The rollers benefit from an annual silicone-based lubrication. The sill seal should be inspected annually and the drainage channel kept clear of debris — particularly important in the UAE where dust and sand accumulate rapidly. The hardware — handles, locking points, roller adjustment — rarely requires attention if the system was installed correctly. Our aftercare team is available for annual service visits.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4600", href: "/catalogue/aluminium-sliding-doors/cor-vision-4600" },
      { name: "Cor Vision 4700", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cor Vision Plus", href: "/catalogue/aluminium-sliding-doors/cor-vision-plus" },
    ],
  },
  {
    slug: "curtain-wall-residential",
    date: "November 2024",
    category: "Technical",
    title: "Curtain Wall for Residential Projects: When and Why",
    excerpt:
      "Once reserved for commercial towers, structural glazing and curtain wall systems are increasingly specified for prestige Dubai villas. Is it right for your project?",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "What curtain wall actually is",
        paragraphs: [
          "Curtain wall is a non-structural facade system — a glass and aluminium skin attached to the building's structural frame, carrying only its own weight and wind loads. Unlike window systems, curtain wall covers continuous building faces without requiring structural wall elements between openings. The result is a fully glazed facade.",
          "In commercial buildings, curtain wall is standard. In residential architecture, it has historically been associated only with exceptional projects. That is changing in Dubai, where the aspiration for floor-to-ceiling glass architecture in prestige villas is driving genuine curtain wall specifications in residential contexts.",
        ],
      },
      {
        heading: "When curtain wall is appropriate for a villa",
        paragraphs: [
          "The primary residential application for curtain wall is the entrance hall or double-height glazed feature — a full-height glazed wall that acts as an architectural centrepiece. Our Emirates Hills project is a good example: a floor-to-ceiling curtain wall installation in the entrance hall created a glass lobby experience that no window system could replicate.",
          "Curtain wall is also the correct specification when the glazed area extends beyond what a window system can span structurally. If the opening is wider or taller than 3 metres without intermediate structural support, curtain wall framing may be the correct technical solution.",
        ],
      },
      {
        heading: "Performance in UAE conditions",
        paragraphs: [
          "Curtain wall systems for UAE residential use must address three key performance requirements: thermal performance, solar control and structural wind resistance. The Cortizo TP52 system we supply achieves wind resistance of +/-4.0 kPa — more than adequate for UAE residential applications. Thermal performance is addressed through thermally broken mullions and the specification of appropriate solar control glass.",
          "The glass specification is particularly important in a full-height curtain wall. An incorrectly specified glass will result in a facade that is difficult to manage thermally in summer, regardless of the frame specification. We work with specialist glass consultants on large curtain wall projects to ensure the glass performance is matched to the orientation and exposure.",
        ],
      },
      {
        heading: "Cost and complexity",
        paragraphs: [
          "Curtain wall is more expensive than window systems on a per-square-metre basis — typically 2–4x the cost of equivalent standard aluminium window framing. It also requires greater structural coordination with the building's engineer, more complex installation sequencing and longer lead times.",
          "For the right project, the investment is justified. For projects where a premium window system can achieve a similar visual result, the window route is usually the more pragmatic choice. The distinction is often in the height of the opening — above 3.5 metres, curtain wall framing becomes the structural requirement rather than a choice.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo TP52", href: "/catalogue/curtain-wall/cortizo-tp52" },
      { name: "Cortizo TP52 Equity", href: "/catalogue/curtain-wall/cortizo-tp52-equity" },
    ],
  },
  {
    slug: "garden-rooms-uae",
    date: "October 2024",
    category: "Product",
    title: "Glass Garden Rooms: The UAE's Most Requested Addition",
    excerpt:
      "The demand for year-round outdoor living space in the UAE has driven a surge in garden room and conservatory enquiries. We explore the options and costs.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The UAE garden room challenge",
        paragraphs: [
          "The appeal of a glass garden room — a sheltered, light-filled space connecting the house to the garden — is universal. In the UK, garden rooms are used 9 months of the year. In the UAE, the challenge is designing a glass room that doesn't become unusable for 5 months during summer.",
          "The solution is not to avoid garden rooms in the UAE — it's to engineer them correctly for the climate. Our Abu Dhabi garden room project demonstrated that a properly specified glass room with solar control glass, concealed ventilation and the right thermal specification can be genuinely comfortable year-round, including in July.",
        ],
      },
      {
        heading: "Glass specification for UAE garden rooms",
        paragraphs: [
          "The glass is the most important variable in a UAE garden room. Standard clear double-glazing transmits approximately 75% of solar radiation as heat. Low-e solar control glass transmits as little as 20% of solar radiation while maintaining a similar visible light transmission — the room remains bright but does not heat up in the same way.",
          "For roof sections — where the sun load is most intense — an insulated panel system rather than a fully glazed roof can dramatically reduce heat gain while maintaining the architectural character of a glass room. We often combine a glazed wall and end elevation with an insulated roof panel on the south or west-facing sections.",
        ],
      },
      {
        heading: "Ventilation: the critical element",
        paragraphs: [
          "A glass room without adequate ventilation will overheat regardless of glass specification. We integrate ventilation into every UAE garden room — typically through concealed fixed ventilators in the frame, operable windows in the end elevation, and ridge vents concealed within the roofline.",
          "For maximum usability in shoulder seasons (March–April, October–November), a garden room with large operable sections allows cross-ventilation that eliminates the need for mechanical cooling on many days. The result is a space that feels genuinely outdoor-adjacent rather than air-conditioned-enclosure.",
        ],
      },
      {
        heading: "Planning and approvals",
        paragraphs: [
          "In most UAE villa communities, a garden room addition requires community management approval and, in some cases, a municipality building permit. We handle the specification documentation required for approval applications and can advise on the community-specific requirements for your project location.",
          "Lead times for garden rooms are typically 8–12 weeks from order confirmation. The structural framework is manufactured to your specific dimensions in our partnered fabrication facility, delivered as a kit and assembled on-site over 2–3 days.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Premium Garden Room", href: "/catalogue/garden-rooms/premium-garden-room" },
      { name: "Glass Conservatory", href: "/catalogue/garden-rooms/glass-conservatory" },
    ],
  },
  {
    slug: "green-building-glazing-uae",
    date: "May 2026",
    category: "Technical Guide",
    title: "Green Building & Glazing in the UAE: Estidama, LEED and Dubai Greenlist Explained",
    excerpt:
      "Estidama Pearl Ratings, DEWA green building codes, and Dubai Greenlist compliance — what they mean for your glazing specification, and which performance targets your windows and doors must meet.",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why glazing is central to UAE green building compliance",
        paragraphs: [
          "Glazing accounts for the largest single variable in a UAE building's energy performance. A villa or apartment with correctly specified windows and doors can reduce cooling energy consumption by 30–45% compared to the same building with a generic aluminium and clear glass specification. For green building compliance, this makes glazing the first — and most impactful — area to get right.",
          "Three regulatory frameworks govern green building in the UAE: Abu Dhabi's Estidama Pearl Rating System, the UAE Green Building Specifications (federal), and Dubai's Green Building Regulations and Specifications — which includes the Dubai Greenlist for product pre-approval. Understanding which applies to your project determines what your glazing specification must achieve.",
        ],
      },
      {
        heading: "Estidama Pearl Rating System (Abu Dhabi)",
        paragraphs: [
          "Estidama is Abu Dhabi's mandatory green building framework. All new residential villas, apartment buildings and commercial developments in Abu Dhabi must achieve a minimum of 1 Pearl. Government projects require 2 Pearls. The system is administered by the Abu Dhabi Urban Planning Council (UPC).",
          "Glazing specifications under Estidama are governed by the Indoor Environment (IE) and Natural Resources (NR) categories. Key glazing requirements at 1 Pearl level include: a maximum U-value of 3.3 W/m²K for the overall window assembly, and a maximum SHGC (Solar Heat Gain Coefficient) of 0.40 for east, west and north orientations — and 0.25 for south-facing glazing in Abu Dhabi's intense solar context.",
          "To meet Estidama 1 Pearl with aluminium frames, thermally broken profiles are mandatory — non-broken aluminium cannot achieve the U-value requirement. At 2 Pearl level, enhanced SHGC limits of 0.30 and 0.20 are typically required. Laminated or triple-glazed units with low-e coatings are the normal route to compliance at higher Pearl levels.",
        ],
      },
      {
        heading: "Dubai Green Building Regulations",
        paragraphs: [
          "Dubai Municipality issued its Green Building Regulations and Specifications in 2011, updated progressively since. The regulations apply to all new buildings in Dubai above 300m² in floor area. Compliance is verified at the planning permit and completion certificate stages.",
          "Dubai's regulations specify maximum SHGC values by orientation and a minimum visible light transmittance (VLT) of 0.27 — to ensure that solar control glass does not make interiors uncomfortably dark. The standard requires: SHGC ≤ 0.25 for east and west facades; SHGC ≤ 0.40 for north-facing glazing; SHGC ≤ 0.30 for south-facing glazing. Maximum window-to-wall ratio is limited to 40% on east and west elevations for most building types.",
          "The overall window assembly U-value must not exceed 3.7 W/m²K for residential buildings under Dubai regulations. Thermally broken aluminium with a quality double-glazed unit incorporating a low-e coating will meet this in most configurations. The Cortizo Cor Vision and Cor 70 ranges tested to EN 10077 achieve frame U-values of 2.0–2.4 W/m²K, providing comfortable compliance margin.",
        ],
      },
      {
        heading: "Dubai Greenlist — product pre-approval",
        paragraphs: [
          "The Dubai Greenlist is a pre-approved product register maintained by Dubai Municipality. Products on the Greenlist have been independently tested and verified to meet Dubai's environmental standards — simplifying the approval process for architects and contractors who specify them.",
          "For glazing, Greenlist-registered products include glass units from approved manufacturers with verified SHGC and VLT values. When selecting glass for a Dubai project, specifying from the Greenlist reduces the documentation burden and accelerates municipality approval. We can advise on which glass products from our approved supply chain are Greenlist registered for any given project requirement.",
        ],
      },
      {
        heading: "LEED in the UAE — what it means for glazing",
        paragraphs: [
          "LEED (Leadership in Energy and Environmental Design) is widely used for commercial and mixed-use developments in the UAE alongside Estidama and Dubai's own framework. LEED v4 and v4.1 are the current versions in use. For LEED certification, glazing contributes primarily to Energy & Atmosphere (EA) credits through reduced cooling load.",
          "LEED's energy modelling approach requires the glazing specification to be input into an energy simulation (typically EnergyPlus or eQUEST) demonstrating a percentage improvement over an ASHRAE 90.1-2016 baseline. The simulation inputs require certified SHGC, U-value and VLT values from glazing manufacturers — which European-origin products with CE marking and EN-tested performance data can provide directly. Generic aluminium with unverified glass units cannot satisfy LEED's documentation requirements, regardless of how the performance compares.",
        ],
      },
      {
        heading: "Practical specification guidance for compliance",
        paragraphs: [
          "For most UAE residential projects targeting Estidama 1 Pearl or Dubai Green Building compliance: specify thermally broken aluminium profiles with frames achieving Uf ≤ 2.4 W/m²K, combined with double-glazed units featuring a high-performance low-e coating on surface 2 or 3 and an argon-filled cavity. This combination typically achieves an overall window U-value of 1.6–2.2 W/m²K and an SHGC of 0.22–0.30 depending on glass selection — comfortably meeting 1 Pearl and standard Dubai Green Building requirements.",
          "For higher ratings or heavily glazed facades, triple-glazed units or additional solar control coatings may be required. We provide U-value and SHGC calculations for any system and glass combination at specification stage, with full EN-certified data to support planning submissions. If you are working to a specific green building standard, share the target rating with us at enquiry stage and we will confirm compliance before any commitment is made.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4700 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Cortizo TP52 Curtain Wall", href: "/catalogue/curtain-wall/cortizo-tp52" },
    ],
  },
  {
    slug: "skylights-rooflights-uae-guide",
    date: "April 2026",
    category: "Buying Guide",
    title: "Skylights & Rooflights for UAE Villas: Fixed, Motorised & Pyramid Options Explained",
    excerpt:
      "A well-specified skylight transforms an internal space. A poorly specified one leaks, overheats or fogs up within five years. Here is what to specify for a UAE climate.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why rooflights are popular in UAE villas",
        paragraphs: [
          "The UAE villa typology almost universally features internal circulation spaces — entrance halls, staircases, corridors, bathrooms — that have no access to an external elevation. These spaces, without rooflights, are entirely reliant on artificial lighting. A rooflight brings natural daylight into the core of the building, reduces artificial lighting load, and — when correctly positioned above a staircase or hallway — creates a dramatic architectural moment that no light fitting can replicate.",
          "Demand for rooflights in the UAE has grown steadily as villa owners and developers recognise the quality-of-life improvement they deliver. They are now a standard specification item on new-build UAE villas above a certain price point, and a popular retrofit item on existing villas undergoing renovation.",
        ],
      },
      {
        heading: "Fixed vs motorised: which do you need?",
        paragraphs: [
          "A fixed rooflight is exactly what the name suggests — a sealed, non-opening glazed unit set into the roof. It admits daylight but provides no ventilation. Fixed rooflights are the right choice for internal spaces where the rooflight is above a habitable room below (a bedroom, a living area) where you would not want to open the rooflight anyway, and where the primary objective is light rather than ventilation.",
          "A motorised opening rooflight adds ventilation capability — the glass panel or panels open via an electric actuator, controlled by a wall switch or remote. In the UAE, this is most valuable in the shoulder seasons (October–November, March–April) when the outdoor temperature is comfortable enough to ventilate the building at night. A motorised rooflight above a staircase also allows stack-effect ventilation — hot air rises and escapes through the open rooflight, drawing cool air through lower-level openings. This is a genuinely effective passive cooling strategy for UAE conditions.",
        ],
      },
      {
        heading: "Glass specification: the critical decision",
        paragraphs: [
          "A horizontal or near-horizontal glazed surface receives the highest solar load of any element on the building envelope. A rooflight facing directly upward at UAE latitudes will receive solar radiation throughout most of the day for much of the year. Specifying the wrong glass turns the rooflight from an amenity into a liability.",
          "For UAE rooflights, the minimum glass specification is a laminated solar control unit with a Solar Heat Gain Coefficient (SHGC) of no more than 0.30. Better specifications achieve 0.20–0.25. A laminated outer pane provides safety in the event of glass breakage (fragments stay in place rather than falling into the space below) — this is mandatory for overhead glazing in most building regulations. Low-e coating on the internal surface of the unit further reduces radiated heat to the space below.",
          "Frosted or diffuse glass is commonly specified for bathroom rooflights for privacy — a combination of solar control and diffuse coating in a single laminated unit is available from most glazing suppliers and is the right specification for this application.",
        ],
      },
      {
        heading: "Structural framing: aluminium is the only choice",
        paragraphs: [
          "Rooflights in the UAE must be aluminium-framed. uPVC profiles are not structurally appropriate for overhead applications — they rely on steel reinforcement that is not designed for the loads and thermal cycling associated with a horizontal plane. Powder-coated aluminium frames, specified in any RAL colour to match the roof finish, are the industry standard for all UAE rooflight work.",
          "The frame profile must be thermally broken for any internal application. An unbroken aluminium frame conducts heat directly from the external face to the internal face — in a rooflight, this means the ceiling-visible internal frame face becomes extremely hot to the touch and radiates heat downward into the space. A thermally broken profile eliminates this effect.",
        ],
      },
      {
        heading: "Waterproofing and condensation",
        paragraphs: [
          "The interface between the rooflight frame and the roof structure is the most common source of water ingress in UAE buildings. This is rarely a product failure — it is almost always an installation failure. A correctly designed rooflight installation uses an upstand (a raised kerb) of at least 150mm above the finished roof level, a continuous waterproofing membrane turned up and over the upstand, and the rooflight frame fixed through and over the membrane. Poorly installed rooflights are set directly into the roof membrane without an adequate upstand.",
          "Condensation on the underside of the glass is occasionally reported in UAE rooflights. In most cases this indicates inadequate thermal performance of the glass unit — a poorly specified unit will have an internal glass surface temperature that drops below the dew point of the interior air on winter nights when the aircon is running. A high-performance low-e glass unit prevents this by maintaining a higher internal surface temperature.",
        ],
      },
      {
        heading: "What to ask your contractor",
        paragraphs: [
          "Before committing to a rooflight installation, ask your contractor: what SHGC value does the specified glass unit achieve? Is the outer pane laminated? Is the frame thermally broken? What upstand height is included in the installation? Is the waterproofing membrane included in the contract and who is responsible for its interface with the main roof membrane?",
          "A contractor who cannot answer these questions clearly, or who proposes to set the frame directly on the roof without an adequate upstand, should not be trusted with the work. The consequences of a failed rooflight installation — water ingress, heat gain, condensation, structural damage — are expensive and disruptive to remedy.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Fixed Rooflight", href: "/catalogue/skylights/fixed-rooflight" },
      { name: "Motorised Opening Skylight", href: "/catalogue/skylights/motorised-skylight" },
    ],
  },
  {
    slug: "pivot-doors-uae",
    date: "June 2026",
    category: "Buying Guide",
    title: "Pivot Doors UAE: Specification Guide for Luxury Villa Entrances",
    excerpt:
      "A pivot door makes a powerful first impression — but specifying one correctly in the UAE climate demands careful attention to panel weight, pivot hardware and glass specification. This guide covers everything.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "What is a pivot door?",
        paragraphs: [
          "A pivot door rotates on a vertical axis mounted at the top and bottom of the panel — not at its edge. Unlike a conventional hinged door, the pivot point is typically set 100–300mm from one face of the panel, creating a dramatic overhanging section when open. This allows for very wide, very tall and very heavy door panels that would be mechanically impossible with conventional side hinges.",
          "In the UAE luxury villa market, pivot doors have become the defining feature of high-specification entrances. Panels of 1,200–2,000mm wide and 2,700–3,600mm tall are now routinely specified — sometimes with frameless all-glass construction, sometimes in aluminium with large glass inserts. The effect is architectural rather than merely functional.",
        ],
      },
      {
        heading: "Floor spring vs overhead concealed pivot: which do you need?",
        paragraphs: [
          "The two dominant pivot systems in the UAE market are floor-spring pivots and overhead concealed pivots. A floor-spring pivot houses the pivot mechanism and the door closer in a cassette set into the floor — the door is supported at the bottom and controlled by a hydraulic closer integrated into the floor unit. This is the traditional system for heavy doors and remains the most reliable for panels over 150kg.",
          "Overhead concealed pivots mount the mechanism in the head of the door frame, transferring load upward rather than into the floor. This is the preferred system for projects where cutting into the floor slab is not possible — for example in apartments, refurbishments, or where underfloor services make a floor-spring cassette impractical. Overhead systems can typically handle panels up to 100–120kg; beyond this, a floor-spring system is required.",
          "At Swiftrooms, we specify Dorma Hüppe and Fritsjurgens pivot hardware for floor-spring applications. Both are hydraulically adjustable, available in concealed or surface-mounted configurations, and rated for continuous commercial use. Hardware selection is always matched to panel weight at the specification stage.",
        ],
      },
      {
        heading: "Panel sizes and structural requirements",
        paragraphs: [
          "Pivot doors require structural openings that are precisely engineered to take the load transfer from the pivot hardware. A standard aluminium frame pivot door of 1,200mm × 2,700mm weighs approximately 90–130kg depending on glass specification. A frameless all-glass pivot of the same size weighs 200–280kg. The structural lintel above the opening must be capable of transferring this load — for larger frameless panels, engineers typically specify a steel lintel.",
          "The floor-spring cassette requires a recess of approximately 90–120mm depth cut into the structural slab. This must be planned in advance during construction — retrofitting a floor-spring in a finished floor is expensive and disruptive. If your project is in the fit-out phase, confirm now whether floor-spring is feasible.",
        ],
      },
      {
        heading: "Glass specification for UAE pivot doors",
        paragraphs: [
          "The glass in a pivot door is both its most visible feature and its most technically demanding component. In a frameless all-glass pivot, the glass panel is also the structural element — a minimum 19mm toughened laminated glass is required for panels of this type at standard villa entrance heights. For UAE conditions, we specify low-e solar control glass as standard to manage heat gain, combined with a laminated outer pane for security and fragment retention in the event of impact.",
          "For aluminium-framed pivot doors with glass inserts, the glass unit is a conventional double-glazed insulated unit — typically 10mm toughened + 16mm argon cavity + 6mm laminated inner — with a low-e coating on the inner surface of the outer pane (EN surface 2). This achieves a SHGC of approximately 0.25–0.32, which is appropriate for entrance orientations that receive direct solar exposure.",
          "All glass in pivot doors should be toughened and/or laminated to satisfy UAE building code requirements for safety glazing in door applications.",
        ],
      },
      {
        heading: "Maintenance in the UAE climate",
        paragraphs: [
          "Pivot hardware requires annual lubrication with a high-viscosity hydraulic oil — not silicone spray, which is insufficient for the load-bearing components. Floor-spring units have an adjustment screw for closing speed and a separate adjustment for the hold-open position; these should be checked annually as they drift in high-use environments. The floor-spring cassette and its drainage channel should be cleared of sand and debris every three months.",
          "Frameless glass pivot doors require particular attention to the pivot floor patch fitting at the base — this must be kept clear of sand, which can ingress under the glass and scratch the floor finish or abrade the patch fittings. A low-profile door seal or brush seal is recommended to prevent ingress while preserving the flush appearance.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Vetromax Pivot Door", href: "/catalogue/aluminium-doors/vetromax-pivot-door" },
      { name: "Front Entrance Doors", href: "/catalogue/aluminium-doors/front-entrance-doors" },
    ],
  },
  {
    slug: "insect-screens-retractable-uae",
    date: "May 2026",
    category: "Buying Guide",
    title: "Retractable Insect Screens UAE — Choosing the Right System for Your Doors",
    excerpt:
      "Fixed fly screens block light and views permanently. Retractable screens disappear when not in use — but not all systems are the same. Here is how to choose the right one for your opening.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why retractable, not fixed?",
        paragraphs: [
          "In the UAE, insect screens serve a different purpose than in temperate climates. The challenge is not primarily flies — it is mosquitoes in the evening months (October to April) when temperatures allow natural ventilation, and sand and dust throughout the year. A fixed screen on a lift-and-slide or bi-fold opening defeats the entire purpose of the system: you install a 4-metre wall of glass to open the living space to the garden, and then close it off permanently with a grey mesh grid.",
          "A retractable screen solves this by deploying only when needed. When you want the view and the air, the screen retracts into a compact cassette at the side or head of the opening — completely invisible from inside. When the evening mosquitoes appear, the screen deploys across the full opening width with a single pull.",
        ],
      },
      {
        heading: "Single-panel vs pleated bi-directional systems",
        paragraphs: [
          "Single-panel retractable screens work on a spring-loaded cassette principle, similar to a roller blind. The mesh panel retracts into a slim aluminium cassette when not in use. These are highly reliable and suited to openings up to 2,400mm wide and 3,000mm tall. For openings up to 1,800mm wide, a single-panel system with magnetic closure is the most cost-effective and durable option.",
          "For wider openings — common on lift-and-slide doors in UAE villas — a pleated bi-directional screen deploys from both sides simultaneously, meeting in the middle. Each panel is independently spring-loaded, and the panels lock together with a magnetic closure at the join. This system handles openings up to 4,800mm and is the standard solution for wide lift-and-slide configurations. We offer this system in multiple mesh densities: standard 18×16 fibreglass mesh for insect screening, or a finer 20×20 pet-resistant mesh for households with dogs or cats.",
        ],
      },
      {
        heading: "Compatibility with your door system",
        paragraphs: [
          "Retractable screens are not universally compatible with all door systems — the cassette must be housed within the depth of the door frame or the structural reveal, and the guide channel must be continuous from head to sill. For lift-and-slide doors, the screen cassette is typically surface-mounted to the side jamb within the reveal; for bi-fold doors, a head-mounted system is usually more appropriate as it avoids conflict with the fold-and-stack panel.",
          "For casement windows, single-panel retractable screens mounted to the side hinge jamb are the standard solution. The screen deploys across the opening when the casement is open — and must be retracted before the casement can be closed. We match the screen system to your specific door and window configuration at the specification stage.",
        ],
      },
      {
        heading: "Mesh specifications",
        paragraphs: [
          "Fibreglass mesh is the standard for residential UAE applications. It is PVC-coated, non-corrosive in salty coastal environments, and easy to clean. Standard 18×16 mesh (18 threads per inch horizontally, 16 vertically) provides effective mosquito screening while allowing good air flow — approximately 48% open area. For improved dust management, a finer 20×20 mesh reduces open area to 44% but provides better particle filtration.",
          "Aluminium mesh is sometimes specified for high-end applications where the rigidity of the mesh is aesthetically preferred. It is more expensive and less forgiving of impact damage, but will not distort or sag over time as a fibreglass mesh may if not tensioned correctly.",
          "For screening against sandstorms (shamal events), a standard insect screen is not effective — it will simply become clogged with fine sand and impede air flow. The appropriate response to sandstorm conditions is to close the doors and windows fully. Screens are for insect management in normal ventilation conditions.",
        ],
      },
      {
        heading: "Maintenance and cleaning",
        paragraphs: [
          "Retractable screen systems require minimal maintenance. Clean the mesh annually with warm water and a soft brush — soap can leave a residue that attracts dust, so plain water is preferable. The guide channels should be cleared of sand and debris monthly to prevent abrasion of the mesh edge seals. The cassette spring tension is factory-set and does not require adjustment under normal use; if the panel fails to retract fully, check that the guide channels are clear and the mesh is not snagging on any debris.",
          "In coastal UAE environments (particularly Abu Dhabi, Ras Al Khaimah waterfront, and Palm Jumeirah), the aluminium cassette and guide channel extrusions should be wiped with a mild detergent solution every three months to prevent salt accumulation. Anodised aluminium finishes are recommended over powder coat for applications within 500m of the sea — they provide better corrosion resistance in salt-laden air.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Retractable Fly Screen", href: "/catalogue/insect-screens/retractable-fly-screen" },
    ],
  },
  {
    slug: "aluminium-window-finishes-uae",
    date: "June 2026",
    category: "Buying Guide",
    title: "Aluminium Window Finishes UAE: Powder Coat, Anodising and Woodgrain Explained",
    excerpt:
      "The finish on your aluminium windows affects appearance, longevity, and maintenance for the next 25 years. Here is how to choose correctly for a UAE villa or apartment — including which colours absorb heat and which finishes hold up best near the sea.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1618221118493-53571e5a5d7f?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The three standard finishes for aluminium windows",
        paragraphs: [
          "Aluminium window and door profiles are supplied from the extruder as bare mill-finish aluminium — a dull silver metal. Before installation, every profile must be finished to protect against corrosion and to achieve the desired colour. In the UAE market, three finishing systems are in common use: polyester powder coating, anodising, and woodgrain effect laminate film.",
          "Each system has different cost, durability, maintenance requirements, and available colours. The choice matters — once installed, re-finishing a window in situ is not practical. The finish you specify is the finish you will live with for the lifetime of the installation.",
        ],
      },
      {
        heading: "Powder coating: the standard for most UAE projects",
        paragraphs: [
          "Polyester powder coating is the dominant finish in the UAE market. The aluminium profile is cleaned, pre-treated with a chromate or chrome-free conversion coating, and then electrostatically coated with dry polyester powder before curing in an oven at 180–200°C. The result is a hard, uniform finish available in any RAL or BS colour, including satin, gloss, textured, and metallic variants.",
          "For UAE residential projects, the most popular powder-coat colours are RAL 9016 (traffic white), RAL 9006 (white aluminium — a light silver-grey), RAL 7016 (anthracite grey), RAL 7035 (light grey), and RAL 9005 (jet black). The QUALICOAT standard governs powder-coat quality — all Swiftrooms profiles are coated to QUALICOAT Class 1 minimum, which specifies minimum film thickness, adhesion, and weathering resistance.",
          "One important consideration in the UAE climate: dark powder-coat colours — particularly RAL 9005 black and RAL 7016 anthracite — absorb significantly more solar heat than light colours. In a direct western or southern exposure, dark aluminium frames in direct sunlight can reach surface temperatures exceeding 80°C. This is not a structural concern for the aluminium itself, but it accelerates the rate at which sealants at the glazing rebate and frame joints degrade. For highly exposed elevations with dark colours, we recommend specifying a QUALICOAT Class 2 coating, which has a higher UV and weathering resistance.",
        ],
      },
      {
        heading: "Anodising: the premium choice for coastal locations",
        paragraphs: [
          "Anodising is an electrochemical process that converts the aluminium surface into a layer of aluminium oxide — hard, porous, and integral to the metal rather than applied on top. The anodised layer is then sealed to close the pores and prevent corrosion. Unlike powder coating, anodising does not peel, chip, or delaminate, because the finish is the metal itself.",
          "Standard anodised colours for UAE projects are natural anodised (a warm silver-grey with slight metallic sheen), champagne (a light golden tone popular in traditional and transitional interiors), dark bronze (a deeper warm brown that complements sandstone and travertine), and black anodised. Bright colours are possible through dye injection before sealing, but are uncommon in UAE architectural specifications.",
          "Anodising is the preferred finish for projects within approximately 500m of the sea — Palm Jumeirah, Jumeirah Beach Residences, Abu Dhabi corniche, Saadiyat Island, and Ras Al Khaimah coastal projects. In salt-laden environments, powder-coat films can degrade at the edges of profiles and at cut ends over 15–20 years. An anodised finish provides superior corrosion resistance in these conditions. For projects more than 500m inland, either finish is appropriate and the choice is aesthetic.",
        ],
      },
      {
        heading: "Woodgrain laminates: warmth without the maintenance",
        paragraphs: [
          "Woodgrain effect laminates are factory-applied film wraps bonded to powder-coated profiles. The base profile is powder-coated in a neutral colour (typically a grey or brown), and then a high-pressure digitally printed film — reproducing the grain pattern of oak, walnut, teak, or other timbers — is heat-bonded to the outer face of the profile.",
          "Woodgrain laminates are popular for garden rooms, conservatories, and interior bifold or sliding door applications where clients want the warmth of a timber aesthetic with the low maintenance and thermal performance of aluminium. They are not recommended for profiles that receive direct, prolonged UV exposure on south or west elevations — the laminate film will fade and lift at the edges over 8–12 years in intense UAE sunlight. For sheltered internal applications and shaded elevations, a good-quality woodgrain laminate will perform well for 15+ years.",
          "At Swiftrooms, we offer woodgrain laminates on selected product lines including our garden room and bi-fold door ranges. Colours include golden oak, dark oak, rosewood, and anthracite woodgrain. Sample chips are available in our Jebel Ali showroom.",
        ],
      },
      {
        heading: "Colour matching and custom RAL colours",
        paragraphs: [
          "All Swiftrooms powder-coat finishes are available in any RAL colour at no surcharge on standard projects. For exact colour matching to a specific paint, tile, or material reference, we can supply a wet paint reference number or a physical sample chip to our coating partner for a custom match — this carries a small premium and a minimum-area requirement.",
          "If you are specifying windows and doors to match an existing building element — a stone façade, a metal balustrade, or a specific paint from a manufacturer's range — supply us with a physical sample or the paint manufacturer's reference at the enquiry stage. We will confirm achievability before the order is placed.",
        ],
      },
      {
        heading: "Maintenance: what each finish requires",
        paragraphs: [
          "Powder-coated aluminium should be cleaned every 6–12 months in the UAE, using warm water and a non-abrasive detergent. Avoid solvent-based cleaners, which can attack the powder-coat film. Sand and dust accumulation at the rebates and drainage channels should be cleared with a soft brush. Inspect the sealant at the glazing bead and at any junctions with masonry annually — UV degradation of the sealant is the first maintenance item to address.",
          "Anodised aluminium should be treated similarly — warm water and mild detergent, flushed with clean water. Do not use bleach, acid, or alkaline cleaners on anodised surfaces; these attack the anodise layer. In coastal environments, rinse the frame faces with fresh water monthly to remove salt deposition.",
          "Woodgrain laminates should be cleaned with mild soapy water only — avoid abrasives, which will scratch the film surface. Do not use petroleum-based solvents near the laminate edges, as these can soften the adhesive at the film boundary.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo Cor-70 Hidden Sash Window", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Cor Vision 4700", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Premium Garden Room", href: "/catalogue/garden-rooms/premium-garden-room" },
    ],
  },
  {
    slug: "aluminium-window-maintenance-uae",
    date: "July 2026",
    category: "Maintenance",
    title: "Aluminium Window & Door Maintenance UAE: The Annual Service Checklist",
    excerpt:
      "Sand, salt air, temperature extremes and hard water combine to make the UAE one of the most demanding environments for aluminium window systems. Here is exactly what to check, clean and adjust every year — and which jobs to leave to a professional.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why UAE maintenance schedules differ from European guidance",
        paragraphs: [
          "The maintenance intervals recommended by European aluminium window manufacturers are designed for temperate climates with moderate UV, occasional frost and seasonal rain. In the UAE, the operating conditions are categorically different: average summer surface temperatures on south and west-facing frames exceed 60°C, UV radiation at Dubai's latitude is among the highest in the world, and sand abrasion runs year-round rather than seasonally. If you follow the manufacturer's standard 2-year maintenance interval, you will be replacing hardware and sealants years earlier than necessary.",
          "The guidance below is based on Swiftrooms' fifteen years of UAE service experience and reflects what actually degrades first, fastest, in this specific climate. For manufacturer warranty to remain valid, the intervals and methods below should be observed from year one.",
        ],
      },
      {
        heading: "Every month: track cleaning",
        paragraphs: [
          "The drainage channels at the bottom of each window and door frame must be cleared of sand, dust and debris monthly. In the UAE, fine sand accumulates rapidly in these channels — if it compacts, water from cleaning or rain cannot drain and sits in the rebate, accelerating sealant degradation and hardware corrosion. Use a soft-bristle brush or a vacuum to clear each drainage port. Rinse with clean water from a hose or bottle.",
          "For ground-floor frames in sandy environments or near landscaping, this monthly check is non-negotiable. For upper-floor frames in enclosed buildings, quarterly may suffice.",
        ],
      },
      {
        heading: "Every 6 months: hardware lubrication",
        paragraphs: [
          "All moving hardware — hinges, multi-point locking bars (espagnolettes), handle mechanisms, tilt-and-turn gearboxes, and lift-and-slide rollers — should be lubricated every 6 months. Use a PTFE-based dry lubricant spray or a light machine oil (such as 3-in-1). Avoid WD-40 for ongoing lubrication — it is a displacing fluid rather than a lubricant, and will dry out within weeks, leaving hardware unprotected.",
          "For lift-and-slide door systems, the sill track rollers and the anti-lift blocks should be cleaned of any grit before lubrication. Grit on the rollers causes premature wear to the track. Apply lubricant to each roller, then open and close the door twice to distribute it evenly.",
          "Bi-fold door hinges have a tension adjustment screw — check that panels align correctly when folded. Misalignment causes uneven wear on the gaskets at the panel-to-panel seal. Adjustments can be made with a hex key without specialist tools.",
        ],
      },
      {
        heading: "Annual: sealant inspection and frame cleaning",
        paragraphs: [
          "The silicone sealant at the glazing bead (where the glass meets the frame) and at the perimeter of each frame (where it meets the wall) is the first component to degrade in the UAE climate. UV and thermal cycling cause silicone to harden, crack and pull away from the substrate. Inspect these lines annually — press the sealant with your finger: it should be flexible and springy. Hard, cracked, or visibly pulled-away sealant should be removed and replaced. This is the single most important maintenance task for preventing water ingress.",
          "Powdercoated aluminium frames should be washed annually with warm water and a pH-neutral detergent. Do not use alkaline cleaners, abrasive sponges or solvents on powder-coated surfaces — these damage the film. Rinse thoroughly after washing. For anodised aluminium, the same applies: neutral detergent and clean water only.",
          "Inspect the weep holes (small slots at the base of each frame) to confirm they are clear. On sliding doors, confirm the sill gasket is seated correctly and not compressed flat — a permanently compressed sill gasket provides no weather sealing.",
        ],
      },
      {
        heading: "Annual: glass inspection",
        paragraphs: [
          "Inspect the glass units annually for edge seal failure — this appears as a milky or fogged appearance in the edge zone of a double-glazed unit, sometimes with condensation forming between the panes. A failed unit seal does not always require immediate replacement, but it will progressively worsen and eventually impair the thermal performance of the unit. Failed seals should be replaced within 1–2 seasons.",
          "Solar control glass coatings are on the inner surface of the outer pane in double-glazed units — they should never be cleaned with abrasive materials. For heavily soiled glass, use a glass cleaner and a microfibre cloth. Hard water deposits (calcium scale from UAE tap water used in window cleaning) should be removed with a dilute white vinegar solution before they etch the glass surface.",
        ],
      },
      {
        heading: "When to call a professional",
        paragraphs: [
          "Hardware replacement (hinges, locks, espagnolettes, roller assemblies) should be carried out by an authorised installer or service engineer — incorrect installation can void manufacturer warranties and may compromise security. If a handle is difficult to turn, a lock does not engage properly, or a sash no longer seals correctly when closed, book a service visit rather than forcing the mechanism.",
          "Swiftrooms offers an annual service programme for all systems we have installed. The programme covers hardware adjustment, lubrication, sealant inspection, drainage clearing and a full operation check — scheduled to coincide with the beginning of the September–November cool season, when natural ventilation use increases significantly. Contact our service team to arrange.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision 4700 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Cortizo Bi-fold Door", href: "/catalogue/aluminium-bi-folding-doors/cortizo-bifold" },
    ],
  },
  {
    slug: "green-building-windows-uae",
    date: "June 2026",
    category: "Technical",
    title: "Green Building Regulations & Windows in the UAE: What Architects and Developers Need to Know",
    excerpt:
      "Dubai Green Building Regulations, Estidama in Abu Dhabi, and the UAE Energy Code all place specific performance requirements on windows and glazed facades. Here is what the regulations actually require — and how to specify accordingly.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "The UAE's three green building frameworks",
        paragraphs: [
          "The UAE operates three parallel green building frameworks, each applying to a different jurisdiction. Dubai falls under the Dubai Green Building Regulations and Specifications (DGBRS), administered by Dubai Municipality. Abu Dhabi uses the Estidama Pearl Rating System (PRS), developed by the Abu Dhabi Urban Planning Council. Across both emirates, and in the Northern Emirates, the UAE Energy Code (ECSSR 2010 and its revisions) provides a baseline for building energy efficiency. Each framework addresses windows and glazed facades, but with different language, metrics and compliance routes.",
          "The practical result is that a project tendered in Dubai uses different compliance documentation than an equivalent project in Abu Dhabi. However, the fundamental physics are identical — what the frameworks are regulating is the same: solar heat gain through glazing, thermal conductance through the frame and glass assembly, and air infiltration through sealed openings. A specification that performs well against one framework will generally perform well against all three.",
        ],
      },
      {
        heading: "Solar Heat Gain Coefficient (SHGC): the critical metric",
        paragraphs: [
          "In the UAE climate, where cooling loads dominate year-round, Solar Heat Gain Coefficient (SHGC) is the most consequential performance metric for glazed openings. SHGC measures what fraction of incident solar radiation — both direct and diffuse — passes through the glass assembly and becomes heat inside the building. A value of 1.0 means all solar radiation passes through; 0.0 means none does.",
          "Dubai Green Building Regulations require an SHGC of 0.25 or lower for all glazed facades in standard residential and commercial buildings. The UAE Energy Code requires similar values, with slight variation by climate zone and orientation. Estidama Pearl uses a weighted whole-building energy model but targets comparable glass specifications to achieve compliance. In practice, this means specifying high-performance solar control glass — typically low-emissivity coatings with a solar control layer — across all external glazing. Standard float glass (SHGC approximately 0.86) does not comply, and neither does basic tinted glass without a dedicated solar control coating.",
          "The Swiftrooms standard specification for UAE projects uses glass with an SHGC between 0.22 and 0.32 depending on orientation and facade area. All product data sheets quote SHGC alongside U-value, allowing direct compliance checking against the relevant regulation.",
        ],
      },
      {
        heading: "U-value requirements: frame and glass together",
        paragraphs: [
          "U-value (thermal transmittance) measures heat flow through the complete window assembly — glass plus frame — under a standardised temperature difference. In the UAE context, U-value matters most for night-time thermal comfort and to prevent condensation on the inner glass surface during the rare cooler periods. It is less dominant than SHGC in driving annual energy costs, but is nonetheless regulated.",
          "Dubai Green Building Regulations target a maximum overall window U-value (Uw) of 2.2 W/m²K for residential applications. This requires a thermally broken aluminium frame — a frame in which an insulating polyamide strip separates the inner and outer aluminium extrusions, preventing direct metal-to-metal thermal bridging. Non-thermally-broken aluminium profiles have Uf values in the range of 5–7 W/m²K and cannot meet the regulation regardless of the glass specified. All Cortizo, Vetromax and Gulf Extrusions systems supplied by Swiftrooms incorporate thermal breaks as standard.",
          "Double glazing (IGU) is universally required to meet these U-values. Standard 4mm float glass in a single glazed frame has a U-value above 5 W/m²K. A thermally broken frame with a 6/12/6 argon-filled IGU and low-E coating typically achieves a Uw in the range of 1.6–2.0 W/m²K — comfortably within regulation.",
        ],
      },
      {
        heading: "Estidama Pearl: credit allocation for glazing",
        paragraphs: [
          "Abu Dhabi's Estidama Pearl Rating System allocates credits across multiple categories. The Natural Environment, Indoor Environment, and Energy categories all contain credits that relate directly to the glazing specification. The most valuable route is through Energy (RE) credits, specifically RE-1 (Improved Energy Performance), which rewards whole-building energy models that outperform the baseline. A specification using SHGC values below 0.25 and Uw below 2.0 W/m²K across all facades typically contributes meaningfully to these energy credits.",
          "The Indoor Environment credits also reward glazing decisions: views to the outside (IE-8 External Views) require minimum glass areas at seated eye level, and Glare Control (IE-7) requires evidence that direct solar glare to work surfaces is controlled — achievable through shading devices, fritting, or glass with an appropriate visible light transmission (VLT) value. A high-performance solar control glass with VLT above 35% and SHGC below 0.30 typically satisfies both credits simultaneously.",
          "For projects targeting 2 Pearl or above, the glazing specification is usually one of the highest-leverage decisions on the whole building. Swiftrooms provides a glass performance data sheet for every project in the Estidama format, reducing the documentation burden on the project consultant.",
        ],
      },
      {
        heading: "Specifying for compliance: practical steps",
        paragraphs: [
          "The most common route to compliance is specifying glass by SHGC and Uw, then selecting a thermally broken aluminium system to complete the assembly. Glass manufacturers supply performance certificates showing SHGC and Uw values calculated in accordance with EN 673 and EN 410 — these are accepted by Dubai Municipality, ADDC/AADC, and Estidama assessors as compliance evidence. The certificates reference specific glass build-ups (coating, thickness, spacer bar) and the values are only valid for that specific build-up.",
          "Common compliance-ready glass specifications for the UAE: (1) 6mm Guardian SunGuard HD Clear 62 / 12mm argon / 6mm clear — SHGC 0.28, Uw 1.7 W/m²K. (2) 6mm AGC Stopray Vision 50T / 14mm argon / 6mm clear — SHGC 0.24, Uw 1.6 W/m²K. (3) 6mm Interpane ipasol light 70/39 / 16mm argon / 6mm clear — SHGC 0.22, Uw 1.5 W/m²K. All three meet or exceed Dubai Green Building Regulation requirements. Swiftrooms specifies from these ranges depending on the project's orientation, facade area ratio and budget.",
          "If you are at RIBA Stage 2 or equivalent and need to know whether your glazing concept is compliant before detailed specification, contact our technical team. We will confirm the applicable regulation for your project emirate, provide a compliant glass build-up, and supply the performance certificates required for your submission.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cor Vision Plus Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-plus" },
      { name: "Vetromax VF35 Curtain Wall", href: "/catalogue/curtain-wall/vetromax-vf35" },
      { name: "Premium Garden Room", href: "/catalogue/garden-rooms/premium-garden-room" },
    ],
  },
  {
    slug: "acoustic-glazing-uae",
    date: "May 2026",
    category: "Technical",
    title: "Acoustic Glazing for UAE Homes: Reducing Traffic and Aircraft Noise with the Right Glass Specification",
    excerpt:
      "Proximity to Sheikh Zayed Road, arterial highways, Dubai International Airport, and active construction sites makes acoustic performance a real priority for UAE residential projects. Here is how the glass specification — not the frame — determines how much noise you let in.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
    body: [
      {
        heading: "Why acoustic glazing matters in the UAE",
        paragraphs: [
          "A standard double-glazed unit with 4mm panes achieves a sound reduction index (Rw) of approximately 28–30 dB. Against a busy Dubai arterial road running at approximately 70–75 dB(A), that leaves interior noise levels of 40–47 dB(A) — well above the WHO guideline of 35 dB(A) for sleeping rooms and above the noise levels that typical residents find acceptable for daytime working. For apartments on Sheikh Zayed Road, properties in the flight path of Dubai International or Al Maktoum airports, or any villa near an active construction zone, a standard IGU specification is not adequate.",
          "The good news is that acoustic performance is almost entirely a glass specification decision — not a frame decision. A high-performance acoustic laminated glass unit in a standard thermally broken aluminium frame will dramatically outperform a standard glass unit in the most expensive frame on the market.",
        ],
      },
      {
        heading: "How acoustic glass works: mass and decoupling",
        paragraphs: [
          "Sound transmission through glass is governed by two principles: mass and decoupling. Mass — heavier glass resists vibration more effectively, so thicker panes attenuate more sound. Decoupling — when two panes are isolated from each other (either by the air gap in an IGU or by a laminated PVB interlayer), sound energy that passes through the first pane must re-excite the second pane to continue — a process that loses significant energy at each air-to-solid boundary.",
          "Standard IGUs use equal pane thicknesses — typically 4/12/4 or 6/12/6. Equal panes have a coincidence dip: a frequency at which both panes resonate in phase, dramatically reducing sound attenuation at that specific frequency. For most standard IGUs this coincidence falls in the 2,000–4,000 Hz range — precisely where human speech and much traffic noise is concentrated. The fix is asymmetric pane thicknesses — e.g., 6mm outer pane and 10mm laminated inner pane — which shift the coincidence frequencies of each pane to different bands, eliminating the shared resonance.",
        ],
      },
      {
        heading: "Acoustic laminated glass: the standard specification",
        paragraphs: [
          "The most cost-effective acoustic upgrade is to specify laminated glass on the inner pane of the IGU, using an acoustic-grade PVB interlayer rather than a standard safety PVB. Acoustic PVB (e.g., Saflex Quiet from Eastman, or Trosifol SC from Kuraray) has a higher internal damping coefficient than standard PVB — it converts vibration energy to heat rather than transmitting it. A typical acoustic specification: 6mm clear outer pane / 16mm argon cavity / 6.8mm acoustic laminate (3mm glass + 0.8mm acoustic PVB + 3mm glass) inner pane achieves Rw 38–42 dB depending on frame air sealing quality.",
          "For projects requiring Rw 45 dB or above — typically properties within 500m of a major motorway or in a confirmed flight path — a triple-glazed unit or an asymmetric IGU with a thick outer pane (8–10mm) and acoustic laminated inner pane is required. These units are heavier and more expensive but achievable within the Cortizo and Gulf Extrusions frame ranges, which support IGU weights of up to 60 kg/m².",
        ],
      },
      {
        heading: "Frame airtightness: the limiting factor",
        paragraphs: [
          "The acoustic performance of a window installation is limited by its weakest element. A highly specified acoustic glass unit in a poorly sealed frame will underperform — because sound travels through air gaps far more efficiently than through glass. Frame airtightness to Class 4 (EN 12207) eliminates air-path sound transmission as a significant contributor. All Cortizo systems supplied by Swiftrooms achieve Class 4 airtightness when correctly installed.",
          "The most common acoustic failure point in UAE installations is the perimeter sealant between the frame and the structural opening. This joint must be filled with a continuous, non-hardening acoustic sealant — not just weather sealant — and backed with acoustic mineral wool or closed-cell foam. Our installation teams apply this specification as standard on all projects where acoustic performance has been flagged in the brief.",
        ],
      },
      {
        heading: "Choosing the right acoustic specification",
        paragraphs: [
          "As a starting point: for standard Dubai residential locations away from major roads and airports, the Swiftrooms standard solar control IGU specification (6/16Ar/6.4 acoustic lam) achieves Rw 38 dB — a meaningful improvement over standard double glazing that most residents notice immediately. For properties on Sheikh Zayed Road, the E311, or within the DXB flight path, specify Rw 42–45 dB using an asymmetric IGU with acoustic PVB.",
          "If you are unsure which category your project falls into, our technical team can advise based on the project address and floor level. We provide the acoustic glass performance certificate for each specification — required if you are submitting for a LEED or WELL Building Standard assessment, both of which include acoustic environment credits.",
        ],
      },
    ],
    relatedProducts: [
      { name: "Cortizo Cor 70 Hidden Sash", href: "/catalogue/aluminium-windows/cortizo-cor-70-hidden-sash" },
      { name: "Cor Vision 4700 Lift & Slide", href: "/catalogue/aluminium-sliding-doors/cor-vision-4700" },
      { name: "uPVC Casement Window", href: "/catalogue/upvc/upvc-casement-window" },
    ],
  },
];

// ─── Resources ──────────────────────────────────────────────────────────────

export const resources: Resource[] = [
  // Guides & Knowledge
  {
    id: "product-guide-2025",
    title: "Swiftrooms Product Guide 2025",
    description:
      "Complete overview of the Swiftrooms product range — Cortizo, Vetromax, Vetro and Gulf Extrusions systems — with specifications, performance data and finish options.",
    category: "guides",
    fileType: "PDF",
    fileSize: "4.2 MB",
  },
  {
    id: "aluminium-vs-upvc",
    title: "Aluminium vs uPVC: A Technical Comparison",
    description:
      "An impartial technical comparison of aluminium and uPVC window and door systems for UAE residential applications, covering performance, cost, maintenance and longevity.",
    category: "guides",
    fileType: "PDF",
    fileSize: "1.8 MB",
  },
  {
    id: "thermal-break-guide",
    title: "Understanding Thermal Break Technology",
    description:
      "A technical guide explaining how thermal break aluminium systems work, what to look for in a specification, and why the UAE climate demands thermally broken systems.",
    category: "guides",
    fileType: "PDF",
    fileSize: "2.1 MB",
  },
  {
    id: "glazing-specification-guide",
    title: "Glazing Specification Guide for UAE Climate",
    description:
      "Orientation-specific guidance on glass specification for UAE residential and commercial projects — solar control, acoustic, safety and specialist glass options explained.",
    category: "guides",
    fileType: "PDF",
    fileSize: "3.4 MB",
  },
  // Projects & Inspiration
  {
    id: "portfolio-2024",
    title: "Swiftrooms Portfolio 2024",
    description:
      "A curated collection of completed Swiftrooms projects across the UAE, from villa renovations to large commercial curtain wall installations.",
    category: "projects",
    fileType: "PDF",
    fileSize: "8.7 MB",
  },
  {
    id: "villa-lookbook",
    title: "Villa Glazing Inspiration Lookbook",
    description:
      "Architectural photography and specification details from our most visually impactful residential projects — Al Barari, Emirates Hills, Palm Jumeirah and beyond.",
    category: "projects",
    fileType: "PDF",
    fileSize: "5.3 MB",
  },
  {
    id: "commercial-showcase",
    title: "Commercial Projects Showcase",
    description:
      "Case studies from our commercial glazing portfolio — clubhouses, restaurants, sports facilities and office developments across the UAE.",
    category: "projects",
    fileType: "PDF",
    fileSize: "6.1 MB",
  },
  // Planning & Costs
  {
    id: "project-planning-checklist",
    title: "Project Planning Checklist",
    description:
      "A step-by-step checklist for planning a window and door replacement project in the UAE — from initial brief through to handover. Suitable for residential and commercial projects.",
    category: "planning",
    fileType: "PDF",
    fileSize: "0.8 MB",
  },
  {
    id: "budget-guide",
    title: "Budget Guide: Windows & Doors for UAE Villas",
    description:
      "Indicative pricing guidance for common villa window and door replacement programmes across different system and specification levels.",
    category: "planning",
    fileType: "PDF",
    fileSize: "1.2 MB",
  },
  {
    id: "municipality-guide",
    title: "Municipality Approval Guide",
    description:
      "An overview of UAE municipality approval requirements for window and door replacement projects — when you need approval, what documentation is required, and how the process works.",
    category: "planning",
    fileType: "PDF",
    fileSize: "0.9 MB",
  },
  {
    id: "installation-timeline-guide",
    title: "Installation Timeline Guide",
    description:
      "Realistic timeline guidance for window and door replacement projects of different scales — from a single apartment to a large villa — covering survey, manufacture, delivery and installation phases.",
    category: "planning",
    fileType: "PDF",
    fileSize: "0.6 MB",
  },
  {
    id: "acoustic-glazing-guide",
    title: "Acoustic Glazing Specification Guide",
    description:
      "Technical guide to specifying acoustic glazing for UAE residential and commercial projects — glass type, interlayer selection, asymmetric pane configurations and performance benchmarks explained.",
    category: "guides",
    fileType: "PDF",
    fileSize: "1.9 MB",
  },
  {
    id: "garden-room-brochure",
    title: "Garden Room & Conservatory Brochure",
    description:
      "Design options, thermal performance data and completed project photography for our glass garden room and conservatory range — including UAE-specific climate specification guidance.",
    category: "projects",
    fileType: "PDF",
    fileSize: "4.6 MB",
  },
  {
    id: "green-building-guide",
    title: "Green Building & Glazing: Estidama, LEED & Dubai Greenlist",
    description:
      "A specification guide for architects and consultants — which of our glazing systems qualify for Estidama, LEED and Dubai Greenlist credits, and what performance data is needed for submission.",
    category: "guides",
    fileType: "PDF",
    fileSize: "2.3 MB",
  },
];

// ─── Portfolio media (migrated from www.swiftrooms.ae) ──────────────────────
export type PortfolioMedia = { hero: string; gallery: string[]; video?: string; videoPoster?: string };
export const portfolioMedia: Record<string, PortfolioMedia> = {
  "al-barari": { hero: "/images/portfolio/al-barari/al-barari-01.jpg", gallery: ["/images/portfolio/al-barari/al-barari-01.jpg", "/images/portfolio/al-barari/al-barari-02.jpg", "/images/portfolio/al-barari/al-barari-03.jpg", "/images/portfolio/al-barari/al-barari-04.jpg", "/images/portfolio/al-barari/al-barari-05.png"] },
  "palm-jumeirah": { hero: "/images/portfolio/palm-jumeirah/palm-jumeirah-01.jpg", gallery: ["/images/portfolio/palm-jumeirah/palm-jumeirah-01.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-02.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-03.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-04.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-05.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-06.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-07.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-08.jpg", "/images/portfolio/palm-jumeirah/palm-jumeirah-09.jpg"] },
  "emirates-hills": { hero: "/images/portfolio/emirates-hills/emirates-hills-poster.jpg", videoPoster: "/images/portfolio/emirates-hills/emirates-hills-poster.jpg", video: "/videos/portfolio/emirates-hills/emirates-hills.mp4", gallery: [] },
  "arabian-ranches": { hero: "/images/portfolio/arabian-ranches/arabian-ranches-01.jpg", gallery: ["/images/portfolio/arabian-ranches/arabian-ranches-01.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-02.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-03.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-04.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-05.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-06.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-07.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-08.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-09.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-10.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-11.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-12.jpg", "/images/portfolio/arabian-ranches/arabian-ranches-13.jpg", "/images/portfolio/arabian-ranches/palmara-01.jpg", "/images/portfolio/arabian-ranches/palmara-02.jpg", "/images/portfolio/arabian-ranches/palmara-03.jpg", "/images/portfolio/arabian-ranches/palmara-04.jpg", "/images/portfolio/arabian-ranches/palmara-05.jpg", "/images/portfolio/arabian-ranches/palmara-06.jpg", "/images/portfolio/arabian-ranches/palmara-07.jpg", "/images/portfolio/arabian-ranches/palmara-08.jpg", "/images/portfolio/arabian-ranches/palmara-09.jpg", "/images/portfolio/arabian-ranches/palmara-10.jpg", "/images/portfolio/arabian-ranches/palmara-11.jpg", "/images/portfolio/arabian-ranches/palmara-12.jpg", "/images/portfolio/arabian-ranches/palmara-13.jpg", "/images/portfolio/arabian-ranches/palmara-14.jpg", "/images/portfolio/arabian-ranches/palmara-15.jpg"] },
  "centro-the-villas": { hero: "/images/portfolio/centro-the-villas/centro-the-villas-01.jpg", gallery: ["/images/portfolio/centro-the-villas/centro-the-villas-01.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-02.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-03.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-04.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-05.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-06.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-07.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-08.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-09.jpg", "/images/portfolio/centro-the-villas/centro-the-villas-10.jpg"] },
  "brookfields-damac-hills": { hero: "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-01.jpg", gallery: ["/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-01.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-02.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-03.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-04.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-05.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-06.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-07.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-08.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-09.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-10.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-11.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-12.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-13.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-14.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-15.jpg", "/images/portfolio/brookfields-damac-hills/brookfields-damac-hills-16.jpg"] },
  "victory-heights": { hero: "/images/portfolio/victory-heights/victory-heights-01.jpg", gallery: ["/images/portfolio/victory-heights/victory-heights-01.jpg", "/images/portfolio/victory-heights/victory-heights-02.jpg", "/images/portfolio/victory-heights/victory-heights-03.jpg", "/images/portfolio/victory-heights/victory-heights-04.jpg", "/images/portfolio/victory-heights/victory-heights-06.jpg", "/images/portfolio/victory-heights/victory-heights-07.jpg", "/images/portfolio/victory-heights/victory-heights-08.jpg", "/images/portfolio/victory-heights/victory-heights-09.jpg", "/images/portfolio/victory-heights/victory-heights-10.jpg", "/images/portfolio/victory-heights/victory-heights-11.jpg", "/images/portfolio/victory-heights/victory-heights-12.jpg", "/images/portfolio/victory-heights/victory-heights-14.jpg", "/images/portfolio/victory-heights/victory-heights-15.jpg", "/images/portfolio/victory-heights/victory-heights-16.jpg", "/images/portfolio/victory-heights/victory-heights-17.jpg", "/images/portfolio/victory-heights/victory-heights-18.jpg", "/images/portfolio/victory-heights/victory-heights-19.jpg", "/images/portfolio/victory-heights/victory-heights-20.jpg", "/images/portfolio/victory-heights/victory-heights-21.jpg"] },
  "jumeirah-village-triangle": { hero: "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-01.jpg", gallery: ["/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-01.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-02.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-03.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-04.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-05.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-06.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-07.jpg", "/images/portfolio/jumeirah-village-triangle/jumeirah-village-triangle-08.jpg"] },
  "the-springs": { hero: "/images/portfolio/the-springs/the-springs-01.jpg", gallery: ["/images/portfolio/the-springs/the-springs-01.jpg", "/images/portfolio/the-springs/the-springs-02.jpg", "/images/portfolio/the-springs/the-springs-03.jpg", "/images/portfolio/the-springs/the-springs-04.jpg", "/images/portfolio/the-springs/the-springs-05.jpg", "/images/portfolio/the-springs/the-springs-06.jpg", "/images/portfolio/the-springs/the-springs-07.jpg", "/images/portfolio/the-springs/the-springs-08.jpg", "/images/portfolio/the-springs/the-springs-09.jpg", "/images/portfolio/the-springs/the-springs-10.jpg", "/images/portfolio/the-springs/the-springs-11.jpg", "/images/portfolio/the-springs/the-springs-12.jpg", "/images/portfolio/the-springs/the-springs-13.jpg"] },
  "phoenix-damac-hills": { hero: "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-01.jpg", gallery: ["/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-01.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-02.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-03.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-04.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-05.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-06.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-07.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-08.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-09.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-10.jpg", "/images/portfolio/phoenix-damac-hills/phoenix-damac-hills-11.jpg"] },
  "glass-room-abu-dhabi": { hero: "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-01.jpg", gallery: ["/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-01.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-02.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-03.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-04.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-05.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-06.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-07.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-08.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-09.jpg", "/images/portfolio/glass-room-abu-dhabi/glass-room-abu-dhabi-10.jpg"] },
  "montys-golf-course": { hero: "/images/portfolio/montys-golf-course/montys-golf-course-01.jpg", gallery: ["/images/portfolio/montys-golf-course/montys-golf-course-01.jpg", "/images/portfolio/montys-golf-course/montys-golf-course-02.jpg", "/images/portfolio/montys-golf-course/montys-golf-course-03.jpg", "/images/portfolio/montys-golf-course/montys-golf-course-04.jpg"] },
  "phileas-fogg": { hero: "/images/portfolio/phileas-fogg/phileas-fogg-01.jpg", gallery: ["/images/portfolio/phileas-fogg/phileas-fogg-01.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-02.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-03.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-04.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-05.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-06.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-07.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-08.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-09.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-10.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-11.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-12.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-13.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-14.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-15.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-16.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-17.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-18.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-19.jpg", "/images/portfolio/phileas-fogg/phileas-fogg-20.jpg"] },
  "padel-x": { hero: "/images/portfolio/padel-x/padel-x-poster.jpg", videoPoster: "/images/portfolio/padel-x/padel-x-poster.jpg", video: "/videos/portfolio/padel-x/padel-x.mp4", gallery: [] },
};
