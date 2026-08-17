import { buildFilamentField, type FilamentField } from './integrate';

/**
 * Builds the filament field off the main thread.
 *
 * At the high tier this is 180 filaments x (900 transient + 800 recorded) RK4
 * steps, four derivative evaluations each — around 1.2M evaluations producing
 * 144k vertices, in one uninterruptible task during React's render. It blocked
 * paint and the boot loader's own animation with it.
 *
 * The builder is a pure function of `filamentCount`, seeded by a deterministic
 * LCG (makeRandom(0x5eed)), so the geometry that comes back here is identical
 * to what the main thread produced — byte for byte, not merely equivalent.
 */

/**
 * `self` is typed as a Window here because tsconfig ships the `dom` lib, and
 * adding `webworker` would conflict with it across the rest of the project.
 * Narrowing to just what this worker uses keeps it honest without `any`.
 */
interface FilamentWorkerScope {
  onmessage: ((event: MessageEvent<{ size: number }>) => void) | null;
  postMessage(message: FilamentField, transfer: Transferable[]): void;
}

const scope = self as unknown as FilamentWorkerScope;

scope.onmessage = (event) => {
  const field = buildFilamentField(event.data.size);
  // Transferred, not copied: 144k vertices is ~2.3MB and structured-cloning it
  // would hand back most of the time the worker just saved.
  scope.postMessage(field, [
    field.positions.buffer,
    field.progress.buffer,
    field.indices.buffer,
  ]);
};
