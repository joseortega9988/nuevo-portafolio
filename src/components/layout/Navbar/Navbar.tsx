'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FiMenu } from 'react-icons/fi';

import { OWNER } from '@/data/social';
import { Link, usePathname } from '@/i18n/navigation';

import { CvDownloadButton } from '../CvDownloadButton';
import { LanguageSwitch } from '../LanguageSwitch';
import { MobileMenu } from './MobileMenu';
import { NAV_ITEMS } from './navItems';
import styles from './Navbar.module.css';

export interface NavbarProps {
  /** `transparent` drops the glass panel so a full-bleed hero reads edge to
   *  edge. Both variants keep the same geometry, so nothing shifts. */
  variant?: 'default' | 'transparent';
}

/**
 * Rendered once, from app/[locale]/layout.tsx, and injected into every page
 * (§B injectability). ESLint rejects an import of this file from any page or
 * section — pass `variant` instead of rendering a second copy.
 */
export function Navbar({ variant = 'default' }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header} data-variant={variant}>
      <nav className={styles.inner} aria-label={t('home')}>
        <Link href="/" className={styles.logo}>
          <Image
            src={OWNER.logo}
            alt={t('logoAlt')}
            width={40}
            height={40}
            priority
            className={styles.logoImage}
          />
        </Link>

        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => {
            // Home is '/', so a prefix test would match everything — compare
            // exactly for it and by prefix for the nested project routes.
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  data-active={isActive || undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <LanguageSwitch />
          <CvDownloadButton className={styles.cv} />
          <button
            type="button"
            className={styles.burger}
            aria-label={t('openMenu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu aria-hidden />
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
