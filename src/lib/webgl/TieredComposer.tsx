'use client';

import { useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import type { ReactNode } from 'react';

import { samplesForTier, type QualityTier } from './quality';

/**
 * An EffectComposer whose render target is sized to the device, not to the
 * library's default.
 *
 * It exists as a component rather than a helper because
 * `gl.capabilities.maxSamples` is only knowable once a context exists, so the
 * lookup has to happen inside the canvas — a scene component's own body runs
 * outside it and cannot call useThree.
 *
 * Every pass each scene declared is still constructed and still runs; the only
 * thing that changes is how many samples its colour target carries.
 */
export function TieredComposer({
  tier,
  children,
}: {
  tier: QualityTier;
  children: ReactNode;
}) {
  const maxSamples = useThree((state) => state.gl.capabilities.maxSamples);

  return (
    <EffectComposer multisampling={samplesForTier(tier, maxSamples)}>
      {children}
    </EffectComposer>
  );
}
