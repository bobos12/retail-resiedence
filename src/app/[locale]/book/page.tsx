import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookingPanel } from '@/components/booking/BookingPanel';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/book'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.book' });
  return pageMetadata({ locale, path: '/book', title: t('title'), description: t('description'), image: 'clubhouse/reception' });
}

export default async function BookPage({ params }: PageProps<'/[locale]/book'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('home.booking');

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('body')} />
      <BookingPanel />
    </>
  );
}
