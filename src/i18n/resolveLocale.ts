import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from './routing';

export type LocaleParams = Promise<{ locale: string }>;

/**
 * Every route does the same three things with its locale segment: validate it,
 * narrow `string` to `Locale` for the typed message catalogue, and opt into
 * static rendering. Doing it in one place keeps that boilerplate out of the
 * pages and guarantees no route forgets `setRequestLocale` (which would
 * silently make the page dynamic).
 */
export async function resolveLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  return locale;
}

/** Same validation without the static-rendering opt-in, for generateMetadata. */
export async function readLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
