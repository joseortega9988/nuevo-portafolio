'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Vector2 } from 'three';

import { buildPalette } from '@/lib/palette';

import { TORUS_CONFIG } from '../config';
import { shellFragmentShader, shellVertexShader } from '../shaders/shell.glsl';
import { buildShatteredTorus } from '../utils/buildShatteredTorus';

export function Shell({
  gridSize,
  progress,
  onReady,
}: {
  gridSize: number;
  /** Hero scroll progress, 0→1, driving the dissolve. */
  progress: MutableRefObject<number>;
  onReady?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const readyRef = useRef(false);
  const cursor = useMemo(() => new Vector2(2, 2), []); // starts far off-screen
  const pointer = useThree((state) => state.pointer);

  const { geometry, uniforms, dissolve, opacity, cursorUniform } = useMemo(() => {
    const shattered = buildShatteredTorus(gridSize);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(shattered.positions, 3));
    geo.setAttribute('normal', new BufferAttribute(shattered.normals, 3));
    geo.setAttribute('aBarycentric', new BufferAttribute(shattered.barycentric, 3));
    geo.setAttribute('aCenter', new BufferAttribute(shattered.centers, 3));
    geo.setAttribute('aAxis', new BufferAttribute(shattered.axes, 3));
    geo.setAttribute('aSeed', new BufferAttribute(shattered.seeds, 1));

    const palette = buildPalette();
    const dissolve = { value: 0 };
    const opacity = { value: 1 };
    const cursorUniform = { value: new Vector2(2, 2) };

    return {
      geometry: geo,
      dissolve,
      opacity,
      cursorUniform,
      uniforms: {
        uSurface: { value: palette.elevated },
        uEdge: { value: palette.cyan },
        uRim: { value: palette.magenta },
        uCursor: cursorUniform,
        uCursorRadius: { value: TORUS_CONFIG.cursor.radius },
        uMaxLift: { value: TORUS_CONFIG.cursor.maxLift },
        uMaxAngle: { value: TORUS_CONFIG.cursor.maxAngle },
        uDissolve: dissolve,
        uDissolveDistance: { value: TORUS_CONFIG.dissolveDistance },
        uOpacity: opacity,
      },
    };
  }, [gridSize]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    // Ease the cursor rather than tracking it exactly: fragments then settle
    // behind the pointer instead of snapping with it.
    cursor.lerp(pointer, Math.min(1, delta * 6));
    cursorUniform.value.copy(cursor);

    if (groupRef.current) {
      groupRef.current.rotation.x += delta * TORUS_CONFIG.idleRotation.x;
      groupRef.current.rotation.y += delta * TORUS_CONFIG.idleRotation.y;
    }

    const t = Math.min(1, progress.current / TORUS_CONFIG.dissolveWindow);
    dissolve.value = t;
    opacity.value = 1 - t;

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={shellVertexShader}
          fragmentShader={shellFragmentShader}
          transparent
          // Fragments hinge open, so their back faces become visible.
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
