'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { Badge } from '@/components/ui/Badge';
import { CardMedia } from '@/components/ui/CardMedia';
import { TechChip } from '@/components/ui/TechChip';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

import { SCATTER_SLOTS } from './config';
import { usePointerParallax } from './hooks/usePointerParallax';
import { useThrowSequence } from './hooks/useThrowSequence';
import styles from './ThrownCardsGrid.module.css';
import type { ThrownCardsGridProps } from './types';

const CARD_SELECTOR = '[data-card]';

/**
 * A8 — the Projects page reveal.
 *
 * Three phases over one set of DOM nodes: the cards are thrown in from
 * off-screen, they float and answer the pointer, and then scroll settles those
 * same elements into the final grid via Flip. Nothing cross-fades; there is
 * only ever one card per entry in the document.
 *
 * Static fallback under reduced motion: the grid, faded in, with no throw,
 * no float and no parallax.
 */
export function ThrownCardsGrid({
  cards,
  hrefFor,
  labels,
  active = true,
  className,
}: ThrownCardsGridProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { phase, settling } = useThrowSequence(
    stageRef,
    CARD_SELECTOR,
    active,
    reducedMotion,
  );

  usePointerParallax(stageRef, CARD_SELECTOR, phase === 'scattered' && !reducedMotion);

  return (
    <div
      ref={stageRef}
      className={[styles.stage, className].filter(Boolean).join(' ')}
      data-phase={phase}
      data-settling={settling || undefined}
    >
      <ul data-track className={styles.track}>
        {cards.map((card, index) => {
          const slot = SCATTER_SLOTS[index % SCATTER_SLOTS.length];
          return (
            <li
              key={card.slug}
              data-card
              data-depth={slot?.depth ?? 0.5}
              className={styles.card}
              style={
                phase === 'grid'
                  ? undefined
                  : {
                      top: `${slot?.top ?? 0}%`,
                      left: `${slot?.left ?? 0}%`,
                      rotate: `${slot?.rotate ?? 0}deg`,
                    }
              }
            >
              <div data-float className={styles.float}>
                <div data-parallax className={styles.parallax}>
                  <Link href={hrefFor(card.slug)} className={styles.link}>
                    <article className={styles.inner}>
                      <CardMedia card={card} ratio="wide" priority={index < 2} />
                      <Badge type={card.type}>
                        {card.type === 'experience' ? labels.experience : labels.project}
                      </Badge>
                      <h3 className={styles.title}>{card.title}</h3>
                      <p className={styles.summary}>{card.shortDescription}</p>
                      <ul className={styles.chips}>
                        {card.technologies.slice(0, 4).map((tech) => (
                          <li key={tech.id}>
                            <TechChip tech={tech} size="sm" />
                          </li>
                        ))}
                      </ul>
                      <span className={styles.cta}>
                        {labels.viewCase} <span aria-hidden>→</span>
                      </span>
                    </article>
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
