'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
} from 'three';

import { getThreeColor } from '@/lib/palette';

/**
 * The particle field the previous section descends into.
 *
 * Deliberately sparse and far out: the sunset sea above ends on true black, and
 * these are the first thing that resolves out of it.
 */
export function Starfield({ count }: { count: number }) {
  const pointsRef = useRef<Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 6 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new PointsMaterial({
        size: 0.05,
        color: getThreeColor('cyan'),
        transparent: true,
        opacity: 0.65,
        blending: AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.008;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
