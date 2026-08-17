'use client';

import { useState } from 'react';

import { useReducedMotion } from '@/lib/motion/useReducedMotion';

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualitySettings {
  tier: QualityTier;
  /** [min, max] device pixel ratio handed to the renderer. */
  dpr: [number, number];
  /** Multiplier on each scene's designed bloom strength. */
  bloom: number;
  /** Multiplier on particle / filament / fragment counts. */
  density: number;
  /** False when WebGL is unavailable — sections render their static poster. */
  enabled: boolean;
}

const TIERS: Record<QualityTier, Omit<QualitySettings, 'enabled'>> = {
  high: { tier: 'high', dpr: [1, 2], bloom: 1, density: 1 },
  medium: { tier: 'medium', dpr: [1, 1.5], bloom: 0.8, density: 0.65 },
  // 1.25 is the mobile cap the brief sets for the sea shader; applying it to
  // every scene keeps fill rate predictable on phones.
  low: { tier: 'low', dpr: [1, 1.25], bloom: 0.6, density: 0.4 },
};

/**
 * Answered once per page load, because asking costs a real WebGL context.
 *
 * `useQuality()` has seven callers and each ran this on its own mount, so the
 * probe created seven contexts and dropped them on the floor — the browser
 * counts each as live until GC collects the canvas, and the caps are low
 * (sixteen in Chrome, stricter and noisier in Safari). On Home that roughly
 * doubled the page's context count on top of the four real canvases, which is
 * the most likely cause of the losses seen on iOS. Memoizing asks once;
 * `loseContext()` hands even that one straight back.
 */
let webglSupport: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    webglSupport = Boolean(gl);
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

interface DeviceHints {
  deviceMemory?: number;
}

function detectTier(): QualityTier {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; absence is not a signal either way.
  const memory = (navigator as Navigator & DeviceHints).deviceMemory ?? 8;

  if (width < 768) return 'low';
  if (cores <= 4 || memory <= 4) return 'medium';
  if (width < 1280) return 'medium';
  return 'high';
}

/** Resolved once, alongside the probe above: the inputs (support, cores,
 *  memory, width) are read once per load today anyway, since nothing re-runs
 *  detection on resize. Caching also stops two scenes that mounted at
 *  different moments from landing on different tiers. */
let resolved: QualitySettings | null = null;

export function detectQuality(): QualitySettings {
  if (typeof window === 'undefined') {
    return { ...TIERS.medium, enabled: false };
  }
  if (!resolved) {
    resolved = supportsWebGL()
      ? { ...TIERS[detectTier()], enabled: true }
      : { ...TIERS.low, enabled: false };
  }
  return { ...resolved };
}

export function settingsForTier(tier: QualityTier): QualitySettings {
  return { ...TIERS[tier], enabled: true };
}

/**
 * Samples for an EffectComposer's render target, clamped to what the GPU
 * actually offers.
 *
 * The library default is 8 and nobody here chose it. Most GPUs report
 * MAX_SAMPLES = 4 and clamp silently, so on that hardware the old value was an
 * allocation request for antialiasing the driver was never going to deliver —
 * and 4 is therefore byte-identical there, not a reduction. Where the GPU
 * genuinely does 8 (desktop NVIDIA/AMD) the high tier gives up four samples on
 * additively-blended line geometry that a mipmap bloom is about to soften
 * anyway; that is the one step in this change that is a judgement call rather
 * than an identity, and it is the reason this lives in its own commit.
 *
 * `maxSamples` is only knowable once a context exists, so it is read inside
 * the canvas — see TieredComposer.
 */
export function samplesForTier(tier: QualityTier, maxSamples: number): number {
  if (tier === 'low') return 0;
  if (tier === 'medium') return Math.min(2, maxSamples);
  return Math.min(4, maxSamples);
}

/**
 * Device-appropriate render settings.
 *
 * Resolved on the first client render, not in a mount effect. This used to
 * start disabled and correct afterwards, justified on the grounds that
 * detection needs `window` and the server cannot guess — but every caller is a
 * scene behind a `dynamic(…, { ssr: false })` import, so there is no server
 * render to disagree with and `window` is there on the very first pass. The
 * effect only ever bought an extra render of every scene, one in which the
 * canvas was disabled, before the real one.
 */
export function useQuality(override?: QualityTier): QualitySettings {
  const reducedMotion = useReducedMotion();
  const [settings] = useState<QualitySettings>(detectQuality);

  if (reducedMotion) return { ...settings, enabled: false };
  if (override && settings.enabled) return settingsForTier(override);
  return settings;
}
