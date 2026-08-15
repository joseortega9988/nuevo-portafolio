/**
 * Accretion disk around a dark core.
 *
 * Framed much closer than a typical wide shot of one: the disk is meant to
 * fill the frame behind the grid and run off every edge, not sit in the middle
 * of empty space.
 */
export const DISK_CONFIG = {
  /**
   * Streaks per quality tier. Each is two vertices in one draw call.
   *
   * Raised along with the scale below so the larger disk reads as denser rather
   * than as the same streaks stretched thinner over more area.
   */
  particles: { high: 34000, medium: 22000, low: 10000 },

  /**
   * Radial extent, in world units, chosen against the view frustum rather than
   * by eye.
   *
   * At the camera below the visible half-diagonal is about 2.25 world units, so
   * that number — not the disk's own size — decides what lands on screen. The
   * rim sits comfortably past it, so the disk is cropped by the viewport on
   * every side instead of floating with empty space around it.
   *
   * Resisting the urge to push the rim much further: radius beyond the corner
   * is spent entirely off-camera, so a far larger disk would move most of these
   * streaks outside the frame and leave the visible part looking sparser than
   * the small version it replaced.
   */
  innerRadius: 0.85,
  outerRadius: 3.4,
  /**
   * Radial density bias. Above 1 packs particles toward the inside, which is
   * where a real disk is brightest and where the eye expects the detail.
   *
   * Eased down from 2.1: that crowded roughly half of every streak into the
   * innermost fifth, so the disk thinned out well before the frame edge no
   * matter what the outer radius was. The density curve, not the radius, was
   * what actually stopped it filling the space.
   */
  densityBias: 1.3,

  /** Disk thickness, as a fraction of radius — thin, and slightly flared. */
  thickness: 0.028,
  flare: 0.35,

  /**
   * Orbital speed. Keplerian falloff, so the inside shears past the outside
   * and the disk visibly winds up rather than turning as a rigid plate.
   *
   * Scaled with the radius rather than left alone. Angular speed goes as
   * r^-1.5, so moving the inner edge outward would otherwise have slowed the
   * disk noticeably — a bigger disk that also crawled. This holds the inner
   * edge at roughly the angular rate it turned at before.
   */
  angularSpeed: 0.94,
  keplerExponent: 1.5,

  /**
   * How far each streak trails behind its particle, in seconds of travel.
   * Faster orbits therefore draw longer streaks, which is what reads as motion
   * blur rather than as dashes of fixed length.
   *
   * Lengthened with the rest of the scale-up. Streak length is what actually
   * carries the sense of size here — at the old value the larger disk was drawn
   * with the same short ticks and read as a wider field of small marks rather
   * than as a bigger object.
   */
  trailSeconds: 0.13,

  /**
   * Relativistic beaming: the side of the disk rotating toward the viewer is
   * far brighter. This is the single detail that makes the image read as a
   * black hole rather than as a ring of confetti.
   */
  beamStrength: 0.85,
  beamAngle: -0.35,

  /**
   * The dark core and the thin ring of light bent around it. Grown with the
   * disk, but deliberately by less than the rest of it: scaled to match, the
   * silhouette would span most of the frame height and leave the colour ramp —
   * the part actually worth looking at — showing only in the corners.
   */
  horizonRadius: 0.5,
  photonRingRadius: 0.6,

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
    /**
     * Further back on a phone. At the reference distance a narrow frustum
     * shows only the disk's hot inner region, so the ramp that carries all the
     * colour sits outside the frame and the section reads as a grey core.
     */
    positionNarrow: [0, 0, 4.1] as const,
  },

  bloom: { intensity: 1.15, threshold: 0.1 },
  /** Seconds the whole scene takes to fade up once the cards have settled. */
  fadeInSeconds: 1.6,
} as const;
