'use client';

import gsap from 'gsap';
import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { usePathname } from '@/i18n/navigation';

import { useReducedMotion } from './useReducedMotion';

/**
 * Smooth scroll, owned in exactly one place.
 *
 * Nothing else in the app imports lenis (ESLint enforces this for sections and
 * components). Consumers that need the instance — the scroll-driven animations
 * — take it from `useLenis()`, so swapping the scroll engine is a one-file job.
 */

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis(): Lenis | null {
  return useContext(LenisContext).lenis;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // With reduce-motion on, smooth scrolling is itself the offending motion:
    // let the browser scroll natively instead of interpolating.
    if (reducedMotion) {
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      // Exponential ease-out: fast response to the wheel, long calm settle.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have momentum scrolling; doubling it feels laggy.
      syncTouch: false,
      // gsap.ticker drives it instead — see below.
      autoRaf: false,
    });

    /**
     * One ticker for the whole page, in a defined order.
     *
     * Lenis used to run its own hand-rolled rAF here while GSAP ran a second
     * one on the routes that use a timeline, and nothing guaranteed which went
     * first within a frame. Driving Lenis from gsap.ticker makes the order
     * explicit: Lenis writes the scroll position, then everything subscribed to
     * its `scroll` event (ScrollTrigger.update, useScrollProgress) reads a
     * value written this frame rather than last one.
     *
     * lagSmoothing(0) because GSAP otherwise clamps a long frame's delta and
     * would hand Lenis a time that disagrees with the clock it interpolates
     * against — the scroll would stall after any main-thread stall.
     *
     * gsap.ticker's time is in seconds; Lenis.raf expects milliseconds.
     */
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  /**
   * Return to the top on navigation.
   *
   * Next resets the window's scroll when the route changes, but Lenis keeps
   * its own position and writes it back on the next frame — so the new page
   * would open part-way down, wherever the previous one was left. Lenis has to
   * be told separately, and immediately, so nothing animates past the content.
   *
   * Guarded on an actual path change: without that it would also fire on every
   * re-render, fighting the visitor mid-scroll.
   */
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      // Section heights differ per route; stale measurements would leave every
      // scroll-driven animation reading the wrong progress.
      lenis.resize();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
