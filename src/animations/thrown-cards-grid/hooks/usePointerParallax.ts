'use client';

import { useEffect, type RefObject } from 'react';

import { THROWN_CONFIG } from '../config';

/** Below this the eased follow has effectively arrived. Targets are normalised
 *  to −0.5…0.5 and strength is 26px, so this is well under a tenth of a pixel
 *  even on the deepest card. */
const EPSILON = 1e-4;

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
    /** True once the eased position has landed exactly on the target and the
     *  final transform has been written. Cleared the moment it moves again. */
    let settled = false;

    /*
     * Collected once, not per frame.
     *
     * This used to run a querySelectorAll on the stage plus a querySelector per
     * card inside the rAF loop. The node list cannot change while the hook is
     * enabled — it is only enabled during the 'scattered' phase, and Flip
     * animates these same elements rather than swapping them for new ones — so
     * the queries were pure cost, on the page that already has the most going
     * on. depth is read here too: it comes from a data attribute the layout
     * writes once and never changes.
     */
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(cardSelector))
      .map((card) => ({
        card,
        inner: card.querySelector<HTMLElement>('[data-parallax]'),
        depth: Number(card.dataset.depth ?? 0.5),
      }))
      .filter(
        (entry): entry is { card: HTMLElement; inner: HTMLElement; depth: number } =>
          entry.inner !== null,
      );

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
      // `hovered` decides the tilt, and it can change without the eased
      // position changing — so wake the loop explicitly rather than relying on
      // the target having moved.
      settled = false;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      hovered = null;
      settled = false;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const moving = Math.abs(dx) > EPSILON || Math.abs(dy) > EPSILON;

      /*
       * At rest, write nothing at all.
       *
       * The loop used to write a transform to every card on every frame whether
       * or not the pointer had moved, and those writes interleave with the
       * getBoundingClientRect() in useScrollProgress — a forced synchronous
       * layout each frame, on /projects, for transforms identical to the ones
       * already on the elements.
       */
      if (!moving && settled) return;

      if (moving) {
        currentX += dx * ease;
        currentY += dy * ease;
        settled = false;
      } else {
        // Land exactly on the target for the last write, so stopping early
        // cannot leave a sub-pixel offset behind.
        currentX = targetX;
        currentY = targetY;
        settled = true;
      }

      for (const { card, inner, depth } of cards) {
        const x = -currentX * strength * depth;
        const y = -currentY * strength * depth;

        // Only the hovered card tilts; the rest just drift.
        const rx = card === hovered ? -currentY * tilt * 2 : 0;
        const ry = card === hovered ? currentX * tilt * 2 : 0;

        inner.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
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
