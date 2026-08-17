/**
 * Visibility windows for the WebGL sections, in one place so the policy is
 * auditable rather than folded into three separate components.
 *
 * POLICY: every animation on a page mounts up front and stays mounted. Scenes
 * are only ever *paused* when off-screen, never unmounted.
 *
 * This is a deliberate change from the original mount-on-approach design.
 * Unmounting kept at most two WebGL contexts alive, but it meant each scene
 * built itself the moment the visitor arrived at it — the attractor integrates
 * 144k points, the torus clips 2500 Voronoi cells — so sections visibly
 * assembled themselves as you scrolled in. Paying that cost once, at load,
 * behind the boot loader, is the better trade: three contexts is well within
 * what browsers allow (the practical ceiling is around sixteen), and a paused
 * scene costs nothing because R3F stops scheduling frames entirely.
 *
 * The margins below therefore drive `paused`, not mounting. They are generous
 * so a scene is already running before it is seen rather than starting on the
 * first visible frame.
 *
 * hero and fibration were originally 200% — two full viewport-heights, which
 * on a three-section page like Home meant both were unpaused for nearly the
 * entire scroll range, not just near their own section. Both run an
 * EffectComposer Bloom pass on top of real per-frame cost (the attractor
 * integrates 180 filaments * 800 points = 144k points via RK4; the fibration
 * tumbles its fibre field, starfield and cages), so having them both active
 * at once was genuine GPU contention, not just a paused scene sitting idle.
 * It showed up as stutter specifically when scrolling from Technologies back
 * to the hero, because that is the one path where both heavy scenes overlap
 * — the sea in between self-throttles via useAdaptiveResolution and never
 * causes the same contention. 100% keeps the "already running before you
 * arrive" warm-up this policy wants while cutting that overlap roughly in
 * half; it also matches the margin every other section on the site already
 * uses (ProjectsHeroSection, ProjectsGridSection, EntryBackdrop). This is a
 * pause-timing change only — no scene's particle count, resolution or bloom
 * strength moved.
 *
 * The Projects hero used to be recorded here as an exception — the torus
 * disposed after dissolving, on the grounds that it was finished — but that was
 * reversed and the note outlived it. The torus stays mounted like everything
 * else, precisely so it can reassemble on the way back up; see the comment on
 * its scroll progress in ProjectsHeroSection.
 *
 * THE ONE REAL EXCEPTION: the footer tunnel (see FooterTunnel.tsx).
 *
 * The argument above turns on rebuild cost, and the footer tunnel does not have
 * one worth protecting: it is a single BoxGeometry with 2,304 instances and it
 * builds in about 2ms, against the attractor's 144k integrated points and the
 * torus's 2,500 clipped cells. What it does have is an unusually high cost to
 * keep. Footer is rendered from the locale layout, so this scene held a WebGL
 * context and a bloom composer on *every route on the site*, including the
 * detail pages, where it sat behind a firework sky already spending the budget.
 * It therefore unmounts after five continuous seconds off-screen and remounts a
 * full viewport before it is seen again, which is early enough that the rebuild
 * is never visible. Nothing else on the site should copy this: for every other
 * scene the trade runs the other way, and that is what the policy above is.
 */
export const MOUNT_MARGINS = {
  hero: '100% 0px 100% 0px',
  sea: '100% 0px 100% 0px',
  fibration: '100% 0px 100% 0px',
} as const;
