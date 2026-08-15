import type { QualityTier } from './quality';

/**
 * The contract every animation in src/animations/* satisfies (§B — Liskov).
 *
 * Because all eight share it, any of them can be dropped into any background
 * slot without the host section changing a line. Sections type their background
 * prop as `ComponentType<AnimationLayerProps>` and nothing more.
 */
export interface AnimationLayerProps {
  /** Positioning/sizing comes from the host section, never from the animation. */
  className?: string;
  /** True while the section is off-screen or the tab is hidden: stop the loop. */
  paused?: boolean;
  /** Lets the host force a tier down; omitted means "detect from the device". */
  quality?: QualityTier;
  /** Fired on the first rendered frame. The boot loader waits on this. */
  onReady?: () => void;
}

/** What a section imports when it wants "some animation" rather than a specific one. */
export type AnimationLayer = React.ComponentType<AnimationLayerProps>;
