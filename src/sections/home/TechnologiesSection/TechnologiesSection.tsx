'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { HexTechGrid, type TechCluster } from '@/animations/hex-tech-grid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TECH_CATEGORIES, technologiesByCategory } from '@/data/technologies';
import { useInViewport } from '@/lib/motion/useInViewport';
import { MOUNT_MARGINS } from '@/lib/webgl/contextBudget';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './TechnologiesSection.module.css';

const HopfFibration = dynamic(
  () => import('@/animations/hopf-fibration').then((m) => m.HopfFibration),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

export function TechnologiesSection() {
  const t = useTranslations('technologies');
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: MOUNT_MARGINS.fibration });
  const paused = useRafPause(visible);

  // Categories come from the data layer and are localized here, so the grid
  // itself never touches a message catalogue.
  const clusters: TechCluster[] = TECH_CATEGORIES.map((category) => ({
    id: category.id,
    accent: category.accent,
    label: t(`categories.${category.id}`),
    technologies: technologiesByCategory(category.id),
  }));

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.canvas} aria-hidden>
        {visible && <HopfFibration paused={paused} />}
      </div>

      <div className={styles.content}>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          align="center"
          scrim
        />
        <HexTechGrid clusters={clusters} />
      </div>
    </section>
  );
}
