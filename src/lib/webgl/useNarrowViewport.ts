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
 * Starts false and corrects after mount. Every caller is inside a client-only
 * dynamic import, so there is no server render to disagree with, and the first
 * frame is behind the boot loader either way.
 */
export function useNarrowViewport(maxWidth = 768): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [maxWidth]);

  return narrow;
}
