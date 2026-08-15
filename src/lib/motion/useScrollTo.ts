'use client';

import { useCallback } from 'react';

import { useLenis } from './LenisProvider';

/**
 * Programmatic scrolling that actually works while Lenis is running.
 *
 * `window.scrollTo` looks like it should be enough, but Lenis drives the page
 * from its own rAF loop: a native scroll is overwritten on the very next
 * frame, so the call silently does nothing. Anything that wants to move the
 * page — the carousel arrows and dots — has to ask Lenis instead.
 *
 * The native path is still the fallback, because under reduced motion Lenis is
 * deliberately never instantiated.
 */
export function useScrollTo(): (top: number) => void {
  const lenis = useLenis();

  return useCallback(
    (top: number) => {
      if (lenis) {
        lenis.scrollTo(top, { duration: 0.9 });
        return;
      }
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [lenis],
  );
}
