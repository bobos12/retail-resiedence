import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import { standardFeatures } from '@/content/residences';

// What every residence comes with, as a quiet numbered row.
export async function IncludedBand({ className }: { className?: string }) {
  const t = await getTranslations('residences');
  return (
    <section className={className} aria-labelledby="included-title">
      <h2 id="included-title" className="eyebrow mb-6 text-ink-muted">
        {t('index.included')}
      </h2>
      <ul className="grid grid-cols-2 border-t border-ink lg:grid-cols-4">
        {standardFeatures.map((key, i) => (
          <Reveal as="li" key={key} delay={i * 0.06} className="flex items-baseline gap-4 border-b border-line py-6 pe-4">
            <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-h4 font-medium">{t(`features.${key}`)}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
