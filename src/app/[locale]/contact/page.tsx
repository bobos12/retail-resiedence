import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { PageHeader } from '@/components/ui/PageHeader';
import { contact } from '@/content/contact';
import { photo } from '@/content/images';
import { DIRECTIONS_URL } from '@/content/neighborhood';
import { residences } from '@/content/residences';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.contact' });
  return pageMetadata({ locale, path: '/contact', title: t('title'), description: t('description'), image: 'site/gate-sign-dusk' });
}

const link =
  'inline-flex min-h-tap items-center underline decoration-line underline-offset-4 transition-[text-decoration-color] duration-(--dur-fast) hover:decoration-ink';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-line py-4">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="col-span-2 text-body">{children}</dd>
    </div>
  );
}

export default async function ContactPage({ params, searchParams }: PageProps<'/[locale]/contact'>) {
  const locale = (await params).locale as Locale;
  const requested = (await searchParams).residence;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tr = await getTranslations('residences.items');
  const tAlt = await getTranslations('images');
  const options = residences.map((r) => ({ value: r.slug, label: tr(`${r.slug}.name`) }));

  return (
    <>
      <PageHeader eyebrow={t('hero.eyebrow')} title={t('hero.title')} intro={t('hero.subtitle')} />
      <section className="page-x pb-section">
        <div className="grid-page gap-y-16">
          <div className="col-span-4 md:col-span-6 lg:order-2 lg:col-span-7 lg:col-start-6">
            <ContactForm residences={options} requested={typeof requested === 'string' ? requested : undefined} />
          </div>

          <Reveal className="col-span-4 md:col-span-6 lg:order-1 lg:col-span-4">
            <h2 className="eyebrow mb-4 text-ink-muted">{t('direct')}</h2>
            <dl className="border-t border-ink">
              <Row label={t('main')}>
                <a href={contact.phone.href} className={`${link} tabular`} dir="ltr">
                  {contact.phone.display}
                </a>
              </Row>
              <Row label={t('reservations')}>
                <span className="flex flex-col items-start">
                  {contact.reservations.map((p) => (
                    <a key={p.href} href={p.href} className={`${link} tabular`} dir="ltr">
                      {p.display}
                    </a>
                  ))}
                </span>
              </Row>
              <Row label={t('whatsapp')}>
                <a href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer" className={`${link} tabular`} dir="ltr">
                  {contact.whatsapp.display}
                </a>
              </Row>
              <Row label={t('email')}>
                <a href={`mailto:${contact.email}`} className={`${link} break-all`}>
                  {contact.email}
                </a>
              </Row>
              <Row label={t('sales')}>
                <a href={`mailto:${contact.salesEmail}`} className={`${link} break-all`}>
                  {contact.salesEmail}
                </a>
              </Row>
              <Row label={t('address')}>
                <address className="not-italic">
                  <span dir="ltr">{contact.company}</span>
                  <br />
                  <span dir="ltr">
                    {contact.address.street}, {contact.address.city} {contact.address.postalCode}
                  </span>
                </address>
                <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={link}>
                  {t('directions')}
                </a>
              </Row>
            </dl>
            <ParallaxImage photo={photo('site/gate-sign-dusk', tAlt)} sizes="(min-width: 1024px) 33vw, 100vw" className="mt-10 aspect-4/3" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
