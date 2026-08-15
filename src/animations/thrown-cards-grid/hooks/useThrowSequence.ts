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
 * Two things are load-bearing here.
 *
 * First, phase three animates *the same DOM nodes* as phases one and two — no
 * cross-fade between two sets of cards. That is what Flip is for: capture the
 * scattered layout, let React switch the container to its grid class, then
 * animate the difference.
 *
 * Second, both the throw and the settle are driven by where the stage is on
 * screen, not by a state flag alone. The throw used to fire the moment the
 * hero torus scattered, while the stage was still most of a viewport below the
 * fold — so the cards had already landed by the time anyone could see them.
 */
export function useThrowSequence(
  stageRef: RefObject<HTMLElement | null>,
  cardSelector: string,
  active: boolean,
  reducedMotion: boolean,
): ThrowPhase {
  const [phase, setPhase] = useState<ThrowPhase>('waiting');
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  // Without this, the triggers below fire late (or never) under smooth scroll.
  useGsapLenisSync();

  // Reduced motion skips the choreography entirely and lands in the grid.
  useEffect(() => {
    if (reducedMotion) setPhase('grid');
  }, [reducedMotion]);

  // ── phase 1 + 2: throw in, then float ──
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !active || reducedMotion || phase !== 'waiting') return;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(cardSelector);
      const { throw: thrown, float } = THROWN_CONFIG;

      const timeline = gsap.timeline({ paused: true });

      timeline.from(cards, {
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

      // Drift lives on its own element so it never fights Flip, which animates
      // the outer one.
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

      // Wait until the stage is genuinely on screen before throwing.
      ScrollTrigger.create({
        trigger: stage,
        start: THROWN_CONFIG.throwAt,
        once: true,
        onEnter: () => {
          setPhase('scattered');
          timeline.play();
        },
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
      start: THROWN_CONFIG.settleAt,
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
    const stage = stageRef.current;
    if (phase !== 'grid' || !state || !stage) return;
    flipStateRef.current = null;

    const track = stage.querySelector<HTMLElement>('[data-track]');

    // Flip's `absolute` lifts every card out of flow for the duration of the
    // tween. Without pinning the height first, the track collapses to zero,
    // the document shortens by most of a viewport, and the footer is yanked up
    // into the middle of the animation. React has already committed the grid
    // layout at this point, so this measurement is the final height.
    if (track) track.style.minHeight = `${track.getBoundingClientRect().height}px`;

    Flip.from(state, {
      duration: THROWN_CONFIG.settle.duration,
      stagger: THROWN_CONFIG.settle.stagger,
      ease: THROWN_CONFIG.settle.ease,
      absolute: true,
      onComplete: () => {
        // Flip finishes by leaving the transform it animated to as an inline
        // style. Left in place, the cards keep the rotation they were thrown
        // with and never sit square in the grid — so hand layout back to CSS.
        gsap.set(gsap.utils.toArray<HTMLElement>(cardSelector), {
          clearProps: 'all',
        });
        if (track) track.style.minHeight = '';
        ScrollTrigger.refresh();
      },
    });
  }, [phase, cardSelector, stageRef]);

  return phase;
}
