'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { BootLoader } from '@/animations/boot-loader';
import { CvDownloadButton } from '@/components/layout/CvDownloadButton';
import { Link } from '@/i18n/navigation';
import { useInViewport } from '@/lib/motion/useInViewport';
import { MOUNT_MARGINS } from '@/lib/webgl/contextBudget';
import { useRafPause } from '@/lib/webgl/useRafPause';

import styles from './HeroSection.module.css';

/**
 * The attractor is loaded on the client only and after first paint, so copy
 * and layout render before any WebGL work begins (restriction 14). Deleting
 * src/animations/aizawa-attractor would leave exactly this one import broken;
 * the documented static fallback is already what shows while it loads.
 */
const AizawaAttractor = dynamic(
  () => import('@/animations/aizawa-attractor').then((m) => m.AizawaAttractor),
  { ssr: false, loading: () => <div className={styles.poster} /> },
);

/**
 * Home hero.
 *
 * The copy sits in a column to one side so the attractor stays visually
 * dominant, and the boot loader lives here because this is the component that
 * knows when the hero scene has actually rendered a frame.
 */
export function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInViewport(sectionRef, { rootMargin: MOUNT_MARGINS.hero });
  const paused = useRafPause(visible);
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <section ref={sectionRef} className={styles.section}>
      <BootLoader sceneReady={sceneReady} />

      <div className={styles.canvas} aria-hidden>
        {visible && (
          <AizawaAttractor paused={paused} onReady={() => setSceneReady(true)} />
        )}
      </div>

      <div className={styles.copy}>
        <p className={`eyebrow ${styles.eyebrow}`}>{t('eyebrow')}</p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.body}>{t('body')}</p>

        <div className={styles.actions}>
          <Link href="/projects" className={styles.primary}>
            {t('ctaProjects')} <span aria-hidden>→</span>
          </Link>
          <CvDownloadButton />
        </div>
      </div>

      <p className={styles.scroll} aria-hidden>
        {t('scrollHint')}
      </p>
    </section>
  );
}
