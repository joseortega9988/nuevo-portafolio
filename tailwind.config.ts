import type { Config } from 'tailwindcss';

/**
 * Tailwind v4 is CSS-first: the design tokens live in `@theme inline` inside
 * src/styles/globals.css, mapped from src/styles/tokens.css. This file exists
 * only to pin content sources for tooling that still expects it, and must stay
 * minimal — adding colors here would create a second source of truth (§A 1.4).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
};

export default config;
