'use client';

import { Bloom } from '@react-three/postprocessing';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { TieredComposer } from '@/lib/webgl/TieredComposer';
import { useQuality } from '@/lib/webgl/quality';
import type { AnimationLayerProps } from '@/lib/webgl/types';

import { Cages } from './components/Cages';
import { CoreSphere } from './components/CoreSphere';
import { Fibers } from './components/Fibers';
import { Starfield } from './components/Starfield';
import { HOPF_CONFIG } from './config';
import styles from './HopfFibration.module.css';

/**
 * A6 — the Technologies section background.
 *
 * The Hopf fibration: every point of S² lifts to a circle in S³, and any two
 * of those circles are linked exactly once. Projected stereographically into
 * R³ they become the nested tori of arcs sweeping past the frame edges.
 *
 * Background only — no controls, no HUD, no readouts, pointer-events: none.
 * density, pulse and bloom are fixed at the requested values.
 *
 * Static fallback: a deep-space gradient carrying the same three arc colours,
 * so the honeycomb in front of it keeps its contrast.
 */
export function HopfFibration({
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: AnimationLayerProps) {
  const quality = useQuality(tierOverride);
  const particles = Math.round(HOPF_CONFIG.particles * quality.density);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        camera={{
          fov: HOPF_CONFIG.camera.fov,
          position: [...HOPF_CONFIG.camera.position],
          near: HOPF_CONFIG.camera.near,
          far: HOPF_CONFIG.camera.far,
        }}
        fallback={<div className={styles.fallback} />}
      >
        <Fibers onReady={onReady} />
        <CoreSphere />
        <Cages />
        <Starfield count={particles} />

        {/* Conditional, not `enabled` — see the note in VoronoiTorus: the prop
            only silences the pass, it does not stop the composer and its
            render targets being allocated on the tier that never uses them. */}
        {quality.tier !== 'low' && (
          <TieredComposer tier={quality.tier}>
            <Bloom
              intensity={HOPF_CONFIG.bloom * quality.bloom}
              luminanceThreshold={0.12}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
          </TieredComposer>
        )}
      </CanvasStage>
    </div>
  );
}
