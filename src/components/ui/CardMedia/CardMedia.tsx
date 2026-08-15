import Image from 'next/image';

import type { CardViewModel } from '@/data/types';

import styles from './CardMedia.module.css';

export interface CardMediaProps {
  card: CardViewModel;
  /** `banner` is the slim band used where vertical room is tight. */
  ratio?: 'wide' | 'tall' | 'banner';
  priority?: boolean;
}

/**
 * The image band at the top of a card, shared by the Home carousel and the
 * Projects grid so an entry looks the same wherever it appears.
 *
 * Entries with no screenshots — the two roles and the take-home API — get a
 * tokened panel carrying their own technology marks rather than a stock photo
 * or an empty box. Nothing here stands in for work that does not exist.
 */
export function CardMedia({ card, ratio = 'wide', priority = false }: CardMediaProps) {
  if (card.thumbnail) {
    return (
      <div className={styles.media} data-ratio={ratio}>
        <Image
          src={card.thumbnail.src}
          alt={card.thumbnail.alt}
          fill
          sizes="(max-width: 900px) 90vw, 420px"
          className={styles.image}
          priority={priority}
        />
        <span className={styles.scrim} aria-hidden />
      </div>
    );
  }

  return (
    <div className={styles.media} data-ratio={ratio} data-fallback aria-hidden>
      <ul className={styles.marks}>
        {card.technologies.slice(0, 5).map((tech) => (
          <li key={tech.id}>
            <tech.Icon />
          </li>
        ))}
      </ul>
    </div>
  );
}
