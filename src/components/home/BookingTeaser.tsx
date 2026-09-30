import { getTranslations } from 'next-intl/server';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { Arrow } from '@/components/ui/Arrow';
import { Icon, type IconName } from '@/components/ui/Icon';
import { photo } from '@/content/images';
import { Link } from '@/i18n/navigation';

const facts: { key: 'day' | 'hour' | 'whatsapp'; icon: IconName }[] = [
  { key: 'day', icon: 'calendar' },
  { key: 'hour', icon: 'clock' },
  { key: 'whatsapp', icon: 'chat' },
];

// Straight after the hero: an invitation to book a visit, leading to the booking page.
export async function BookingTeaser() {
  const t = await getTranslations('home.bookTeaser');
  const tAlt = await getTranslations('images');

  return (
    <section aria-labelledby="book-teaser-title" className="bg-canvas-deep py-section-sm">
      <div className="page-x grid-page items-center gap-y-10">
        <ParallaxImage
          photo={photo('clubhouse/reception', tAlt)}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="col-span-4 aspect-4/3 md:col-span-6 lg:col-span-6"
        />
        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8">
          <p className="eyebrow flex items-center gap-3">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('eyebrow')}
          </p>
          <RevealLines as="h2" id="book-teaser-title" text={t('title')} className="mt-6 text-h2 font-medium" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-prose text-lead text-ink-soft">{t('body')}</p>
            <ul className="mt-8 grid gap-3 border-y border-line py-5 sm:grid-cols-3 sm:gap-4">
              {facts.map((f) => (
                <li key={f.key} className="flex items-center gap-3 text-small font-medium">
                  <span className="grid size-9 shrink-0 place-items-center border border-line text-copper-deep" aria-hidden>
                    <Icon name={f.icon} className="size-4" />
                  </span>
                  {t(`facts.${f.key}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/book"
              className="group mt-8 flex min-h-14 w-full items-center justify-between gap-4 rounded-pill bg-ink py-2 pe-2 ps-6 text-body font-medium text-canvas transition-colors duration-(--dur-fast) hover:bg-copper-deep sm:w-auto sm:min-w-80"
            >
              {t('cta')}
              <span className="inline-flex size-11 items-center justify-center rounded-pill bg-canvas text-ink transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <Arrow />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
