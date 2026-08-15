'use client';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { SCENE } from '../config';

/**
 * Camera rig: the reference framing, plus controls that allow rotation and
 * nothing else.
 *
 * Zoom and pan are disabled at the control level, and the orbit radius is then
 * pinned by setting minDistance === maxDistance. That second lock is the one
 * that matters: it makes the camera distance a hard invariant, so no gesture,
 * wheel event or pinch can change the framing even if a future drei release
 * routes them differently (§D A2, restriction 9).
 */
export function Rig({ enabled }: { enabled: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const target = new Vector3(...SCENE.camera.target);
    const offset = new Vector3(...SCENE.camera.position).sub(target);
    const distance = offset.length();

    // Pin the radius. OrbitControls clamps every dolly against these.
    controls.minDistance = distance;
    controls.maxDistance = distance;

    // Allow ±25° of elevation around the reference view, clamped to the
    // legal polar range so the camera can never flip over the pole.
    const polar = Math.acos(offset.y / distance);
    const swing = SCENE.controls.polarSwing;
    controls.minPolarAngle = Math.max(0.01, polar - swing);
    controls.maxPolarAngle = Math.min(Math.PI - 0.01, polar + swing);

    camera.position.set(...SCENE.camera.position);
    controls.target.copy(target);
    controls.update();
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={SCENE.controls.dampingFactor}
      rotateSpeed={SCENE.controls.rotateSpeed}
      // Drift, so the hero is alive even when nobody touches it (§G).
      autoRotate={enabled}
      autoRotateSpeed={SCENE.autoRotateSpeed}
    />
  );
}
