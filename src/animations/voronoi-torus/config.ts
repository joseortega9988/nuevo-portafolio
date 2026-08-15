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
  bloom: { intensity: 0.9, threshold: 0.2 },

  /** The dissolve completes over the first 60% of the hero's exit (§D A7). */
  dissolveWindow: 0.6,
  dissolveDistance: 3.4,
} as const;
