export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://retalresidence.com').replace(/\/$/, '');

export const contact = {
  company: 'Nesaj Real Estate Compound Co.',
  address: {
    street: '9268 Salmah Bin Suliman',
    city: 'Al Khubar',
    postalCode: '34215-3975',
    region: 'Eastern Province',
    country: 'SA',
  },
  phone: { display: '+966 13 825 9600', href: 'tel:+966138259600' },
  reservations: [
    { display: '+966 800 3040 111', href: 'tel:+9668003040111' },
    { display: '+966 56 241 6136', href: 'tel:+966562416136' },
  ],
  whatsapp: { display: '+966 56 241 6136', href: 'https://wa.me/966562416136' },
  email: 'info@retalresidence.com',
  salesEmail: 'sales@retalresidence.com',
};

export const social = [
  { key: 'instagram', href: 'https://instagram.com/retal.residence' },
  { key: 'x', href: 'https://x.com/retalresidence' },
  { key: 'linkedin', href: 'https://linkedin.com/company/retal-residence' },
  { key: 'facebook', href: 'https://facebook.com/retalresidence' },
] as const;
