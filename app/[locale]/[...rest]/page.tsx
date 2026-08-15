import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths under a valid locale.
 *
 * Without it, a URL like /en/anything matches no route at all, so Next falls
 * back to its own bare 404 — no navbar, no footer, no styling and no
 * translation. Routing it through notFound() here hands it to
 * app/[locale]/not-found.tsx instead, which is the localized page.
 */
export default function CatchAllNotFound() {
  notFound();
}
