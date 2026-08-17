import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { CONTACT_EMAILS, OWNER, SOCIAL_LINKS } from '@/data/social';
import { Link } from '@/i18n/navigation';

import styles from './Footer.module.css';
import { FooterTunnel } from './FooterTunnel';

export interface FooterProps {
  variant?: 'default' | 'transparent';
}

/**
 * Rendered once, from app/[locale]/layout.tsx (§B injectability).
 *
 * A server component: nothing here is interactive, so none of it needs to ship
 * as JavaScript.
 */
export async function Footer({ variant = 'default' }: FooterProps) {
  const t = await getTranslations('footer');
  const [primaryEmail, secondaryEmail] = CONTACT_EMAILS;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-variant={variant}>
      <FooterTunnel />

      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Image
              src={OWNER.logo}
              alt={t('logoAlt')}
              width={56}
              height={56}
              className={styles.logoImage}
            />
          </Link>
          <p className={styles.location}>{OWNER.location}</p>
        </div>

        <div className={styles.contact}>
          <h2 className={styles.heading}>{t('contactMe')}</h2>
          <p className={styles.body}>
            {t('contactPart1')}{' '}
            <a className={styles.email} href={`mailto:${primaryEmail}`}>
              {primaryEmail}
            </a>{' '}
            {t('contactPart2')}{' '}
            <a className={styles.email} href={`mailto:${secondaryEmail}`}>
              {secondaryEmail}
            </a>
            . {t('contactPart3')}
          </p>
        </div>

        <div className={styles.social}>
          <h2 className={styles.headingSmall}>{t('officialLinks')}</h2>
          <ul className={styles.socialList}>
            {SOCIAL_LINKS.map(({ id, href, label, Icon, brandVar }) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.socialLink}
                  aria-label={label}
                  style={{ '--brand': `var(${brandVar})` } as React.CSSProperties}
                >
                  <Icon aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.copyright}>
        © {year} {OWNER.name}. {t('rights')}
      </p>
    </footer>
  );
}
