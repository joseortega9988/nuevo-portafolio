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
 * The drag itself is mouse only. Claiming touch drags would steal vertical
 * scrolling on exactly the pinned section a phone visitor most needs to
 * scroll past. A touch tap is handled separately below: it never captures the
 * pointer or blocks scrolling, so it costs nothing if the visitor actually
 * meant to scroll.
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
    const { maxMovement, maxDurationMs, velocity: tapVelocity } = TORUS_CONFIG.tap;
    let lastX = 0;
    let lastY = 0;
    let pointerId: number | null = null;
    // A touch's own start point/time, tracked separately from the mouse-drag
    // state above so a tap can be told apart from a scroll that happened to
    // start on the canvas — never captured, so it never fights the scroll.
    let touchStart: { x: number; y: number; time: number; id: number } | null = null;

    const clamp = (v: number) => Math.max(-maxVelocity, Math.min(maxVelocity, v));

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        touchStart = { x: event.clientX, y: event.clientY, time: performance.now(), id: event.pointerId };
        return;
      }
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

    // Only fires for a touch that ended as a genuine tap — a scroll instead
    // ends in pointercancel once the browser claims the gesture, which skips
    // this entirely.
    const onTouchEnd = (event: PointerEvent) => {
      if (!touchStart || event.pointerId !== touchStart.id) return;
      const moved = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
      const held = performance.now() - touchStart.time;
      touchStart = null;
      if (moved > maxMovement || held > maxDurationMs) return;

      // A small randomised flick — enough to visibly react to the tap
      // without being as forceful as an intentional mouse throw.
      state.current.velocity.y = clamp(tapVelocity * (Math.random() < 0.5 ? -1 : 1));
      state.current.velocity.x = clamp(tapVelocity * (Math.random() * 0.6 - 0.3));
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        onTouchEnd(event);
        return;
      }
      if (event.pointerId !== pointerId) return;
      state.current.dragging = false;
      pointerId = null;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      element.style.cursor = 'grab';
    };

    const onCancel = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        // The browser claimed this for scrolling — not a tap, no nudge.
        touchStart = null;
        return;
      }
      onUp(event);
    };

    element.style.cursor = 'grab';
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onCancel);

    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onCancel);
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
