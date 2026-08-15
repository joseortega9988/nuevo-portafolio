import type { Metadata } from 'next';

import { readLocale, resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';
import { getTranslations } from 'next-intl/server';

import { ProjectsExperience } from './ProjectsExperience';

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
    alternates: {
      languages: { en: '/en/projects', es: '/es/projects' },
    },
  };
}

export default async function ProjectsPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <ProjectsExperience />;
}
