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
 * How much of the sun's arc is spent while the section is still sliding in,
 * before the first card is settled.
 *
 * Small on purpose: the sky should visibly answer the very first scroll, but
 * the substantial part of the journey still belongs to the card hand-offs.
 */
const SUN_ENTRY_SHARE = 0.18;

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
  // 'present' lives in the detail namespace. Reused rather than duplicated into
  // this one so the two places that render a role's dates can never disagree.
  const tDetail = useTranslations('detail');
  const locale = useLocale() as Locale;

  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: MOUNT_MARGINS.sea });
  const paused = useRafPause(visible);

  const cards = getCardViewModels(locale, tDetail('present'));
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * The value the sea actually reads. It is the raw scroll progress reshaped
   * by shapeSunProgress, held in its own ref so the shader can sample it every
   * frame without this component re-rendering.
   */
  const sunProgress = useRef(0);

  /**
   * Progress is measured from the moment the section is first touched, so the
   * sky answers the very first scroll rather than waiting a full viewport for
   * the section to reach the top.
   *
   * The two things it drives are split along that boundary. The sun spends a
   * small share of its arc during the entry, then does the rest in steps tied
   * to the card hand-offs. The cards themselves only begin once the section is
   * pinned — advancing them while it is still sliding in would burn two of the
   * five before the visitor could read any of them.
   */
  useScrollProgress(sectionRef, {
    mode: 'from-entry',
    onChange: (value) => {
      const section = sectionRef.current;
      if (!section) return;

      // Fraction of the section's travel spent sliding into view.
      const entry = Math.min(0.9, window.innerHeight / section.offsetHeight);
      const pinned = Math.min(1, Math.max(0, (value - entry) / (1 - entry)));

      sunProgress.current =
        value < entry
          ? (value / entry) * SUN_ENTRY_SHARE
          : SUN_ENTRY_SHARE +
            (1 - SUN_ENTRY_SHARE) * shapeSunProgress(pinned, cards.length);

      /**
       * Which card is active, with a deadband at each boundary.
       *
       * The raw band index alone made the carousel flip back and forth
       * constantly on a phone: `entry` is derived from window.innerHeight,
       * which changes as the browser's own chrome hides and shows during a
       * scroll, so `pinned` twitches every frame and any position sitting near
       * a boundary crossed it repeatedly. Requiring the scroll to travel
       * properly into the next band before committing means that twitch can no
       * longer move the card, while a real scroll still advances it.
       */
      const exact = pinned * cards.length;
      const raw = Math.min(cards.length - 1, Math.floor(exact));
      setActiveIndex((current) => {
        if (current === raw) return current;
        const into = exact - raw; // how far into the new band, 0→1
        const margin = 0.2;
        if (raw > current && into < margin) return current;
        if (raw < current && into > 1 - margin) return current;
        return raw;
      });
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

      // Invert the mapping above: find the pinned fraction that centres this
      // card, convert it back to overall progress, then to a scroll position.
      // Deriving it rather than reusing the old formula keeps the dots landing
      // on the card they name.
      const viewport = window.innerHeight;
      const height = section.offsetHeight;
      const entry = Math.min(0.9, viewport / height);
      const pinned = (index + 0.5) / cards.length;
      const progress = entry + pinned * (1 - entry);

      scrollTo(progress * height - viewport + section.offsetTop);
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
