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
/**
 * `presentLabel` is the caller's translation for an open-ended role. It is
 * passed in rather than read here because this module is deliberately free of
 * next-intl — it is a pure projection over the data, callable from a server
 * component, a client component or a test without a provider in scope.
 */
export function toCardViewModel(
  entry: PortfolioEntry,
  locale: Locale,
  presentLabel: string,
): CardViewModel {
  const lead = entry.images?.[0];
  const period = entry.period
    ? `${entry.period.start[locale]} — ${entry.period.end?.[locale] ?? presentLabel}`
    : undefined;

  return {
    slug: entry.slug,
    type: entry.type,
    title: entry.title[locale],
    shortDescription: entry.shortDescription[locale],
    developmentAreas: entry.developmentAreas[locale],
    ...(period ? { period } : {}),
    technologies: resolveTechnologies(entry.technologies),
    ...(lead ? { thumbnail: { src: lead.src, alt: lead.alt[locale] } } : {}),
  };
}

/** Every entry as a card, in the canonical order. Used by both the Home
 *  carousel and the Projects grid, so the two can never diverge. */
export function getCardViewModels(
  locale: Locale,
  presentLabel: string,
): readonly CardViewModel[] {
  return ENTRIES.map((entry) => toCardViewModel(entry, locale, presentLabel));
}
