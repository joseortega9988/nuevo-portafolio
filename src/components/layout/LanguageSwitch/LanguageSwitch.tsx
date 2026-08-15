'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, type Locale } from '@/i18n/routing';

import styles from './LanguageSwitch.module.css';

/**
 * Flags, as emoji rather than images: no request, no asset to keep in sync
 * with LOCALES, and they inherit the button's own size.
 *
 * Decorative only — they are marked aria-hidden and the locale code beside
 * them carries the meaning, because a flag names a country and not a language.
 */
const FLAGS: Record<Locale, string> = { en: '🇬🇧', es: '🇪🇸' };

/**
 * A two-state toggle, not a dropdown (§E 4).
 *
 * `usePathname` from next-intl returns the path *without* the locale segment,
 * so replacing with a different locale swaps only that segment and keeps the
 * rest of the URL. `scroll: false` is what preserves the reading position —
 * without it Next would jump the visitor back to the top mid-section.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('nav');

  const switchTo = (locale: Locale) => {
    if (locale === active) return;
    startTransition(() => {
      // `pathname` here is the already-resolved path minus the locale segment
      // (e.g. "/projects/my-time"), so replacing it under a different locale
      // preserves dynamic segments without rebuilding them.
      router.replace(pathname, { locale, scroll: false });
    });
  };

  return (
    <div
      className={[styles.group, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={t('switchLanguage')}
      data-pending={isPending || undefined}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className={styles.option}
          aria-pressed={locale === active}
          onClick={() => switchTo(locale)}
        >
          <span className={styles.flag} aria-hidden>
            {FLAGS[locale]}
          </span>
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
