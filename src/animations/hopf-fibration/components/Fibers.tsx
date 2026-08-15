'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Group } from 'three';

import { buildPalette } from '@/lib/palette';

import { HOPF_CONFIG } from '../config';
import { fiberFragmentShader, fiberVertexShader } from '../shaders/fiber.glsl';
import { buildFiberField } from '../utils/hopf';

export function Fibers({ onReady }: { onReady?: () => void }) {
  const groupRef = useRef<Group>(null);
  const readyRef = useRef(false);

  const { geometry, uniforms, time } = useMemo(() => {
    const field = buildFiberField();

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(field.positions, 3));
    geo.setAttribute('aPhase', new BufferAttribute(field.phase, 1));
    geo.setAttribute('aBand', new BufferAttribute(field.band, 1));
    geo.setIndex(new BufferAttribute(field.indices, 1));

    const palette = buildPalette();
    const time = { value: 0 };

    return {
      geometry: geo,
      time,
      uniforms: {
        uMagenta: { value: palette.magenta },
        uCyan: { value: palette.cyan },
        uViolet: { value: palette.violet },
        uCore: { value: palette.core },
        uTime: time,
        uPulse: { value: HOPF_CONFIG.pulse },
        uPulseSpeed: { value: HOPF_CONFIG.pulseSpeed },
      },
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    time.value += delta;
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
      <lineSegments geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={fiberVertexShader}
          fragmentShader={fiberFragmentShader}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
