'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';

import { buildPalette } from '@/lib/palette';

import { SEA_CONFIG } from '../config';
import { useAdaptiveResolution } from '../hooks/useAdaptiveResolution';
import { seaFragmentShader, seaVertexShader } from '../shaders/sea.glsl';

export function SeaPlane({
  progress,
  octaves,
  baseDpr,
  onReady,
}: {
  progress: MutableRefObject<number>;
  octaves: number;
  baseDpr: number;
  onReady?: () => void;
}) {
  const size = useThree((state) => state.size);
  const readyRef = useRef(false);

  const { uniforms, phase, time, aspect } = useMemo(() => {
    const palette = buildPalette();
    const phase = { value: 0 };
    const time = { value: 0 };
    const aspect = { value: 1 };
    return {
      phase,
      time,
      aspect,
      uniforms: {
        uAmber: { value: palette.amber },
        uCyan: { value: palette.cyan },
        uCore: { value: palette.core },
        uMagenta: { value: palette.magenta },
        uViolet: { value: palette.violet },
        uVoid: { value: palette.void },
        uDeep: { value: palette.deep },
        uPhase: phase,
        uTime: time,
        uAspect: aspect,
        uOctaves: { value: octaves },
      },
    };
  }, [octaves]);

  aspect.value = size.width / Math.max(size.height, 1);

  useAdaptiveResolution(baseDpr);

  useFrame((_, delta) => {
    // The wave field animates on its own clock; the phase comes entirely from
    // scroll, so the sea stays alive while the sun stays put.
    time.value += delta * SEA_CONFIG.waveSpeed;
    phase.value = progress.current;

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={seaVertexShader}
        fragmentShader={seaFragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
