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
   * dissolveDistance is the one that actually decides whether the handoff is
   * black, and it is bounded by the camera rather than by taste. The canvas is
   * opaque (CanvasStage runs alpha: false) and the hero's pin is sticky for the
   * whole section, so nothing below can show through and nothing else can be on
   * screen until the pin scrolls off. The only way to avoid a black screen is
   * for the shell to still be visible while it slides away.
   *
   * At this camera the visible half-height at the torus is about 2.3 units and
   * the shell's outer edge sits at 2.07, so a fragment that travels much beyond
   * ~0.9 is out of frame. 3.4 and even 2.4 emptied the canvas well before the
   * scroll reached the end of the hero, which is what left the screen black
   * while waiting for the grid.
   */
  dissolveStart: 0.42,
  dissolveEnd: 1,
  dissolveDistance: 0.9,
} as const;
