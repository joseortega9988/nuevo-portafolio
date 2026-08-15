'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

import { Link, usePathname, useRouter } from '@/i18n/navigation';

import { CvDownloadButton } from '../CvDownloadButton';
import { LanguageSwitch } from '../LanguageSwitch';
import { NAV_ITEMS } from './navItems';
import styles from './MobileMenu.module.css';

/**
 * pointerEvents is animated alongside opacity, deliberately.
 *
 * AnimatePresence does not always take this node back out of the DOM — after a
 * route change it was observed still mounted at opacity 0, full-screen, with
 * pointer-events auto. Invisible but hit-testable, it swallowed the first tap
 * anywhere on the new page, which read as the site being slow to respond.
 * Tying pointer-events to the same variants means a node left behind like that
 * is inert whatever AnimatePresence does with it.
 */
const PANEL = {
  hidden: { opacity: 0, pointerEvents: 'none' as const },
  visible: {
    opacity: 1,
    pointerEvents: 'auto' as const,
    transition: { duration: 0.32, staggerChildren: 0.07 },
  },
  exit: {
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: { duration: 0.24 },
  },
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
  const router = useRouter();

  // Held in a ref so the effects below can depend on `pathname` and `open`
  // alone. Depending on the callback itself is what made this menu open and
  // then immediately shut: the parent passes an inline arrow, so every render
  // produced a new identity and re-fired the close-on-navigation effect.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const previousPath = useRef(pathname);

  // Close on route change only — not on mount, and not on re-render.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    onCloseRef.current();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    // Lenis keeps scrolling the page behind a fixed overlay otherwise.
    document.documentElement.classList.add('lenis-stopped');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lenis-stopped');
    };
  }, [open]);

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
                {/*
                  Navigate first, then close — both explicitly.

                  Leaving it to the Link's own click meant closing the menu
                  tore this overlay, and the Link inside it, down before Next
                  had finished handling that click: the menu shut and the page
                  never changed. Not closing at all fixed the navigation but
                  left the menu covering the new page. Pushing the route
                  ourselves puts the navigation beyond anything unmounting can
                  cancel, so the close is then safe to do immediately and the
                  tap feels instant.

                  The href stays on the Link so it remains a real link —
                  middle-click, long-press and "open in new tab" all still work,
                  and it is still crawlable.
                */}
                <Link
                  href={item.href}
                  className={styles.link}
                  onClick={(event) => {
                    // Let modified clicks (new tab, download) behave normally.
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return;
                    }
                    event.preventDefault();
                    router.push(item.href);
                    onClose();
                  }}
                >
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
