import { resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';

import { AizawaHarness } from './AizawaHarness';

/** Dev-only isolation route for A2. Removed before the final commit. */
export default async function AizawaDevPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <AizawaHarness />;
}
