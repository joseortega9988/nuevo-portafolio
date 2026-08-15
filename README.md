# Jose Ortega — Portfolio

Bilingual (EN/ES), dark-mode-only portfolio built with Next.js 15, React 19 and
TypeScript in strict mode. Eight self-contained animations — three of them
WebGL — carry the narrative across three route types.

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint **and** the colour-token guard |
| `npm run typecheck` | `tsc --noEmit` |

---

## Where things live

```
app/[locale]/          routes only — they compose, they never implement
  layout.tsx           the ONE place Navbar and Footer are rendered
  page.tsx             Home
  projects/            index + [slug] detail pages
src/
  styles/tokens.css    ← every colour in the product
  lib/                 palette, motion hooks, WebGL plumbing
  data/                the five entries, the technology catalogue
  components/          layout chrome + reusable UI
  sections/            page sections; they compose animations
  animations/          one folder per animation, self-contained
messages/{en,es}.json  every visitor-facing string
```

### The rules the codebase enforces on itself

These are not conventions — `npm run lint` fails on all of them:

- **No hex colour outside `src/styles/tokens.css`.** An ESLint rule covers
  `.ts`/`.tsx`; `scripts/check-color-tokens.mjs` covers `.css`, which ESLint
  cannot see.
- **No `three`, `gsap` or `lenis` inside `src/sections/**` or
  `src/components/**`.** Those live behind `src/lib/*` and `src/animations/*`.
- **`Navbar` and `Footer` may only be imported by a layout.** Pages change
  their appearance with the `variant` prop instead.
- **No `any`, no `@ts-ignore`, no non-null assertions.**

---

## How to add a sixth project

Edit **one file**: `src/data/entries.ts`. Append a `PortfolioEntry` to the
`ENTRIES` array.

```ts
{
  slug: 'my-new-thing',            // add it to EntrySlug in ./types.ts
  type: 'project',                 // or 'experience'
  title:            { en: '…', es: '…' },
  shortDescription: { en: '…', es: '…' },
  description:      { en: '…', es: '…' },
  developmentAreas: { en: '…', es: '…' },
  technologies: ['nextjs', 'postgresql'],   // ids from src/data/technologies.ts
  images: [{ src: '/projects/shot.png', alt: { en: '…', es: '…' } }],
  links:  [{ kind: 'github', href: 'https://github.com/…' }],
}
```

That is the whole change. The Home carousel, the Projects grid, the detail
page, the static params and the sitemap all read from this array — no
component knows how many entries there are.

Drop any images into `public/projects/` first. Experience entries additionally
take `organization`, `period` and `highlights`, and omit `images`/`links`.

## How to change a colour

Edit `src/styles/tokens.css`. Nothing else. The value flows to CSS modules via
`var(--c-*)`, to Tailwind via the `@theme inline` block in `globals.css`, and
into the shaders via `src/lib/palette.ts`, which resolves the custom property
at runtime and hands WebGL a `THREE.Color`.

## How to add a ninth animation

Create **one folder** under `src/animations/`:

```
my-animation/
├── index.ts              the only import surface
├── MyAnimation.tsx       satisfies AnimationLayerProps
├── MyAnimation.module.css
├── types.ts
└── config.ts             tunable constants — never colours
```

Have the component accept `AnimationLayerProps`
(`{ className?, paused?, quality?, onReady? }`) and it can be dropped into any
background slot. Then add one dynamic import to the section that should use it:

```tsx
const MyAnimation = dynamic(
  () => import('@/animations/my-animation').then((m) => m.MyAnimation),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);
```

**The reverse also holds:** delete any animation folder and only that one
import breaks. Every section already renders a documented static fallback while
its animation loads, so removing one degrades the section rather than the site.

### If it uses WebGL

Mount it through `CanvasStage` (dpr clamping, context-loss recovery, a
frameloop that genuinely stops when paused), take its budget from
`useQuality()`, and gate its mounting with `useInViewport` — at most **two**
WebGL contexts may be alive at once. The windows are declared and justified in
`src/lib/webgl/contextBudget.ts`.

---

## The eight animations

| | Module | Where | Technique |
| --- | --- | --- | --- |
| A1 | `boot-loader` | overlay | 14-segment display spelling `LOADING`; CSS only |
| A2 | `aizawa-attractor` | Home hero | RK4 attractor, 180 filaments in one draw call |
| A3 | `tilted-card-carousel` | Home | Framer Motion arc, 60°/step |
| A4 | `sunset-scroll-sea` | Home | Shader ocean bound to scroll progress |
| A5 | `hex-tech-grid` | Home | `clip-path` honeycomb; CSS only |
| A6 | `hopf-fibration` | Home | Stereographic S³ projection |
| A7 | `voronoi-torus` | Projects hero | Sutherland–Hodgman Voronoi shatter |
| A8 | `thrown-cards-grid` | Projects | GSAP throw → float → Flip into the grid |

Every one honours `prefers-reduced-motion` with a documented static fallback.

## Deployment

Vercel, zero configuration. `.vercelignore` keeps the reference folders out of
the build. Set `NEXT_PUBLIC_SITE_URL` once a custom domain exists; until then
the sitemap uses Vercel's production URL automatically.
