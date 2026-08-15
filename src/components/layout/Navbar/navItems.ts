/**
 * The nav is data, not markup. Adding a route means adding one entry here and
 * one message key — no component changes (§B, Open/Closed).
 */
export interface NavItem {
  href: '/' | '/projects';
  labelKey: 'home' | 'projects';
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/projects', labelKey: 'projects' },
];
