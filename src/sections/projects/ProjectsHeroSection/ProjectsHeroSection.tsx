'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSceneRegistration } from '@/lib/motion/SceneReady';
import { useScrollProgress } from '@/lib/motion/useScrollProgress';
import { useInViewport } from '@/lib/motion/useInViewport';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './ProjectsHeroSection.module.css';

const VoronoiTorus = dynamic(
  () => import('@/animations/voronoi-torus').then((m) => m.VoronoiTorus),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

/**
 * Point at which the cards below are released. The torus is fully scattered by
 * now; it is *not* unmounted here.
 */
const RELEASE_CARDS_AT = 0.72;

export interface ProjectsHeroSectionProps {
  /** Raised once the torus has scattered, releasing the thrown-cards sequence. */
  onDissolved?: (dissolved: boolean) => void;
}

export function ProjectsHeroSection({ onDissolved }: ProjectsHeroSectionProps) {
  const t = useTranslations('projectsPage');
  const sectionRef = useRef<HTMLElement>(null);
  const [scattered, setScattered] = useState(false);

  const visible = useInViewport(sectionRef, { rootMargin: '100% 0px 100% 0px' });
  const paused = useRafPause(visible);
  // The torus is expensive to build — 2500 Voronoi cells — so the boot loader
  // waits for it here just as it does for the Home attractor.
  const { reportReady } = useSceneRegistration();

  /**
   * The torus reads this every frame to drive its scatter. Because the scatter
   * is a pure function of scroll position, it reverses on the way back up for
   * free — which is the whole reason the canvas is no longer torn down at the
   * bottom of the hero. Unmounting it meant scrolling up from the cards showed
   * nothing but black while 2500 Voronoi cells were rebuilt from scratch, and
   * the shell was still fully dissolved by the time it returned.
   */
  const progress = useScrollProgress(sectionRef, {
    mode: 'section',
    onChange: (value) => {
      setScattered((current) => {
        const next = value >= RELEASE_CARDS_AT;
        return current === next ? current : next;
      });
    },
  });

  useEffect(() => {
    onDissolved?.(scattered);
  }, [scattered, onDissolved]);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Sticky, not fixed: the torus is pinned to the hero and cannot escape
          into the rest of the page (§D A7). */}
      <div className={styles.pin}>
        <div className={styles.canvas} aria-hidden>
          <VoronoiTorus progress={progress} paused={paused} onReady={reportReady} />
        </div>

        <div className={styles.copy} data-faded={scattered || undefined}>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            align="start"
            scrim
          />
          <p className={styles.body}>{t('body')}</p>
        </div>

        {/* The torus is the most interactive thing on the site and nothing said
            so. Centred low in the frame rather than tucked into the copy: it is
            an invitation to play with the object, so it sits under the object
            and away from the reading column. Fades with the copy, so it is only
            up while there is still a shell to grab. */}
        <p className={styles.hint} data-faded={scattered || undefined}>
          {t('torusHint')}
        </p>
      </div>
    </section>
  );
}
