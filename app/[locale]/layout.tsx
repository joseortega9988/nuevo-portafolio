import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

import { BootLoaderHost } from '@/components/layout/BootLoaderHost';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { SceneReadyProvider } from '@/lib/motion/SceneReady';
import { routing } from '@/i18n/routing';
import { readLocale, resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';
import { LenisProvider } from '@/lib/motion/LenisProvider';
import { getSiteUrl } from '@/lib/siteUrl';
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
    metadataBase: new URL(getSiteUrl()),
    title: { default: t('home.title'), template: `%s — ${t('siteName')}` },
    description: t('home.description'),
    // Icons come from app/icon.png and app/apple-icon.png, which Next wires up
    // automatically at the right sizes — the 758 KB source logo is not served.
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title: t('home.title'),
      description: t('home.description'),
      locale,
    },
  };
}

/**
 * The one place Navbar and Footer are rendered (§B injectability). ESLint
 * rejects an import of either from any page or section file, so a page that
 * wants a different chrome passes a `variant` rather than duplicating them.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);

  /*
   * suppressHydrationWarning below is for browser extensions, not for our own
   * markup. Dark Reader and similar stamp attributes onto <html> —
   * data-darkreader-mode, data-darkreader-scheme, data-darkreader-proxy-injected
   * — before React hydrates, and React then reports a mismatch that nothing in
   * this codebase can prevent. The flag is shallow: it covers this element's
   * own attributes only, so a genuine mismatch anywhere inside the tree is
   * still reported.
   */
  return (
    <html
      lang={locale}
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider>
          <LenisProvider>
            <SceneReadyProvider>
              {/* Above the page transition on purpose: the transition's fade
                  creates a stacking context, and the overlay nested inside it
                  painted beneath the navbar however high its z-index. */}
              <BootLoaderHost />
              <Navbar />
              <PageTransition>{children}</PageTransition>
              <Footer />
            </SceneReadyProvider>
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
