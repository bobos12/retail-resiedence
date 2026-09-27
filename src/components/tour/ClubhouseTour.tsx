import { getTranslations } from 'next-intl/server';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { Arrow } from '@/components/ui/Arrow';
import { buttonClass } from '@/components/ui/ButtonLink';
import { homeScenes, panorama, posterId, scenes } from '@/content/clubhouse-tour';
import { getImage } from '@/content/images';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { TourViewer, type TourScene } from './TourViewer';

type Props = {
  /** Home shows a shorter list and links on to the full tour on the Clubhouse page. */
  variant: 'home' | 'full';
  tone: 'light' | 'dark';
  id?: string;
  className?: string;
};

export async function ClubhouseTour({ variant, tone, id, className }: Props) {
  const t = await getTranslations('clubhouse.tour');
  const tIntro = await getTranslations(variant === 'home' ? 'home.tour' : 'clubhouse.tour');
  const list = variant === 'home' ? scenes.filter((s) => homeScenes.includes(s.slug)) : scenes;
  const items: TourScene[] = list.map((s) => {
    const name = t(`scenes.${s.slug}`);
    return {
      slug: s.slug,
      name,
      poster: { ...getImage(posterId(s.slug)), alt: t('posterAlt', { name }) },
      pano: panorama(s.slug),
    };
  });
  const titleId = `${id ?? 'clubhouse-tour'}-title`;
  const dark = tone === 'dark';

  // Heading on one side, paragraph and link on the other, above the list and viewer.
  const intro = (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-x-gap">
      <div className="lg:col-span-6">
        <p className="eyebrow flex items-center gap-3">
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {tIntro('eyebrow')}
        </p>
        <RevealLines as="h2" id={titleId} text={tIntro('title')} className="mt-6 text-h2 font-medium" />
      </div>
      <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
        <p className={cn('max-w-prose text-lead', dark ? 'text-bone-soft' : 'text-ink-soft')}>{tIntro('body')}</p>
        {variant === 'home' && (
          <Link href={{ pathname: '/clubhouse', hash: 'tour' }} className={buttonClass(dark ? 'outline-light' : 'outline', 'mt-6')}>
            <span>{t('all', { count: scenes.length })}</span>
            <Arrow className="transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        )}
      </Reveal>
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-theme={dark ? 'dark' : undefined}
      className={cn('scroll-mt-header', dark ? 'bg-night text-bone' : 'bg-canvas text-ink', className)}
    >
      <div className="page-x">
        <TourViewer
          scenes={items}
          twoColumns={variant === 'full'}
          tone={tone}
          intro={intro}
          labels={{
            enter: t('enter'),
            loading: t('loading'),
            drag: t('drag'),
            viewer: t('viewer', { name: '{name}' }),
            scenes: t('scenes.label'),
            previous: t('previous'),
            next: t('next'),
            rotate: t('rotate'),
            gyro: t('gyro'),
            fullscreen: t('fullscreen'),
            exitFullscreen: t('exitFullscreen'),
            ctrlZoom: t('ctrlZoom'),
            twoFingers: t('twoFingers'),
            choose: t('choose'),
          }}
        />
      </div>
    </section>
  );
}
