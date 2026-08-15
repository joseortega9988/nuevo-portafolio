import { resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';

import { BootLoaderHarness } from './BootLoaderHarness';

/**
 * Dev-only isolation route for A1. Removed before the final commit — it exists
 * so each animation can be verified on its own before it is composed into a
 * page (§H step 5).
 */
export default async function BootLoaderDevPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <BootLoaderHarness />;
}
