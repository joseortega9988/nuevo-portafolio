/** Tunable timings for the boot loader. No colours here — those are tokens. */
export const BOOT_LOADER_CONFIG = {
  /** Delay between letters lighting up. Seven letters spell in ~0.76s. */
  letterIntervalMs: 109,
  /** How long the caret blinks after the word completes, before looping. */
  caretHoldMs: 900,
  /** Fade + scale-up on dismissal (§D A1). */
  exitDurationMs: 600,
  /**
   * Floor on how long the overlay stays up.
   *
   * Without it the loader is pointless: with warm fonts and a fast first
   * frame the exit gate opens in a few hundred milliseconds, so the word
   * never finishes spelling and the visitor sees a flash. Sized to just clear
   * one full spelling of the word (7 x letterIntervalMs) plus a beat, so the
   * loader is seen and read without ever feeling like a wait.
   */
  minVisibleMs: 3000,
  /**
   * Hard ceiling. Whatever the scene is doing, the loader leaves — a preloader
   * that can trap the visitor is worse than no preloader. Sits comfortably
   * above minVisibleMs so the floor is never the thing that trips it.
   */
  timeoutMs: 8000,
} as const;

export const LOADER_WORD = 'LOADING';
