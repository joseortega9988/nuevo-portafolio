# Graph Report - .  (2026-08-16)

## Corpus Check
- 163 files · ~137,460 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 599 nodes · 1113 edges · 44 communities (26 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Cards, Entries & UI Components
- WebGL Scene Mounting & Quality
- i18n Routing & App Shell
- Accretion Disk & Hopf Fibration Internals
- Section Scroll & Motion Hooks
- Dev Tooling Config
- TypeScript Config
- Aizawa Attractor Animation
- Navbar, Footer & Contact Layout
- NPM Dependencies
- Animation Docs & Decisions
- Boot Loader Sequence
- Thrown Cards Grid & Lenis Sync
- Voronoi Torus Internals
- CV Content & Repo Overview
- MyTime App Screenshot
- ESLint Config Helpers
- Color Token Guard Script
- Entries.ts as Single Source
- Scroll Single Source Docs
- MyTime1 Screenshot
- MyTime3 Screenshot & Entries Link
- Apple Touch Icon
- Layering Enforcement Rules
- Color Token Rule Docs
- Next.js Config
- ScrollTrigger State Gotcha
- DOM Verification Methodology
- J-Flows Brand Logo
- MyTime2 Logo
- Technologies Catalogue Docs
- PostCSS Config
- Tailwind Config
- Site Favicon
- Scatter Layout Gotcha
- Build/Dev Conflict Gotcha
- GSAP Flip Gotcha
- i18n Overview
- Overflow Sticky Gotcha
- BreastCancer Ultrasound Grid
- BreastCancer Ultrasound Image
- BreastCancer Project Screenshot
- Vercel Deployment Docs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `buildPalette()` - 18 edges
3. `useQuality()` - 14 edges
4. `AnimationLayerProps` - 13 edges
5. `useRafPause()` - 12 edges
6. `useInViewport()` - 11 edges
7. `CardViewModel` - 10 edges
8. `routing` - 10 edges
9. `useReducedMotion()` - 10 edges
10. `getThreeColor()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Tight Line tool stack (TS, Next.js, AWS, Claude, Prisma, GraphQL, CI/CD)` --semantically_similar_to--> `CLAUDE.md (Repo Guidance for Claude Code)`  [INFERRED] [semantically similar]
  public/cv/CV-JOSE-ORTEGA-EN.pdf → CLAUDE.md
- `How to add a sixth project (edit entries.ts only)` --semantically_similar_to--> `src/data/entries.ts as single source of truth`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Mount-on-approach tried and reversed for WebGL scenes` --semantically_similar_to--> `WebGL mount-once, pause-off-screen policy`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `How to change a colour (edit tokens.css only)` --semantically_similar_to--> `No hex colour outside tokens.css rule`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `LocaleLayout()` --calls--> `resolveLocale()`  [EXTRACTED]
  app/[locale]/layout.tsx → src/i18n/resolveLocale.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Gotchas found the hard way** — claude_overflow_hidden_sticky_gotcha, claude_gsap_flip_gotcha, claude_absolutely_positioned_scatter_gotcha, claude_scrolltrigger_state_dependency_gotcha [EXTRACTED 1.00]
- **The nine animations table** — readme_boot_loader_a1, readme_aizawa_attractor_a2, readme_tilted_card_carousel_a3, readme_sunset_scroll_sea_a4, readme_hex_tech_grid_a5, readme_hopf_fibration_a6, readme_voronoi_torus_a7, readme_thrown_cards_grid_a8, readme_accretion_disk_a9 [EXTRACTED 1.00]
- **Animation-specific design decisions** — decisions_hex_grid_row_overlap, decisions_carousel_clamped_navigation, decisions_boot_loader_in_hero, decisions_adaptive_quality_resolution, decisions_reference_screenshot_framing [INFERRED 0.85]

## Communities (44 total, 18 thin omitted)

### Community 0 - "Cards, Entries & UI Components"
Cohesion: 0.06
Nodes (47): HEX_RATIO, hexGeometryStyle(), HexTechGrid(), HexTechGridProps, TechCluster, CarouselCard(), CarouselCardProps, CAROUSEL_CONFIG (+39 more)

### Community 1 - "WebGL Scene Mounting & Quality"
Cohesion: 0.09
Nodes (31): AccretionDisk(), AccretionDiskProps, HopfFibration(), HopfFibrationProps, SeaPlane(), SEA_CONFIG, useAdaptiveResolution(), seaFragmentShader (+23 more)

### Community 2 - "i18n Routing & App Shell"
Cohesion: 0.08
Nodes (28): display, generateMetadata(), LocaleLayout(), mono, HomePage(), generateMetadata(), ProjectsPage(), ProjectsExperience() (+20 more)

### Community 3 - "Accretion Disk & Hopf Fibration Internals"
Cohesion: 0.10
Nodes (29): Disk(), EventHorizon(), DISK_CONFIG, diskFragmentShader, diskVertexShader, horizonFragmentShader, horizonVertexShader, buildDisk() (+21 more)

### Community 4 - "Section Scroll & Motion Hooks"
Cohesion: 0.13
Nodes (24): SectionHeading(), SectionHeadingProps, technologiesByCategory(), getCardViewModels(), useLenis(), useSceneRegistration(), InViewportOptions, useInViewport() (+16 more)

### Community 5 - "Dev Tooling Config"
Cohesion: 0.06
Nodes (35): eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, description, devDependencies, eslint, eslint-config-next (+27 more)

### Community 6 - "TypeScript Config"
Cohesion: 0.06
Nodes (35): ANTIGUO_PORTAFOLIO, COSAS_ADJUNTAS, dom, dom.iterable, ES2022, home-challengue-nest, ./messages/*, next-env.d.ts (+27 more)

### Community 7 - "Aizawa Attractor Animation"
Cohesion: 0.11
Nodes (24): AizawaAttractor(), BaseDisk(), Filaments(), Rig(), AIZAWA, INTEGRATION, SCENE, baseDiskFragmentShader (+16 more)

### Community 8 - "Navbar, Footer & Contact Layout"
Cohesion: 0.13
Nodes (18): CvDownloadButton(), CvDownloadButtonProps, Footer(), FooterProps, LanguageSwitch(), ITEM, MobileMenu(), PANEL (+10 more)

### Community 9 - "NPM Dependencies"
Cohesion: 0.07
Nodes (27): gsap, lenis, motion, next, next-intl, dependencies, gsap, lenis (+19 more)

### Community 10 - "Animation Docs & Decisions"
Cohesion: 0.10
Nodes (25): CanvasStage (WebGL mount point), src/lib/webgl/contextBudget.ts (WebGL context budget rationale), SceneReady registration (boot loader dismissal), useInViewport hook, useQuality hook (adaptive render budget), useRafPause hook, WebGL mount-once, pause-off-screen policy, Adaptive quality lowers resolution, never features (+17 more)

### Community 11 - "Boot Loader Sequence"
Cohesion: 0.14
Nodes (16): BootLoader(), BOOT_LOADER_CONFIG, LOADER_WORD, BootPhase, BootSequence, useBootSequence(), BootLoaderProps, GLYPHS (+8 more)

### Community 12 - "Thrown Cards Grid & Lenis Sync"
Cohesion: 0.17
Nodes (15): SCATTER_SLOTS, THROWN_CONFIG, usePointerParallax(), ThrowPhase, ThrowState, useThrowSequence(), ThrownCardsGrid(), ThrownCardsGridProps (+7 more)

### Community 13 - "Voronoi Torus Internals"
Cohesion: 0.22
Nodes (12): Shell(), TORUS_CONFIG, DragSpin, useDragSpin(), shellFragmentShader, shellVertexShader, buildShatteredTorus(), makeRandom() (+4 more)

### Community 14 - "CV Content & Repo Overview"
Cohesion: 0.18
Nodes (11): CLAUDE.md (Repo Guidance for Claude Code), DECISIONS.md (Design Decision Log), CV Jose Ortega (English), Jose Francisco Ortega (Full-Stack Developer), Theodo UK - employer, Theodo UK tool stack (TS, Python, NestJS, AWS, TensorFlow, Keras), Tight Line (Startup) - employer, Tight Line tool stack (TS, Next.js, AWS, Claude, Prisma, GraphQL, CI/CD) (+3 more)

### Community 15 - "MyTime App Screenshot"
Cohesion: 0.24
Nodes (10): MyTime (Task/Time Management App), Bottom Navigation Bar (Home/Create/Calendar/Learn/Profile), Calendar View (September 2024), MyTime Clock Logo (Wordmark), Create Task / Sign In / Date-Time Picker Flow, Pomodoro Technique Learn Card, High/Mid/Low Priority Badges, User Profile Stats (jose1234) (+2 more)

### Community 16 - "ESLint Config Helpers"
Cohesion: 0.33
Nodes (5): compat, __dirname, eslintConfig, RENDERING_LIB_PATTERNS, RENDERING_LIBS

### Community 17 - "Color Token Guard Script"
Cohesion: 0.33
Nodes (4): ALLOWED, offences, ROOT, SEARCH_DIRS

### Community 18 - "Entries.ts as Single Source"
Cohesion: 0.50
Nodes (5): src/data/entries.ts as single source of truth, viewModels.ts PortfolioEntry to CardViewModel projection, entries.ts stays a single file (Open/Closed vs 250-line cap), Take-home links to Swagger docs, not a live demo, How to add a sixth project (edit entries.ts only)

### Community 19 - "Scroll Single Source Docs"
Cohesion: 0.50
Nodes (4): Scroll as the single source of truth (Lenis-driven), useGsapLenisSync hook, useScrollProgress hook (section / from-entry modes), useScrollTo hook

### Community 20 - "MyTime1 Screenshot"
Cohesion: 0.83
Nodes (4): MyTime Bottom Navigation (Home/Create/Calendar/Learn/Profile), MyTime Task Management App, Priority Badge System (High/Mid/Low), MyTime To-Do Tasks Screenshot

### Community 21 - "MyTime3 Screenshot & Entries Link"
Cohesion: 0.50
Nodes (4): 1-3-5 Big Tasks Method UI, MyTime Project, MyTime3.png (MyTime App Screenshot), src/data/entries.ts

### Community 22 - "Apple Touch Icon"
Cohesion: 0.67
Nodes (3): Apple Touch Icon (J-Flows CV Circuit Badge), J-FLOWS CV Brand Mark, Next.js apple-icon.png Convention

### Community 23 - "Layering Enforcement Rules"
Cohesion: 0.67
Nodes (3): Self-contained animation folder pattern, Enforced Layering (three-tier import restriction), Navbar/Footer importable only from layout.tsx

### Community 24 - "Color Token Rule Docs"
Cohesion: 1.00
Nodes (3): No hex colour outside tokens.css rule, src/lib/palette.ts (CSS token to THREE.Color resolver), How to change a colour (edit tokens.css only)

## Knowledge Gaps
- **169 isolated node(s):** `display`, `mono`, `EntryParams`, `__dirname`, `compat` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `Thrown Cards Grid & Lenis Sync` to `WebGL Scene Mounting & Quality`, `Boot Loader Sequence`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `useQuality()` connect `WebGL Scene Mounting & Quality` to `Accretion Disk & Hopf Fibration Internals`, `Thrown Cards Grid & Lenis Sync`, `Aizawa Attractor Animation`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `MyTime App Screenshot Collage` connect `MyTime App Screenshot` to `Cards, Entries & UI Components`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `display`, `mono`, `EntryParams` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cards, Entries & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05985915492957746 - nodes in this community are weakly interconnected._
- **Should `WebGL Scene Mounting & Quality` be split into smaller, more focused modules?**
  _Cohesion score 0.08549019607843138 - nodes in this community are weakly interconnected._
- **Should `i18n Routing & App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.07890070921985816 - nodes in this community are weakly interconnected._