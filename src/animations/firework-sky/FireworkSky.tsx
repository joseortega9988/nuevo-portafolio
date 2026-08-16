'use client';

import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Points,
  PointsMaterial,
} from 'three';

import { CanvasStage } from '@/lib/webgl/CanvasStage';
import { useQuality } from '@/lib/webgl/quality';

import { FIREWORK_CONFIG } from './config';
import styles from './FireworkSky.module.css';
import type { FireworkSkyProps } from './types';

const C = FIREWORK_CONFIG;

/** Uniform point on a sphere. Rejection-free, so no loop can run long. */
function sphere(out: Float32Array, i3: number, speed: number) {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  out[i3] = r * Math.cos(theta) * speed;
  out[i3 + 1] = r * Math.sin(theta) * speed;
  out[i3 + 2] = u * speed;
}

/**
 * One shell: a rocket that rises, then bursts into `count` sparks.
 *
 * Buffers are allocated once per shell and reused for its whole life, so a
 * launch costs no allocation beyond the first.
 */
class Shell {
  points: Points;
  /** Captured once: geo.attributes.* is optional in three's types, and looking
   *  it up per frame would mean re-narrowing it every time. */
  private pos: Float32Array;
  private col: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private base: Float32Array;
  private rocketY: number;
  private rocketVelY: number;
  private targetY: number;
  private x: number;
  private z: number;
  private timer = 0;
  private exploded = false;
  dead = false;

  /** True once the shell has burst — the launcher counts these separately
   *  from rockets still climbing. */
  get bursting(): boolean {
    return this.exploded;
  }

  constructor(private count: number) {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3));
    // Nothing is drawn until the burst; the rocket is the first point only.
    geo.setDrawRange(0, 1);

    this.points = new Points(
      geo,
      new PointsMaterial({
        size: C.particleSize,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    );

    const posAttr = geo.getAttribute('position');
    const colAttr = geo.getAttribute('color');
    this.pos = posAttr.array as Float32Array;
    this.col = colAttr.array as Float32Array;

    this.velocities = new Float32Array(count * 3);
    this.lifetimes = new Float32Array(count);
    this.base = new Float32Array(count * 3);

    this.x = (Math.random() - 0.5) * C.spawnX * 2;
    this.z = (Math.random() - 0.5) * C.spawnZ * 2;
    this.rocketY = MathUtils.lerp(C.spawnY[0], C.spawnY[1], Math.random());
    this.targetY = MathUtils.lerp(C.targetY[0], C.targetY[1], Math.random());
    this.rocketVelY = C.rocketSpeed * (1.6 + Math.random() * 0.8);

    // The rocket itself, drawn warm so the climb reads before the burst.
    const pos = this.pos;
    const col = this.col;
    pos[0] = this.x;
    pos[1] = this.rocketY;
    pos[2] = this.z;
    col[0] = 1;
    col[1] = 0.85;
    col[2] = 0.6;
  }

  /** Mono, dual or triad — the reference's colour scheme, kept verbatim. */
  private palette(): Color[] {
    const hue = Math.random();
    const roll = Math.random();
    if (roll < 0.33) return [new Color().setHSL(hue, 1, 0.6)];
    if (roll < 0.66) {
      return [
        new Color().setHSL(hue, 1, 0.6),
        new Color().setHSL((hue + 0.5) % 1, 1, 0.5),
      ];
    }
    return [
      new Color().setHSL(hue, 1, 0.6),
      new Color().setHSL((hue + 1 / 3) % 1, 1, 0.55),
      new Color().setHSL((hue + 2 / 3) % 1, 1, 0.5),
    ];
  }

  private explode() {
    this.exploded = true;
    this.timer = 0;

    const geo = this.points.geometry;
    const pos = this.pos;
    const col = this.col;
    const colours = this.palette();
    const speed = C.explosionForce * (0.8 + Math.random() * 0.4);

    for (let i = 0; i < this.count; i += 1) {
      const i3 = i * 3;
      pos[i3] = this.x;
      pos[i3 + 1] = this.rocketY;
      pos[i3 + 2] = this.z;

      /*
       * Speed is the force itself — no damping factor.
       *
       * This used to be scaled by 0.1, which is why the bursts read as small
       * balls instead of filling the frame. Friction is 0.955 per frame, so a
       * spark's total travel is roughly v0 / (1 - friction) — about 22x its
       * starting speed. At 0.1 that came to ~6 world units against a frame
       * some 173 units tall; at full force it reaches 30-110, which is the
       * whole canvas.
       *
       * The squared random still biases speed inward, so the burst keeps a
       * dense core and a sparse outer shell rather than reading as a hollow
       * ring.
       */
      sphere(this.velocities, i3, speed * (0.25 + Math.random() ** 2 * 0.75));

      const c = colours[i % colours.length] ?? new Color();
      this.base[i3] = c.r;
      this.base[i3 + 1] = c.g;
      this.base[i3 + 2] = c.b;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;

      this.lifetimes[i] = 0.75 + Math.random() * 0.25;
    }

    geo.setDrawRange(0, this.count);
    geo.getAttribute('position').needsUpdate = true;
    geo.getAttribute('color').needsUpdate = true;
  }

  update(dt: number) {
    const geo = this.points.geometry;
    const pos = this.pos;

    if (!this.exploded) {
      this.rocketVelY -= C.gravity * 12 * dt * 60;
      this.rocketY += this.rocketVelY * dt * 60 * 0.35;
      pos[1] = this.rocketY;
      geo.getAttribute('position').needsUpdate = true;
      if (this.rocketVelY < C.rocketStallSpeed || this.rocketY >= this.targetY) {
        this.explode();
      }
      return;
    }

    this.timer += dt;
    const col = this.col;
    // Gravity ramps in after the hover rather than switching on, which is what
    // gives the burst its moment of hang before it falls.
    const g =
      MathUtils.smoothstep(this.timer, C.hoverDuration, C.hoverDuration + 0.5) *
      C.gravity;

    let alive = 0;
    for (let i = 0; i < this.count; i += 1) {
      const remaining = this.lifetimes[i] ?? 0;
      if (remaining <= 0) continue;
      alive += 1;
      const i3 = i * 3;

      const vx = (this.velocities[i3] ?? 0) * C.friction;
      const vy = ((this.velocities[i3 + 1] ?? 0) - g) * C.friction;
      const vz = (this.velocities[i3 + 2] ?? 0) * C.friction;
      this.velocities[i3] = vx;
      this.velocities[i3 + 1] = vy;
      this.velocities[i3 + 2] = vz;

      pos[i3] = (pos[i3] ?? 0) + vx;
      pos[i3 + 1] = (pos[i3 + 1] ?? 0) + vy;
      pos[i3 + 2] = (pos[i3 + 2] ?? 0) + vz;

      const life = Math.max(0, remaining - C.fadeSpeed * dt * 60);
      this.lifetimes[i] = life;
      col[i3] = (this.base[i3] ?? 0) * life;
      col[i3 + 1] = (this.base[i3 + 1] ?? 0) * life;
      col[i3 + 2] = (this.base[i3 + 2] ?? 0) * life;
    }

    geo.getAttribute('position').needsUpdate = true;
    geo.getAttribute('color').needsUpdate = true;
    if (alive === 0) this.dead = true;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as PointsMaterial).dispose();
  }
}

function Sky({ count, onReady }: { count: number; onReady?: () => void }) {
  const groupRef = useRef<Group>(null);
  const shells = useRef<Shell[]>([]);
  const nextLaunch = useRef(0);
  const ready = useRef(false);
  const scene = useThree((state) => state.scene);

  // The pen keeps the previous frame and paints a translucent black quad over
  // it, which is what draws the trails. autoClear does the same job here
  // without a quad, and without a colour literal.
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.autoClearColor = false;
    return () => {
      gl.autoClearColor = true;
    };
  }, [gl]);

  useEffect(() => {
    const current = shells.current;
    return () => {
      current.forEach((s) => {
        scene.remove(s.points);
        s.dispose();
      });
      current.length = 0;
    };
  }, [scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 1 / 30);

    /*
     * One burst at a time, one rocket climbing behind it.
     *
     * Counting the two phases separately is what lets the sky stay occupied
     * without becoming a wall of sparks: the next rocket may rise while the
     * current burst is still fading, but it cannot explode until that one has
     * finished.
     */
    let bursts = 0;
    let rockets = 0;
    for (const shell of shells.current) {
      if (shell.bursting) bursts += 1;
      else rockets += 1;
    }

    nextLaunch.current -= dt * 1000;
    if (
      nextLaunch.current <= 0 &&
      bursts < C.maxBursts &&
      rockets < C.maxRockets
    ) {
      const shell = new Shell(count);
      shells.current.push(shell);
      group.add(shell.points);
      nextLaunch.current = MathUtils.lerp(
        C.launchIntervalMs[0],
        C.launchIntervalMs[1],
        Math.random(),
      );
    }

    for (let i = shells.current.length - 1; i >= 0; i -= 1) {
      const shell = shells.current[i];
      if (!shell) continue;
      shell.update(dt);
      if (shell.dead) {
        group.remove(shell.points);
        shell.dispose();
        shells.current.splice(i, 1);
      }
    }

    if (!ready.current) {
      ready.current = true;
      onReady?.();
    }
  });

  return <group ref={groupRef} />;
}

/**
 * A10 — the firework sky behind an entry's detail page.
 *
 * Shells rise, hang and fall, after the reference pen: a rocket climbs until
 * it stalls or reaches its target, bursts into a mono, dual or triad palette,
 * hangs for `hoverDuration`, then gravity ramps in and the sparks fade.
 *
 * Launches overlap on purpose. The reference fired on one fixed interval,
 * which left the sky empty between bursts; here the next rocket is already
 * climbing while the last is still fading, bounded by `maxConcurrent` so the
 * particle budget cannot run away.
 *
 * Static fallback under reduced motion: a still starfield, no launches.
 */
export function FireworkSky({
  className,
  paused = false,
  quality: tierOverride,
  onReady,
}: FireworkSkyProps) {
  const quality = useQuality(tierOverride);
  const count = useMemo(() => FIREWORK_CONFIG.particles[quality.tier], [quality.tier]);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <CanvasStage
        quality={quality}
        paused={paused}
        camera={{ fov: C.camera.fov, position: [...C.camera.position] }}
        fallback={<div className={styles.fallback} />}
      >
        <Sky count={count} onReady={onReady} />

        <EffectComposer enabled={quality.tier !== 'low'}>
          <Bloom
            intensity={C.bloom.strength * quality.bloom}
            luminanceThreshold={C.bloom.threshold}
            luminanceSmoothing={0.6}
            mipmapBlur
          />
        </EffectComposer>
      </CanvasStage>
    </div>
  );
}
