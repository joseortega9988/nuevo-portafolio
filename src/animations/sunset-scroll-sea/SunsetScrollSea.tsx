'use client';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { useQuality } from '@/lib/webgl/quality';

import { SEA_CONFIG } from './config';
import { SeaPlane } from './components/SeaPlane';
import styles from './SunsetScrollSea.module.css';
import type { SunsetScrollSeaProps } from './types';

/**
 * A4 — the background of the Experience & Selected Work section.
 *
 * A procedural ocean under a sky that travels from sunrise to full night as
 * the visitor scrolls the section. It is scroll-driven, not time-driven: the
 * only thing on a clock is the wave motion itself.
 *
 * Static fallback: the same four-stop sky frozen at dusk, dark enough that the
 * carousel above it keeps AA contrast.
 */
export function SunsetScrollSea({
  progress,
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: SunsetScrollSeaProps) {
  const quality = useQuality(tierOverride);
  const octaves = SEA_CONFIG.octaves[quality.tier];
  const baseDpr = quality.dpr[1];

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        fallback={<div className={styles.fallback} />}
      >
        <SeaPlane
          progress={progress}
          octaves={octaves}
          baseDpr={baseDpr}
          onReady={onReady}
        />
      </CanvasStage>
    </div>
  );
}
