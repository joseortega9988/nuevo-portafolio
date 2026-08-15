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
  /**
   * ScrollTrigger start positions, as "trigger viewport" pairs.
   *
   * The throw waits until the stage is properly on screen. Firing it the
   * instant the hero torus scattered meant it played most of a viewport below
   * the fold, so the cards had already landed by the time they were visible.
   *
   * The settle then waits until the stage has reached the top of the viewport,
   * which leaves a full screen of scrolling to watch the cards float first.
   */
  throwAt: 'top 85%',
  /** Early enough that the deck arranges itself while still well in view,
   *  rather than making the visitor scroll the stage almost off-screen first. */
  settleAt: 'top 45%',
} as const;

/**
 * Deterministic scatter positions, as percentages of the stage.
 *
 * Authored rather than randomised: a random layout occasionally stacks two
 * cards or pushes one off the visible area, and this phase is on screen for
 * only a couple of seconds — it has to look composed every time.
 */
export const SCATTER_SLOTS = [
  { top: 8, left: 3, depth: 0.9, rotate: -8 },
  { top: 46, left: 24, depth: 0.4, rotate: 6 },
  { top: 5, left: 38, depth: 0.7, rotate: 4 },
  { top: 44, left: 60, depth: 0.3, rotate: -5 },
  { top: 10, left: 73, depth: 0.8, rotate: 9 },
  { top: 48, left: 42, depth: 0.55, rotate: -3 },
] as const;
