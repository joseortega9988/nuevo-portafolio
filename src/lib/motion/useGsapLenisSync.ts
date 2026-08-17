'use client';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

import { useLenis } from './LenisProvider';

/**
 * Keeps ScrollTrigger in step with Lenis.
 *
 * Lenis takes over scrolling and does not always emit a native scroll event
 * that ScrollTrigger would see, so without this bridge a ScrollTrigger fires
 * late, or not at all, exactly when smooth scrolling is enabled.
 *
 * Lives in lib/motion rather than inside an animation so ScrollTrigger is only
 * ever pulled into the chunk that actually needs a timeline.
 *
 * This used to add that gsap must not be imported from LenisProvider, because
 * that would put the whole library in the root bundle. That is no longer true
 * as written: P1-10 moved Lenis onto gsap.ticker, so gsap core is in the root
 * bundle deliberately, bought for one deterministic ticker. The point the note
 * was making still stands for the plugins — ScrollTrigger and Flip are the
 * expensive part and they stay here, on the one route that uses them.
 */
export function useGsapLenisSync(): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    lenis.on('scroll', update);
    /*
     * No ScrollTrigger.refresh() here any more.
     *
     * It was justified as "positions measured before Lenis started are stale by
     * one frame", but refresh() recalculates every trigger on the page and
     * forces a full layout to do it, and this effect re-runs whenever the Lenis
     * instance changes as well as on every consumer mount. The staleness it was
     * guarding against is covered without it: ScrollTrigger refreshes itself on
     * load and resize, and the one moment on this site where a layout genuinely
     * changes under the triggers — the Flip settle — already calls refresh()
     * deliberately in useThrowSequence's onComplete. That is the right site for
     * it, because that is where the document height actually moves.
     */

    return () => {
      lenis.off('scroll', update);
    };
  }, [lenis]);
}
