'use client';

import { useCallback, useState } from 'react';

import { ProjectsGridSection } from '@/sections/projects/ProjectsGridSection';
import { ProjectsHeroSection } from '@/sections/projects/ProjectsHeroSection';

/**
 * Holds the one piece of state the two Projects sections share: whether the
 * hero torus has finished dissolving.
 *
 * It lives here rather than in either section because neither owns it — the
 * hero raises it, the grid consumes it, and the page is their only common
 * ancestor. This is also what guarantees the ordering restriction 13 needs:
 * the cards are not released until the torus canvas is gone.
 */
export function ProjectsExperience() {
  const [torusGone, setTorusGone] = useState(false);
  const handleDissolved = useCallback((dissolved: boolean) => {
    setTorusGone(dissolved);
  }, []);

  return (
    <main>
      <ProjectsHeroSection onDissolved={handleDissolved} />
      <ProjectsGridSection active={torusGone} />
    </main>
  );
}
