/**
 * Firework sky — geometry, physics and cadence.
 *
 * The numbers are the reference pen's, with the panel values the brief
 * specified rather than the pen's own defaults: 30000 particles, force 5,
 * hover 1.05, gravity 0.0053, fade 0.0044.
 */
export const FIREWORK_CONFIG = {
  /** Particles per shell, per quality tier. The brief's figure is the ceiling. */
  particles: { high: 30000, medium: 14000, low: 5000 },
  particleSize: 0.8,
  /** Alpha lost per frame once a spark is past its hover. */
  fadeSpeed: 0.0044,

  /** Initial speed of a shell's sparks, before the per-shell 0.8–1.2 jitter. */
  explosionForce: 5,
  /** Seconds the sparks hang before gravity ramps in. */
  hoverDuration: 1.05,
  gravity: 0.0053,
  friction: 0.955,

  /** Rocket rise. It explodes on reaching its target or stalling. */
  rocketSpeed: 1,
  rocketStallSpeed: 0.2,

  /**
   * Cadence. Deliberately shorter than a shell's life, which is the whole
   * point of the brief: the next rocket is already climbing while the last one
   * is still fading, so the sky is never empty. The reference pen used a
   * single 3.8s interval, which left visible gaps.
   */
  launchIntervalMs: [900, 1700] as const,
  /**
   * One burst on screen at a time.
   *
   * Four at once was a wall of sparks with no single event to look at. A
   * rocket may still be climbing while the last burst fades — that is the
   * overlap the brief asked for, and it keeps the sky from ever emptying —
   * but only one shell is ever exploding.
   */
  maxBursts: 1,
  maxRockets: 1,

  /**
   * Spawn box, as a fraction of the visible frame rather than in world units.
   *
   * Fixed units could not know how wide the frame actually is: at a narrow
   * viewport the visible half-width at z=0 is around 60 units, so the old
   * spawnX of 90 put shells past the edge and half the burst never appeared.
   * Read against the live frustum, these hold every burst's centre well inside
   * the frame at any aspect ratio.
   */
  spawnXFactor: 0.5,
  /** Where the rocket starts, as a fraction of half-height below centre. */
  spawnYFactor: [-1.15, -0.9] as const,
  /** Where it bursts, as a fraction of half-height. Kept off the top edge. */
  targetYFactor: [-0.1, 0.4] as const,
  /**
   * Depth spread. Small on purpose: at +/-60 some shells burst far enough back
   * to read as a different, smaller firework altogether. A shallow band keeps
   * every burst at much the same apparent size.
   */
  spawnZ: 12,

  camera: { fov: 60, position: [0, 0, 150] as const },
  bloom: { strength: 1.495, radius: 0.5, threshold: 0 },
  /** Opacity of the black quad that eats the previous frame — the trails. */
  trailOpacity: 0.397,
} as const;
