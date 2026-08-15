'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { DoubleSide, ShaderMaterial } from 'three';

import { buildPalette } from '@/lib/palette';

import { DISK_CONFIG } from '../config';
import { horizonFragmentShader, horizonVertexShader } from '../shaders/disk.glsl';

/**
 * The dark core and its photon ring, drawn as a camera-facing disc.
 *
 * A billboard rather than a sphere: the horizon only ever needs to read as a
 * flat silhouette, and a disc can occlude the far side of the accretion disk
 * with one opaque fragment test instead of a lit mesh.
 */
export function EventHorizon({ fade }: { fade: { current: number } }) {
  const material = useMemo(() => {
    const palette = buildPalette();
    return new ShaderMaterial({
      vertexShader: horizonVertexShader,
      fragmentShader: horizonFragmentShader,
      transparent: true,
      side: DoubleSide,
      // Writes depth so the disk behind it is genuinely hidden.
      depthWrite: true,
      uniforms: {
        uCore: { value: palette.core },
        uHorizon: { value: DISK_CONFIG.horizonRadius / DISK_CONFIG.photonRingRadius },
        uRing: { value: 1 },
        uOpacity: { value: 0 },
      },
    });
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const uOpacity = material.uniforms.uOpacity;
    if (uOpacity) uOpacity.value = fade.current;
  });

  const size = DISK_CONFIG.photonRingRadius * 2;

  return (
    <mesh material={material} renderOrder={1}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}
