'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Runs a scene's mount-time geometry builder in a Web Worker, and returns null
 * until it comes back.
 *
 * WHY: every one of these builders is a single uninterruptible task during
 * React's render — the attractor integrates ~1.2M RK4 derivative evaluations,
 * the torus clips ~60,000 polygons — and it blocks paint, the boot loader's own
 * animation, and INP with it. Moving them off-thread is what lets the loader
 * actually animate while the geometry builds.
 *
 * WHY IT IS SAFE: each builder is a pure function of one number, seeded by a
 * deterministic LCG, so the worker returns byte-identical geometry rather than
 * merely equivalent geometry. No visual change is possible.
 *
 * `spawn` must contain the literal `new Worker(new URL('./x.worker.ts',
 * import.meta.url))` at its call site so the bundler can see and split it —
 * passing a pre-built worker in would defeat that.
 *
 * The main thread stays as the fallback. If the worker cannot be constructed
 * or fails to load, the build happens inline exactly as it used to, because a
 * scene that never produces geometry never calls reportReady, and that traps
 * the boot loader forever.
 */
export function useWorkerBuild<TResult>(
  spawn: () => Worker,
  size: number,
  buildInline: (size: number) => TResult,
): TResult | null {
  const [result, setResult] = useState<TResult | null>(null);

  // Held in refs: both are fresh closures on every render, and neither is a
  // reason to rebuild geometry. Only `size` is.
  const spawnRef = useRef(spawn);
  spawnRef.current = spawn;
  const buildInlineRef = useRef(buildInline);
  buildInlineRef.current = buildInline;

  useEffect(() => {
    let cancelled = false;
    let worker: Worker | null = null;

    const onMainThread = () => {
      if (!cancelled) setResult(buildInlineRef.current(size));
    };

    try {
      worker = spawnRef.current();
      worker.onmessage = (event: MessageEvent<TResult>) => {
        if (!cancelled) setResult(event.data);
        worker?.terminate();
        worker = null;
      };
      worker.onerror = () => {
        worker?.terminate();
        worker = null;
        onMainThread();
      };
      worker.postMessage({ size });
    } catch {
      onMainThread();
    }

    return () => {
      cancelled = true;
      worker?.terminate();
    };
  }, [size]);

  return result;
}
