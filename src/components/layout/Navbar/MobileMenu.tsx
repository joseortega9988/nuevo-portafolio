'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

import { Link, usePathname } from '@/i18n/navigation';

import { CvDownloadButton } from '../CvDownloadButton';
import { LanguageSwitch } from '../LanguageSwitch';
import { NAV_ITEMS } from './navItems';
import styles from './MobileMenu.module.css';

const PANEL = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, staggerChildren: 0.07 } },
  exit: { opacity: 0, transition: { duration: 0.24 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.8 } },
} as const;

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Close on route change: without this the overlay would survive navigation
  // and cover the page the visitor just asked for.
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Lenis keeps scrolling the page behind a fixed overlay otherwise.
    document.documentElement.classList.add('lenis-stopped');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lenis-stopped');
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          variants={PANEL}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.close}
            aria-label={t('closeMenu')}
            onClick={onClose}
            autoFocus
          >
            <FiX aria-hidden />
          </button>

          <ul className={styles.list}>
            {NAV_ITEMS.map((item) => (
              <motion.li key={item.href} variants={ITEM}>
                <Link href={item.href} className={styles.link} onClick={onClose}>
                  {t(item.labelKey)}
                </Link>
              </motion.li>
            ))}
          </ul>

          <motion.div className={styles.footer} variants={ITEM}>
            <LanguageSwitch />
            <CvDownloadButton variant="solid" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
