import type { Locale } from '@/i18n/routing';

import { ENTRIES } from './entries';
import { resolveTechnologies } from './technologies';
import type { CardViewModel, PortfolioEntry } from './types';

/**
 * Projections from the data layer to the shapes the UI actually needs.
 *
 * Keeping these here rather than inside components is what lets a card receive
 * a CardViewModel instead of a whole PortfolioEntry (§B — Interface
 * Segregation): the carousel and the grid cannot accidentally depend on fields
 * that only the detail page should read.
 */
export function toCardViewModel(
  entry: PortfolioEntry,
  locale: Locale,
): CardViewModel {
  const lead = entry.images?.[0];

  return {
    slug: entry.slug,
    type: entry.type,
    title: entry.title[locale],
    shortDescription: entry.shortDescription[locale],
    developmentAreas: entry.developmentAreas[locale],
    technologies: resolveTechnologies(entry.technologies),
    ...(lead ? { thumbnail: { src: lead.src, alt: lead.alt[locale] } } : {}),
  };
}

/** Every entry as a card, in the canonical order. Used by both the Home
 *  carousel and the Projects grid, so the two can never diverge. */
export function getCardViewModels(locale: Locale): readonly CardViewModel[] {
  return ENTRIES.map((entry) => toCardViewModel(entry, locale));
}
