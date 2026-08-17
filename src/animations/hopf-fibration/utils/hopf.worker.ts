import { buildFiberField, type FiberField } from './hopf';

/**
 * Projects the fibre field off the main thread.
 *
 * 112 fibres x 168 segments of stereographic projection at the authored
 * density, built inside a useMemo during render.
 *
 * buildFiberField takes no argument — it reads its dimensions straight from
 * HOPF_CONFIG — so the request payload is ignored here. It is still sent, so
 * every builder worker on the site speaks the same `{ size }` protocol and
 * useWorkerBuild needs no special case. The function is deterministic, so what
 * comes back is byte-identical to the main thread's field.
 */

/** See the note in the attractor's worker: `self` is typed as a Window because
 *  tsconfig ships the `dom` lib, so it is narrowed to what this worker uses. */
interface FiberWorkerScope {
  onmessage: ((event: MessageEvent<{ size: number }>) => void) | null;
  postMessage(message: FiberField, transfer: Transferable[]): void;
}

const scope = self as unknown as FiberWorkerScope;

scope.onmessage = () => {
  const field = buildFiberField();
  scope.postMessage(field, [
    field.positions.buffer,
    field.phase.buffer,
    field.band.buffer,
    field.indices.buffer,
  ]);
};
