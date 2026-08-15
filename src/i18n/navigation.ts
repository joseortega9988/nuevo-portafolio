import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation primitives. Always import Link/useRouter/usePathname
 * from here rather than from next/link or next/navigation — these keep the
 * /[locale] segment attached automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
