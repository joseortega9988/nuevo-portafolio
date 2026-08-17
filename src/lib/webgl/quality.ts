'use client';

import { useEffect, useState } from 'react';

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
 * Device-appropriate render settings.
 *
 * Starts disabled and resolves after mount: detection needs `window`, and
 * guessing on the server would either block first paint or flash a canvas the
 * device cannot afford (restriction 14).
 */
export function useQuality(override?: QualityTier): QualitySettings {
  const reducedMotion = useReducedMotion();
  const [settings, setSettings] = useState<QualitySettings>(() => ({
    ...TIERS.medium,
    enabled: false,
  }));

  useEffect(() => {
    setSettings(detectQuality());
  }, []);

  if (reducedMotion) return { ...settings, enabled: false };
  if (override && settings.enabled) return settingsForTier(override);
  return settings;
}
