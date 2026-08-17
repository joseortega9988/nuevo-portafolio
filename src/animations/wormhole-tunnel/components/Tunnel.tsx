'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  PerspectiveCamera,
  ShaderMaterial,
} from 'three';

import { buildPalette } from '@/lib/palette';

import { TUNNEL_CONFIG } from '../config';
import { tunnelFragmentShader, tunnelVertexShader } from '../shaders/tunnel.glsl';

/**
 * Points the camera down into the mouth of the funnel.
 *
 * R3F positions the camera from the `camera` prop but never aims it, so
 * without this it looks along -Z no matter how high it sits — which is what
 * put a horizon across the frame and left an empty band above it.
 *
 * Re-applied on resize: R3F touches the camera when the canvas resizes, and
 * the aim has to survive that.
 */
function useCameraAim() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const [tx, ty, tz] = TUNNEL_CONFIG.camera.target;
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();
  }, [camera, size]);
}

export function Tunnel({
  columns,
  rows,
  onReady,
}: {
  columns: number;
  rows: number;
  onReady?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const readyRef = useRef(false);

  useCameraAim();

  const { geometry, material, instanceCount } = useMemo(() => {
    const layers = TUNNEL_CONFIG.layers;
    const count = rows * columns * layers;

    const rcl = new Float32Array(count * 3);
    let i = 0;
    for (let row = 0; row < rows; row++) {
      for (let layer = 0; layer < layers; layer++) {
        for (let col = 0; col < columns; col++) {
          rcl[i++] = row;
          rcl[i++] = col;
          rcl[i++] = layer;
        }
      }
    }

    const geo = new BoxGeometry();
    geo.setAttribute('aRCL', new InstancedBufferAttribute(rcl, 3));

    // Approximates the discrete per-row accumulation the reference pen used
    // (a Riemann sum of radius * arc) with its continuous equivalent, so the
    // per-row loop can become a single pow() driven by a continuous depth.
    const arc = (2 * Math.PI) / columns;
    const zShiftScale = arc / Math.log(1 + arc);

    const palette = buildPalette();
    const mat = new ShaderMaterial({
      vertexShader: tunnelVertexShader,
      fragmentShader: tunnelFragmentShader,
      side: DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uRowCount: { value: rows },
        uColumnCount: { value: columns },
        uBaseRadius: { value: TUNNEL_CONFIG.baseRadius },
        uZShiftScale: { value: zShiftScale },
        uEdgeWidth: { value: TUNNEL_CONFIG.edgeWidth },
        // Midnight Violet: a muted violet on the rings nearest the camera,
        // sinking to a near-navy violet at the vanishing point. Both ends
        // share a hue, so depth reads as the tunnel falling into darkness
        // rather than as a shift between two different colours.
        uNear: { value: palette['violet-deep'] },
        uFar: { value: palette['violet-night'] },
      },
    });

    return { geometry: geo, material: mat, instanceCount: count };
  }, [rows, columns]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const uTime = material.uniforms.uTime;
    if (uTime) uTime.value = (uTime.value as number) + delta * TUNNEL_CONFIG.speed;

    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * TUNNEL_CONFIG.rotationSpeed;
    }

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    // Flips the whole tunnel 180°.
    <group rotation={[0, 0, Math.PI]}>
      <group ref={groupRef}>
        <instancedMesh
          args={[geometry, material, instanceCount]}
          frustumCulled={false}
        />
      </group>
    </group>
  );
}
