'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry } from 'three';

import { buildPalette } from '@/lib/palette';

import { SCENE } from '../config';
import { filamentFragmentShader, filamentVertexShader } from '../shaders/filament.glsl';
import { buildFilamentField } from '../utils/integrate';

/**
 * The trajectories themselves: one indexed LineSegments for the whole field,
 * so hundreds of filaments cost a single draw call.
 */
export function Filaments({
  filamentCount,
  onReady,
}: {
  filamentCount: number;
  onReady?: () => void;
}) {
  const readyRef = useRef(false);

  const { geometry, uniforms, time } = useMemo(() => {
    const field = buildFilamentField(filamentCount);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(field.positions, 3));
    geo.setAttribute('aProgress', new BufferAttribute(field.progress, 1));
    geo.setIndex(new BufferAttribute(field.indices, 1));

    // Held by reference rather than looked up as uniforms['uTime'] each frame:
    // indexing would be possibly-undefined under the strict compiler settings,
    // and this avoids the lookup entirely.
    const time = { value: 0 };

    const palette = buildPalette();
    return {
      geometry: geo,
      time,
      uniforms: {
        uSpring: { value: palette.spring },
        uAmber: { value: palette.amber },
        uViolet: { value: palette.violet },
        uMagenta: { value: palette.magenta },
        uCore: { value: palette.core },
        uTime: time,
        uFlowRepeat: { value: SCENE.flow.repeat },
        uFlowSpeed: { value: SCENE.flow.speed },
        uIntensity: { value: 1 },
        uMinY: { value: field.minY },
        uRangeY: { value: Math.max(field.maxY - field.minY, 0.001) },
      },
    };
  }, [filamentCount]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    time.value += delta;
    // The hero reports ready on its first rendered frame, which is what
    // releases the boot loader.
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={filamentVertexShader}
        fragmentShader={filamentFragmentShader}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
