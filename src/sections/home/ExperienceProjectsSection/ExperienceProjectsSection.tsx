'use client';

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';

import { TiltedCardCarousel } from '@/animations/tilted-card-carousel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCardViewModels } from '@/data/viewModels';
import type { Locale } from '@/i18n/routing';
import { useInViewport } from '@/lib/motion/useInViewport';
import { useScrollProgress } from '@/lib/motion/useScrollProgress';
import { MOUNT_MARGINS } from '@/lib/webgl/contextBudget';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './ExperienceProjectsSection.module.css';

const SunsetScrollSea = dynamic(
  () => import('@/animations/sunset-scroll-sea').then((m) => m.SunsetScrollSea),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

/**
 * Experience and selected work — one carousel carrying both, in the canonical
 * order (§E, explicit and non-negotiable).
 *
 * The section owns the scroll math and hands the result down: it does not know
 * how the sea is rendered, and the sea does not know what a section is.
 * 'section' mode is what makes the phase reach 1 exactly as the section's
 * bottom edge meets the viewport's, which is what puts full darkness precisely
 * at the handoff.
 */
export function ExperienceProjectsSection() {
  const t = useTranslations('work');
  const tEntry = useTranslations('entryTypes');
  const locale = useLocale() as Locale;

  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: MOUNT_MARGINS.sea });
  const paused = useRafPause(visible);
  const progress = useScrollProgress(sectionRef, { mode: 'section' });

  const cards = getCardViewModels(locale);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.canvas} aria-hidden>
        {visible && <SunsetScrollSea progress={progress} paused={paused} />}
      </div>

      <div className={styles.content}>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          align="center"
          scrim
        />

        <TiltedCardCarousel
          cards={cards}
          hrefFor={(slug) => `/${locale}/projects/${slug}`}
          labels={{
            experience: tEntry('experience'),
            project: tEntry('project'),
            viewCase: t('viewCase'),
            previous: t('previous'),
            next: t('next'),
            open: t('openCard'),
            close: t('closeCard'),
            keyboardHint: t('keyboardHint'),
            goToSlide: t('goToSlide', { index: '{index}' }),
          }}
        />
      </div>
    </section>
  );
}
