import { TORUS_CONFIG } from '../config';
import { clipAgainstBisector, type Point2 } from './clipPolygon';

export interface ShatteredTorus {
  positions: Float32Array;
  normals: Float32Array;
  /** Per-vertex barycentric coordinate, for the wireframe in the shader. */
  barycentric: Float32Array;
  /** The owning fragment's centroid — the point it hinges and scatters about. */
  centers: Float32Array;
  /** Random unit axis per fragment, so no two fragments open the same way. */
  axes: Float32Array;
  /** Random scalar per fragment, for staggering the dissolve. */
  seeds: Float32Array;
  fragmentCount: number;
}

const TAU = Math.PI * 2;

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Torus surface point and its outward normal for parameters (u, v). */
function surface(u: number, v: number): { p: [number, number, number]; n: [number, number, number] } {
  const { radius, tube } = TORUS_CONFIG;
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const cv = Math.cos(v);
  const sv = Math.sin(v);
  return {
    p: [(radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv],
    n: [cv * cu, cv * su, sv],
  };
}

/**
 * Shatters a torus into Voronoi fragments.
 *
 * Seeds are jittered on a grid in (u, v) space; each cell is the unit square
 * around its seed clipped against the perpendicular bisectors of its
 * neighbours. Because the parameter space is periodic, neighbours are taken
 * with wraparound, so the cells at the seam are as correct as the rest.
 */
export function buildShatteredTorus(gridSize: number): ShatteredTorus {
  const { jitter, clipRadius } = TORUS_CONFIG;
  const random = makeRandom(0xc0ffee);
  const cell = 1 / gridSize;

  // Seed positions in normalised (0..1) parameter space.
  const seeds: Point2[] = [];
  for (let i = 0; i < gridSize; i += 1) {
    for (let j = 0; j < gridSize; j += 1) {
      seeds.push({
        u: (i + 0.5 + (random() - 0.5) * 2 * jitter) * cell,
        v: (j + 0.5 + (random() - 0.5) * 2 * jitter) * cell,
      });
    }
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const barycentric: number[] = [];
  const centers: number[] = [];
  const axes: number[] = [];
  const seedValues: number[] = [];

  const BARY = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ] as const;

  for (let i = 0; i < gridSize; i += 1) {
    for (let j = 0; j < gridSize; j += 1) {
      const seedIndex = i * gridSize + j;
      const seed = seeds[seedIndex];
      if (!seed) continue;

      // Start from a square generous enough to contain the true cell.
      let polygon: Point2[] = [
        { u: seed.u - cell, v: seed.v - cell },
        { u: seed.u + cell, v: seed.v - cell },
        { u: seed.u + cell, v: seed.v + cell },
        { u: seed.u - cell, v: seed.v + cell },
      ];

      for (let di = -clipRadius; di <= clipRadius; di += 1) {
        for (let dj = -clipRadius; dj <= clipRadius; dj += 1) {
          if (di === 0 && dj === 0) continue;
          const ni = (i + di + gridSize) % gridSize;
          const nj = (j + dj + gridSize) % gridSize;
          const neighbour = seeds[ni * gridSize + nj];
          if (!neighbour) continue;

          // Unwrap the neighbour across the periodic boundary so the bisector
          // is taken against the copy that is actually adjacent. Parameter
          // space has period 1, so rounding the difference gives exactly the
          // -1 / 0 / +1 shift needed.
          polygon = clipAgainstBisector(polygon, seed, {
            u: neighbour.u + Math.round(seed.u - neighbour.u),
            v: neighbour.v + Math.round(seed.v - neighbour.v),
          });
          if (polygon.length < 3) break;
        }
        if (polygon.length < 3) break;
      }
      if (polygon.length < 3) continue;

      const centre = surface(seed.u * TAU, seed.v * TAU);
      // A random unit axis: the hinge this fragment swings on.
      const ax = random() * 2 - 1;
      const ay = random() * 2 - 1;
      const az = random() * 2 - 1;
      const length = Math.hypot(ax, ay, az) || 1;
      const axis: [number, number, number] = [ax / length, ay / length, az / length];
      const seedValue = random();

      // Fan-triangulate the convex cell.
      for (let k = 1; k < polygon.length - 1; k += 1) {
        const corners = [polygon[0], polygon[k], polygon[k + 1]];
        for (let c = 0; c < 3; c += 1) {
          const corner = corners[c];
          const bary = BARY[c];
          if (!corner || !bary) continue;
          const { p, n } = surface(corner.u * TAU, corner.v * TAU);
          positions.push(p[0], p[1], p[2]);
          normals.push(n[0], n[1], n[2]);
          barycentric.push(bary[0], bary[1], bary[2]);
          centers.push(centre.p[0], centre.p[1], centre.p[2]);
          axes.push(axis[0], axis[1], axis[2]);
          seedValues.push(seedValue);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    barycentric: new Float32Array(barycentric),
    centers: new Float32Array(centers),
    axes: new Float32Array(axes),
    seeds: new Float32Array(seedValues),
    fragmentCount: gridSize * gridSize,
  };
}
