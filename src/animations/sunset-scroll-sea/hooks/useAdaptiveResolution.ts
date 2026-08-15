'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

import { SEA_CONFIG } from '../config';

/**
 * Watches the frame rate and lowers the internal render scale when the GPU
 * cannot keep up.
 *
 * Resolution is sacrificed before features, deliberately: a slightly softer
 * sea still reads as the same scene, whereas dropping octaves changes what the
 * water looks like mid-scroll, which is far more noticeable.
 *
 * The scale only ever ratchets down. Recovering it would oscillate — the
 * moment the scene got cheaper the frame rate would rise and push it back up.
 */
export function useAdaptiveResolution(baseDpr: number): void {
  const setDpr = useThree((state) => state.setDpr);
  const scaleRef = useRef(1);
  const framesRef = useRef(0);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const { sampleSize, targetFps, minScale, scaleStep } = SEA_CONFIG.adaptive;

    framesRef.current += 1;
    elapsedRef.current += delta;
    if (framesRef.current < sampleSize) return;

    const fps = framesRef.current / elapsedRef.current;
    framesRef.current = 0;
    elapsedRef.current = 0;

    if (fps >= targetFps || scaleRef.current <= minScale) return;

    scaleRef.current = Math.max(minScale, scaleRef.current - scaleStep);
    setDpr(baseDpr * scaleRef.current);
  });
}
