'use client';

import { BootLoader } from '@/animations/boot-loader';
import { useSceneReady } from '@/lib/motion/SceneReady';

/**
 * Mounts the boot loader at the top of the layout, as a sibling of the navbar,
 * and feeds it the hero's readiness through context.
 *
 * The indirection exists so the layout — a server component — does not have to
 * become a client component just to read that flag.
 */
export function BootLoaderHost() {
  const { ready } = useSceneReady();
  return <BootLoader sceneReady={ready} />;
}
