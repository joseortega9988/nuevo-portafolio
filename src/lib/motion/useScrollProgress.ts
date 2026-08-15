'use client';

import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';

import { useLenis } from './LenisProvider';

export type ProgressMode =
  /** 0 when the element's top reaches the viewport bottom, 1 when its bottom
   *  clears the viewport top. Full travel — good for ambient parallax. */
  | 'through'
  /** 0 when the element's top meets the viewport top, 1 when its bottom meets
   *  the viewport bottom. This is the one that makes "the sea reaches full
   *  darkness exactly at the section's end" literally true (§D A4). */
  | 'section';

export interface ScrollProgressOptions {
  mode?: ProgressMode;
  /** Called on every change with the clamped 0→1 value. */
  onChange?: (progress: number) => void;
}

/**
 * Normalised scroll progress for an element, delivered as a ref rather than
 * state.
 *
 * WHY a ref: this value changes every frame. Putting it in state would re-render
 * the section — and everything under it — 60 times a second. Shaders and GSAP
 * read `.current` inside their own frame loop, which costs nothing.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  { mode = 'through', onChange }: ScrollProgressOptions = {},
): MutableRefObject<number> {
  const progress = useRef(0);
  const lenis = useLenis();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;

      let raw: number;
      if (mode === 'section') {
        // Distance already scrolled into the section, over the distance it can
        // scroll before its bottom edge reaches the viewport bottom.
        const travel = rect.height - viewport;
        raw = travel <= 0 ? (rect.top <= 0 ? 1 : 0) : -rect.top / travel;
      } else {
        raw = (viewport - rect.top) / (viewport + rect.height);
      }

      const next = Math.min(1, Math.max(0, raw));
      if (next === progress.current) return;
      progress.current = next;
      onChangeRef.current?.(next);
    };

    // Coalesce: several scroll sources can fire within one frame.
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();

    // Lenis drives scrolling when it is active; the native listener covers the
    // reduced-motion path where Lenis is deliberately not instantiated.
    lenis?.on('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      lenis?.off('scroll', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [target, mode, lenis]);

  return progress;
}
