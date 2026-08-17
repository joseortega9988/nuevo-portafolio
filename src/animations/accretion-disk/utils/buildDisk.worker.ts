import { buildDisk, type DiskField } from './buildDisk';

/**
 * Lays the disk out off the main thread.
 *
 * Lighter than the attractor and the torus — 34,000 streaks at the high tier,
 * five Float32Arrays — but it is still a synchronous loop inside a useMemo
 * during render, on the route that also mounts the Projects hero torus.
 *
 * buildDisk is a pure function of `count` seeded by makeRandom(0xacc7e), so
 * what comes back is byte-identical to the main thread's layout.
 */

/** See the note in the attractor's worker: `self` is typed as a Window because
 *  tsconfig ships the `dom` lib, so it is narrowed to what this worker uses. */
interface DiskWorkerScope {
  onmessage: ((event: MessageEvent<{ size: number }>) => void) | null;
  postMessage(message: DiskField, transfer: Transferable[]): void;
}

const scope = self as unknown as DiskWorkerScope;

scope.onmessage = (event) => {
  const field = buildDisk(event.data.size);
  scope.postMessage(field, [
    field.radius.buffer,
    field.angle.buffer,
    field.height.buffer,
    field.tail.buffer,
    field.seed.buffer,
  ]);
};
