'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface InViewportOptions {
  /** Grows the detection box. "100% 0px" mounts a scene one viewport early. */
  rootMargin?: string;
  threshold?: number;
  /** Once true, stay true. For one-shot reveals that must not replay. */
  once?: boolean;
}

/**
 * IntersectionObserver as a boolean.
 *
 * This is what keeps the WebGL context budget under control (restriction 13):
 * a canvas is mounted only while its section is near the viewport, and the rAF
 * loop is paused the moment it leaves. Generous rootMargins are deliberate —
 * mounting exactly at the boundary would show a blank frame mid-scroll.
 */
export function useInViewport(
  target: RefObject<Element | null>,
  { rootMargin = '0px', threshold = 0, once = false }: InViewportOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Ancient browser: degrade to "always visible" rather than never showing.
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, rootMargin, threshold, once]);

  return inView;
}
