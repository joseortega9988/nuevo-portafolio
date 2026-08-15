import { DISK_CONFIG } from '../config';

export interface DiskField {
  /** Two vertices per streak: the head and its trailing tail. */
  radius: Float32Array;
  angle: Float32Array;
  height: Float32Array;
  /** 0 for the head vertex, 1 for the tail. Drives the trail in the shader. */
  tail: Float32Array;
  /** Per-streak randomness, for colour jitter and brightness variation. */
  seed: Float32Array;
}

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Lays out the disk once, at mount.
 *
 * Only the orbital *parameters* are stored — radius, starting angle, height.
 * The actual position is computed in the vertex shader from those plus the
 * clock, so nothing is uploaded per frame no matter how many streaks there are.
 */
export function buildDisk(count: number): DiskField {
  const { innerRadius, outerRadius, densityBias, thickness, flare } = DISK_CONFIG;
  const random = makeRandom(0xacc7e);

  const radius = new Float32Array(count * 2);
  const angle = new Float32Array(count * 2);
  const height = new Float32Array(count * 2);
  const tail = new Float32Array(count * 2);
  const seed = new Float32Array(count * 2);

  for (let i = 0; i < count; i += 1) {
    // Bias the radial distribution inward: a uniform sample would leave the
    // bright inner region looking sparse, because area grows with r².
    const t = Math.pow(random(), densityBias);
    const r = innerRadius + (outerRadius - innerRadius) * t;
    const theta = random() * Math.PI * 2;

    // Thin disk, flaring slightly with radius, with a gaussian-ish profile so
    // the edges feather instead of ending on a hard plane.
    const spread = thickness * r * (1 + flare * (r / outerRadius));
    const y = (random() + random() - 1) * spread;

    const s = random();

    for (let v = 0; v < 2; v += 1) {
      const index = i * 2 + v;
      radius[index] = r;
      angle[index] = theta;
      height[index] = y;
      tail[index] = v;
      seed[index] = s;
    }
  }

  return { radius, angle, height, tail, seed };
}
