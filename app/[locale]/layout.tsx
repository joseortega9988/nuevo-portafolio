import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

import { routing } from '@/i18n/routing';
import { readLocale, resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';
import '@/styles/globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: t('home.title'),
      template: `%s — ${t('siteName')}`,
    },
    description: t('home.description'),
    icons: { icon: '/logo/LOGOCV.png' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);

  return (
    <html lang={locale} className={`${display.variable} ${mono.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
