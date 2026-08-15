import type { CardViewModel } from '@/data/types';

export interface ThrownCardsGridProps {
  cards: readonly CardViewModel[];
  hrefFor: (slug: CardViewModel['slug']) => string;
  labels: ThrownCardsLabels;
  /** Flips to true once the hero torus has dissolved, releasing the throw. */
  active?: boolean;
  className?: string;
  /** Shown only while the deck is scattered — the phase that answers the
   *  pointer. Omitted, nothing is rendered. */
  pointerHint?: string;
}

export interface ThrownCardsLabels {
  experience: string;
  project: string;
  viewCase: string;
}
