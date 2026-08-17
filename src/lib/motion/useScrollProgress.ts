'use client';

import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';

import { useLenis } from './LenisProvider';

export type ProgressMode =
  /** 0 when the element's top reaches the viewport bottom, 1 when its bottom
   *  clears the viewport top. Full travel — good for ambient parallax. */
  | 'through'
  /** 0 when the element's top meets the viewport top, 1 when its bottom meets
   *  the viewport bottom. Only counts the pinned stretch. */
  | 'section'
  /**
   * 0 the instant the element's top edge enters the viewport, 1 when its
   * bottom edge reaches the viewport bottom.
   *
   * The difference from 'section' is where zero sits. 'section' ignores the
   * whole first viewport of scrolling — the section slides in with nothing
   * responding — whereas this starts the moment the section is first touched,
   * and still ends in exactly the same place.
   */
  | 'from-entry';

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
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;

      let raw: number;
      if (mode === 'from-entry') {
        // Zero as the top edge crosses the viewport bottom; one as the bottom
        // edge arrives at the viewport bottom.
        raw = rect.height <= 0 ? 0 : (viewport - rect.top) / rect.height;
      } else if (mode === 'section') {
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
      if (frame === null) {
        frame = requestAnimationFrame(() => {
          frame = null;
          measure();
        });
      }
    };

    measure();

    /*
     * Lenis is measured synchronously; the native listener is not.
     *
     * Lenis emits `scroll` from inside the ticker, immediately after writing
     * the scroll position, so reading the rect there is valid and lands in the
     * same frame. It used to go through `schedule`, which deferred the read to
     * the *next* rAF — so the sea's uPhase, the torus's uDissolve and the
     * carousel's active index were all a frame behind the page, which is what
     * read as the background lagging the content.
     *
     * The native path keeps the rAF coalescing: it covers the reduced-motion
     * case where Lenis is deliberately not instantiated, and resize, where
     * several events can arrive in one frame and none of them is worth a
     * synchronous layout read each.
     */
    lenis?.on('scroll', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      lenis?.off('scroll', measure);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [target, mode, lenis]);

  return progress;
}
