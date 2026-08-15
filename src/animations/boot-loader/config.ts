/** Tunable timings for the boot loader. No colours here — those are tokens. */
export const BOOT_LOADER_CONFIG = {
  /** Delay between letters lighting up. */
  letterIntervalMs: 170,
  /** How long the caret blinks after the word completes, before looping. */
  caretHoldMs: 900,
  /** Fade + scale-up on dismissal (§D A1). */
  exitDurationMs: 600,
  /**
   * Hard ceiling. Whatever the hero scene is doing, the loader leaves at six
   * seconds — a preloader that can trap the visitor is worse than no preloader.
   */
  timeoutMs: 6000,
  /** One appearance per browsing session. sessionStorage only — never local. */
  sessionKey: 'jo-boot-loader-shown',
} as const;

export const LOADER_WORD = 'LOADING';
