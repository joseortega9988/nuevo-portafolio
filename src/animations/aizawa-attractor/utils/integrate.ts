import { AIZAWA, INTEGRATION } from '../config';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * The Aizawa system:
 *   dx/dt = (z − b)x − d·y
 *   dy/dt = d·x + (z − b)y
 *   dz/dt = c + a·z − z³/3 − (x² + y²)(1 + e·z) + f·z·x³
 */
function derivative(p: Vec3, out: Vec3): Vec3 {
  const { a, b, c, d, e, f } = AIZAWA;
  const { x, y, z } = p;
  const zb = z - b;
  const r2 = x * x + y * y;

  out.x = zb * x - d * y;
  out.y = d * x + zb * y;
  out.z = c + a * z - (z * z * z) / 3 - r2 * (1 + e * z) + f * z * x * x * x;
  return out;
}

// Scratch vectors, reused across every step. Allocating inside the loop would
// churn ~2M short-lived objects while building the geometry.
const k1: Vec3 = { x: 0, y: 0, z: 0 };
const k2: Vec3 = { x: 0, y: 0, z: 0 };
const k3: Vec3 = { x: 0, y: 0, z: 0 };
const k4: Vec3 = { x: 0, y: 0, z: 0 };
const probe: Vec3 = { x: 0, y: 0, z: 0 };

/** One classical Runge–Kutta 4 step, integrated in place. */
export function step(p: Vec3, dt: number): void {
  derivative(p, k1);

  probe.x = p.x + (dt / 2) * k1.x;
  probe.y = p.y + (dt / 2) * k1.y;
  probe.z = p.z + (dt / 2) * k1.z;
  derivative(probe, k2);

  probe.x = p.x + (dt / 2) * k2.x;
  probe.y = p.y + (dt / 2) * k2.y;
  probe.z = p.z + (dt / 2) * k2.z;
  derivative(probe, k3);

  probe.x = p.x + dt * k3.x;
  probe.y = p.y + dt * k3.y;
  probe.z = p.z + dt * k3.z;
  derivative(probe, k4);

  p.x += (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x);
  p.y += (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y);
  p.z += (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z);
}

/** Deterministic PRNG so the same scene renders identically on every load. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export interface FilamentField {
  /** Interleaved xyz, three.js oriented (attractor z becomes world up). */
  positions: Float32Array;
  /** 0→1 along each filament, driving the travelling pulse in the shader. */
  progress: Float32Array;
  /** Line-segment pairs. Indexing avoids duplicating every position. */
  indices: Uint32Array;
  minY: number;
  maxY: number;
}

/**
 * Integrates the whole filament field once, at mount.
 *
 * The attractor's own z axis is the funnel axis, so it is mapped to three.js's
 * y (up) here — that is what stands the funnel upright in the frame.
 */
export function buildFilamentField(filamentCount: number): FilamentField {
  const { dt, transientSteps, pointsPerFilament, seedSpread } = INTEGRATION;
  const total = filamentCount * pointsPerFilament;

  const positions = new Float32Array(total * 3);
  const progress = new Float32Array(total);
  const indices = new Uint32Array(filamentCount * (pointsPerFilament - 1) * 2);

  const random = makeRandom(0x5eed);
  let minY = Infinity;
  let maxY = -Infinity;
  let index = 0;

  for (let filament = 0; filament < filamentCount; filament += 1) {
    const point: Vec3 = {
      x: (random() - 0.5) * seedSpread,
      y: (random() - 0.5) * seedSpread,
      z: (random() - 0.5) * seedSpread,
    };

    // Let the trajectory fall onto the attractor before recording anything.
    for (let i = 0; i < transientSteps; i += 1) step(point, dt);

    const base = filament * pointsPerFilament;
    for (let i = 0; i < pointsPerFilament; i += 1) {
      step(point, dt);
      const offset = (base + i) * 3;
      positions[offset] = point.x;
      positions[offset + 1] = point.z;
      positions[offset + 2] = point.y;
      progress[base + i] = i / (pointsPerFilament - 1);

      if (point.z < minY) minY = point.z;
      if (point.z > maxY) maxY = point.z;

      if (i < pointsPerFilament - 1) {
        indices[index] = base + i;
        indices[index + 1] = base + i + 1;
        index += 2;
      }
    }
  }

  return { positions, progress, indices, minY, maxY };
}
