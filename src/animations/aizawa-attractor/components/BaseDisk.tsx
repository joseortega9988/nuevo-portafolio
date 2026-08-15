'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending } from 'three';

import { buildPalette } from '@/lib/palette';

import { SCENE } from '../config';
import { baseDiskFragmentShader, baseDiskVertexShader } from '../shaders/baseDisk.glsl';

/** The glowing disk at the foot of the funnel, laid flat under the attractor. */
export function BaseDisk({ y }: { y: number }) {
  const { uniforms, time } = useMemo(() => {
    const palette = buildPalette();
    // Kept by reference so the frame loop never has to index into uniforms.
    const time = { value: 0 };
    return {
      time,
      uniforms: {
        uSpring: { value: palette.spring },
        uCore: { value: palette.core },
        uTime: time,
        uRings: { value: SCENE.baseDisk.rings },
        uIntensity: { value: 1 },
      },
    };
  }, []);

  useFrame((_, delta) => {
    time.value += delta;
  });

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[SCENE.baseDisk.radius * 2, SCENE.baseDisk.radius * 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={baseDiskVertexShader}
        fragmentShader={baseDiskFragmentShader}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
