'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { useScrollProgress } from '@/lib/motion/useScrollProgress';
import { useInViewport } from '@/lib/motion/useInViewport';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './ProjectsHeroSection.module.css';

const VoronoiTorus = dynamic(
  () => import('@/animations/voronoi-torus').then((m) => m.VoronoiTorus),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

/** The dissolve finishes at 60% of the hero's travel; a little past that the
 *  canvas is torn down, which is what frees the context before the grid's
 *  own work begins (restriction 13). */
const DISPOSE_AT = 0.72;

export interface ProjectsHeroSectionProps {
  /** Raised once the torus is gone, releasing the thrown-cards sequence. */
  onDissolved?: (dissolved: boolean) => void;
}

export function ProjectsHeroSection({ onDissolved }: ProjectsHeroSectionProps) {
  const t = useTranslations('projectsPage');
  const sectionRef = useRef<HTMLElement>(null);
  const [disposed, setDisposed] = useState(false);

  const visible = useInViewport(sectionRef, { rootMargin: '0px' });
  const paused = useRafPause(visible, disposed);

  // The torus reads this every frame to drive its scatter; the section also
  // watches it to decide when the canvas is no longer worth keeping alive.
  const progress = useScrollProgress(sectionRef, {
    mode: 'section',
    onChange: (value) => setDisposed(value >= DISPOSE_AT),
  });

  useEffect(() => {
    onDissolved?.(disposed);
  }, [disposed, onDissolved]);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Sticky, not fixed: the torus is pinned to the hero and cannot escape
          into the rest of the page (§D A7). */}
      <div className={styles.pin}>
        <div className={styles.canvas} aria-hidden>
          {!disposed && <VoronoiTorus progress={progress} paused={paused} />}
        </div>

        <div className={styles.copy}>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            align="start"
            scrim
          />
          <p className={styles.body}>{t('body')}</p>
        </div>
      </div>
    </section>
  );
}
