'use client';

import { useCallback, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { CAROUSEL_CONFIG } from './config';
import { CarouselCard } from './components/CarouselCard';
import styles from './TiltedCardCarousel.module.css';
import type { TiltedCardCarouselProps } from './types';

/**
 * A3 — the Experience & Selected Work carousel.
 *
 * Cards sit on an arc: each step away from centre rotates 60° about Y, scales
 * down, blurs slightly and pushes back in Z. Clicking the front card squares it
 * to the viewer and springs open a preview with the summary, the development
 * areas and the technology chips.
 *
 * Content arrives entirely through props — this module contains no copy, no
 * routes and no locale awareness.
 */
export function TiltedCardCarousel({
  cards,
  hrefFor,
  labels,
  className,
}: TiltedCardCarouselProps) {
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const move = useCallback(
    (direction: -1 | 1) => {
      setOpenIndex(null);
      setActive((current) => {
        const next = current + direction;
        // Clamped rather than wrapped: with five entries in a deliberate order,
        // looping from the last back to the first would undercut the ranking.
        return Math.min(Math.max(next, 0), cards.length - 1);
      });
    },
    [cards.length],
  );

  const toggleOpen = useCallback((index: number) => {
    setActive(index);
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        move(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        move(1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleOpen(active);
        break;
      case 'Escape':
        setOpenIndex(null);
        break;
      default:
        break;
    }
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {/* The stage is the keyboard entry point: one tab stop for the whole
          carousel, then arrows to browse — the same model as a listbox. */}
      <div
        ref={stageRef}
        className={styles.stage}
        role="group"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="carousel"
        aria-label={labels.keyboardHint}
      >
        <ul className={styles.track}>
          {cards.map((card, index) => {
            const offset = index - active;
            if (Math.abs(offset) > CAROUSEL_CONFIG.visibleRange) return null;
            return (
              <CarouselCard
                key={card.slug}
                card={card}
                offset={offset}
                isActive={index === active}
                isOpen={openIndex === index}
                href={hrefFor(card.slug)}
                labels={labels}
                onSelect={() => toggleOpen(index)}
              />
            );
          })}
        </ul>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => move(-1)}
          disabled={active === 0}
          aria-label={labels.previous}
        >
          <FiChevronLeft aria-hidden />
        </button>

        <ul className={styles.dots}>
          {cards.map((card, index) => (
            <li key={card.slug}>
              <button
                type="button"
                className={styles.dot}
                data-active={index === active || undefined}
                aria-label={labels.goToSlide.replace('{index}', String(index + 1))}
                aria-current={index === active ? 'true' : undefined}
                onClick={() => {
                  setOpenIndex(null);
                  setActive(index);
                }}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => move(1)}
          disabled={active === cards.length - 1}
          aria-label={labels.next}
        >
          <FiChevronRight aria-hidden />
        </button>
      </div>

      <p className={styles.hint}>{labels.keyboardHint}</p>
    </div>
  );
}
