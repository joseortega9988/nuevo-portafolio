'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';

import { useInViewport } from '@/lib/motion/useInViewport';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './EntryBackdrop.module.css';

/**
 * The detail page's backdrop.
 *
 * A thin client island: EntryDetailSection itself is a server component and
 * ships almost no JavaScript, which is worth keeping. Isolating the canvas
 * here means the page stays server-rendered and only this element hydrates.
 */
const FireworkSky = dynamic(
  () => import('@/animations/firework-sky').then((m) => m.FireworkSky),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

export function EntryBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInViewport(ref, { rootMargin: '100% 0px 100% 0px' });
  const paused = useRafPause(visible);

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden>
      <FireworkSky paused={paused} />
    </div>
  );
}
