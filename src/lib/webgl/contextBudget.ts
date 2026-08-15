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
 * There are no exceptions left. This used to record the Projects hero as one —
 * the torus disposed after dissolving, on the grounds that it was finished —
 * but that was reversed and the note outlived it. The torus stays mounted like
 * everything else, precisely so it can reassemble on the way back up; see the
 * comment on its scroll progress in ProjectsHeroSection.
 */
export const MOUNT_MARGINS = {
  hero: '200% 0px 200% 0px',
  sea: '200% 0px 200% 0px',
  fibration: '200% 0px 200% 0px',
} as const;
