'use client';

import { useEffect, useState } from 'react';

/**
 * True while the viewport is phone-width.
 *
 * Exists because a camera framed for a wide screen is wrong on a narrow one in
 * a way quality tiers cannot express: `useQuality` answers "how much can this
 * device afford", which is not the same question as "how much of the scene
 * fits". A capable phone lands on a high tier and still needs the camera
 * pulled back, because the frustum is tall and narrow and a scene framed for
 * 16:9 arrives cropped.
 *
 * Resolved on the first client render. It used to start false and correct in a
 * mount effect, on the same reasoning that there is no server render to
 * disagree with — but that argument cuts the other way: with no server render,
 * `matchMedia` is available on the first pass and starting at `false` was
 * simply wrong for a whole render. On a phone that meant R3F built the camera
 * at the desktop position and then re-applied the narrow one, which is a
 * visible framing jump on the first frames of the torus, the tunnel and the
 * disk. The listener stays, for viewport changes after mount.
 */
export function useNarrowViewport(maxWidth = 768): boolean {
  const [narrow, setNarrow] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(max-width: ${maxWidth}px)`).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [maxWidth]);

  return narrow;
}
