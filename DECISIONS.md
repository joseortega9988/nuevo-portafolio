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

### Verification was done against the DOM, not screenshots

The Browser pane in this environment does not composite frames unless it is
displayed, which suspends `requestAnimationFrame` and defers style
recalculation. Behaviour was therefore verified by driving the live page and
reading the DOM and computed state directly. Anything that could only be judged
by eye — camera framing against the two reference screenshots, and the visual
quality of the shaders — is reported as unverified rather than as passing.
