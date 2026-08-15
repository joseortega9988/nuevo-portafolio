'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { AdditiveBlending, ShaderMaterial } from 'three';

import { buildPalette } from '@/lib/palette';

import { SCENE } from '../config';
import { baseDiskFragmentShader, baseDiskVertexShader } from '../shaders/baseDisk.glsl';

/** The glowing disk at the foot of the funnel, laid flat under the attractor. */
export function BaseDisk({ y }: { y: number }) {
  const material = useMemo(() => {
    const palette = buildPalette();
    return new ShaderMaterial({
      vertexShader: baseDiskVertexShader,
      fragmentShader: baseDiskFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uSpring: { value: palette.spring },
        uCore: { value: palette.core },
        uTime: { value: 0 },
        uRings: { value: SCENE.baseDisk.rings },
        uIntensity: { value: 1 },
      },
    });
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const uTime = material.uniforms.uTime;
    if (uTime) uTime.value = (uTime.value as number) + delta;
  });

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[SCENE.baseDisk.radius * 2, SCENE.baseDisk.radius * 2]} />
    </mesh>
  );
}
