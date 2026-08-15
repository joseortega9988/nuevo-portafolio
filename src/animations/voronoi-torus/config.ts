/** Voronoi torus geometry and interaction tuning. */
export const TORUS_CONFIG = {
  /** Seeds are laid on a jittered grid in (u, v) parameter space. A 50×50 grid
   *  is 2500 fragments; mobile drops to 35×35, about 1200. */
  seedGrid: { high: 50, medium: 44, low: 35 },
  /** How far a seed may wander inside its grid cell, as a fraction of the cell.
   *  Must stay below 0.5 or cells can leapfrog and the clip neighbourhood
   *  below would no longer contain every true neighbour. */
  jitter: 0.38,
  /** Neighbourhood searched when clipping a cell. ±2 is comfortably enough at
   *  this jitter, and keeps the build at a few tens of thousands of clips. */
  clipRadius: 2,

  radius: 1.55,
  tube: 0.52,

  /** Cursor influence, measured in normalised device coordinates so it behaves
   *  the same at every viewport size. */
  cursor: { radius: 0.38, maxLift: 0.42, maxAngle: 1.15 },

  camera: { fov: 48, position: [0, 0.9, 5.1] as const },
  idleRotation: { x: 0.055, y: 0.11 },
  /**
   * Drag-to-spin. Radians per pixel, plus the per-second decay applied to the
   * throw once the pointer is released — high enough that a flick keeps
   * turning for a moment, low enough that it always comes to rest.
   */
  drag: { sensitivity: 0.006, friction: 2.6, maxVelocity: 6 },
  bloom: { intensity: 0.9, threshold: 0.2 },

  /**
   * Scroll range over which the shell comes apart, as a fraction of the hero.
   *
   * It starts late and runs to the very end of the hero on purpose. Any margin
   * left after the dissolve completes is a stretch of pinned, empty canvas: on
   * the way down it reads as the hero dying before the cards arrive, and on the
   * way back up from the cards it is a full screen of black before the torus
   * reassembles. Ending at 0.98 means the shell is still coming apart as the
   * grid takes over, so there is never a moment with nothing on screen.
   *
   * The fragments also travel less far than they used to. At 3.4 they left the
   * frame long before the dissolve numerically finished, which put the black
   * stretch back even with the range extended.
   */
  dissolveStart: 0.42,
  dissolveEnd: 0.98,
  dissolveDistance: 2.4,
} as const;
