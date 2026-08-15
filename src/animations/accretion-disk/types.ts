import type { AnimationLayerProps } from '@/lib/webgl/types';

export interface AccretionDiskProps extends AnimationLayerProps {
  /**
   * Reveals the scene. The Projects grid holds this false until its cards have
   * finished arranging, so the disk fades up behind a settled layout rather
   * than competing with the cards while they are still moving.
   */
  active?: boolean;
}
