import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ENTRIES, getEntry } from '@/data/entries';
import { routing } from '@/i18n/routing';
import { readLocale, resolveLocale } from '@/i18n/resolveLocale';
import { EntryDetailSection } from '@/sections/detail/EntryDetailSection';

type EntryParams = Promise<{ locale: string; slug: string }>;

/**
 * Ten static pages: five entries across two locales. The list is derived from
 * the data, so publishing a sixth entry adds its page automatically (§B).
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ENTRIES.map((entry) => ({ locale, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: EntryParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await readLocale(params);
  const entry = getEntry(slug);
  if (!entry) return {};

  const title = entry.title[locale];
  const description = entry.shortDescription[locale];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: entry.images?.[0] ? [entry.images[0].src] : undefined,
    },
    alternates: {
      languages: {
        en: `/en/projects/${entry.slug}`,
        es: `/es/projects/${entry.slug}`,
      },
    },
  };
}

export default async function EntryPage({ params }: { params: EntryParams }) {
  const { slug } = await params;
  const locale = await resolveLocale(params);

  const entry = getEntry(slug);
  if (!entry) notFound();

  return (
    <main>
      <EntryDetailSection entry={entry} locale={locale} />
    </main>
  );
}
