/** Tuning for the scroll-driven sea. Phase stops are fixed by the brief. */
export const SEA_CONFIG = {
  /** Wave octaves per tier. Mobile gets half, per §D A4. */
  octaves: { high: 5, medium: 4, low: 2 },
  /** How fast the wave field itself animates. Independent of scroll: the sea
   *  keeps moving while the visitor is still, the phase does not. */
  waveSpeed: 0.22,
  adaptive: {
    /** Frames averaged before judging performance. */
    sampleSize: 45,
    /** Below this, drop internal resolution — never features (§D A4). */
    targetFps: 48,
    minScale: 0.55,
    scaleStep: 0.15,
  },
} as const;
