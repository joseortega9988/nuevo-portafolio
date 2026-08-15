import { HOPF_CONFIG } from '../config';

export interface FiberField {
  positions: Float32Array;
  /** 0→1 around the fibre circle: drives the travelling pulse. */
  phase: Float32Array;
  /** 0→1 across the rings: selects the colour band for this fibre. */
  band: Float32Array;
  indices: Uint32Array;
}

/**
 * Builds the Hopf fibration as line geometry.
 *
 * Each point of the base sphere S² lifts to a whole circle in S³, and any two
 * such circles are linked exactly once — that linkage is the thing worth
 * looking at. The circles are then projected stereographically from S³ into
 * R³, which is what turns them into the nested tori of arcs on screen.
 *
 * For a base point at polar angle α and azimuth β, the fibre is
 *   x1 = sin(α/2)·cos((β+ψ)/2)   x2 = sin(α/2)·sin((β+ψ)/2)
 *   x3 = cos(α/2)·cos((β−ψ)/2)   x4 = cos(α/2)·sin((β−ψ)/2)
 * as ψ runs once around the circle.
 */
export function buildFiberField(): FiberField {
  const { density, rings, segments, maxSegmentLength, projectionScale } = HOPF_CONFIG;

  const fiberCount = rings * density;
  const total = fiberCount * segments;

  const positions = new Float32Array(total * 3);
  const phase = new Float32Array(total);
  const band = new Float32Array(total);
  // Worst case one segment per sample (each fibre closes back on itself).
  const indexBuffer = new Uint32Array(fiberCount * segments * 2);

  let indexCount = 0;
  let vertex = 0;

  for (let ring = 0; ring < rings; ring += 1) {
    // Rings are spaced away from the pole; α = 0 would collapse the fibre to
    // a point, and α = π sends it through the projection's singularity.
    const alpha = ((ring + 1) / (rings + 1)) * Math.PI * 0.82 + 0.12;
    const bandValue = ring / Math.max(rings - 1, 1);

    for (let f = 0; f < density; f += 1) {
      const beta = (f / density) * Math.PI * 2;
      const first = vertex;

      for (let s = 0; s < segments; s += 1) {
        const psi = (s / segments) * Math.PI * 2;

        const halfA = alpha / 2;
        const sinA = Math.sin(halfA);
        const cosA = Math.cos(halfA);
        const plus = (beta + psi) / 2;
        const minus = (beta - psi) / 2;

        const x1 = sinA * Math.cos(plus);
        const x2 = sinA * Math.sin(plus);
        const x3 = cosA * Math.cos(minus);
        const x4 = cosA * Math.sin(minus);

        // Stereographic projection from the x4 = 1 pole.
        const denominator = 1 - x4;
        const k = projectionScale / (Math.abs(denominator) < 1e-4 ? 1e-4 : denominator);

        positions[vertex * 3] = x1 * k;
        positions[vertex * 3 + 1] = x2 * k;
        positions[vertex * 3 + 2] = x3 * k;
        phase[vertex] = s / segments;
        band[vertex] = bandValue;
        vertex += 1;
      }

      // Close the loop, skipping any segment that the projection blew up.
      // `at` reads with a default rather than a non-null assertion: every index
      // here is in range by construction, but the compiler cannot know that.
      const at = (i: number): number => positions[i] ?? 0;

      for (let s = 0; s < segments; s += 1) {
        const a = first + s;
        const b = first + ((s + 1) % segments);
        const dx = at(a * 3) - at(b * 3);
        const dy = at(a * 3 + 1) - at(b * 3 + 1);
        const dz = at(a * 3 + 2) - at(b * 3 + 2);
        if (dx * dx + dy * dy + dz * dz > maxSegmentLength * maxSegmentLength) continue;
        indexBuffer[indexCount] = a;
        indexBuffer[indexCount + 1] = b;
        indexCount += 2;
      }
    }
  }

  return {
    positions,
    phase,
    band,
    indices: indexBuffer.subarray(0, indexCount),
  };
}
