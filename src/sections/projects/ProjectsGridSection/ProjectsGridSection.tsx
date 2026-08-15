'use client';

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';

import { ThrownCardsGrid } from '@/animations/thrown-cards-grid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCardViewModels } from '@/data/viewModels';
import type { Locale } from '@/i18n/routing';
import { useInViewport } from '@/lib/motion/useInViewport';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './ProjectsGridSection.module.css';

const AccretionDisk = dynamic(
  () => import('@/animations/accretion-disk').then((m) => m.AccretionDisk),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

export interface ProjectsGridSectionProps {
  /** True once the hero torus has dissolved and released its context. */
  active: boolean;
}

export function ProjectsGridSection({ active }: ProjectsGridSectionProps) {
  const t = useTranslations('projectsPage');
  const tWork = useTranslations('work');
  const tEntry = useTranslations('entryTypes');
  // See ExperienceProjectsSection: 'present' is shared with the detail page.
  const tDetail = useTranslations('detail');
  const locale = useLocale() as Locale;

  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: '100% 0px 100% 0px' });
  const paused = useRafPause(visible);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Present from the start of the section rather than waiting for the
          cards to arrange — it is the setting they arrive into, not a reward
          for finishing the sequence. */}
      <div className={styles.canvas} aria-hidden>
        <AccretionDisk active paused={paused} />
      </div>

      <div className={styles.content}>
        <SectionHeading
          eyebrow={t('gridTitle')}
          title={t('title')}
          subtitle={t('gridHint')}
          align="center"
        />

        <ThrownCardsGrid
          cards={getCardViewModels(locale, tDetail('present'))}
          active={active}
          hrefFor={(slug) => `/${locale}/projects/${slug}`}
          labels={{
            experience: tEntry('experience'),
            project: tEntry('project'),
            viewCase: tWork('viewCase'),
          }}
        />
      </div>
    </section>
  );
}
