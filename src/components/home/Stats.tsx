import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';

const stats = ['types', 'size', 'security', 'school'] as const;

// Real figures only, in a row with hairline dividers.
export async function Stats() {
  const t = await getTranslations('home.stats');
  return (
    <section aria-label={t('label')} className="page-x pb-section">
      <dl className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {stats.map((key, i) => {
          const unit = t.has(`${key}.unit`) ? t(`${key}.unit`) : null;
          return (
            <Reveal
              key={key}
              delay={i * 0.08}
              className="flex flex-col gap-6 border-line py-8 pe-4 odd:border-e even:ps-5 lg:border-e lg:ps-6 lg:first:ps-0 lg:last:border-e-0"
            >
              <dt className="order-2 max-w-3xs text-small text-ink-soft">{t(`${key}.label`)}</dt>
              <dd className="order-1 flex flex-wrap items-baseline gap-x-2">
                <span className="tabular whitespace-nowrap text-stat font-medium" dir="ltr">
                  {t(`${key}.value`)}
                </span>
                {unit && <span className="text-h4 font-medium text-ink-muted">{unit}</span>}
              </dd>
            </Reveal>
          );
        })}
      </dl>
    </section>
  );
}
