'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useReducedMotion } from '@/lib/motion/useReducedMotion';

import styles from './BootLoader.module.css';
import { BOOT_LOADER_CONFIG, LOADER_WORD } from './config';
import { useBootSequence } from './hooks/useBootSequence';
import type { BootLoaderProps } from './types';
import { SEGMENT_NAMES, segmentsFor } from './utils/segments';

/**
 * A1 — the full-screen preloader.
 *
 * No numbers: the display spells LOADING one letter at a time on a 14-segment
 * matrix, then blinks a caret and loops. Pure CSS and a small state machine —
 * the whole point is that the first thing painted costs no WebGL and no
 * animation library (restriction 14).
 *
 * Static fallback under prefers-reduced-motion: the full word, lit, no loop.
 */
export function BootLoader({
  sceneReady = false,
  onDismissed,
  className,
}: BootLoaderProps) {
  const reducedMotion = useReducedMotion();
  const t = useTranslations('loader');
  // Null until the session flag has been read, so the server-rendered markup
  // and the first client paint agree.
  const [active, setActive] = useState<boolean | null>(null);
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;

  const initialisedRef = useRef(false);

  // Runs exactly once. The effect writes the very flag it reads, so a second
  // pass would see its own flag and dismiss the loader instantly — which is
  // precisely what StrictMode's double-invoked effects do in development, and
  // what an unstable `onDismissed` in the dependency list would do in
  // production. The ref survives StrictMode's simulated remount; the flag in
  // sessionStorage does not need to.
  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;

    if (sessionStorage.getItem(BOOT_LOADER_CONFIG.sessionKey)) {
      setActive(false);
      onDismissedRef.current?.();
      return;
    }
    sessionStorage.setItem(BOOT_LOADER_CONFIG.sessionKey, '1');
    setActive(true);
  }, []);

  const { lit, phase } = useBootSequence(
    active === true,
    sceneReady,
    reducedMotion,
    onDismissed,
  );

  if (active !== true || phase === 'gone') return null;

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={t('label')}
    >
      <div className={styles.display} aria-hidden>
        {LOADER_WORD.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            className={styles.char}
            // Reduced motion lights every letter at once; otherwise a letter is
            // dark until the sequence reaches it.
            data-segments={
              reducedMotion || index < lit ? segmentsFor(character) : ''
            }
            data-fresh={!reducedMotion && index === lit - 1 ? '' : undefined}
          >
            {/* All fourteen segments are always in the DOM. Unlit ones stay
                faintly visible, the way a real panel shows its dark segments;
                the data-segments list above decides which ones illuminate. */}
            {SEGMENT_NAMES.map((segment) => (
              <i key={segment} className={`${styles.seg} ${styles[segment]}`} />
            ))}
          </span>
        ))}
        {!reducedMotion && <span className={styles.caret} data-blink={phase === 'caret' ? '' : undefined} />}
      </div>
      <p className={styles.srOnly}>{t('word')}</p>
    </div>
  );
}
