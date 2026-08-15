'use client';

import { useLocale, useTranslations } from 'next-intl';

import { ThrownCardsGrid } from '@/animations/thrown-cards-grid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCardViewModels } from '@/data/viewModels';
import type { Locale } from '@/i18n/routing';

import styles from './ProjectsGridSection.module.css';

export interface ProjectsGridSectionProps {
  /** True once the hero torus has dissolved and released its context. */
  active: boolean;
}

export function ProjectsGridSection({ active }: ProjectsGridSectionProps) {
  const t = useTranslations('projectsPage');
  const tWork = useTranslations('work');
  const tEntry = useTranslations('entryTypes');
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <SectionHeading
          eyebrow={t('gridTitle')}
          title={t('title')}
          subtitle={t('gridHint')}
          align="center"
        />

        <ThrownCardsGrid
          cards={getCardViewModels(locale)}
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
