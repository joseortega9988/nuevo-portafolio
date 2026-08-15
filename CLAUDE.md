# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`README.md` is accurate and worth reading first — it covers the directory map, the
self-enforced rules, and step-by-step recipes for adding an entry, a colour or an
animation. This file covers what those recipes don't: cross-cutting behaviour that
only becomes visible after reading several files, and the traps that cost real time.

`DECISIONS.md` records why specific choices were made. Check it before "fixing"
something that looks odd — several oddities are deliberate and explained there.

## Commands

```bash
npm run dev        # http://localhost:3000, redirects to /en
npm run lint       # ESLint AND the colour-token guard — both must pass
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

**Never run `npm run build` while `npm run dev` is running.** They share the
`.next` directory; the build overwrites the server chunks underneath the live dev
server, which then fails every route with `Cannot find module './vendor-chunks/*'`.
Stop the dev server first. If it already happened, `rm -rf .next` and restart.

There is no test framework and no test script — do not invent one or claim tests
pass. Verification here means `typecheck` + `lint` + `build`, plus driving the page
in a browser. Because most of the work is visual and scroll-driven, measuring the
DOM (`getBoundingClientRect`, computed styles) is usually more reliable than
eyeballing a screenshot, and is how the existing behaviour was verified
(see DECISIONS.md, "Verification was done against the DOM, not screenshots").

## Architecture

### Layering is enforced, not suggested

`npm run lint` fails the build on these, so work with them rather than around them:

- `src/sections/**`, `src/components/**` and `app/**` may not import `three`,
  `gsap`, `lenis`, `@react-three/*` or `postprocessing`. Those belong in
  `src/animations/*` and `src/lib/*`. A section consumes an animation through a
  dynamic import and the `AnimationLayerProps` contract, nothing more.
- No hex colour literal anywhere outside `src/styles/tokens.css` — including in
  template strings and shader source. Two mechanisms cover this: an ESLint
  `no-restricted-syntax` rule for `.ts`/`.tsx`, and `scripts/check-color-tokens.mjs`
  for `.css`, which ESLint cannot see.
- `Navbar`/`Footer` may only be imported from a `layout.tsx`.
- No `any`, no `@ts-ignore`, no non-null assertions.

Colour reaches WebGL through `src/lib/palette.ts`, which resolves the CSS custom
property off `:root` at runtime and returns a `THREE.Color`. Shaders take colours as
uniforms from there — a new colour means adding a token *and* adding it to
`COLOR_TOKENS`.

### Everything flows from `src/data/entries.ts`

The five entries drive the Home carousel, the Projects grid, all detail pages,
`generateStaticParams` and the sitemap. No component knows how many entries exist.
Components never receive a `PortfolioEntry` — `src/data/viewModels.ts` projects it
to a `CardViewModel` so a card cannot reach fields only the detail page should read.
That module is deliberately free of `next-intl`: anything locale-dependent beyond
the plain `locale` key (such as the "Present" label) is passed *in* by the caller,
which keeps it callable from a server component, a client component or a test.

### Scroll is the single source of truth

Lenis drives smooth scrolling globally (`src/lib/motion/LenisProvider.tsx`). Two
consequences that bite:

- A bare `window.scrollTo` is overwritten by Lenis on the next frame and appears to
  do nothing. Use `useScrollTo`.
- GSAP ScrollTrigger does not see Lenis's scrolling unless synced. Any component
  creating a ScrollTrigger must call `useGsapLenisSync()`, or its triggers fire late
  or never.

Section animation is driven by normalised scroll progress (`useScrollProgress`,
with `section` and `from-entry` modes) rather than by state flags, which is what
lets effects reverse correctly when scrolling back up. Interactive controls
(carousel arrows, dots) scroll the page to the position representing a card instead
of moving the carousel directly, so the two can never disagree.

### WebGL mounting and pausing

Every scene on a page mounts once at load, behind the boot loader, and is then only
*paused* when off-screen — never unmounted. This is deliberate and explained at the
top of `src/lib/webgl/contextBudget.ts`: unmounting meant each scene rebuilt itself
mid-scroll (the attractor integrates 144k points, the torus clips 2500 Voronoi
cells), so sections visibly assembled as you reached them.

Mount every WebGL scene through `src/lib/webgl/CanvasStage.tsx` — it handles dpr
clamping, context-loss recovery, and a frameloop that genuinely stops when paused.
Take the budget from `useQuality()` (which lowers resolution and particle counts,
never features) and drive `paused` from `useInViewport` + `useRafPause`.

The boot loader waits for expensive scenes via the `SceneReady` registration in
`src/lib/motion/SceneReady.tsx`; a scene that calls `reportReady` must actually call
it or the loader will not dismiss.

### Animations are self-contained

One folder per animation under `src/animations/`, exposing only `index.ts`. Tunable
constants live in that folder's `config.ts` — that is the first place to look when
asked to make something bigger, faster or brighter. Colours never live there.
Deleting an animation folder should break exactly one dynamic import; every section
renders a documented static fallback while its animation loads, and every animation
honours `prefers-reduced-motion` with a static fallback.

### i18n

`en` and `es`, via `next-intl` with a `[locale]` segment and `middleware.ts`. Every
visitor-facing string lives in `messages/{en,es}.json` — both must be updated
together. Content strings that belong to an entry are localised inside
`entries.ts` as `{ en, es }` pairs instead.

## Gotchas found the hard way

- **`overflow: hidden` breaks `position: sticky` descendants.** It makes the element
  a scroll container, so a sticky child pins to a box that never scrolls and slides
  away with the page. Use `overflow: clip`, which clips without creating one — this
  is why `body` uses `overflow: clip visible`.
- **GSAP Flip only animates what it captured.** `Flip.getState(..., { props })` must
  name any non-transform property that changes, and that property must actually
  differ after the DOM change or the tween is a no-op. A CSS `rotate` property is
  *not* GSAP's `rotation` (which is `transform: rotate()`); mixing them silently
  animates nothing.
- **Absolutely-positioned scatter layouts must account for the element's own size.**
  A raw `left: 73%` ignores the card's width and overflows on narrow viewports;
  position against the free space instead.
- **Effects that set React state from inside a ScrollTrigger must not list that
  state as a dependency** — the cleanup calls `context.revert()` and kills the
  in-flight timeline. `useThrowSequence` guards with a ref and documents this.
