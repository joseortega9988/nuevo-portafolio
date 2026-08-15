'use client';

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

import { TiltedCardCarousel } from '@/animations/tilted-card-carousel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCardViewModels } from '@/data/viewModels';
import type { Locale } from '@/i18n/routing';
import { useInViewport } from '@/lib/motion/useInViewport';
import { useScrollProgress } from '@/lib/motion/useScrollProgress';
import { useScrollTo } from '@/lib/motion/useScrollTo';
import { MOUNT_MARGINS } from '@/lib/webgl/contextBudget';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './ExperienceProjectsSection.module.css';

const SunsetScrollSea = dynamic(
  () => import('@/animations/sunset-scroll-sea').then((m) => m.SunsetScrollSea),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Reshapes linear scroll into the sun's actual travel.
 *
 * Raw progress would move the sun at a constant rate, which reads as unrelated
 * to the cards. Instead each card gets a band, and within a band the sun moves
 * quickly at the edges and holds through the middle. The effect is that the sky
 * changes *as one card gives way to the next* and settles while a card is
 * centred and being read — the transition belongs to the hand-off, not to the
 * dwell.
 */
function shapeSunProgress(raw: number, bands: number): number {
  const scaled = raw * bands;
  const index = Math.min(bands - 1, Math.floor(scaled));
  const t = Math.min(1, scaled - index);
  // Steep near t=0 and t=1 (either side of a card change), flat between.
  const eased = 0.5 * (smoothstep(0, 0.32, t) + smoothstep(0.68, 1, t));
  return (index + eased) / bands;
}

/**
 * Experience and selected work — one carousel carrying both, in the canonical
 * order (§E, explicit and non-negotiable).
 *
 * One scroll drives everything. The section's normalised progress feeds the
 * sea's phase *and* selects the active card, so the sun descends as the cards
 * advance and the two can never drift apart. 'section' mode is what makes the
 * phase reach 1 exactly as the section's bottom edge meets the viewport's,
 * which puts full darkness precisely at the handoff.
 *
 * The arrows, dots and arrow keys do not move the carousel directly — they
 * scroll the page to the position that shows that card, which keeps scroll as
 * the single source of truth.
 */
export function ExperienceProjectsSection() {
  const t = useTranslations('work');
  const tEntry = useTranslations('entryTypes');
  const locale = useLocale() as Locale;

  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: MOUNT_MARGINS.sea });
  const paused = useRafPause(visible);

  const cards = getCardViewModels(locale);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * The value the sea actually reads. It is the raw scroll progress reshaped
   * by shapeSunProgress, held in its own ref so the shader can sample it every
   * frame without this component re-rendering.
   */
  const sunProgress = useRef(0);

  /**
   * Each card gets an equal band of the scroll — including the last, which
   * would otherwise only be active for the final instant.
   */
  useScrollProgress(sectionRef, {
    mode: 'section',
    onChange: (value) => {
      sunProgress.current = shapeSunProgress(value, cards.length);
      const index = Math.min(
        cards.length - 1,
        Math.floor(value * cards.length),
      );
      setActiveIndex((current) => (current === index ? current : index));
    },
  });

  // The inverse mapping: scroll to the middle of a card's band. Routed through
  // useScrollTo because a bare window.scrollTo is overwritten by Lenis on the
  // next frame — the arrows and dots would appear to do nothing.
  const scrollTo = useScrollTo();
  const scrollToIndex = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const travel = section.offsetHeight - window.innerHeight;
      scrollTo(section.offsetTop + ((index + 0.5) / cards.length) * travel);
    },
    [cards.length, scrollTo],
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.canvas} aria-hidden>
        <SunsetScrollSea progress={sunProgress} paused={paused} />
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
          activeIndex={activeIndex}
          onRequestIndex={scrollToIndex}
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
