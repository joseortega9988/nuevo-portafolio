import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import styles from './not-found.module.css';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className={styles.main}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.body}>{t('body')}</p>
      <Link href="/" className={styles.cta}>
        {t('cta')}
      </Link>
    </main>
  );
}
