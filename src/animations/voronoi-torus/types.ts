import type { MutableRefObject } from 'react';

import type { AnimationLayerProps } from '@/lib/webgl/types';

export interface VoronoiTorusProps extends AnimationLayerProps {
  /** Hero scroll progress, 0→1. Drives the dissolve. */
  progress: MutableRefObject<number>;
}
