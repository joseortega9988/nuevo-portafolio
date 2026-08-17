'use client';

import { Bloom } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { TieredComposer } from '@/lib/webgl/TieredComposer';
import { useQuality } from '@/lib/webgl/quality';
import { useNarrowViewport } from '@/lib/webgl/useNarrowViewport';

import styles from './AccretionDisk.module.css';
import { Disk } from './components/Disk';
import { EventHorizon } from './components/EventHorizon';
import { DISK_CONFIG } from './config';
import type { AccretionDiskProps } from './types';

/** Eases the whole scene up once the host says the layout has settled. */
function Fade({ active, fade }: { active: boolean; fade: { current: number } }) {
  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    const step = delta / DISK_CONFIG.fadeInSeconds;
    fade.current =
      fade.current < target
        ? Math.min(target, fade.current + step)
        : Math.max(target, fade.current - step);
  });
  return null;
}

/**
 * A9 — the accretion disk behind the Projects grid.
 *
 * Thousands of orbiting streaks around a dark core, seen at a shallow angle so
 * the disk reads as a wide ellipse. Speed follows a Keplerian falloff, so the
 * inside shears past the outside and the whole thing winds up rather than
 * turning as a rigid plate; each streak's length is proportional to its own
 * speed, which is what gives the motion blur. The approaching side is
 * dramatically brighter — the beaming that makes it read as a black hole
 * rather than a ring of confetti.
 *
 * Framed close, so it fills the frame and runs off every edge.
 *
 * Static fallback: a still elliptical wash carrying the same temperature ramp.
 */
export function AccretionDisk({
  active = true,
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: AccretionDiskProps) {
  const quality = useQuality(tierOverride);
  const narrow = useNarrowViewport();
  const count = DISK_CONFIG.particles[quality.tier];
  const fade = useRef(0);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        camera={{
          fov: DISK_CONFIG.camera.fov,
          position: [
            ...(narrow
              ? DISK_CONFIG.camera.positionNarrow
              : DISK_CONFIG.camera.position),
          ],
        }}
        fallback={<div className={styles.fallback} />}
      >
        <Fade active={active} fade={fade} />

        {/* The disk is built in the XZ plane; standing it up by a quarter turn
            presents it face-on to the camera. Rotating the geometry rather than
            flying the camera overhead keeps the default camera orientation, so
            no lookAt is needed anywhere. */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Disk count={count} fade={fade} onReady={onReady} />
        </group>

        {/* Outside that group: the horizon is a billboard and must keep facing
            the camera rather than turning with the disk. */}
        <EventHorizon fade={fade} />

        {/* Always on. This was gated on `quality.tier !== 'low'`, and low is
            every phone-width viewport (see detectTier) — so the disk lost its
            glow entirely on mobile rather than being dimmed, a hard on/off
            cliff at 768px instead of the taper quality.bloom already
            provides. Same reasoning as the Home attractor's composer. */}
        <TieredComposer tier={quality.tier}>
          <Bloom
            intensity={DISK_CONFIG.bloom.intensity * quality.bloom}
            luminanceThreshold={DISK_CONFIG.bloom.threshold}
            luminanceSmoothing={0.6}
            mipmapBlur
          />
        </TieredComposer>
      </CanvasStage>
    </div>
  );
}
