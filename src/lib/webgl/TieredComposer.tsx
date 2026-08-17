'use client';

import { useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import type { ReactNode } from 'react';

import { samplesForTier } from './quality';

/**
 * An EffectComposer that asks the GPU for what it can actually give, rather
 * than for the library's default of 8.
 *
 * It exists as a component rather than a helper because
 * `gl.capabilities.maxSamples` is only knowable once a context exists, so the
 * lookup has to happen inside the canvas — a scene component's own body runs
 * outside it and cannot call useThree.
 *
 * Every pass each scene declared is still constructed and still runs, and on
 * every GPU the sample count is the one that was being delivered before.
 */
export function TieredComposer({ children }: { children: ReactNode }) {
  const maxSamples = useThree((state) => state.gl.capabilities.maxSamples);

  return (
    <EffectComposer multisampling={samplesForTier(maxSamples)}>
      {children}
    </EffectComposer>
  );
}
