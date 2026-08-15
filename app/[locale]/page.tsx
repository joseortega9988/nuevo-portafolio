import { resolveLocale, type LocaleParams } from '@/i18n/resolveLocale';
import { ExperienceProjectsSection } from '@/sections/home/ExperienceProjectsSection';
import { HeroSection } from '@/sections/home/HeroSection';
import { TechnologiesSection } from '@/sections/home/TechnologiesSection';

/**
 * Home composes; it does not implement. Navbar and Footer arrive from the
 * layout, and each section owns its own background.
 */
export default async function HomePage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);

  return (
    <main>
      <HeroSection />
      <ExperienceProjectsSection />
      <TechnologiesSection />
    </main>
  );
}
