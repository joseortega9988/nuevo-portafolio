'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';

import { SEA_CONFIG } from '../config';

/**
 * Internal render scale, moving in both directions.
 *
 * Resolution is still what gets sacrificed, never features — SEA_CONFIG.octaves
 * is untouched and the floor is still SEA_CONFIG.adaptive.minScale. What
 * changes is that the scale can now come back up.
 *
 * DECISIONS.md records the old one-way ratchet, and its reasoning was sound
 * for a hand-rolled sampler: "recovering it would oscillate — the moment the
 * scene got cheaper the frame rate would rise and push it straight back up."
 * The missing piece was hysteresis, not the direction. PerformanceMonitor
 * averages against a refresh-rate-derived band rather than one fixed number,
 * and counts flip-flops: after `flipflops` reversals it stops adjusting
 * entirely and calls onFallback, so the oscillation the old comment predicted
 * is bounded by design instead of by refusing to climb.
 *
 * What the ratchet cost in practice: it only ever measured 45 frames below
 * 48fps once, and never re-measured. A single stutter during a route
 * transition pinned the sea at reduced resolution for the rest of the session,
 * and a phone that could afford full resolution after the boot loader's work
 * finished could never earn it back.
 *
 * The bounds follow the device's own refresh rate, because 48fps is a pass on
 * a 60Hz panel and a bad frame on a 120Hz one.
 */
export function AdaptiveResolution({ baseDpr }: { baseDpr: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const { minScale, scaleStep, targetFps } = SEA_CONFIG.adaptive;
  const scale = useRef(1);

  const apply = useCallback(
    (next: number) => {
      const clamped = Math.min(1, Math.max(minScale, next));
      if (clamped === scale.current) return;
      scale.current = clamped;
      setDpr(baseDpr * clamped);
    },
    [baseDpr, minScale, setDpr],
  );

  return (
    <PerformanceMonitor
      // On a high-refresh display the same absolute fps means something
      // different, so the lower bound scales with what the panel can do.
      bounds={(refresh) => (refresh > 90 ? [targetFps * 1.5, 90] : [targetFps, 58])}
      flipflops={3}
      onDecline={() => apply(scale.current - scaleStep)}
      onIncline={() => apply(scale.current + scaleStep)}
      // Settle at the floor rather than keep hunting: reaching this means the
      // device has flip-flopped `flipflops` times and no scale is stable.
      onFallback={() => apply(minScale)}
    />
  );
}
