'use client';

import { useEffect, type RefObject } from 'react';

import { THROWN_CONFIG } from '../config';

/**
 * Mouse parallax and hover tilt, driven by one rAF loop for the whole stage.
 *
 * Deliberately not GSAP: this runs every frame while the pointer moves, and a
 * single loop writing transforms directly is cheaper than one tween per card.
 * It writes to the inner element, leaving the outer one free for Flip.
 *
 * Depth comes from each card's data-depth attribute, so the layout decides how
 * much a card moves and this hook stays generic.
 */
export function usePointerParallax(
  stageRef: RefObject<HTMLElement | null>,
  cardSelector: string,
  enabled: boolean,
): void {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return;

    const { strength, tilt, ease } = THROWN_CONFIG.parallax;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hovered: HTMLElement | null = null;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      // Normalised to −1…1 about the centre of the stage.
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;

      const element = event.target;
      hovered =
        element instanceof Element
          ? element.closest<HTMLElement>(cardSelector)
          : null;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      hovered = null;
    };

    const tick = () => {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      for (const card of stage.querySelectorAll<HTMLElement>(cardSelector)) {
        const inner = card.querySelector<HTMLElement>('[data-parallax]');
        if (!inner) continue;

        const depth = Number(card.dataset.depth ?? 0.5);
        const x = -currentX * strength * depth;
        const y = -currentY * strength * depth;

        // Only the hovered card tilts; the rest just drift.
        const rx = card === hovered ? -currentY * tilt * 2 : 0;
        const ry = card === hovered ? currentX * tilt * 2 : 0;

        inner.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      frame = requestAnimationFrame(tick);
    };

    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerleave', onPointerLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(frame);
    };
  }, [stageRef, cardSelector, enabled]);
}
