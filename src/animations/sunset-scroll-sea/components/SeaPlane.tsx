'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { ShaderMaterial } from 'three';

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

  /**
   * The material is constructed here and passed by reference, rather than
   * declared as <shaderMaterial uniforms={…}>.
   *
   * That is not a style preference. With the declarative form the uniforms
   * object this component mutates each frame is not the one the compiled
   * program reads — the scene rendered a permanent sunrise while `uPhase` in
   * JavaScript sat at 1. Owning the instance makes the reference unambiguous.
   */
  const material = useMemo(() => {
    const palette = buildPalette();
    return new ShaderMaterial({
      vertexShader: seaVertexShader,
      fragmentShader: seaFragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAmber: { value: palette.amber },
        uCyan: { value: palette.cyan },
        uCore: { value: palette.core },
        uMagenta: { value: palette.magenta },
        uViolet: { value: palette.violet },
        uVoid: { value: palette.void },
        uDeep: { value: palette.deep },
        uPhase: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uOctaves: { value: octaves },
      },
    });
  }, [octaves]);

  useEffect(() => () => material.dispose(), [material]);

  useAdaptiveResolution(baseDpr);

  useFrame((_, delta) => {
    const { uTime, uPhase, uAspect } = material.uniforms;
    if (!uTime || !uPhase || !uAspect) return;

    // The wave field runs on its own clock; the phase comes entirely from
    // scroll, so the sea keeps moving while the sun stays put.
    uTime.value = (uTime.value as number) + delta * SEA_CONFIG.waveSpeed;
    uPhase.value = progress.current;
    uAspect.value = size.width / Math.max(size.height, 1);
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
