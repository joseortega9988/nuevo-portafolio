import type { CardViewModel } from '@/data/types';

export interface TiltedCardCarouselProps {
  /** Ordered cards. The animation never sources its own content (§B). */
  cards: readonly CardViewModel[];
  /**
   * Controlled active card. When supplied, scroll is the source of truth and
   * the carousel stops owning the index — the arrows and dots then ask the
   * host to move instead, via onRequestIndex.
   */
  activeIndex?: number;
  onRequestIndex?: (index: number) => void;
  /** Builds the detail route for a card — injected so the animation stays
   *  ignorant of routing and of the active locale. */
  hrefFor: (slug: CardViewModel['slug']) => string;
  /** Localized labels, passed in rather than read from a message catalogue,
   *  so this module has no i18n dependency. */
  labels: CarouselLabels;
  className?: string;
}

export interface CarouselLabels {
  experience: string;
  project: string;
  viewCase: string;
  previous: string;
  next: string;
  open: string;
  close: string;
  keyboardHint: string;
  /** Template containing `{index}`. */
  goToSlide: string;
}
