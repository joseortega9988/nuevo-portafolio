'use client';

import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { useMemo } from 'react';
import { Vector2 } from 'three';

import { useQuality } from '@/lib/webgl/quality';
import { CanvasStage } from '@/lib/webgl/CanvasStage';

import styles from './AizawaAttractor.module.css';
import { BaseDisk } from './components/BaseDisk';
import { Filaments } from './components/Filaments';
import { ParticleField } from './components/ParticleField';
import { Rig } from './components/Rig';
import { INTEGRATION, SCENE } from './config';
import type { AizawaAttractorProps } from './types';

/**
 * A2 — the Home hero background.
 *
 * A field of Aizawa trajectories integrated with RK4, drawn as additively
 * blended glowing filaments with a pulse travelling along each curve, standing
 * on a luminous base disk, inside a drifting particle field.
 *
 * Static fallback (reduced motion, no WebGL, or a lost context): the gradient
 * wash below, which carries the same palette so the hero copy stays legible.
 */
export function AizawaAttractor({
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: AizawaAttractorProps) {
  const quality = useQuality(tierOverride);

  const filamentCount = Math.max(
    40,
    Math.round(INTEGRATION.filaments * quality.density),
  );
  const particleCount = Math.round(SCENE.particles * quality.density);

  // A Vector2 offset that would otherwise be reallocated on every render and
  // force the effect chain to rebuild.
  const aberration = useMemo(
    () => new Vector2(SCENE.chromaticAberration, SCENE.chromaticAberration),
    [],
  );

  const fallback = <div className={styles.fallback} />;

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        camera={{
          fov: SCENE.camera.fov,
          position: [...SCENE.camera.position],
          near: SCENE.camera.near,
          far: SCENE.camera.far,
        }}
        fallback={fallback}
      >
        <Rig enabled={!paused} />
        <Filaments filamentCount={filamentCount} onReady={onReady} />
        {/* The disk sits just under the lowest point of the trajectories so the
            funnel appears to rise out of it rather than to intersect it. */}
        <BaseDisk y={-0.02} />
        <ParticleField count={particleCount} />

        <EffectComposer enabled={quality.tier !== 'low'}>
          <Bloom
            intensity={SCENE.bloom.intensity * quality.bloom}
            luminanceThreshold={SCENE.bloom.threshold}
            luminanceSmoothing={SCENE.bloom.radius}
            mipmapBlur
          />
          {/* Subtle only: enough to fringe the brightest filaments the way a
              real lens would, not enough to read as a glitch effect. Only
              `offset` is passed — the library's prop type resolves the rest
              away, and the defaults are what we want anyway. */}
          <ChromaticAberration offset={aberration} />
        </EffectComposer>
      </CanvasStage>
    </div>
  );
}
