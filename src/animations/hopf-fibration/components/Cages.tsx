'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Group, IcosahedronGeometry, WireframeGeometry } from 'three';

import { getThreeColor } from '@/lib/palette';

import { HOPF_CONFIG } from '../config';

/**
 * Two wireframe shells counter-rotating around the fibration.
 *
 * They give the scene a sense of enclosing structure and, more practically, a
 * fixed reference the eye can hold onto while the fibres tumble.
 */
export function Cages() {
  const outerRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);

  const { outer, inner, colour } = useMemo(
    () => ({
      outer: new WireframeGeometry(new IcosahedronGeometry(HOPF_CONFIG.cageRadius, 1)),
      inner: new WireframeGeometry(
        new IcosahedronGeometry(HOPF_CONFIG.cageRadius * 0.55, 0),
      ),
      colour: getThreeColor('violet'),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.03;
    // Counter-rotation, so the two shells never lock into a single silhouette.
    if (innerRef.current) innerRef.current.rotation.x -= delta * 0.05;
  });

  return (
    <>
      <group ref={outerRef}>
        <lineSegments geometry={outer}>
          <lineBasicMaterial
            color={colour}
            transparent
            opacity={0.12}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      <group ref={innerRef}>
        <lineSegments geometry={inner}>
          <lineBasicMaterial
            color={colour}
            transparent
            opacity={0.18}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </>
  );
}
