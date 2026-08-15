import type { CardViewModel } from '@/data/types';

export interface ThrownCardsGridProps {
  cards: readonly CardViewModel[];
  hrefFor: (slug: CardViewModel['slug']) => string;
  labels: ThrownCardsLabels;
  /** Flips to true once the hero torus has dissolved, releasing the throw. */
  active?: boolean;
  className?: string;
}

export interface ThrownCardsLabels {
  experience: string;
  project: string;
  viewCase: string;
}
