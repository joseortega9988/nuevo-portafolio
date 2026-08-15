import type { MutableRefObject } from 'react';

import type { AnimationLayerProps } from '@/lib/webgl/types';

export interface SunsetScrollSeaProps extends AnimationLayerProps {
  /**
   * The host section's normalised scroll progress, 0→1, delivered as a ref so
   * the value can change every frame without re-rendering anything. The
   * section produces it with useScrollProgress(ref, { mode: 'section' }).
   */
  progress: MutableRefObject<number>;
}
