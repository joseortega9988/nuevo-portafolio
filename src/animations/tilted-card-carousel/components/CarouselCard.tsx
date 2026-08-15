'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { CardMedia } from '@/components/ui/CardMedia';
import { TechChip } from '@/components/ui/TechChip';
import type { CardViewModel } from '@/data/types';

import { CAROUSEL_CONFIG } from '../config';
import type { CarouselLabels } from '../types';
import styles from '../TiltedCardCarousel.module.css';

export interface CarouselCardProps {
  card: CardViewModel;
  /** Signed distance from the active card: 0 is front and centre. */
  offset: number;
  isActive: boolean;
  isOpen: boolean;
  href: string;
  labels: CarouselLabels;
  onSelect: () => void;
}

const { rotationStep, offsetStep, inactiveScale, inactiveBlurPx, depthStep, spring } =
  CAROUSEL_CONFIG;

export function CarouselCard({
  card,
  offset,
  isActive,
  isOpen,
  href,
  labels,
  onSelect,
}: CarouselCardProps) {
  // An opened card faces the viewer square-on and lifts toward the camera;
  // otherwise it sits at its place on the arc.
  const rotateY = isOpen ? 0 : -offset * rotationStep;
  const z = isOpen ? 120 : Math.abs(offset) * depthStep;

  return (
    <motion.li
      className={styles.slide}
      animate={{
        rotateY,
        z,
        x: `${offset * offsetStep * 100}%`,
        scale: isActive ? 1 : inactiveScale,
        opacity: Math.abs(offset) > 2 ? 0 : 1,
      }}
      transition={spring}
      style={{ zIndex: 10 - Math.abs(offset) }}
      data-active={isActive || undefined}
      data-open={isOpen || undefined}
    >
      <motion.article
        className={styles.card}
        // Only the resting card is a button; once open, the panel inside owns
        // the interactions and a wrapping button would swallow them.
        onClick={isOpen ? undefined : onSelect}
        role={isOpen ? undefined : 'button'}
        tabIndex={isOpen ? undefined : -1}
        aria-label={isOpen ? undefined : `${labels.open}: ${card.title}`}
        animate={{ filter: isActive ? 'blur(0px)' : `blur(${inactiveBlurPx}px)` }}
        transition={spring}
      >
        <CardMedia card={card} ratio="banner" priority={isActive} />

        <div className={styles.cardHead}>
          <div className={styles.cardMeta}>
            <Badge type={card.type}>
              {card.type === 'experience' ? labels.experience : labels.project}
            </Badge>
            {card.period && <span className={styles.cardPeriod}>{card.period}</span>}
          </div>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          {/* The resting card used to stop at the title, which said what a
              thing was called but nothing about what it is. Hidden once the
              card opens, where the preview carries the same text alongside the
              areas and the stack. */}
          <p className={styles.cardSummary}>{card.shortDescription}</p>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.preview}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
            >
              <p className={styles.areas}>{card.developmentAreas}</p>
              <p className={styles.summary}>{card.shortDescription}</p>
              <ul className={styles.chips}>
                {card.technologies.map((tech) => (
                  <li key={tech.id}>
                    <TechChip tech={tech} size="sm" />
                  </li>
                ))}
              </ul>
              <Link href={href} className={styles.caseLink}>
                {labels.viewCase} <span aria-hidden>→</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </motion.li>
  );
}
