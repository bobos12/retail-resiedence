import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { SITE_URL } from '@/content/contact';
import { dirFor, routing } from '@/i18n/routing';
import { JsonLd, organizationJsonLd } from '@/lib/seo';
import { generalSans, plexArabic } from '../fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#f3f1eb',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('home.title'), template: t('titleTemplate') },
    description: t('home.description'),
    applicationName: t('siteName'),
    formatDetection: { telephone: false },
  };
}

// Only what client components need goes to the browser.
const CLIENT_NAMESPACES = ['nav', 'common', 'contact', 'residences'] as const;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));
  const residences = clientMessages.residences as Record<string, unknown>;
  // Residence descriptions are rendered on the server; the client only needs labels.
  clientMessages.residences = { ...residences, items: undefined };
  const t = await getTranslations('nav');

  return (
    <html lang={locale} dir={dirFor(locale)} className={`${generalSans.variable} ${plexArabic.variable}`}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only z-50 rounded-pill bg-ink px-5 py-3 text-small text-canvas focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
            >
              {t('skip')}
            </a>
            <SmoothScroll />
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
          </MotionProvider>
        </NextIntlClientProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
