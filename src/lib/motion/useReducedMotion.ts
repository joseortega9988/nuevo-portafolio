'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function readPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * The single source of truth for "should this move?".
 *
 * All eight animations consult this and fall back to their documented static
 * state (§G). Reading it here rather than in each module means one place to
 * change if the policy ever softens.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readPreference);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    // Sync once on mount: the lazy initialiser above runs during SSR hydration
    // where matchMedia is unavailable, so the first client value may be stale.
    setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
