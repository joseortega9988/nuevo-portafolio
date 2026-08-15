import type { CSSProperties } from 'react';

import type { ColorToken } from './palette';

/**
 * Exposes a palette token to CSS as `--accent`, so a component can be tinted by
 * data without any stylesheet learning the category list.
 *
 * The cast is needed only because React's CSSProperties has no index signature
 * for custom properties; the value itself is still a `var()` pointing at
 * tokens.css, never a literal colour.
 */
export function accentStyle(token: ColorToken): CSSProperties {
  return { '--accent': `var(--c-${token})` } as CSSProperties;
}
