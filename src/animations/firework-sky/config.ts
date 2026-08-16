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
  /** Shells alive at once. Bounds the particle budget however fast we launch. */
  maxConcurrent: 4,

  /** Spawn box, in world units. */
  spawnX: 90,
  spawnY: [-60, -30] as const,
  targetY: [10, 55] as const,
  spawnZ: 60,

  camera: { fov: 60, position: [0, 0, 150] as const },
  bloom: { strength: 1.495, radius: 0.5, threshold: 0 },
  /** Opacity of the black quad that eats the previous frame — the trails. */
  trailOpacity: 0.397,
} as const;
