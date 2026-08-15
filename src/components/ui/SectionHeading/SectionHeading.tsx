import styles from './SectionHeading.module.css';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
  /** Adds the scrim that keeps text at AA contrast over an animated
   *  background (§G). Off for sections that sit on a flat surface. */
  scrim?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  scrim = false,
}: SectionHeadingProps) {
  return (
    <header className={styles.header} data-align={align} data-scrim={scrim || undefined}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
