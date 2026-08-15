/**
 * Aizawa attractor — system parameters and scene tuning. No colours here;
 * those are read from tokens.css through src/lib/palette.ts.
 */

/** The canonical Aizawa constants. Changing any of these changes the shape of
 *  the attractor itself, not just its look. */
export const AIZAWA = {
  a: 0.95,
  b: 0.7,
  c: 0.6,
  d: 3.5,
  e: 0.25,
  f: 0.1,
} as const;

export const INTEGRATION = {
  /** RK4 step. Small enough that the trajectory stays smooth at this scale;
   *  larger values visibly polygonise the tight curves near the base disk. */
  dt: 0.0045,
  /** Steps discarded before recording, so every filament has already settled
   *  onto the attractor and no stray line runs in from the seed point. */
  transientSteps: 900,
  pointsPerFilament: 800,
  filaments: 180,
  /** Seeds are scattered in this cube; the attractor pulls them in regardless. */
  seedSpread: 0.6,
} as const;

export const SCENE = {
  /**
   * Camera framing, matched to the reference screenshot: a low, slightly
   * off-axis view with the funnel of filaments rising through the frame and
   * the glowing base disk sitting at the lower edge. The distance below is
   * already the reference framing dollied in by 15%.
   */
  camera: {
    fov: 62,
    position: [0.38, 0.06, 1.62] as const,
    target: [0, 0.66, 0] as const,
    near: 0.05,
    far: 40,
  },
  /** Rotation is allowed; zoom and pan are not (§D A2). The polar limits are
   *  ±25° around the reference elevation. */
  controls: {
    rotateSpeed: 0.4,
    dampingFactor: 0.07,
    polarSwing: (25 * Math.PI) / 180,
  },
  /** Slow drift so the scene is never completely still, even untouched. */
  autoRotateSpeed: 0.035,
  flow: {
    /** How many pulse heads travel each filament at once. */
    repeat: 3.0,
    speed: 0.16,
  },
  bloom: { intensity: 1.1, radius: 0.6, threshold: 0.15 },
  chromaticAberration: 0.0009,
  particles: 900,
  baseDisk: { radius: 1.35, rings: 7 },
} as const;
