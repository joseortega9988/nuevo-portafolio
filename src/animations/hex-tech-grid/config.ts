/**
 * Hex grid geometry.
 *
 * A pointy-top hexagon's point-to-point height is its flat-to-flat width times
 * 2/√3 — the constant below. Getting this wrong is what makes a CSS honeycomb
 * look subtly squashed, so it is derived rather than eyeballed.
 */
export const HEX_RATIO = 2 / Math.sqrt(3);

/**
 * Handed to CSS as a custom property so the ratio is defined once, here,
 * rather than baked as a rounded literal into the stylesheet.
 */
export function hexGeometryStyle(): React.CSSProperties {
  return { '--hex-ratio': HEX_RATIO.toFixed(4) } as React.CSSProperties;
}
