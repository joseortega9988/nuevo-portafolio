'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
} from 'three';

import { buildPalette } from '@/lib/palette';
import { useWorkerBuild } from '@/lib/webgl/useWorkerBuild';

import { DISK_CONFIG } from '../config';
import { diskFragmentShader, diskVertexShader } from '../shaders/disk.glsl';
import { buildDisk } from '../utils/buildDisk';

export function Disk({
  count,
  fade,
  onReady,
}: {
  count: number;
  /** 0→1 reveal, driven by the host once the cards have settled. */
  fade: { current: number };
  onReady?: () => void;
}) {
  const readyRef = useRef(false);

  /* 34,000 streaks at the high tier, previously laid out inside this useMemo
   * during render — on the route that also mounts the hero torus. Inline
   * fallback as elsewhere, so onReady is always reached. */
  const field = useWorkerBuild(
    () => new Worker(new URL('../utils/buildDisk.worker.ts', import.meta.url)),
    count,
    buildDisk,
  );

  const built = useMemo(() => {
    if (!field) return null;

    const geo = new BufferGeometry();
    // The shader derives position from the orbital parameters, so the only
    // "position" attribute three needs is a placeholder it can count.
    geo.setAttribute('position', new BufferAttribute(new Float32Array(count * 6), 3));
    geo.setAttribute('aRadius', new BufferAttribute(field.radius, 1));
    geo.setAttribute('aAngle', new BufferAttribute(field.angle, 1));
    geo.setAttribute('aHeight', new BufferAttribute(field.height, 1));
    geo.setAttribute('aTail', new BufferAttribute(field.tail, 1));
    geo.setAttribute('aSeed', new BufferAttribute(field.seed, 1));

    const palette = buildPalette();
    const mat = new ShaderMaterial({
      vertexShader: diskVertexShader,
      fragmentShader: diskFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uCore: { value: palette.core },
        uAmber: { value: palette.amber },
        uEmber: { value: palette.ember },
        uMagenta: { value: palette.magenta },
        uViolet: { value: palette.violet },
        uIndigo: { value: palette.indigo },
        uCyan: { value: palette.cyan },
        uSpring: { value: palette.spring },
        uTime: { value: 0 },
        uAngularSpeed: { value: DISK_CONFIG.angularSpeed },
        uKepler: { value: DISK_CONFIG.keplerExponent },
        uTrailSeconds: { value: DISK_CONFIG.trailSeconds },
        uLensing: { value: DISK_CONFIG.lensing },
        uInnerRadius: { value: DISK_CONFIG.innerRadius },
        uInner: { value: DISK_CONFIG.innerRadius },
        uOuter: { value: DISK_CONFIG.outerRadius },
        uBeamStrength: { value: DISK_CONFIG.beamStrength },
        uBeamAngle: { value: DISK_CONFIG.beamAngle },
        uOpacity: { value: 0 },
      },
    });

    return { geometry: geo, material: mat };
  }, [field, count]);

  useEffect(() => {
    if (!built) return;
    return () => {
      built.geometry.dispose();
      built.material.dispose();
    };
  }, [built]);

  useFrame((_, delta) => {
    if (!built) return;
    const { uTime, uOpacity } = built.material.uniforms;
    if (uTime) uTime.value = (uTime.value as number) + delta;
    if (uOpacity) uOpacity.value = fade.current;

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  if (!built) return null;

  return (
    <lineSegments
      geometry={built.geometry}
      material={built.material}
      frustumCulled={false}
    />
  );
}
