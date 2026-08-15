import type { EntryType } from '@/data/types';

import styles from './Badge.module.css';

export interface BadgeProps {
  type: EntryType;
  children: React.ReactNode;
}

/**
 * The Experience / Project marker. Experience is warm, project is cool — the
 * one place the two kinds of entry are visually distinguished, since they
 * deliberately share the same carousel and the same grid.
 */
export function Badge({ type, children }: BadgeProps) {
  return (
    <span className={styles.badge} data-type={type}>
      {children}
    </span>
  );
}
