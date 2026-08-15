import type { MetadataRoute } from 'next';

import { ENTRIES } from '@/data/entries';
import { routing } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/siteUrl';

/**
 * Built from the same data the pages are, so it cannot drift: adding an entry
 * adds its URLs, and the dev routes never appear because they are not in it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const languagesFor = (path: string) =>
    Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}${path}`]));

  return routing.locales.flatMap((locale) => [
    {
      url: `${base}/${locale}`,
      changeFrequency: 'monthly' as const,
      priority: 1,
      alternates: { languages: languagesFor('') },
    },
    {
      url: `${base}/${locale}/projects`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: { languages: languagesFor('/projects') },
    },
    ...ENTRIES.map((entry) => ({
      url: `${base}/${locale}/projects/${entry.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
      alternates: { languages: languagesFor(`/projects/${entry.slug}`) },
    })),
  ]);
}
