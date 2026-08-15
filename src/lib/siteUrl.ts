/**
 * The canonical origin, resolved at build time.
 *
 * Vercel injects VERCEL_PROJECT_PRODUCTION_URL on production builds, so the
 * sitemap is correct the first time the project is imported without anyone
 * having to set a variable. NEXT_PUBLIC_SITE_URL overrides it once a custom
 * domain exists.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}
