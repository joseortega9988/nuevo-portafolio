import type { AnimationLayerProps } from '@/lib/webgl/types';

export interface BootLoaderProps extends AnimationLayerProps {
  /**
   * True once the hero scene has rendered its first frame. The loader also
   * waits on document.fonts.ready and enforces its own timeout, so a scene
   * that never reports ready cannot strand the visitor.
   */
  sceneReady?: boolean;
  /** Fired after the exit animation finishes and the overlay unmounts. */
  onDismissed?: () => void;
}
