'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import styles from './Carousel.module.css';

export interface CarouselImage {
  src: string;
  alt: string;
}

export interface CarouselLabels {
  previous: string;
  next: string;
  /** Template containing `{index}` and `{total}`. */
  imageOf: string;
}

export interface CarouselProps {
  images: readonly CarouselImage[];
  labels: CarouselLabels;
}

/** Below this many pixels a drag is treated as a tap, not a swipe. */
const SWIPE_THRESHOLD = 48;

export function Carousel({ images, labels }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const dragStart = useRef<number | null>(null);

  const go = useCallback(
    (direction: -1 | 1) => {
      setIndex((current) => {
        const next = current + direction;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    dragStart.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    go(delta > 0 ? -1 : 1);
  };

  if (images.length === 0) return null;

  const label = labels.imageOf
    .replace('{index}', String(index + 1))
    .replace('{total}', String(images.length));

  return (
    <div className={styles.root}>
      <div
        className={styles.viewport}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* One track translated by index rather than swapping <img> elements:
            the browser keeps every decoded frame, so repeat visits to a slide
            are instant. */}
        <div
          className={styles.track}
          style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
        >
          {images.map((image, i) => (
            <figure key={image.src} className={styles.slide} aria-hidden={i !== index}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className={styles.image}
                // Only the first frame is worth blocking on; the rest are
                // below the fold of the visitor's attention.
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
              />
            </figure>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => go(-1)}
            aria-label={labels.previous}
          >
            <FiChevronLeft aria-hidden />
          </button>

          <ul className={styles.dots}>
            {images.map((image, i) => (
              <li key={image.src}>
                <button
                  type="button"
                  className={styles.dot}
                  data-active={i === index || undefined}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={labels.imageOf
                    .replace('{index}', String(i + 1))
                    .replace('{total}', String(images.length))}
                  onClick={() => setIndex(i)}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={styles.arrow}
            onClick={() => go(1)}
            aria-label={labels.next}
          >
            <FiChevronRight aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
