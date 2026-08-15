import { getTranslations } from 'next-intl/server';
import { FiBookOpen, FiExternalLink, FiGithub, FiSmartphone } from 'react-icons/fi';
import type { IconType } from 'react-icons';

import { Badge } from '@/components/ui/Badge';
import { Carousel } from '@/components/ui/Carousel';
import { TechChip } from '@/components/ui/TechChip';
import { resolveTechnologies } from '@/data/technologies';
import type { EntryLinkKind, PortfolioEntry } from '@/data/types';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

import styles from './EntryDetailSection.module.css';

const LINK_ICONS: Record<EntryLinkKind, IconType> = {
  github: FiGithub,
  documentation: FiBookOpen,
  apk: FiSmartphone,
  apiDocs: FiExternalLink,
};

/** Literal union, not `string`: t() typechecks its key against the catalogue,
 *  so a renamed message is a compile error rather than a runtime warning. */
type DetailLinkLabel =
  | 'viewGithub'
  | 'viewDocumentation'
  | 'downloadApk'
  | 'viewApiDocs';

const LINK_LABEL_KEYS: Record<EntryLinkKind, DetailLinkLabel> = {
  github: 'viewGithub',
  documentation: 'viewDocumentation',
  apk: 'downloadApk',
  apiDocs: 'viewApiDocs',
};

/**
 * The isolated page for one entry.
 *
 * A server component: there is no WebGL here and nothing interactive except
 * the carousel, so almost none of this needs to ship as JavaScript. The
 * entrance is a CSS stagger — fade and a 24px rise — driven by an index custom
 * property, which costs nothing and needs no library.
 *
 * Experience entries take a different shape: achievements and stack instead of
 * a gallery, and no external links, because there is no public repository.
 */
export async function EntryDetailSection({
  entry,
  locale,
}: {
  entry: PortfolioEntry;
  locale: Locale;
}) {
  const t = await getTranslations('detail');
  const tEntry = await getTranslations('entryTypes');

  const technologies = resolveTechnologies(entry.technologies);
  const images = entry.images ?? [];
  const links = entry.links ?? [];
  const isExperience = entry.type === 'experience';

  let step = 0;
  const rise = () => ({ '--i': step++ }) as React.CSSProperties;

  return (
    <article className={styles.article}>
      <Link href="/projects" className={styles.back} style={rise()}>
        <span aria-hidden>←</span> {t('backToProjects')}
      </Link>

      <header className={styles.header} style={rise()}>
        <div className={styles.meta}>
          <Badge type={entry.type}>
            {isExperience ? tEntry('experience') : tEntry('project')}
          </Badge>
          {entry.period && (
            <span className={styles.period}>
              {entry.period.start[locale]} —{' '}
              {entry.period.end ? entry.period.end[locale] : t('present')}
            </span>
          )}
        </div>
        <h1 className={styles.title}>{entry.title[locale]}</h1>
        <p className={styles.lead}>{entry.shortDescription[locale]}</p>
      </header>

      {/* Directly under the title: the visitor knows what they are looking at,
          and the screenshots are then the fastest way to understand it.
          Experience entries have no gallery and go straight to the stack. */}
      {!isExperience && images.length > 0 && (
        <section className={styles.gallery} style={rise()}>
          <Carousel
            images={images.map((image) => ({
              src: image.src,
              alt: image.alt[locale],
            }))}
            labels={{
              previous: t('previousImage'),
              next: t('nextImage'),
              imageOf: t('imageOf', { index: '{index}', total: '{total}' }),
            }}
          />
        </section>
      )}

      <section className={styles.block} style={rise()}>
        <h2 className={styles.blockTitle}>
          {isExperience ? t('stack') : t('technologiesUsed')}
        </h2>
        <ul className={styles.chips}>
          {technologies.map((tech) => (
            <li key={tech.id}>
              <TechChip tech={tech} />
            </li>
          ))}
        </ul>
      </section>

      {isExperience && entry.highlights && (
        <section className={styles.block} style={rise()}>
          <h2 className={styles.blockTitle}>{t('highlights')}</h2>
          <ul className={styles.highlights}>
            {entry.highlights.map((highlight) => (
              <li key={highlight.en}>{highlight[locale]}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.block} style={rise()}>
        <h2 className={styles.blockTitle}>{t('description')}</h2>
        <p className={styles.body}>{entry.description[locale]}</p>
        {entry.topicsSummary && (
          <>
            <h3 className={styles.subTitle}>{t('topics')}</h3>
            <p className={styles.body}>{entry.topicsSummary[locale]}</p>
          </>
        )}
        <h3 className={styles.subTitle}>{t('developmentAreas')}</h3>
        <p className={styles.areas}>{entry.developmentAreas[locale]}</p>
      </section>

      {links.length > 0 && (
        <section className={styles.block} style={rise()}>
          <h2 className={styles.blockTitle}>{t('resources')}</h2>
          <ul className={styles.links}>
            {links.map((link) => {
              const Icon = LINK_ICONS[link.kind];
              return (
                <li key={link.kind}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.resource}
                  >
                    <Icon aria-hidden />
                    {t(LINK_LABEL_KEYS[link.kind])}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
