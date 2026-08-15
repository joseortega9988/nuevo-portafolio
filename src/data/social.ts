import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

export interface SocialLink {
  id: string;
  href: string;
  label: string;
  Icon: IconType;
  /** Custom property in tokens.css holding that platform's brand colour. */
  brandVar: string;
}

/**
 * LinkedIn and GitHub only (§E). Instagram and every other network from the
 * old portfolio are deliberately gone — this site talks to hiring managers.
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: 'linkedin',
    href: 'https://www.linkedin.com/in/joseortega9988/',
    label: 'LinkedIn',
    Icon: FaLinkedin,
    brandVar: '--c-brand-linkedin',
  },
  {
    id: 'github',
    href: 'https://github.com/joseortega9988',
    label: 'GitHub',
    Icon: FaGithub,
    brandVar: '--c-brand-github',
  },
];

export const CONTACT_EMAILS = [
  'joseortega9988@gmail.com',
  'joseortega99888@gmail.com',
] as const;

export const CV_FILES = {
  en: '/cv/CV-JOSE-ORTEGA-EN.pdf',
  es: '/cv/CV-JOSE-ORTEGA-ES.pdf',
} as const;

/** Filename the browser saves as — humanised, not the raw path (§E 3). */
export const CV_DOWNLOAD_NAMES = {
  en: 'Jose Ortega — CV (EN).pdf',
  es: 'Jose Ortega — CV (ES).pdf',
} as const;

export const OWNER = {
  name: 'Jose Ortega',
  location: 'Quito, Ecuador',
  logo: '/logo/LOGOCV.png',
} as const;
