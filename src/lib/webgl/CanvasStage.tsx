'use client';

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { QualitySettings } from './quality';

export interface CanvasStageProps {
  children: ReactNode;
  quality: QualitySettings;
  paused?: boolean;
  className?: string;
  camera?: CanvasProps['camera'];
  /** The scene's still poster. Rendered *instead of* the canvas when WebGL is
   *  unavailable or motion is reduced, and *over* it while a context is lost —
   *  so a failure degrades to a still image and can recover from one. */
  fallback?: ReactNode;
  /**
   * MSAA on the *default* framebuffer. Off by default and worth leaving off.
   *
   * A scene with an EffectComposer rasterises into the composer's own render
   * target; the default framebuffer then only ever receives a fullscreen
   * triangle from the final pass, which has no interior edges to sample. Asking
   * for antialias there allocates a multisampled backbuffer that nothing reads.
   * Turn it on only for a scene that draws real geometry straight to the
   * screen with no composer — on this site that is the wormhole tunnel alone.
   */
  antialias?: boolean;
  onCreated?: () => void;
}

/**
 * The one <Canvas> every scene mounts through.
 *
 * Centralising it buys three things no individual animation should re-solve:
 * a dpr clamped to the device tier, a frameloop that genuinely stops when
 * paused (rather than rendering identical frames), and context-loss handling.
 *
 * `frameloop="never"` is not just a pause — R3F stops scheduling rAF entirely,
 * so a backgrounded scene costs nothing.
 */
export function CanvasStage({
  children,
  quality,
  paused = false,
  className,
  camera,
  fallback = null,
  antialias = false,
  onCreated,
}: CanvasStageProps) {
  const [contextLost, setContextLost] = useState(false);
  /**
   * State, not a ref, and taken from onCreated rather than looked up.
   *
   * The element only exists once R3F has built the renderer, so the effect
   * that listens on it has to be keyed on the element arriving. It used to key
   * on `contextLost` instead, which is the wrong dependency in both directions:
   * it re-ran the effect on every loss, and it never re-ran when the canvas
   * itself changed.
   */
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleCreated = useCallback(
    (state: { gl: { domElement: HTMLCanvasElement } }) => {
      setCanvas(state.gl.domElement);
      onCreated?.();
    },
    [onCreated],
  );

  useEffect(() => {
    if (!canvas) return;

    const onLost = (event: Event) => {
      // Preventing the default keeps the context restorable; without it the
      // browser tears it down permanently.
      event.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => setContextLost(false);

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [canvas]);

  // No WebGL at all, or reduced motion: never build a context in the first
  // place. This is the one path that renders the poster *instead of* a canvas.
  if (!quality.enabled) return <>{fallback}</>;

  return (
    <>
      <Canvas
        className={className}
        dpr={quality.dpr}
        // Stop scheduling frames against a dead context, but keep the canvas.
        frameloop={paused || contextLost ? 'never' : 'always'}
        camera={camera}
        gl={{
          antialias,
          powerPreference: 'high-performance',
          // The scenes paint their own void-coloured background; an alpha
          // buffer would only add a compositing pass.
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={handleCreated}
      >
        {children}
      </Canvas>
      {/*
        Overlaid on the canvas, not swapped in for it.
        Returning the fallback in place of <Canvas> unmounted the <canvas>
        element, which took the webglcontextrestored listener with it — so the
        restore event could never arrive and a lost scene stayed a still image
        until a full page reload. iOS Safari drops contexts routinely when a tab
        is backgrounded, so that was a permanent failure on a recoverable event.
        Every scene's .fallback is already position:absolute; inset:0 over an
        opaque background, so it covers the canvas without any extra styling.
      */}
      {contextLost ? fallback : null}
    </>
  );
}
