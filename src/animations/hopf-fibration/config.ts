/**
 * Hopf fibration settings.
 *
 * density, pulse and bloom are the three values the reference exposes as
 * sliders. They are hardcoded here at the requested figures — this is a
 * background, not a toy, and no control panel ships (restriction 8).
 */
export const HOPF_CONFIG = {
  /** Fibres per ring of base points on S². */
  density: 16,
  /** Rings of base points, from near the pole out toward the equator. More
   *  rings means more nested, more deeply linked tori. */
  rings: 7,
  /** Samples around each fibre circle. Below ~120 the tighter fibres visibly
   *  polygonise after stereographic projection. */
  segments: 168,
  /** Travelling-pulse frequency along each fibre. */
  pulse: 4.2,
  pulseSpeed: 0.32,
  bloom: 0.8,

  /**
   * Camera: wide framing with the core centred, matching the reference frame.
   * The arcs are meant to run out past the edges rather than sit inside them.
   */
  camera: {
    fov: 55,
    position: [0, 0.35, 6.4] as const,
    near: 0.1,
    far: 60,
  },
  /** Slow tumble, so the linkage of the fibres is legible over time. */
  rotationSpeed: { x: 0.021, y: 0.045 },

  /** Stereographic projection diverges at the pole; segments longer than this
   *  are dropped rather than drawn across the whole frame. */
  maxSegmentLength: 2.2,
  projectionScale: 0.62,

  particles: 700,
  cageRadius: 2.9,
} as const;
