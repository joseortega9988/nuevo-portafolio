import { buildShatteredTorus, type ShatteredTorus } from './buildShatteredTorus';

/**
 * Shatters the torus off the main thread.
 *
 * At the high tier that is 2,500 seeds, each clipped against its neighbours
 * inside a (2*clipRadius+1)^2 window — roughly 60,000 polygon clips — followed
 * by fan-triangulating every surviving cell. It ran inside a useMemo during
 * render, so the whole thing landed in one uninterruptible task.
 *
 * The builder is a pure function of `gridSize` seeded by makeRandom(0xc0ffee),
 * so what comes back is byte-identical to what the main thread produced.
 */

/** See the note in the attractor's worker: tsconfig ships the `dom` lib, so
 *  `self` is typed as a Window and is narrowed here to what this worker uses. */
interface TorusWorkerScope {
  onmessage: ((event: MessageEvent<{ size: number }>) => void) | null;
  postMessage(message: ShatteredTorus, transfer: Transferable[]): void;
}

const scope = self as unknown as TorusWorkerScope;

scope.onmessage = (event) => {
  const shattered = buildShatteredTorus(event.data.size);
  scope.postMessage(shattered, [
    shattered.positions.buffer,
    shattered.normals.buffer,
    shattered.barycentric.buffer,
    shattered.centers.buffer,
    shattered.axes.buffer,
    shattered.seeds.buffer,
  ]);
};
