import type { IconType } from 'react-icons';

import type { ColorToken } from '@/lib/palette';
import type { Locale } from '@/i18n/routing';

/** Every visitor-facing string carries both languages. */
export type LocalizedText = Record<Locale, string>;

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/* ── Technologies ───────────────────────────────────────────────────────── */

export type TechCategoryId = 'frontend' | 'backend' | 'data' | 'tools';

export interface TechCategory {
  id: TechCategoryId;
  /** Which palette token tints this cluster's hexagons (§F). */
  accent: ColorToken;
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategoryId;
  /** Bundled react-icons component — never a hotlinked remote image. */
  Icon: IconType;
}

/* ── Portfolio entries ──────────────────────────────────────────────────── */

export type EntryType = 'experience' | 'project';

export type EntrySlug =
  | 'tight-line'
  | 'theodo-uk'
  | 'takehome-challenge'
  | 'my-time'
  | 'breast-cancer-detection';

/** Ordered by resource kind so the detail page can render links generically. */
export type EntryLinkKind = 'github' | 'documentation' | 'apk' | 'apiDocs';

export interface EntryLink {
  kind: EntryLinkKind;
  href: string;
}

export interface EntryImage {
  src: string;
  /** Alt text is content, so it is localized like everything else. */
  alt: LocalizedText;
}

export interface EntryPeriod {
  /** Already-formatted month+year, localized ("Dec 2024" / "Dic 2024"). */
  start: LocalizedText;
  /** null means the role is current — rendered as "Present" / "Actualidad". */
  end: LocalizedText | null;
}

export interface PortfolioEntry {
  slug: EntrySlug;
  type: EntryType;
  title: LocalizedText;
  /** Employer, for experience entries. */
  organization?: string;
  period?: EntryPeriod;
  shortDescription: LocalizedText;
  description: LocalizedText;
  developmentAreas: LocalizedText;
  topicsSummary?: LocalizedText;
  /** Measurable outcomes. Experience entries show these instead of a gallery. */
  highlights?: readonly LocalizedText[];
  /** Technology ids — resolved against TECHNOLOGIES so icons stay consistent. */
  technologies: readonly string[];
  images?: readonly EntryImage[];
  links?: readonly EntryLink[];
}

/* ── View models (§B — Interface Segregation) ───────────────────────────── */

/**
 * What a card is handed. Deliberately *not* the whole PortfolioEntry: a card
 * has no business knowing about the full description or the image gallery.
 */
export interface CardViewModel {
  slug: EntrySlug;
  type: EntryType;
  title: string;
  shortDescription: string;
  developmentAreas: string;
  /**
   * Formatted, localized date range — "Jun 2021 — Nov 2024", or the start and
   * a "Present" for a current role. Only the two experience entries have one;
   * projects carry no period, so cards must treat this as optional.
   */
  period?: string;
  technologies: readonly Technology[];
  /**
   * The entry's lead image, when it has one. Absent for the two roles and for
   * the take-home, which have no screenshots — cards fall back to a tokened
   * panel rather than to a stand-in photo.
   */
  thumbnail?: { src: string; alt: string };
}
