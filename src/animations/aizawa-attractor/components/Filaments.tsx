'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
} from 'three';

import { buildPalette } from '@/lib/palette';
import { useWorkerBuild } from '@/lib/webgl/useWorkerBuild';

import { SCENE } from '../config';
import { filamentFragmentShader, filamentVertexShader } from '../shaders/filament.glsl';
import { buildFilamentField } from '../utils/integrate';

/**
 * The trajectories themselves: one indexed LineSegments for the whole field,
 * so hundreds of filaments cost a single draw call.
 *
 * The material is constructed here and passed by reference rather than
 * declared as <shaderMaterial uniforms={…}>. With the declarative form the
 * uniforms object this component mutates is not the one the compiled program
 * reads, and the scene renders a frozen first frame.
 */
export function Filaments({
  filamentCount,
  onReady,
}: {
  filamentCount: number;
  onReady?: () => void;
}) {
  const readyRef = useRef(false);

  /*
   * The 1.2M-evaluation RK4 integration now happens in a worker, so the boot
   * loader can animate while the field builds instead of sitting on a blocked
   * main thread. `field` is null until it arrives and this component renders
   * nothing; the hook falls back to building inline if the worker cannot be
   * created, because a scene that never renders never calls onReady and the
   * loader waits on that.
   */
  const field = useWorkerBuild(
    () => new Worker(new URL('../utils/integrate.worker.ts', import.meta.url)),
    filamentCount,
    buildFilamentField,
  );

  const built = useMemo(() => {
    if (!field) return null;

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(field.positions, 3));
    geo.setAttribute('aProgress', new BufferAttribute(field.progress, 1));
    geo.setIndex(new BufferAttribute(field.indices, 1));

    const palette = buildPalette();
    const mat = new ShaderMaterial({
      vertexShader: filamentVertexShader,
      fragmentShader: filamentFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uSpring: { value: palette.spring },
        uAmber: { value: palette.amber },
        uViolet: { value: palette.violet },
        uMagenta: { value: palette.magenta },
        uCore: { value: palette.core },
        uTime: { value: 0 },
        uFlowRepeat: { value: SCENE.flow.repeat },
        uFlowSpeed: { value: SCENE.flow.speed },
        uIntensity: { value: 1 },
        uMinY: { value: field.minY },
        uRangeY: { value: Math.max(field.maxY - field.minY, 0.001) },
      },
    });

    return { geometry: geo, material: mat };
  }, [field]);

  useEffect(() => {
    if (!built) return;
    return () => {
      built.geometry.dispose();
      built.material.dispose();
    };
  }, [built]);

  useFrame((_, delta) => {
    if (!built) return;
    const uTime = built.material.uniforms.uTime;
    if (uTime) uTime.value = (uTime.value as number) + delta;

    // The hero reports ready on its first rendered frame, which is what
    // releases the boot loader.
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  if (!built) return null;

  return (
    <lineSegments
      geometry={built.geometry}
      material={built.material}
      frustumCulled={false}
    />
  );
}
