import { getTranslations } from 'next-intl/server';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { Arrow } from '@/components/ui/Arrow';
import { residences } from '@/content/residences';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

// Every residence with a 3D tour, one tap from the tour itself.
export async function ToursStrip({ className }: { className?: string }) {
  const t = await getTranslations('residences');
  const withTours = residences.filter((r) => r.vrTour);

  return (
    <section className={cn('page-x', className)} aria-label={t('tours.eyebrow')}>
      <div className="grid-page items-end gap-y-10 border-t border-ink pt-10">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <p className="eyebrow flex items-center gap-3">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('tours.eyebrow')}
          </p>
          <RevealLines as="h2" text={t('tours.title')} className="mt-6 text-h3 font-medium" />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-prose text-body text-ink-soft">{t('tours.body')}</p>
          </Reveal>
        </div>
        <ul className="col-span-4 grid gap-x-gap md:col-span-6 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {withTours.map((r, i) => (
            <li key={r.slug} className="border-b border-line">
              <Link
                href={`/residences/${r.slug}#tour`}
                className="group flex min-h-tap items-center justify-between gap-4 py-4 transition-colors duration-(--dur-fast) hover:text-copper-deep"
              >
                <span className="flex items-baseline gap-4">
                  <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-body font-medium">{t(`items.${r.slug}.name`)}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-line px-3 py-1.5 text-micro font-medium transition-colors duration-(--dur-fast) group-hover:border-ink group-hover:bg-ink group-hover:text-canvas">
                  {t('tours.start')}
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
