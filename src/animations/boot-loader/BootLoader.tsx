'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useReducedMotion } from '@/lib/motion/useReducedMotion';

import styles from './BootLoader.module.css';
import { LOADER_WORD } from './config';
import { useBootSequence } from './hooks/useBootSequence';
import type { BootLoaderProps } from './types';
import { SEGMENT_NAMES, segmentsFor } from './utils/segments';

/**
 * Set for the lifetime of one page load.
 *
 * Module scope, not storage: it survives React remounts — so returning to Home
 * from Projects does not replay the loader — but resets on a real reload, so a
 * refresh still shows it. That is the behaviour asked for, and it needs no
 * sessionStorage, which the old flag used and which made refreshes skip it.
 */
let hasRunThisPageLoad = false;

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
  /**
   * Once per page load: shown on a fresh visit or a refresh, skipped when the
   * visitor merely navigates back to Home from another route.
   *
   * Null on the first render so the server markup and the first client paint
   * agree; the effect below resolves it immediately after mount.
   */
  const [active, setActive] = useState<boolean | null>(null);
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;

  useEffect(() => {
    if (hasRunThisPageLoad) {
      setActive(false);
      onDismissedRef.current?.();
      return;
    }
    hasRunThisPageLoad = true;
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
