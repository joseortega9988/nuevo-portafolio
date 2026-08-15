import type { routing } from '@/i18n/routing';
import type messages from './messages/en.json';

/**
 * Makes `t('hero.title')` typecheck against the real message catalogue, so a
 * missing or renamed key is a compile error rather than a runtime warning.
 * en.json is the reference shape — es.json must mirror it.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
