'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { usePathname } from '@/i18n/navigation';

import styles from './PageTransition.module.css';

/**
 * A short fade-in between routes so navigation never snaps.
 *
 * Deliberately restrained. The pages already open with their own choreography
 * (thrown cards, staggered detail reveal), so a heavier transition would only
 * delay the thing the visitor actually asked for.
 *
 * Keyed on the pathname: React remounts the subtree on navigation, which is
 * what replays the fade. No AnimatePresence — there is no exit animation to
 * wait for, and keeping the outgoing page mounted would briefly double the
 * live WebGL contexts (restriction 13).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
