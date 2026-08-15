'use client';

import { useEffect, useState } from 'react';

/**
 * True when the tab is hidden.
 *
 * Combined with the section's own `useInViewport`, this is what lets a scene
 * stop integrating an attractor while nobody is looking — the difference
 * between a portfolio that idles at 0% CPU in a background tab and one that
 * drains a laptop battery.
 */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return hidden;
}

/**
 * Resolves the single `paused` boolean a scene should obey.
 *
 * `visible` is the section's viewport state; the host may also force a pause
 * (for example while the boot loader is still covering the page).
 */
export function useRafPause(visible: boolean, forcePause = false): boolean {
  const hidden = useDocumentHidden();
  return forcePause || hidden || !visible;
}
