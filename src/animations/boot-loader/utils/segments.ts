/**
 * A 14-segment alphanumeric display, the kind used on industrial panels.
 *
 * Segment names follow the standard convention:
 *
 *      ─ a ─
 *    f │╲h│i╱│ b        h, i, j are the upper diagonals/stem
 *    ├g1─┼─g2┤          g1, g2 are the two halves of the middle bar
 *    e │╱k│l╲│ c        k, l, m are the lower diagonals/stem
 *      ─ d ─
 *
 * Only the seven letters of LOADING are defined — this display never renders
 * anything else, and shipping a full character ROM would be dead weight.
 */
export const SEGMENT_NAMES = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g1', 'g2', 'h', 'i', 'j', 'k', 'l', 'm',
] as const;

export type SegmentName = (typeof SEGMENT_NAMES)[number];

const GLYPHS: Record<string, readonly SegmentName[]> = {
  L: ['d', 'e', 'f'],
  O: ['a', 'b', 'c', 'd', 'e', 'f'],
  A: ['a', 'b', 'c', 'e', 'f', 'g1', 'g2'],
  // D lights the two vertical stems rather than b/c, which is what gives a
  // 14-segment D its distinctive flat-sided look.
  D: ['a', 'b', 'c', 'd', 'i', 'l'],
  I: ['a', 'd', 'i', 'l'],
  N: ['b', 'c', 'e', 'f', 'h', 'm'],
  G: ['a', 'c', 'd', 'e', 'f', 'g2'],
};

/** Space-separated segment list for the `data-segments~="a"` CSS selectors. */
export function segmentsFor(character: string): string {
  return (GLYPHS[character.toUpperCase()] ?? []).join(' ');
}
