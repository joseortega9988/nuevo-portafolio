'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  ShaderMaterial,
} from 'three';

import { buildPalette } from '@/lib/palette';

import { HOPF_CONFIG } from '../config';
import { fiberFragmentShader, fiberVertexShader } from '../shaders/fiber.glsl';
import { buildFiberField } from '../utils/hopf';

export function Fibers({ onReady }: { onReady?: () => void }) {
  const groupRef = useRef<Group>(null);
  const readyRef = useRef(false);

  const { geometry, material } = useMemo(() => {
    const field = buildFiberField();

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(field.positions, 3));
    geo.setAttribute('aPhase', new BufferAttribute(field.phase, 1));
    geo.setAttribute('aBand', new BufferAttribute(field.band, 1));
    geo.setIndex(new BufferAttribute(field.indices, 1));

    const palette = buildPalette();
    const mat = new ShaderMaterial({
      vertexShader: fiberVertexShader,
      fragmentShader: fiberFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uMagenta: { value: palette.magenta },
        uCyan: { value: palette.cyan },
        uViolet: { value: palette.violet },
        uCore: { value: palette.core },
        uTime: { value: 0 },
        uPulse: { value: HOPF_CONFIG.pulse },
        uPulseSpeed: { value: HOPF_CONFIG.pulseSpeed },
      },
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const uTime = material.uniforms.uTime;
    if (uTime) uTime.value = (uTime.value as number) + delta;

    if (groupRef.current) {
      groupRef.current.rotation.x += delta * HOPF_CONFIG.rotationSpeed.x;
      groupRef.current.rotation.y += delta * HOPF_CONFIG.rotationSpeed.y;
    }
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
