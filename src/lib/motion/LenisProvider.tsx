'use client';

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
  const rafRef = useRef<number | null>(null);
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
    });

    const raf = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    setLenis(instance);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
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
