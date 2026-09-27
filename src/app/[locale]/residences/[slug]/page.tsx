import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { RevealLines } from '@/components/motion/RevealLines';
import { FloorPlan } from '@/components/residences/FloorPlan';
import { Gallery } from '@/components/residences/Gallery';
import { ResidenceCard } from '@/components/residences/ResidenceCard';
import { VideoFacade } from '@/components/residences/VideoFacade';
import { Arrow } from '@/components/ui/Arrow';
import { ButtonLink, buttonClass } from '@/components/ui/ButtonLink';
import { TourEmbed } from '@/components/ui/TourEmbed';
import { SITE_URL } from '@/content/contact';
import { photo, roomPhoto } from '@/content/images';
import { residenceSummaries } from '@/content/residence-summaries';
import { getResidence, residences, standardFeatures, vrTourUrl } from '@/content/residences';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { JsonLd, localePath, pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return residences.map((r) => ({ slug: r.slug }));
}

type Props = PageProps<'/[locale]/residences/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const r = getResidence(slug);
  if (!r) return {};
  const t = await getTranslations({ locale, namespace: `residences.items.${slug}` });
  return pageMetadata({
    locale,
    path: `/residences/${slug}`,
    title: t('name'),
    description: `${t('summary')} ${t('description')}`,
    image: r.cover,
  });
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
      {children}
    </p>
  );
}

export default async function ResidencePage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const r = getResidence(slug);
  if (!r) notFound();

  const t = await getTranslations('residences');
  const tc = await getTranslations('common');
  const tRooms = await getTranslations('rooms');
  const tAlt = await getTranslations('images');
  const name = t(`items.${slug}.name`);
  const gallery = r.gallery.map((id) => roomPhoto(id, tAlt, tRooms));
  const others = (await residenceSummaries()).filter((o) => o.slug !== slug);
  const index = residences.findIndex((o) => o.slug === slug);

  const specs = [
    { label: t('detail.size'), value: String(r.size), unit: tc('sqmUnit') },
    { label: t('detail.bedrooms'), value: String(r.bedrooms) },
    { label: t('detail.bathrooms'), value: String(r.bathrooms) },
    { label: t('detail.floors'), value: String(r.floors) },
    { label: t('detail.garage'), value: t('detail.garageValue') },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': r.type === 'apartment' ? 'Apartment' : 'SingleFamilyResidence',
    name,
    description: t(`items.${slug}.description`),
    url: `${SITE_URL}${localePath(locale, `/residences/${slug}`)}`,
    image: gallery.slice(0, 4).map((p) => `${SITE_URL}${p.src}`),
    numberOfBedrooms: r.bedrooms,
    numberOfBathroomsTotal: r.bathrooms,
    floorSize: { '@type': 'QuantitativeValue', value: r.size, unitCode: 'MTK' },
    amenityFeature: standardFeatures.map((f) => ({ '@type': 'LocationFeatureSpecification', name: t(`features.${f}`), value: true })),
    containedInPlace: { '@id': `${SITE_URL}/#complex`, '@type': 'ApartmentComplex', name: 'Retal Residence' },
  };

  return (
    <article>
      {/* Split opening: name and summary, photograph running off the inline end */}
      <header className="pt-hero-top">
        <div className="page-x grid-page items-end gap-y-10">
          <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:pb-4">
            <nav aria-label={t('detail.back')} className="mb-10">
              <Link
                href="/residences"
                className="group inline-flex min-h-tap items-center gap-2 text-small text-ink-soft transition-colors duration-(--dur-fast) hover:text-ink"
              >
                <Arrow className="rotate-180 transition-transform duration-(--dur-base) ease-out group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                {t('detail.back')}
              </Link>
            </nav>
            <Eyebrow>
              <span className="tabular">{String(index + 1).padStart(2, '0')}</span> · {t(`types.${r.type}`)}
            </Eyebrow>
            <RevealLines text={name} as="h1" className="mt-6 text-h1 font-medium" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-prose text-lead text-ink-soft">{t(`items.${slug}.summary`)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={{ pathname: '/contact', query: { residence: slug } }}>{t('detail.enquireCta')}</ButtonLink>
                {r.vrTour && (
                  <a href="#tour" className={buttonClass('outline')}>
                    <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
                    {t('detail.heroTour')}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:-me-gutter">
            <ParallaxImage
              photo={photo(r.cover, tAlt)}
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
              reveal={false}
              quality={80}
              className="aspect-16/9"
            />
          </div>
        </div>
      </header>

      {/* Key figures */}
      <section aria-label={t('detail.specs')} className="page-x mt-section-sm">
        <dl className="grid grid-cols-2 border-y border-line md:grid-cols-5">
          {specs.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.05}
              className="flex flex-col gap-3 border-line py-6 pe-4 max-md:odd:border-e max-md:even:ps-5 md:border-e md:ps-5 md:first:ps-0 md:last:border-e-0"
            >
              <dt className="eyebrow text-ink-muted">{s.label}</dt>
              <dd className="flex items-baseline gap-1.5">
                <span className="tabular text-h2 font-medium">{s.value}</span>
                {s.unit && <span className="text-h4 text-ink-muted">{s.unit}</span>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* The 3D tour (or, for the one residence without a tour, the video) */}
      <section id="tour" className="page-x scroll-mt-header pt-section-sm" aria-labelledby="tour-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{r.vrTour ? t('detail.tour') : t('detail.video')}</Eyebrow>
            <h2 id="tour-title" className="mt-4 text-h3 font-medium">
              {r.vrTour ? t('detail.tourTitle', { name }) : name}
            </h2>
          </div>
          {!r.vrTour && <p className="max-w-prose text-small text-ink-muted">{t('detail.tourNone')}</p>}
        </div>
        {r.vrTour ? (
          <TourEmbed
            src={vrTourUrl(r.vrTour)}
            title={t('detail.tourTitle', { name })}
            poster={photo(r.gallery[1] ?? r.cover, tAlt)}
            cta={t('detail.tourCta')}
            hint={t('detail.tourHint')}
            openLabel={t('detail.tourOpen')}
            newTabLabel={tc('opensNewTab')}
          />
        ) : (
          <VideoFacade id={r.youtube} title={`${t('detail.video')} · ${name}`} playLabel={t('detail.video')} poster={photo(r.gallery[1] ?? r.cover, tAlt)} />
        )}
      </section>

      {/* Description and what's included */}
      <section className="page-x py-section-sm">
        <div className="grid-page gap-y-12">
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-6">
            <p className="text-h4 font-medium leading-relaxed">{t(`items.${slug}.description`)}</p>
          </Reveal>
          <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <h2 className="eyebrow mb-4 text-ink-muted">{t('detail.features')}</h2>
            <ul className="border-t border-ink">
              {standardFeatures.map((f) => (
                <li key={f} className="flex items-center justify-between gap-4 border-b border-line py-4 text-body">
                  {t(`features.${f}`)}
                  <span className="size-1.5 rounded-pill bg-ink" aria-hidden />
                </li>
              ))}
              {r.extras.map((e) => (
                <li key={e} className="flex items-center justify-between gap-4 border-b border-line py-4 text-body">
                  {t(`extras.${e}`)}
                  <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="page-x pb-section-sm" aria-labelledby="gallery-title">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 id="gallery-title" className="text-h3 font-medium">
            {t('detail.gallery')}
          </h2>
          <p className="tabular text-small text-ink-muted">{String(gallery.length).padStart(2, '0')}</p>
        </div>
        <Gallery photos={gallery} title={`${t('detail.gallery')} · ${name}`} />
      </section>

      {/* Floor plan */}
      <section className="page-x pb-section-sm" aria-labelledby="plan-title">
        <div className="grid-page gap-y-8">
          <div className="col-span-4 md:col-span-6 lg:col-span-3">
            <h2 id="plan-title" className="text-h3 font-medium">
              {t('detail.plan')}
            </h2>
            <p className="mt-4 text-small text-ink-muted">
              {tc('sqm', { value: r.size })} · {tc('bedrooms', { n: r.bedrooms, num: String(r.bedrooms) })}
            </p>
            <p className="mt-2 text-small text-ink-muted">{t('detail.planHint')}</p>
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-9">
            <FloorPlan plan={photo(r.plan, tAlt)} title={name} />
          </div>
        </div>
      </section>

      {/* Video walkthrough */}
      {r.vrTour && (
        <section className="page-x pb-section" aria-labelledby="video-title">
          <div className="grid-page items-end gap-y-8">
            <div className="col-span-4 md:col-span-6 lg:col-span-4">
              <Eyebrow>{t('detail.video')}</Eyebrow>
              <h2 id="video-title" className="mt-4 text-h3 font-medium">
                {name}
              </h2>
              <p className="mt-4 text-small text-ink-muted">
                <span className="sr-only">{t('detail.videoPlay', { name })}. </span>
                {t('detail.videoNote')}
              </p>
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-8">
              <VideoFacade
                id={r.youtube}
                title={`${t('detail.video')} · ${name}`}
                playLabel={t('detail.video')}
                poster={photo(r.gallery[2] ?? r.cover, tAlt)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Enquiry */}
      <section className="bg-canvas-deep py-section-sm">
        <div className="page-x grid-page items-end gap-y-8">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <Eyebrow>{t('detail.enquireEyebrow')}</Eyebrow>
            <RevealLines text={t('detail.enquireTitle', { name })} className="mt-6 text-h2 font-medium" />
          </div>
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="max-w-prose text-lead text-ink-soft">{t('detail.enquireBody')}</p>
            <ButtonLink href={{ pathname: '/contact', query: { residence: slug } }} className="mt-8">
              {t('detail.enquireCta')}
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Other residences */}
      <section className="py-section" aria-labelledby="others-title">
        <div className="page-x mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="others-title" className="text-h2 font-medium">
            {t('detail.other')}
          </h2>
          <ButtonLink href="/residences" variant="outline">
            {tc('viewAll')}
          </ButtonLink>
        </div>
        <ul className="rail">
          {others.map((o) => (
            <li key={o.slug} className="snap-start">
              <ResidenceCard residence={o} sizes="(min-width: 1024px) 42vw, (min-width: 768px) 45vw, 82vw" />
            </li>
          ))}
        </ul>
      </section>

      <JsonLd data={jsonLd} />
    </article>
  );
}
