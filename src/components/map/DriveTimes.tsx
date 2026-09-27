import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import { destinations } from '@/content/neighborhood';
import { cn } from '@/lib/cn';

// Numbered drive-time list; numbers match the map markers.
export async function DriveTimes({ className, columns = 2 }: { className?: string; columns?: 1 | 2 }) {
  const t = await getTranslations('neighborhood');
  const tc = await getTranslations('common');
  return (
    <div className={className}>
      <h3 className="eyebrow mb-4 text-ink-muted">
        {t('driveTimes')} <span className="sr-only">({t('byCar')})</span>
      </h3>
      <ol className={cn('grid border-t border-line', columns === 2 && 'md:grid-cols-2 md:gap-x-gap')}>
        {destinations.map((d, i) => (
          <Reveal as="li" key={d.key} delay={i * 0.04} y={12} className="flex items-baseline gap-4 border-b border-line py-4">
            <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1 text-body">{t(`destinations.${d.key}`)}</span>
            <span className="tabular whitespace-nowrap text-h4 font-medium">
              {d.minutes}
              <span className="ms-1.5 text-small font-normal text-ink-muted">{tc('minUnit', { n: d.minutes })}</span>
            </span>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
