'use client';

import { useEffect, useRef, useState } from 'react';

import { BOOT_LOADER_CONFIG, LOADER_WORD } from '../config';

export type BootPhase = 'typing' | 'caret' | 'leaving' | 'gone';

interface BootSequence {
  /** How many letters are currently lit. */
  lit: number;
  phase: BootPhase;
}

/**
 * The loader's state machine, kept out of the component so the component is
 * only markup (§B, Single Responsibility).
 *
 * Two independent clocks run here: the cosmetic one that spells the word on
 * a loop, and the real one that decides when the overlay may leave — the
 * earliest of (scene ready AND fonts ready) or the hard timeout.
 */
export function useBootSequence(
  active: boolean,
  sceneReady: boolean,
  reducedMotion: boolean,
  onDismissed?: () => void,
): BootSequence {
  const [lit, setLit] = useState(reducedMotion ? LOADER_WORD.length : 0);
  // Always starts at 'typing'. Deriving the initial phase from `active` would
  // freeze it at 'gone', because `active` is still unknown on the first render
  // (the session flag has not been read yet) and a useState initialiser never
  // runs again. The caller renders nothing while inactive, so 'typing' here is
  // simply the phase the sequence will be in once it is switched on.
  const [phase, setPhase] = useState<BootPhase>('typing');
  const [fontsReady, setFontsReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const dismissedRef = useRef(false);
  const scheduledRef = useRef(false);
  /** When the overlay first went up, for the minimum-display floor. */
  const shownAtRef = useRef<number | null>(null);
  // Held in a ref so an inline callback from the parent cannot restart the
  // exit timer on every render.
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;

  // ── cosmetic loop ──
  useEffect(() => {
    if (!active || reducedMotion || phase === 'leaving' || phase === 'gone') return;

    if (phase === 'typing' && lit >= LOADER_WORD.length) {
      const id = window.setTimeout(() => setPhase('caret'), BOOT_LOADER_CONFIG.caretHoldMs);
      return () => window.clearTimeout(id);
    }
    if (phase === 'caret') {
      const id = window.setTimeout(() => {
        setLit(0);
        setPhase('typing');
      }, BOOT_LOADER_CONFIG.caretHoldMs);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(
      () => setLit((n) => n + 1),
      BOOT_LOADER_CONFIG.letterIntervalMs,
    );
    return () => window.clearTimeout(id);
  }, [active, reducedMotion, phase, lit]);

  // ── readiness gates ──
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    const id = window.setTimeout(() => setExpired(true), BOOT_LOADER_CONFIG.timeoutMs);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [active]);

  // ── exit ──
  useEffect(() => {
    if (!active || scheduledRef.current) return;
    if (shownAtRef.current === null) shownAtRef.current = performance.now();
    if (!((sceneReady && fontsReady) || expired)) return;

    scheduledRef.current = true;

    // The gate is open, but the overlay still owes the visitor its minimum
    // display time — otherwise the word never finishes spelling.
    const elapsed = performance.now() - shownAtRef.current;
    const hold = Math.max(0, BOOT_LOADER_CONFIG.minVisibleMs - elapsed);

    const startExit = window.setTimeout(() => {
      dismissedRef.current = true;
      setPhase('leaving');
    }, hold);

    const finish = window.setTimeout(() => {
      setPhase('gone');
      onDismissedRef.current?.();
    }, hold + BOOT_LOADER_CONFIG.exitDurationMs);

    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(finish);
    };
  }, [active, sceneReady, fontsReady, expired]);

  return { lit, phase };
}
