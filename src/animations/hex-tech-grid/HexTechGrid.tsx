import { Fragment } from 'react';

import type { Technology } from '@/data/types';
import { accentStyle } from '@/lib/accent';

import { hexGeometryStyle } from './config';
import styles from './HexTechGrid.module.css';
import type { HexTechGridProps } from './types';

/**
 * Tech ids whose name should always land on two lines, regardless of how
 * much room the cell has, requested case by case as a name read cramped
 * against a neighbour. Only a space-separated name needs listing here — a
 * hyphenated one already breaks via withHyphenBreaks below.
 */
const FORCE_LINE_BREAK: ReadonlySet<string> = new Set(['prisma']);

/**
 * Forces a line break after every hyphen in a name (e.g. "scikit-learn").
 *
 * Scoped to this one rendered span rather than the shared `name` string
 * itself, so `aria-label` and every other consumer of `tech.name` (TechChip
 * on a detail page, for one) still get the plain, unbroken string. A normal
 * wrap already breaks after a hyphen when a name is wider than its cell, but
 * that only kicks in once it actually overflows — this makes a hyphenated
 * name land on two lines every time, regardless of how much room it has.
 */
function withHyphenBreaks(name: string) {
  const parts = name.split('-');
  if (parts.length === 1) return name;

  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? '-' : ''}
      {i < parts.length - 1 && <br />}
    </Fragment>
  ));
}

/** Forces a break at the first space, for the names in FORCE_LINE_BREAK. */
function withSpaceBreak(name: string) {
  const spaceAt = name.indexOf(' ');
  if (spaceAt === -1) return name;

  return (
    <>
      {name.slice(0, spaceAt)}
      <br />
      {name.slice(spaceAt + 1)}
    </>
  );
}

function renderName(tech: Technology) {
  if (tech.name.includes('-')) return withHyphenBreaks(tech.name);
  if (FORCE_LINE_BREAK.has(tech.id)) return withSpaceBreak(tech.name);
  return tech.name;
}

/**
 * A5 — the technologies honeycomb.
 *
 * Pure CSS geometry: every hexagon is a clip-path, and the "stroke" is an
 * outer hexagon showing through behind a slightly inset inner one, because a
 * clip-path element cannot carry a border.
 *
 * The icon sits inside the hexagon and the name directly underneath it. That
 * label band is why rows are spaced a little further apart than a mathematically
 * tight honeycomb: alternate rows still offset by half a cell, which is what
 * carries the honeycomb read, but a tight vertical interlock would leave the
 * names nowhere to live. Noted in DECISIONS.md.
 *
 * No canvas and no JavaScript — this works with scripting disabled, and the
 * reduced-motion fallback is simply the same grid without the hover lift.
 */
export function HexTechGrid({ clusters, className }: HexTechGridProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={hexGeometryStyle()}
    >
      {clusters.map((cluster) => (
        <section
          key={cluster.id}
          className={styles.cluster}
          style={accentStyle(cluster.accent)}
          aria-labelledby={`tech-${cluster.id}`}
        >
          <h3 id={`tech-${cluster.id}`} className={styles.clusterLabel}>
            {cluster.label}
          </h3>

          <ul className={styles.comb}>
            {cluster.technologies.map((tech) => (
              <li
                key={tech.id}
                className={styles.cell}
                tabIndex={0}
                aria-label={tech.name}
              >
                <span className={styles.hex}>
                  <span className={styles.hexInner}>
                    <tech.Icon aria-hidden className={styles.icon} />
                  </span>
                </span>
                <span className={styles.name}>{renderName(tech)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
