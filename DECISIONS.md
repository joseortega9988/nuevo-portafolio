# Decisions

Points where the brief left room, or where two requirements pulled against each
other, and what was chosen instead of guessing silently.

---

### The take-home links to its Swagger docs, not to a "live demo"

The brief said there is no live demo. Its README, however, carries a real
Heroku URL, and that URL responds — it serves the NestJS Swagger page. So the
link is genuine rather than invented, and it ships labelled **"API docs
(Swagger)"** rather than "Live demo": a free dyno that has gone to sleep then
reads as documentation being briefly unavailable, not as a broken portfolio
demo. Confirmed with the repo owner before including it.

### The hex grid's rows are not tightly interlocked

Two requirements collide. A mathematically tight pointy-top honeycomb overlaps
rows by a quarter of the hexagon height; the brief also requires each
technology's name to sit *directly underneath* its hexagon. Both cannot hold —
a tight interlock leaves the labels nowhere to live.

Kept: the exact `clip-path`, the exact `--hex-width * 2/√3` height ratio, and
the half-cell horizontal offset on alternate rows, which is what actually
carries the honeycomb read. Relaxed: the vertical overlap, to open a label
band. The offset is expressed as `nth-child` cycles of twice the column count,
one block per breakpoint, because CSS cannot address a wrapped flex row.

### The reference screenshots pin framing, not aspect ratio

Both are wide crops (roughly 1900×540) of a browser window. They fix the
composition and the palette — where the funnel rises, where the base disk sits,
that the fibration's core is centred with arcs running past the frame edges —
but not a 16:9 layout. The cameras match the composition at the site's own
aspect ratio.

### Carousel navigation is clamped, not looping

The reference wraps from the last card to the first. With five entries in a
deliberate order of weight, wrapping would quietly undercut that ranking, so
the arrows disable at both ends instead.

### The boot loader lives inside `HeroSection`

The brief lists it as a separate item of the Home page. It is mounted by the
hero because the hero is the component that knows when the scene has rendered
its first frame, which is one of the loader's two dismissal conditions. Putting
it a level higher would have meant threading that state up through a page that
otherwise only composes.

### Four technologies use a semantic icon

REST APIs, SQL, CI/CD and Playwright have no brand mark in `react-icons`.
Rather than hotlink an SVG or omit them, they use a semantic icon (an API
glyph, a database, a refresh cycle, a browser check). React Native shares the
React atom, which is its actual logo.

### `entries.ts` stays a single file

Restriction 10 caps files at 250 lines; the Open/Closed requirement says adding
an entry must touch only `src/data/entries.ts`. Splitting per entry would have
satisfied the first and broken the second. The file lands at ~220 lines with
all five entries, so both hold as written — worth knowing if a sixth and
seventh entry push it over, at which point the registry pattern
(`entries.ts` importing `entries/<slug>.ts`) is the escape hatch.

### Adaptive quality lowers resolution, never features

The sea shader drops internal render scale under load and leaves its wave
octaves alone. A softer sea is still the same scene; octaves disappearing
mid-scroll changes what the water *is*, which is far more noticeable than a
slightly soft frame. The scale also only ratchets down — recovering it would
oscillate, since the moment the scene got cheaper the frame rate would rise and
push it straight back up.

### `sessionStorage` is used once, for the loader

Restriction 2 permits exactly this. No other state is persisted anywhere, and
`localStorage` is not used at all.

### Adaptive resolution now recovers, because the sampler gained hysteresis

*Supersedes the second paragraph of "Adaptive quality lowers resolution, never
features" (2026-08-17).*

That entry's first half still holds and is not in question: the sea drops
internal render scale and leaves its octaves alone, because a softer sea is the
same scene and a sea with fewer octaves is a different one. `SEA_CONFIG.octaves`
is untouched and the floor is still `SEA_CONFIG.adaptive.minScale`.

The second half — that the scale may only ratchet down, because recovering it
would oscillate — was a correct diagnosis of the sampler that existed rather
than of the idea. That sampler averaged 45 frames against one fixed 48fps
threshold and had no memory, so yes, it would have hunted. What it actually did
instead was worse than hunting: it measured once, dropped, and never looked
again. One stutter during a route transition pinned the sea at reduced
resolution for the rest of the session, and a phone that could afford full
resolution once the boot loader's work was done could never earn it back.

The missing piece was hysteresis, not the direction. drei's `PerformanceMonitor`
averages against a band derived from the device's own refresh rate — 48fps is a
pass on a 60Hz panel and a bad frame on a 120Hz one — and counts reversals,
settling at the floor after three. The oscillation the old note predicted is
bounded by construction. Resolution still degrades before features.

### `antialias` is off on every canvas except the wormhole tunnel

MSAA on the default framebuffer does nothing for a scene that runs an
`EffectComposer`. The scene is rasterised into the composer's own render target
and the default framebuffer only ever receives a fullscreen triangle from the
final pass, which has no interior edges to sample — so the multisampled
backbuffer was allocated per canvas and never read.

The exception is real and worth not "fixing": the wormhole tunnel has no
composer, because it drops bloom deliberately (see the comment in
`WormholeTunnel.tsx`), and unlike the sea it is not a fullscreen quad — it is
2,304 instanced boxes with hard silhouettes drawing straight to the screen. It
keeps `antialias` at `tier === 'high'`, which is exactly what every canvas
received before. The audit that prompted this change recommended turning it off
everywhere; it had miscounted the composers and missed the tunnel.

### `multisampling` is clamped to the GPU, not left at the library default

`EffectComposer` defaults to `multisampling={8}` on a `HalfFloatType` target.
Nobody here chose 8, and most GPUs report `MAX_SAMPLES = 4` and clamp it
silently — so on that hardware the request bought an allocation for
antialiasing the driver was never going to deliver. `samplesForTier` asks for
`min(8, maxSamples)`, read from `gl.capabilities` inside the canvas because it
is only knowable once a context exists. It requests exactly what was being
delivered before, on every GPU.

It is a clamp and nothing more, and that is the second version. The first
stepped down by tier — 4 on high, 2 on medium, none on low — for a real VRAM
saving. On a GPU that genuinely offers 8, which this project's development
machine does (AMD Radeon via ANGLE/D3D11), that halved the coverage carried by
the thinnest geometry on the site. The Hopf fibration showed it immediately:
its arcs are sub-pixel additive lines, already dimmed toward the back of the
field by `depthFade`, and then thresholded by a bloom at `luminanceThreshold`
0.12. Losing coverage dropped the far arcs under that threshold while the
bright near side survived, so the field stopped reading as lit on all sides and
only filled in as it rotated.

Anyone tempted to reinstate the saving: the lever is per-scene, not per-tier,
and it needs a side-by-side first. A scene of solid geometry can afford fewer
samples in a way a scene of thin additive lines cannot.

### The footer tunnel is the one scene that unmounts

`contextBudget.ts` sets the opposite policy for everything else, and it is
right: unmounting made scenes visibly rebuild themselves mid-scroll. That
argument turns entirely on rebuild cost, and the footer tunnel has almost none
— one `BoxGeometry`, 2,304 instances, about 2ms — against the attractor's 144k
integrated points and the torus's 2,500 clipped Voronoi cells.

What it does have is an unusually high cost to keep. `Footer` is rendered from
the locale layout, so this scene held a WebGL context and a bloom composer on
every route on the site, including the detail pages, where it sat behind a
firework sky already spending the budget. It unmounts after five continuous
seconds off-screen and remounts a full viewport before it is seen again. The
two margins are deliberate: the tight `0px` one still drives `paused`, the wide
one drives mount and unmount, so the frame loop still stops the instant the
footer leaves while the scene itself comes back early enough that the rebuild
is never visible.

### `gsap` is in the root bundle on purpose

`useGsapLenisSync` used to carry a note that gsap must never be imported from
`LenisProvider`, because that would pull the whole library into the root
bundle. The observation was correct, and the trade was taken anyway: Lenis is
now driven by `gsap.ticker` with `autoRaf: false`, so one ticker owns the frame
and Lenis writes the scroll position before anything reads it. Before that,
Lenis ran a hand-rolled rAF loop while GSAP ran its own on the routes with a
timeline, and nothing ordered them within a frame.

Only gsap *core* moved. `ScrollTrigger` and `Flip` are the expensive half and
they stay in `useGsapLenisSync` and `useThrowSequence`, on the one route that
uses them. If the bundle cost is ever judged too dear, the commit tagged
`[P1-10]` that moves the ticker is revertible on its own.

### Verification was done against the DOM, not screenshots

The Browser pane in this environment does not composite frames unless it is
displayed, which suspends `requestAnimationFrame` and defers style
recalculation. Behaviour was therefore verified by driving the live page and
reading the DOM and computed state directly. Anything that could only be judged
by eye — camera framing against the two reference screenshots, and the visual
quality of the shaders — is reported as unverified rather than as passing.
