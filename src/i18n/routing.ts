import { defineRouting } from 'next-intl/routing';

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  // 'always' keeps /en and /es symmetrical, which is what makes the language
  // toggle a pure segment swap that preserves the rest of the path (§E).
  localePrefix: 'always',
});

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
