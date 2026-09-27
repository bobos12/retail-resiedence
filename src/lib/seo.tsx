import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { contact, SITE_URL, social } from '@/content/contact';
import { getImage, ogImage, type ImageId } from '@/content/images';
import { GEO } from '@/content/neighborhood';
import { residences } from '@/content/residences';
import { routing, type Locale } from '@/i18n/routing';

// Trailing slash: the site is exported as folders (en/residences/index.html) for Apache hosting.
export const localePath = (locale: Locale, path: string) => `/${locale}${path === '/' ? '' : path}/`;

type PageMeta = {
  locale: Locale;
  /** Path without locale, e.g. "/residences". */
  path: string;
  title: string;
  description: string;
  image: ImageId;
  /** Use the title as-is instead of the "%s · Retal Residence" template. */
  absoluteTitle?: boolean;
};

export async function pageMetadata({ locale, path, title, description, image, absoluteTitle }: PageMeta): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const og = ogImage(image) ?? getImage(image).src;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)]));
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: { ...languages, 'x-default': localePath(routing.defaultLocale, path) },
    },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title,
      description,
      url: localePath(locale, path),
      locale: locale === 'ar' ? 'ar_SA' : 'en_GB',
      alternateLocale: locale === 'ar' ? ['en_GB'] : ['ar_SA'],
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og], site: '@retalresidence' },
  };
}

const address = {
  '@type': 'PostalAddress',
  streetAddress: contact.address.street,
  addressLocality: contact.address.city,
  postalCode: contact.address.postalCode,
  addressRegion: contact.address.region,
  addressCountry: contact.address.country,
};

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Retal Residence',
    legalName: contact.company,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: contact.email,
    telephone: contact.phone.display,
    address,
    sameAs: social.map((s) => s.href),
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer service', telephone: contact.phone.display, email: contact.email },
      {
        '@type': 'ContactPoint',
        contactType: 'reservations',
        telephone: contact.reservations[0]?.display,
        email: contact.salesEmail,
      },
    ],
  };
}

export async function complexJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tr = await getTranslations({ locale, namespace: 'residences.items' });
  const tc = await getTranslations({ locale, namespace: 'clubhouse.amenities' });
  const amenities = ['restaurant', 'market', 'cinema', 'bowling', 'pools', 'gym', 'tennis', 'laundry'];
  return {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    '@id': `${SITE_URL}/#complex`,
    name: t('siteName'),
    description: t('home.description'),
    url: `${SITE_URL}${localePath(locale, '/')}`,
    image: `${SITE_URL}${getImage('site/aerial-compound-dusk').src}`,
    telephone: contact.phone.display,
    email: contact.email,
    address,
    geo: { '@type': 'GeoCoordinates', latitude: GEO.lat, longitude: GEO.lng },
    amenityFeature: amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: tc(a), value: true })),
    containsPlace: residences.map((r) => ({
      '@type': r.type === 'apartment' ? 'Apartment' : 'SingleFamilyResidence',
      name: tr(`${r.slug}.name`),
      url: `${SITE_URL}${localePath(locale, `/residences/${r.slug}`)}`,
      numberOfBedrooms: r.bedrooms,
      numberOfBathroomsTotal: r.bathrooms,
      floorSize: { '@type': 'QuantitativeValue', value: r.size, unitCode: 'MTK' },
    })),
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped so it cannot close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
