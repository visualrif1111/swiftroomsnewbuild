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
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
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
    id: "gulf-extrusion",
    name: "Gulf Extrusion",
    country: "UAE",
    description:
      "The Middle East's premier aluminium extrusion group, producing high-performance profiles engineered for Gulf climates. Gulf Extrusion's TB600 series and CW systems define regional architectural standards.",
    tagline: "Built for the Gulf. Engineered for life.",
    speciality: ["Tilt & Turn", "Sliding Systems", "Curtain Wall", "TB600 Series"],
  },
  {
    id: "deceuninck",
    name: "Deceuninck",
    country: "Belgium",
    description:
      "A world-leading Belgian manufacturer of uPVC and composite window and door systems. Deceuninck profiles are recognised across Europe for outstanding thermal performance, design versatility and long-term durability in demanding climates.",
    tagline: "Belgian engineering. Global performance.",
    speciality: ["uPVC Windows", "uPVC Doors", "Sliding Systems", "Tilt & Turn"],
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
];

// ─── Products ──────────────────────────────────────────────────────────────

export const productCategories: ProductCategory[] = [
  {
    id: "aluminium-doors",
    name: "Aluminium Doors",
    slug: "aluminium-doors",
    tagline: "Threshold-defining precision.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    description:
      "From statement entrance doors to expansive sliding walls of glass, our aluminium door collection redefines the boundary between inside and out.",
    products: [
      {
        id: "cor-vision-4600",
        name: "Cor Vision 4600 Lift & Slide",
        slug: "cor-vision-4600",
        brand: "Cortizo",
        category: "aluminium-doors",
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
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "cor-vision-4700",
        name: "Cor Vision 4700 Lift & Slide",
        slug: "cor-vision-4700",
        brand: "Cortizo",
        category: "aluminium-doors",
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
        },
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "cor-vision-plus",
        name: "Cor Vision Plus",
        slug: "cor-vision-plus",
        brand: "Cortizo",
        category: "aluminium-doors",
        description:
          "The Cor Vision Plus brings frameless aesthetics to sliding door technology, with recessed floor tracks and flush thresholds for barrier-free living.",
        features: [
          "Flush floor threshold option",
          "Recessed track system",
          "Integrated insect screen channel",
          "180° opening capability",
        ],
        image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
      },
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
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1561958595-c74b59cf48a0?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "gulf-extrusion-tb600-door",
        name: "Gulf Extrusion TB600 Door",
        slug: "gulf-extrusion-tb600-door",
        brand: "Gulf Extrusion",
        category: "aluminium-doors",
        description:
          "Engineered specifically for GCC climates, the TB600 door series combines thermal break technology with the durability demanded by the UAE's extreme temperatures.",
        features: [
          "GCC climate-rated thermal break",
          "High air infiltration resistance",
          "Corrosion-resistant hardware",
          "Wide colour range",
        ],
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
        image: "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "aluminium-windows",
    name: "Aluminium Windows",
    slug: "aluminium-windows",
    tagline: "Light. Framed perfectly.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description:
      "Our aluminium window collection covers every architectural requirement — from slim-sash casements to large-format tilt-and-turn, all precision-engineered for Gulf climates.",
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
        },
        image: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "gulf-extrusion-tb600-window",
        name: "Gulf Extrusion TB600 Tilt & Turn",
        slug: "gulf-extrusion-tb600-tilt-and-turn",
        brand: "Gulf Extrusion",
        category: "aluminium-windows",
        description:
          "The TB600 tilt-and-turn window is engineered for UAE residential and commercial projects, offering versatile ventilation and easy cleaning in a robust, climate-rated system.",
        features: [
          "UAE climate thermal break",
          "Tilt-turn dual function",
          "Anti-corrosion finish",
          "Acoustic glass compatible",
        ],
        image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "aluminium-sliding-window",
        name: "Aluminium Sliding Windows",
        slug: "aluminium-sliding-windows",
        brand: "Gulf Extrusion",
        category: "aluminium-windows",
        description:
          "Space-efficient sliding windows ideal for apartments and villas, with low maintenance and high air performance.",
        features: [
          "2-track and 3-track options",
          "Night ventilation latch",
          "Integrated fly screen",
          "Powder coated finishes",
        ],
        image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "vetro-casement",
        name: "Vetro Casement Windows",
        slug: "vetro-casement",
        brand: "Vetromax",
        category: "aluminium-windows",
        description:
          "Ultra-slim aluminium casement windows from the Vetromax range, delivering a contemporary minimal aesthetic for modern architecture.",
        features: [
          "15mm slim sightlines",
          "Tilt-only and tilt-turn",
          "RAL and anodised finishes",
          "Triple glazing ready",
        ],
        image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall & Facade",
    slug: "curtain-wall",
    tagline: "Architecture expressed in glass.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    description:
      "Our curtain wall and facade systems transform commercial and residential buildings into architectural landmarks, delivering thermal performance and visual impact at scale.",
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
        },
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "gulf-extrusion-cw50",
        name: "Gulf Extrusion CW 50mm",
        slug: "gulf-extrusion-cw-50",
        brand: "Gulf Extrusion",
        category: "curtain-wall",
        description:
          "Designed and tested for Gulf region projects, the CW 50mm system delivers structural reliability, thermal control and clean aesthetics for UAE-scale developments.",
        features: [
          "50mm face width",
          "GCC climate certified",
          "Natural drainage system",
          "Compatible with structural glazing",
        ],
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "bi-fold",
    name: "Bi-Fold Doors",
    slug: "bi-fold",
    tagline: "Open everything.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    description:
      "Our bi-folding door systems transform walls into open vistas, connecting living spaces to gardens, terraces and pools with theatrical effect.",
    products: [
      {
        id: "cortizo-bifold",
        name: "Cortizo Bi-fold Door",
        slug: "cortizo-bifold",
        brand: "Cortizo",
        category: "bi-fold",
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
        },
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "upvc",
    name: "uPVC Windows & Doors",
    slug: "upvc",
    tagline: "Low maintenance. High performance.",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
    description:
      "Our uPVC/PVCu range delivers outstanding thermal and acoustic performance with minimal maintenance requirements — ideal for residential applications.",
    products: [
      {
        id: "upvc-casement",
        name: "Deceuninck uPVC Casement Suite",
        slug: "upvc-casement",
        brand: "Deceuninck",
        category: "upvc",
        description:
          "A comprehensive Deceuninck uPVC window and door suite covering casement, tilt-turn, sliding and door systems in a fully coordinated range.",
        features: [
          "5-chamber profile",
          "Steel reinforcement",
          "Multi-point locking",
          "White and colour foils",
        ],
        image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "upvc-sliding",
        name: "Deceuninck uPVC Sliding Window & Door",
        slug: "upvc-sliding",
        brand: "Deceuninck",
        category: "upvc",
        description:
          "High-performance Deceuninck uPVC sliding system designed for UAE climate conditions, with enhanced seals and corrosion-resistant hardware.",
        features: [
          "Anti-UV profile",
          "Multi-roller carrier",
          "Fly screen channels",
          "Weather-rated hardware",
        ],
        image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1525438160292-a4a860951216?auto=format&fit=crop&w=800&q=80",
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
    products: [
      {
        id: "retractable-screen",
        name: "Retractable Fly Screen",
        slug: "retractable-fly-screen",
        brand: "Gulf Extrusion",
        category: "insect-screens",
        description:
          "Cassette-housed retractable screens that disappear completely when not needed, preserving the visual clarity of aluminium windows.",
        features: [
          "Concealed cassette housing",
          "Fiberglass and aluminium mesh options",
          "Matching powder coat finish",
          "Side-slide and pleated types",
        ],
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
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
      "A full window and door replacement project in the Phoenix cluster, using Gulf Extrusion TB600 series windows throughout the property for enhanced thermal performance.",
    products: ["Gulf Extrusion TB600 Window", "Gulf Extrusion TB600 Door"],
    tags: ["Villa", "Gulf Extrusion", "Damac Hills"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
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
      "A contemporary townhouse in Jumeirah Village Triangle receiving Cor Vision 4600 lift-and-slide doors to the ground floor, and Gulf Extrusion TB600 tilt-and-turn windows to all upper levels.",
    products: ["Cor Vision 4600", "Gulf Extrusion TB600 Window"],
    tags: ["Townhouse", "JVT", "Cortizo", "Gulf Extrusion"],
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
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
      "A large-scale commercial curtain wall and window project for the Monty's Golf Course clubhouse, featuring Gulf Extrusion CW50 curtain wall facade and TB600 commercial windows throughout the facility.",
    products: ["Gulf Extrusion CW 50mm", "Gulf Extrusion TB600 Window"],
    tags: ["Commercial", "Curtain Wall", "Golf Course", "Gulf Extrusion"],
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
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
      "Complete window and door package for a Sports City villa, with Cortizo Cor 70 hidden sash windows and Gulf Extrusion TB600 entrance doors delivering a clean contemporary aesthetic.",
    products: ["Cortizo Cor 70 Hidden Sash", "Gulf Extrusion TB600 Door"],
    tags: ["Villa", "Sports City", "Cortizo", "Gulf Extrusion"],
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
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
  },
];

// ─── Process Steps ──────────────────────────────────────────────────────────

export const processSteps = [
  {
    number: "01",
    title: "Initial Consultation",
    description:
      "We meet at your project site or in our showroom to understand your vision, architectural requirements and budget framework. No obligation, no pressure.",
  },
  {
    number: "02",
    title: "Technical Survey",
    description:
      "Our certified surveyors conduct a precise dimensional survey and assess the structural requirements for your chosen window and door systems.",
  },
  {
    number: "03",
    title: "Design & Specification",
    description:
      "Our design team produces technical drawings, product specifications and material samples for your review and approval.",
  },
  {
    number: "04",
    title: "Manufacture",
    description:
      "Your windows and doors are precision-fabricated by our certified manufacturing partners in Europe and the UAE to exact project specifications.",
  },
  {
    number: "05",
    title: "Delivery & Installation",
    description:
      "Our expert installation teams deliver and fit your products with minimal disruption, ensuring every system is perfectly aligned and tested.",
  },
  {
    number: "06",
    title: "Aftercare",
    description:
      "We provide comprehensive aftercare, maintenance guidance and warranty support to protect your investment for decades to come.",
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────────

export const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years in UAE" },
  { value: "3", label: "Premium Brands" },
  { value: "100%", label: "Client Satisfaction" },
];

// ─── FAQs ───────────────────────────────────────────────────────────────────

export const faqs = [
  {
    question: "What makes Cortizo windows different from standard aluminium windows?",
    answer:
      "Cortizo is a Spanish manufacturer with over 50 years of engineering expertise. Their systems feature precision-extruded thermal breaks, European hardware standards, and performance credentials that far exceed typical Dubai market products. The difference is immediately apparent in operation smoothness and long-term durability.",
  },
  {
    question: "How long does a typical installation project take?",
    answer:
      "Lead times vary by project scope and system complexity. A typical villa window and door replacement takes 6–10 weeks from survey to installation completion. Larger projects or custom sizes may require 12–16 weeks. We provide precise timelines at quotation stage.",
  },
  {
    question: "Do you install across the UAE or only Dubai?",
    answer:
      "We serve the entire UAE — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah and Fujairah. Our project teams operate across all seven emirates.",
  },
  {
    question: "What warranty do your window and door systems carry?",
    answer:
      "Our aluminium systems carry a minimum 10-year manufacturer warranty on profiles and hardware. Installation workmanship is warranted for 2 years. Glass carries the manufacturer's standard warranty, typically 5–10 years depending on the glass type.",
  },
  {
    question: "Can you match existing RAL colours for a partial replacement?",
    answer:
      "Yes. We can powder-coat profiles to any RAL Classic or BS colour reference, ensuring a seamless match with existing frames or architectural finishes.",
  },
  {
    question: "Do you handle the municipality approvals?",
    answer:
      "For projects requiring NOC or DDA approval (e.g. curtain wall, large commercial glazing), we can advise on documentation requirements and liaise with your consultant. Standard residential replacements typically do not require formal approval.",
  },
  {
    question: "What is the difference between a lift-and-slide and a standard sliding door?",
    answer:
      "In a standard sliding door, the panel remains on the track when sliding. In a lift-and-slide system, turning the handle lifts the sash slightly off its sill seal, allowing it to slide on precision rollers with near-zero friction. This allows for much heavier, wider panels with effortless operation and superior weather sealing.",
  },
  {
    question: "Can I visit a showroom to see products full-size?",
    answer:
      "Yes — our Jebel Ali showroom features full-scale installations of our most popular systems including the Cor Vision 4700, Cortizo bi-fold, and curtain wall panels. We strongly recommend a showroom visit before finalising your specification.",
  },
];
