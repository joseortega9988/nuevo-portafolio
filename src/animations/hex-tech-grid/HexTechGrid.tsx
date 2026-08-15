import { accentStyle } from '@/lib/accent';

import { hexGeometryStyle } from './config';
import styles from './HexTechGrid.module.css';
import type { HexTechGridProps } from './types';

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
                <span className={styles.name}>{tech.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
