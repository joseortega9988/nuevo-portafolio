/**
 * Mount windows for the WebGL sections, in one place so the context budget is
 * auditable rather than folded into three separate components.
 *
 * Restriction 13 caps live contexts at two. Home stacks three canvases down the
 * page — hero, sea, fibration — so each is mounted only while its section is
 * near the viewport and unmounted otherwise.
 *
 * Walking the worst case at 100vh sections:
 *  · at rest      — hero visible, sea within its lead margin, fibration far. 2.
 *  · mid-sea      — hero is past its trailing margin and gone, fibration is
 *                   entering its lead margin. 2.
 *  · at fibration — sea still within its trailing margin. 2.
 *
 * The margins are asymmetric on purpose: a scene needs to exist slightly before
 * it is seen (or the visitor scrolls into a blank frame), but can be discarded
 * promptly once it is behind them.
 */
export const MOUNT_MARGINS = {
  /** The hero is discarded once it is well behind the visitor. */
  hero: '150% 0px 0px 0px',
  /** The sea leads by one viewport and trails by half of one. */
  sea: '100% 0px 50% 0px',
  /** The fibration leads by one viewport so the handoff from full darkness
   *  lands on an already-running starfield. */
  fibration: '100% 0px 0px 0px',
} as const;
