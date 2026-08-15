'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lets a page's heavy scenes tell the boot loader when they have drawn,
 * without the two having to be neighbours in the tree.
 *
 * They cannot be neighbours: the loader has to sit above the page transition
 * so its overlay shares a stacking context with the navbar — nested inside the
 * transition, the fade creates a stacking context of its own and the overlay
 * paints *under* the chrome no matter how high its z-index. The scenes,
 * meanwhile, belong to their pages.
 *
 * Scenes announce themselves on mount and report again once they have rendered
 * a frame, so the loader covers the Home attractor and the Projects torus alike
 * — both are expensive to build, and the loader exists precisely to hide that.
 * A route with no scene at all resolves on its own and never waits.
 */
interface SceneReadyValue {
  ready: boolean;
  /** Call on mount from any scene the loader should wait for. */
  registerScene: () => void;
  /** Call once that scene has rendered its first frame. */
  reportReady: () => void;
}

const SceneReadyContext = createContext<SceneReadyValue>({
  ready: true,
  registerScene: () => {},
  reportReady: () => {},
});

export function useSceneReady(): SceneReadyValue {
  return useContext(SceneReadyContext);
}

/**
 * Registers this component's scene for the lifetime of the mount and reports
 * it ready when `drawn` first turns true.
 */
export function useSceneRegistration(): { reportReady: () => void } {
  const { registerScene, reportReady } = useSceneReady();

  useEffect(() => {
    registerScene();
  }, [registerScene]);

  return { reportReady };
}

export function SceneReadyProvider({ children }: { children: ReactNode }) {
  const [expected, setExpected] = useState(0);
  const [drawn, setDrawn] = useState(0);
  /**
   * Scenes register in an effect, which runs before the next frame. Waiting one
   * frame before believing "no scenes on this route" avoids resolving ready in
   * the gap between the loader mounting and the page registering.
   */
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const registerScene = useCallback(() => setExpected((n) => n + 1), []);
  const reportReady = useCallback(() => setDrawn((n) => n + 1), []);

  const ready = settled && (expected === 0 || drawn >= expected);

  const value = useMemo(
    () => ({ ready, registerScene, reportReady }),
    [ready, registerScene, reportReady],
  );

  return (
    <SceneReadyContext.Provider value={value}>
      {children}
    </SceneReadyContext.Provider>
  );
}
