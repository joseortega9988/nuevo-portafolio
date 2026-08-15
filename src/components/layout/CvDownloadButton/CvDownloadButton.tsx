'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FiDownload } from 'react-icons/fi';

import { CV_DOWNLOAD_NAMES, CV_FILES } from '@/data/social';
import type { Locale } from '@/i18n/routing';

import styles from './CvDownloadButton.module.css';

export interface CvDownloadButtonProps {
  variant?: 'solid' | 'ghost';
  className?: string;
}

/**
 * Serves the CV matching the active locale (§E 3). Nothing else in the app
 * knows the file paths, so replacing the Spanish PDF is a one-line change in
 * src/data/social.ts.
 */
export function CvDownloadButton({
  variant = 'ghost',
  className,
}: CvDownloadButtonProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('nav');

  return (
    <a
      href={CV_FILES[locale]}
      download={CV_DOWNLOAD_NAMES[locale]}
      className={[styles.button, styles[variant], className]
        .filter(Boolean)
        .join(' ')}
    >
      <FiDownload aria-hidden className={styles.icon} />
      {/* "Download CV" on a phone left no room for the burger and the language
          toggle beside it. The verb is dropped there and the icon carries it —
          the label stays in the accessible name either way. */}
      <span className={styles.full}>{t('downloadCv')}</span>
      <span className={styles.short} aria-hidden>
        {t('cvShort')}
      </span>
    </a>
  );
}
