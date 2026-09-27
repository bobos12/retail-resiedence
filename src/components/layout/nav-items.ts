export const navItems = [
  { key: 'residences', href: '/residences' },
  { key: 'clubhouse', href: '/clubhouse' },
  { key: 'living', href: '/living' },
  { key: 'neighborhood', href: '/neighborhood' },
  { key: 'contact', href: '/contact' },
] as const;

/** Pages that open on a full-bleed photograph: the header starts transparent over them,
 *  in light type over a dark sky or dark type over a pale one. */
export const overlayHeroes: Record<string, 'light' | 'dark'> = {
  '/': 'light',
  '/clubhouse': 'light',
  '/living': 'dark',
};
