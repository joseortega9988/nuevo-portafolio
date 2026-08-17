'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';

import { useInViewport } from '@/lib/motion/useInViewport';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './FooterTunnel.module.css';

/**
 * The footer's backdrop, isolated the same way the detail page's EntryBackdrop
 * is: Footer itself stays a server component and only this element hydrates.
 */
const WormholeTunnel = dynamic(
  () => import('@/animations/wormhole-tunnel').then((m) => m.WormholeTunnel),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

export function FooterTunnel() {
  const ref = useRef<HTMLDivElement>(null);
  /*
   * Tight on purpose, unlike the hero/detail scenes' generous margins.
   * Those need to be running before the visitor scrolls to them; the footer
   * is the last thing on the page, so there is no "arriving early" to plan
   * for. A wide margin here meant this scene — instanced geometry plus a
   * bloom pass — was rendering every frame for most of a page's scroll
   * range, competing with route transitions for the main thread and reading
   * as the whole site being slow to navigate.
   */
  const visible = useInViewport(ref, { rootMargin: '0px' });
  const paused = useRafPause(visible);

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden>
      <WormholeTunnel paused={paused} />
    </div>
  );
}
