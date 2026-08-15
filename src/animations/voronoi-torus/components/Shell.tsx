'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  ShaderMaterial,
  Vector2,
} from 'three';

import { buildPalette } from '@/lib/palette';

import { TORUS_CONFIG } from '../config';
import { useDragSpin } from '../hooks/useDragSpin';
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
  const spin = useDragSpin();
  /** Idle drift accumulates separately so a drag adds to it rather than
   *  fighting it, and the object never snaps back when released. */
  const drift = useRef({ x: 0, y: 0 });

  const { geometry, material } = useMemo(() => {
    const shattered = buildShatteredTorus(gridSize);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(shattered.positions, 3));
    geo.setAttribute('normal', new BufferAttribute(shattered.normals, 3));
    geo.setAttribute('aBarycentric', new BufferAttribute(shattered.barycentric, 3));
    geo.setAttribute('aCenter', new BufferAttribute(shattered.centers, 3));
    geo.setAttribute('aAxis', new BufferAttribute(shattered.axes, 3));
    geo.setAttribute('aSeed', new BufferAttribute(shattered.seeds, 1));

    const palette = buildPalette();
    const mat = new ShaderMaterial({
      vertexShader: shellVertexShader,
      fragmentShader: shellFragmentShader,
      transparent: true,
      // Fragments hinge open, so their back faces become visible.
      side: DoubleSide,
      uniforms: {
        uSurface: { value: palette.elevated },
        uEdge: { value: palette.cyan },
        uRim: { value: palette.magenta },
        uCursor: { value: new Vector2(2, 2) },
        uCursorRadius: { value: TORUS_CONFIG.cursor.radius },
        uMaxLift: { value: TORUS_CONFIG.cursor.maxLift },
        uMaxAngle: { value: TORUS_CONFIG.cursor.maxAngle },
        uDissolve: { value: 0 },
        uDissolveDistance: { value: TORUS_CONFIG.dissolveDistance },
        uOpacity: { value: 1 },
      },
    });

    return { geometry: geo, material: mat };
  }, [gridSize]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const { uCursor, uDissolve, uOpacity } = material.uniforms;

    // Ease the cursor rather than tracking it exactly: fragments then settle
    // behind the pointer instead of snapping with it.
    cursor.lerp(pointer, Math.min(1, delta * 6));
    if (uCursor) (uCursor.value as Vector2).copy(cursor);

    spin.update(delta);

    if (groupRef.current) {
      // Idle drift pauses while the visitor is holding the object.
      if (!spin.dragging) {
        drift.current.x += delta * TORUS_CONFIG.idleRotation.x;
        drift.current.y += delta * TORUS_CONFIG.idleRotation.y;
      }
      groupRef.current.rotation.x = drift.current.x + spin.offset.x;
      groupRef.current.rotation.y = drift.current.y + spin.offset.y;
    }

    // A pure function of scroll position, so the shell reassembles on the way
    // back up without any extra state.
    const { dissolveStart, dissolveEnd } = TORUS_CONFIG;
    const t = Math.min(
      1,
      Math.max(0, (progress.current - dissolveStart) / (dissolveEnd - dissolveStart)),
    );
    if (uDissolve) uDissolve.value = t;
    if (uOpacity) uOpacity.value = 1 - t;

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
