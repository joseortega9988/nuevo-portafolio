import { TECH_CATEGORIES } from '@/data/technologies';
import type { Technology } from '@/data/types';
import { accentStyle } from '@/lib/accent';

import styles from './TechChip.module.css';

export interface TechChipProps {
  tech: Technology;
  size?: 'sm' | 'md';
}

const ACCENT_BY_CATEGORY = new Map(
  TECH_CATEGORIES.map((category) => [category.id, category.accent]),
);

/**
 * Icon + name pill, tinted by the technology's category accent.
 *
 * Shared by the carousel preview, the project grid and the detail pages, so a
 * technology looks identical everywhere it appears.
 */
export function TechChip({ tech, size = 'md' }: TechChipProps) {
  const accent = ACCENT_BY_CATEGORY.get(tech.category) ?? 'cyan';

  return (
    <span className={styles.chip} data-size={size} style={accentStyle(accent)}>
      <tech.Icon aria-hidden className={styles.icon} />
      {tech.name}
    </span>
  );
}
