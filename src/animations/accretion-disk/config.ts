/**
 * Accretion disk around a dark core.
 *
 * Framed much closer than a typical wide shot of one: the disk is meant to
 * fill the frame behind the grid and run off every edge, not sit in the middle
 * of empty space.
 */
export const DISK_CONFIG = {
  /** Streaks per quality tier. Each is two vertices in one draw call. */
  particles: { high: 14000, medium: 9000, low: 4500 },

  /**
   * Inner edge sits just outside the horizon; outer edge runs a little past
   * the frame.
   *
   * Only a little: at this camera the visible half-height at the origin is
   * about one world unit, so a much larger disk spends most of its particles
   * outside the frame and leaves the part you can actually see looking sparse.
   */
  innerRadius: 0.5,
  outerRadius: 2.5,
  /**
   * Radial density bias. Above 1 packs particles toward the inside, which is
   * where a real disk is brightest and where the eye expects the detail.
   */
  densityBias: 2.1,

  /** Disk thickness, as a fraction of radius — thin, and slightly flared. */
  thickness: 0.028,
  flare: 0.35,

  /** Orbital speed. Keplerian falloff, so the inside shears past the outside
   *  and the disk visibly winds up rather than turning as a rigid plate. */
  angularSpeed: 0.42,
  keplerExponent: 1.5,

  /** How far each streak trails behind its particle, in seconds of travel.
   *  Faster orbits therefore draw longer streaks, which is what reads as
   *  motion blur rather than as dashes of fixed length. */
  trailSeconds: 0.075,

  /**
   * Relativistic beaming: the side of the disk rotating toward the viewer is
   * far brighter. This is the single detail that makes the image read as a
   * black hole rather than as a ring of confetti.
   */
  beamStrength: 0.85,
  beamAngle: -0.35,

  /** The dark core and the thin ring of light bent around it. */
  horizonRadius: 0.34,
  photonRingRadius: 0.4,

  /**
   * Lift applied to the far side of the disk, standing in for gravitational
   * lensing. Zero here: that arc only exists when the disk is seen edge-on,
   * and face-on it would merely push particles toward and away from the
   * camera where nothing can be seen of it.
   */
  lensing: 0,

  camera: {
    fov: 46,
    /**
     * Face-on, looking straight into the disk.
     *
     * A shallow, edge-on angle makes a wide ellipse that only fills a
     * landscape frame — on a tablet or a phone it leaves broad empty bands
     * above and below the cards. Seen face-on the disk is a full circle, so it
     * covers any aspect ratio, and far more of the orbital motion is visible
     * because nothing is foreshortened.
     */
    position: [0, 0, 2.6] as const,
  },

  bloom: { intensity: 1.15, threshold: 0.1 },
  /** Seconds the whole scene takes to fade up once the cards have settled. */
  fadeInSeconds: 1.6,
} as const;
