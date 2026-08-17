'use client';

import { Bloom } from '@react-three/postprocessing';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { TieredComposer } from '@/lib/webgl/TieredComposer';
import { useNarrowViewport } from '@/lib/webgl/useNarrowViewport';
import { useQuality } from '@/lib/webgl/quality';

import { Shell } from './components/Shell';
import { TORUS_CONFIG } from './config';
import type { VoronoiTorusProps } from './types';
import styles from './VoronoiTorus.module.css';

/**
 * A7 — the Projects page hero.
 *
 * A torus shattered into Voronoi fragments that hinge away from the shell
 * under the cursor, revealing a glowing wireframe interior. It stays pinned to
 * the hero and dissolves as the visitor scrolls past.
 *
 * The host is responsible for unmounting this once the dissolve completes, so
 * the WebGL context is released before the grid below mounts (restriction 13).
 *
 * Static fallback: a still ring rendered in CSS, carrying the cyan interior
 * and magenta rim so the hero paragraph beside it keeps its setting.
 */
export function VoronoiTorus({
  progress,
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: VoronoiTorusProps) {
  const quality = useQuality(tierOverride);
  const narrow = useNarrowViewport();
  const gridSize = TORUS_CONFIG.seedGrid[quality.tier];

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        camera={{
          fov: TORUS_CONFIG.camera.fov,
          position: [
            ...(narrow
              ? TORUS_CONFIG.camera.positionNarrow
              : TORUS_CONFIG.camera.position),
          ],
        }}
        fallback={<div className={styles.fallback} />}
      >
        <Shell gridSize={gridSize} progress={progress} onReady={onReady} />

        {/* Not <EffectComposer enabled={…}> — `enabled` is only read inside the
            library's useFrame, so the composer, its multisampled HalfFloat
            render target and the bloom mipmap chain are all still constructed
            on the tier that never renders them. Low is every phone-width
            viewport, i.e. exactly the devices least able to spare the VRAM. */}
        {quality.tier !== 'low' && (
          <TieredComposer tier={quality.tier}>
            <Bloom
              intensity={TORUS_CONFIG.bloom.intensity * quality.bloom}
              luminanceThreshold={TORUS_CONFIG.bloom.threshold}
              luminanceSmoothing={0.55}
              mipmapBlur
            />
          </TieredComposer>
        )}
      </CanvasStage>
    </div>
  );
}
