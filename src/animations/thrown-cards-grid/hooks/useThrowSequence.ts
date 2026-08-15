'use client';

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { useGsapLenisSync } from '@/lib/motion/useGsapLenisSync';

import { THROWN_CONFIG } from '../config';

gsap.registerPlugin(Flip, ScrollTrigger);

export type ThrowPhase = 'waiting' | 'scattered' | 'grid';

/**
 * The throw → float → settle sequence.
 *
 * The critical constraint is that phase three animates *the same DOM nodes* as
 * phases one and two — no cross-fade between two sets of cards. That is what
 * Flip is for: capture the scattered layout, let React switch the container to
 * its grid class, then animate the difference.
 */
export function useThrowSequence(
  stageRef: RefObject<HTMLElement | null>,
  cardSelector: string,
  active: boolean,
  reducedMotion: boolean,
): ThrowPhase {
  const [phase, setPhase] = useState<ThrowPhase>('waiting');
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  // Without this, the settle trigger fires late (or never) under smooth scroll.
  useGsapLenisSync();

  // Reduced motion skips the choreography entirely and lands in the grid.
  useEffect(() => {
    if (reducedMotion) setPhase('grid');
  }, [reducedMotion]);

  // ── phase 1 + 2: throw in, then float ──
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !active || reducedMotion || phase !== 'waiting') return;

    setPhase('scattered');

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(cardSelector);
      const { throw: thrown, float } = THROWN_CONFIG;

      gsap.from(cards, {
        // Thrown in from alternating sides, so they cross rather than arrive
        // as one column.
        x: (index: number) =>
          (index % 2 === 0 ? -1 : 1) * window.innerWidth * thrown.distance,
        y: () => gsap.utils.random(-160, 160),
        rotation: () => gsap.utils.random(-thrown.maxRotation, thrown.maxRotation),
        opacity: 0,
        duration: thrown.duration,
        stagger: thrown.stagger,
        ease: thrown.ease,
      });

      // Drift lives on the inner element so it never fights Flip, which
      // animates the outer one.
      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>('[data-float]');
        if (!inner) return;
        gsap.to(inner, {
          y: gsap.utils.random(float.amplitude[0], float.amplitude[1]),
          duration: gsap.utils.random(float.duration[0], float.duration[1]),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 1.5),
        });
      });
    }, stage);

    return () => context.revert();
  }, [stageRef, cardSelector, active, reducedMotion, phase]);

  // ── phase 3: settle into the grid ──
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion || phase !== 'scattered') return;

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: `top+=${THROWN_CONFIG.settleAt * 100}% center`,
      once: true,
      onEnter: () => {
        // Capture before React re-renders: this is the layout we animate from.
        flipStateRef.current = Flip.getState(
          gsap.utils.toArray<HTMLElement>(cardSelector),
          { props: 'rotation' },
        );
        setPhase('grid');
      },
    });

    return () => trigger.kill();
  }, [stageRef, cardSelector, reducedMotion, phase]);

  // Runs after React has committed the grid class but before paint, so the
  // scattered layout is never visibly skipped.
  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (phase !== 'grid' || !state) return;
    flipStateRef.current = null;

    Flip.from(state, {
      duration: THROWN_CONFIG.settle.duration,
      stagger: THROWN_CONFIG.settle.stagger,
      ease: THROWN_CONFIG.settle.ease,
      absolute: true,
    });
  }, [phase]);

  return phase;
}
