import { Color } from 'three';

/**
 * palette.ts — the typed adapter between tokens.css and WebGL.
 *
 * WHY this exists: GLSL cannot read a CSS custom property, so without this
 * bridge every shader would need its own hardcoded color and the palette would
 * silently fork across eight animations. Here we resolve the token from the
 * live computed style of :root, so editing tokens.css restyles every scene.
 *
 * DOM consumers should NOT import this — use `var(--c-cyan)` in a CSS module
 * instead. This module pulls in three, and importing it from a section would
 * drag the WebGL runtime into a chunk that does not need it.
 */

export const COLOR_TOKENS = [
  'void',
  'deep',
  'surface',
  'elevated',
  'line',
  'magenta',
  'violet',
  'violet-deep',
  'violet-night',
  'cyan',
  'amber',
  'spring',
  'ember',
  'indigo',
  'core',
  'text',
  'text-dim',
  'text-muted',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

/** Resolved values are cached: tokens are static (dark mode only, no theming). */
const cssCache = new Map<ColorToken, string>();
const threeCache = new Map<ColorToken, Color>();

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * The token's computed value, e.g. "#37E5F5".
 *
 * Returns an empty string during SSR. Callers must treat that as "not ready";
 * every animation that needs a palette is client-only, so in practice this
 * branch is only hit by tooling.
 */
export function getColorToken(token: ColorToken): string {
  const cached = cssCache.get(token);
  if (cached !== undefined) return cached;
  if (!isBrowser()) return '';

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--c-${token}`)
    .trim();

  if (value) cssCache.set(token, value);
  return value;
}

/**
 * The token as a THREE.Color, ready to drop into a uniform.
 *
 * Instances are shared per token — callers must not mutate the result. Use
 * `.clone()` if a scene needs to animate a color away from its token value.
 */
export function getThreeColor(token: ColorToken): Color {
  const cached = threeCache.get(token);
  if (cached) return cached;

  const css = getColorToken(token);
  // `new Color()` with no argument is white — a deliberate, hex-free fallback
  // for the SSR/tooling path above. It is never seen in a real browser frame.
  const color = css ? new Color(css) : new Color();
  if (css) threeCache.set(token, color);
  return color;
}

/** A `[r, g, b]` triplet in 0–1 space, for `uniform vec3` without a THREE.Color. */
export function getColorVec3(token: ColorToken): [number, number, number] {
  const { r, g, b } = getThreeColor(token);
  return [r, g, b];
}

export type Palette = Readonly<Record<ColorToken, Color>>;

/**
 * Every token at once. Build this once per scene and hold it in a ref rather
 * than calling the getters inside a frame loop — getComputedStyle is a layout
 * read and would cost a style recalc on every frame.
 */
export function buildPalette(): Palette {
  const entries = COLOR_TOKENS.map(
    (token) => [token, getThreeColor(token)] as const,
  );
  return Object.freeze(Object.fromEntries(entries)) as Palette;
}
