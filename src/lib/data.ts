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

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
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
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    description:
      "Our lift-and-slide door collection redefines the boundary between inside and out. From the Cor Vision 4600 to the flagship 4700, these are sliding systems built for the most demanding UAE villa specifications.",
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
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
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
        },
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "aluminium-bi-folding-doors",
    name: "Aluminium Bi-Folding Doors",
    slug: "aluminium-bi-folding-doors",
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
        },
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "aluminium-doors",
    name: "Aluminium Doors",
    slug: "aluminium-doors",
    tagline: "Every entrance, engineered.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
    description:
      "From statement pivot entrance doors to thermally broken casement doors, our aluminium door collection brings architectural intent to every threshold.",
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
    id: "upvc",
    name: "UPVC Windows & Doors",
    slug: "upvc",
    tagline: "Low maintenance. High performance.",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
    description:
      "Our uPVC/PVCu range delivers outstanding thermal and acoustic performance with minimal maintenance requirements — ideal for residential applications.",
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
        image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall Systems",
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
  {
    name: "Ahmed Al Rashidi",
    role: "Managing Director",
    bio: "Ahmed founded Swiftrooms in 2009 with a vision to bring European-grade glazing systems to the UAE market. With 20 years in UAE construction, he oversees all major client relationships and strategic partnerships.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "James Hartley",
    role: "Technical Director",
    bio: "James trained directly with Cortizo engineers in Spain before joining Swiftrooms. He leads all technical specification, quality assurance and installer training — ensuring every installation meets European standards.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Sarah Mitchell",
    role: "Head of Design",
    bio: "With a background in architectural practice, Sarah bridges the gap between design intent and technical specification. She works with architects, interior designers and clients to translate vision into product selections.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mohammed Al Farsi",
    role: "Senior Project Manager",
    bio: "Mohammed has overseen more than 200 Swiftrooms installations across the UAE. His coordination of complex multi-system projects — from Emirates Hills villas to commercial curtain wall — ensures every delivery meets the programme.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Layla Hassan",
    role: "Client Relations Manager",
    bio: "Layla manages the client journey from initial enquiry through to aftercare, ensuring every Swiftrooms client receives the level of attention their project deserves. She personally oversees all showroom consultations.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
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
];

// ─── FAQs ───────────────────────────────────────────────────────────────────

export const faqs: FAQ[] = [
  // Pricing
  {
    category: "Pricing",
    question: "How much do aluminium windows and doors cost in the UAE?",
    answer:
      "Pricing varies significantly based on system type, size and specification. As a guide, a standard villa window replacement programme typically ranges from AED 80,000 to AED 250,000+ depending on the number of openings and system selected. Lift-and-slide door systems start from AED 12,000–18,000 per panel. We provide detailed fixed-price quotations after a site survey — contact us to arrange one.",
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
];

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
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
];
