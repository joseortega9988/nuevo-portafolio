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
 * Lives in lib/motion rather than inside an animation so gsap is only ever
 * pulled into the chunk that actually needs a timeline — importing it from the
 * LenisProvider would put the whole library in the root bundle.
 */
export function useGsapLenisSync(): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    lenis.on('scroll', update);
    // Positions measured before Lenis started are stale by one frame.
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', update);
    };
  }, [lenis]);
}
