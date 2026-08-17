'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

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

/**
 * How long the tunnel may sit off-screen before its context is released.
 *
 * Long enough that scrolling up off the footer and straight back down — or a
 * bounce at the end of the page — never tears the scene down and rebuilds it.
 */
const RELEASE_AFTER_MS = 5000;

/** Mount margin, deliberately far wider than the pause margin below: the scene
 *  needs to exist before it is seen, or arriving at the footer would show the
 *  poster while the context and shaders came up. */
const APPROACH_MARGIN = '100% 0px 100% 0px';

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

  /*
   * The one scene on the site that unmounts rather than merely pausing.
   *
   * contextBudget.ts sets the opposite policy, and it is right for the scenes
   * it was written about: the attractor integrates 144k points and the torus
   * clips 2,500 Voronoi cells, so rebuilding those mid-scroll made sections
   * visibly assemble themselves. This scene is not in that class — it is one
   * BoxGeometry and 2,304 instances, and it builds in about 2ms — while the
   * cost of keeping it is unusually high: Footer is rendered from the locale
   * layout, so this held a WebGL context and its bloom composer on *every*
   * route, including the detail pages, where it sat behind a firework sky
   * already spending the budget.
   *
   * Two margins, because mounting and pausing want different answers. The wide
   * one brings the scene back a full viewport before it is seen, so the rebuild
   * is never visible; the tight one above still stops the frame loop the moment
   * it scrolls away.
   */
  const near = useInViewport(ref, { rootMargin: APPROACH_MARGIN });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (near) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), RELEASE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [near]);

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden>
      {mounted ? (
        <WormholeTunnel paused={paused} />
      ) : (
        // The same poster the dynamic import shows while loading, so mounting
        // and unmounting cannot flash a different background.
        <div className={styles.poster} />
      )}
    </div>
  );
}
