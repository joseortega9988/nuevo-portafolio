import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * The two custom rule blocks below are the mechanical enforcement of §B
 * (Dependency Inversion) and §C (single source of colour). They are errors,
 * not warnings — `npm run lint` is the gate, not a reviewer's memory.
 */
const RENDERING_LIBS = [
  {
    name: 'three',
    message:
      'Sections and components must not import three. Depend on the AnimationLayer abstraction (src/animations/*) or a hook in src/lib/* instead.',
  },
  {
    name: 'gsap',
    message:
      'Sections and components must not import gsap. Scroll/timeline work belongs in src/animations/* or src/lib/motion/*.',
  },
  {
    name: 'lenis',
    message:
      'Sections and components must not import lenis. Use the LenisProvider / useScrollProgress abstractions in src/lib/motion/*.',
  },
];

const RENDERING_LIB_PATTERNS = [
  {
    group: ['three/*', '@react-three/*', 'gsap/*', 'lenis/*', 'postprocessing'],
    message:
      'WebGL and timeline libraries are only allowed inside src/lib/* and src/animations/*.',
  },
];

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      // Reference material mined for content — not part of this codebase.
      'ANTIGUO_PORTAFOLIO/**',
      'home-challengue-nest/**',
      'COSAS_ADJUNTAS/**',
    ],
  },

  {
    // Project-wide bans. Restrictions 11 and 4.
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // §C: colour has exactly one home. Catches inline styles, shader
          // uniform defaults and stray Tailwind arbitrary values alike.
          selector: 'Literal[value=/#(?:[0-9a-fA-F]{3,4}){1,2}(?![0-9a-fA-F])/]',
          message:
            'Hex colour literal. Colour lives only in src/styles/tokens.css — use var(--c-*) in CSS, or getThreeColor() from src/lib/palette.ts in a shader.',
        },
        {
          selector:
            'TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3,4}){1,2}(?![0-9a-fA-F])/]',
          message:
            'Hex colour literal in a template string. Colour lives only in src/styles/tokens.css.',
        },
      ],
    },
  },

  {
    // §B — Dependency Inversion, enforced at the import boundary.
    files: ['src/sections/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: RENDERING_LIBS, patterns: RENDERING_LIB_PATTERNS },
      ],
    },
  },

  {
    // Pages compose; they must not reach for rendering libraries either.
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: RENDERING_LIBS, patterns: RENDERING_LIB_PATTERNS },
      ],
    },
  },

  {
    // §E injectability: Navbar and Footer are rendered once, by the layout.
    // The exemption is matched by filename rather than by path because a
    // literal "[locale]" segment would be parsed as a glob character class.
    files: ['app/**/*.{ts,tsx}', 'src/sections/**/*.{ts,tsx}'],
    ignores: ['**/layout.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: RENDERING_LIBS,
          patterns: [
            ...RENDERING_LIB_PATTERNS,
            {
              group: ['**/layout/Navbar**', '**/layout/Footer**'],
              message:
                'Navbar and Footer are injected once from app/[locale]/layout.tsx. Pass a `variant` prop instead of rendering another copy.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
