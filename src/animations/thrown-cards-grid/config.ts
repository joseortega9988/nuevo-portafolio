/** Throw, float and settle tuning. No colours, no copy. */
export const THROWN_CONFIG = {
  throw: {
    /** Distance off-screen each card starts from, in viewport widths. */
    distance: 1.25,
    stagger: 0.09,
    duration: 1.1,
    /** Overshoot on arrival — the "thrown and caught" feel. */
    ease: 'back.out(1.35)',
    maxRotation: 34,
  },
  float: {
    /** Per-card drift. Randomised within these bounds so no two cards share a
     *  cycle and the group never pulses in unison. */
    amplitude: [8, 18] as const,
    duration: [3.2, 5.4] as const,
  },
  parallax: {
    /** Multiplier on each card's data-depth. */
    strength: 26,
    /** Hover tilt, in degrees at the extremes of the card. */
    tilt: 16,
    /** Exponential follow factor — lower is heavier. */
    ease: 0.08,
  },
  settle: {
    duration: 0.9,
    stagger: 0.05,
    ease: 'power3.inOut',
  },
  /** Fraction of the section scrolled before the cards settle into the grid. */
  settleAt: 0.42,
} as const;

/**
 * Deterministic scatter positions, as percentages of the stage.
 *
 * Authored rather than randomised: a random layout occasionally stacks two
 * cards or pushes one off the visible area, and this phase is on screen for
 * only a couple of seconds — it has to look composed every time.
 */
export const SCATTER_SLOTS = [
  { top: 6, left: 4, depth: 0.9, rotate: -7 },
  { top: 30, left: 58, depth: 0.45, rotate: 5 },
  { top: 2, left: 34, depth: 0.65, rotate: 3 },
  { top: 52, left: 12, depth: 0.3, rotate: -4 },
  { top: 46, left: 74, depth: 0.75, rotate: 8 },
  { top: 20, left: 22, depth: 0.55, rotate: -2 },
] as const;
