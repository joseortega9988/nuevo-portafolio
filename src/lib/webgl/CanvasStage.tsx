'use client';

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import type { QualitySettings } from './quality';

export interface CanvasStageProps {
  children: ReactNode;
  quality: QualitySettings;
  paused?: boolean;
  className?: string;
  camera?: CanvasProps['camera'];
  /** Rendered instead of the canvas if the GPU drops the context and cannot
   *  recover — every scene ships one so a failure degrades to a still image. */
  fallback?: ReactNode;
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
  onCreated,
}: CanvasStageProps) {
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCreated = useCallback(
    (state: { gl: { domElement: HTMLCanvasElement } }) => {
      canvasRef.current = state.gl.domElement;
      onCreated?.();
    },
    [onCreated],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
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
  }, [contextLost]);

  if (!quality.enabled || contextLost) return <>{fallback}</>;

  return (
    <Canvas
      className={className}
      dpr={quality.dpr}
      frameloop={paused ? 'never' : 'always'}
      camera={camera}
      gl={{
        antialias: quality.tier === 'high',
        powerPreference: 'high-performance',
        // The scenes paint their own void-coloured background; an alpha buffer
        // would only add a compositing pass.
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={handleCreated}
    >
      {children}
    </Canvas>
  );
}
