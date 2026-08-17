'use client';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { useNarrowViewport } from '@/lib/webgl/useNarrowViewport';
import { useQuality } from '@/lib/webgl/quality';

import { Tunnel } from './components/Tunnel';
import { TUNNEL_CONFIG } from './config';
import type { WormholeTunnelProps } from './types';
import styles from './WormholeTunnel.module.css';

/**
 * A11 — the footer backdrop.
 *
 * Rings of glowing wireframe boxes spiral toward a shrinking vanishing point
 * while the nearest rows shear away and fall, so the tunnel reads as endless
 * forward travel rather than a looping loop of geometry.
 *
 * Background only — no controls, pointer-events: none (the host div carries
 * that). Static fallback: a magenta-to-cyan ringed glow standing in for the
 * vanishing point.
 */
export function WormholeTunnel({
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: WormholeTunnelProps) {
  const quality = useQuality(tierOverride);
  const narrow = useNarrowViewport();
  const columns = TUNNEL_CONFIG.columns[quality.tier];

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        // The one scene that asks for it, because it is the one scene drawing
        // real geometry — 2,304 instanced boxes with hard silhouettes — with
        // no composer in front of it. Everywhere else the backbuffer only
        // receives a fullscreen triangle and MSAA on it is pure allocation.
        // Kept at `tier === 'high'`, which is exactly what CanvasStage applied
        // globally before, so nothing about this scene's look changes.
        antialias={quality.tier === 'high'}
        camera={{
          fov: TUNNEL_CONFIG.camera.fov,
          position: [
            ...(narrow
              ? TUNNEL_CONFIG.camera.positionNarrow
              : TUNNEL_CONFIG.camera.position),
          ],
          near: TUNNEL_CONFIG.camera.near,
          far: TUNNEL_CONFIG.camera.far,
        }}
        fallback={<div className={styles.fallback} />}
      >
        {/*
          No bloom pass, deliberately — this scene is the one place on the site
          where it cost more than it bought.

          It used to be gated on `quality.tier !== 'low'`, and low is every
          phone-width viewport, so phones rendered the raw token colours while
          desktops got a bloom that lifted the dark violet into a noticeably
          brighter purple: the same tokens reading as two different palettes
          depending on the device. `quality.bloom` (1 / 0.8 / 0.6) then split
          the desktop tiers again.

          These colours are chosen dark on purpose and are judged against the
          footer copy sitting on top of them, so the honest fix is to drop the
          pass rather than tune it per tier. Every device now renders the
          tokens as authored. The other scenes keep their bloom — their palettes
          are built around having it.
        */}
        <Tunnel columns={columns} rows={TUNNEL_CONFIG.rows} onReady={onReady} />
      </CanvasStage>
    </div>
  );
}
