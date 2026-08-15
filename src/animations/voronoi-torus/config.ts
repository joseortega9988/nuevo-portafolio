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
   * It starts late and finishes late on purpose. Dissolving over the first 60%
   * left the torus invisible for most of the hero — and, scrolling back up from
   * the cards, meant a long stretch of black before it reassembled. Holding it
   * intact through the first 40% keeps the hero populated in both directions.
   */
  dissolveStart: 0.4,
  dissolveEnd: 0.88,
  dissolveDistance: 3.4,
} as const;
