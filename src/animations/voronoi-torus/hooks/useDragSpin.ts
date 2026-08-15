'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { TORUS_CONFIG } from '../config';

export interface DragSpin {
  /** Extra rotation to add on top of the idle drift, in radians. */
  offset: { x: number; y: number };
  /** True while the pointer is held down, so idle drift can stand aside. */
  dragging: boolean;
  /** Advances the throw; call once per frame. */
  update: (delta: number) => void;
}

/**
 * Lets the visitor grab the torus and turn it.
 *
 * Deliberately not OrbitControls: this rotates the object rather than flying
 * the camera, which is what "flip it over" means here and leaves the framing —
 * and the scroll-driven dissolve — untouched.
 *
 * Mouse only. Claiming touch drags would steal vertical scrolling on exactly
 * the pinned section a phone visitor most needs to scroll past.
 */
export function useDragSpin(): DragSpin {
  const gl = useThree((state) => state.gl);
  const state = useRef({
    offset: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    dragging: false,
  });

  useEffect(() => {
    const element = gl.domElement;
    const { sensitivity, maxVelocity } = TORUS_CONFIG.drag;
    let lastX = 0;
    let lastY = 0;
    let pointerId: number | null = null;

    const clamp = (v: number) => Math.max(-maxVelocity, Math.min(maxVelocity, v));

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointerId = event.pointerId;
      state.current.dragging = true;
      state.current.velocity.x = 0;
      state.current.velocity.y = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
      element.style.cursor = 'grabbing';
    };

    const onMove = (event: PointerEvent) => {
      if (!state.current.dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;

      // Horizontal drag spins about Y, vertical about X — the mapping that
      // makes the object feel attached to the cursor.
      state.current.offset.y += dx * sensitivity;
      state.current.offset.x += dy * sensitivity;

      // Remember the last motion so releasing mid-flick throws it.
      state.current.velocity.y = clamp(dx * sensitivity * 60);
      state.current.velocity.x = clamp(dy * sensitivity * 60);
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      state.current.dragging = false;
      pointerId = null;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      element.style.cursor = 'grab';
    };

    element.style.cursor = 'grab';
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);

    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onUp);
      element.style.cursor = '';
    };
  }, [gl]);

  const update = (delta: number) => {
    const current = state.current;
    if (current.dragging) return;

    // Exponential decay: frame-rate independent, and never quite reaches zero
    // so there is no visible stop.
    const decay = Math.exp(-TORUS_CONFIG.drag.friction * delta);
    current.velocity.x *= decay;
    current.velocity.y *= decay;
    current.offset.x += current.velocity.x * delta;
    current.offset.y += current.velocity.y * delta;
  };

  return {
    offset: state.current.offset,
    get dragging() {
      return state.current.dragging;
    },
    update,
  };
}
