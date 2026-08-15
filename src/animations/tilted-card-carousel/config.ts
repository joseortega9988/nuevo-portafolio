/** Geometry and motion for the tilted carousel. No colours, no copy. */
export const CAROUSEL_CONFIG = {
  /** Degrees of Y rotation per step away from the active card. */
  rotationStep: 60,
  /** Horizontal offset per step, as a fraction of card width. */
  offsetStep: 0.55,
  /** Cards further than this from the active one are not rendered at all —
   *  they would be edge-on and invisible, but still cost a composited layer. */
  visibleRange: 3,
  inactiveScale: 0.85,
  inactiveBlurPx: 2,
  /** Z push-back per step, so depth is read as depth and not just as scale. */
  depthStep: -90,
  /** The site's single spring, from §G. */
  spring: { type: 'spring', bounce: 0.2, duration: 0.8 },
} as const;
