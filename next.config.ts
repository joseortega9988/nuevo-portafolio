import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Everything we serve is local (public/projects, public/logo) — no remote
    // patterns on purpose, so nothing can be hotlinked in by accident.
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    dirs: ['app', 'src'],
  },
  // GLSL is authored as tagged template strings in *.glsl.ts, so there is no
  // loader to configure — shaders stay plain TypeScript and typecheck for free.
};

export default withNextIntl(nextConfig);
