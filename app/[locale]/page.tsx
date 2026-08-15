import { useTranslations } from 'next-intl';

import { resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';

export default async function HomePage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('hero');
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-step-6">{t('title')}</h1>
    </main>
  );
}
