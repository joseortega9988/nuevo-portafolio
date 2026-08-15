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
   * The loader runs on every page load, not once per session.
   *
   * It was originally gated behind a sessionStorage flag, which meant a
   * refresh in the same tab skipped it — so the heaviest scenes rebuilt with
   * nothing covering them. Showing it every time gives the WebGL work a
   * consistent window to start in, and it is the first impression of the site.
   *
   * Null on the first render so the server markup and the first client paint
   * agree; the effect below switches it on immediately after mount.
   */
  const [active, setActive] = useState<boolean | null>(null);
  const onDismissedRef = useRef(onDismissed);
  onDismissedRef.current = onDismissed;

  useEffect(() => {
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
