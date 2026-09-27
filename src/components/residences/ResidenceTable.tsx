'use client';

import { useTranslations } from 'next-intl';
import { Arrow } from '@/components/ui/Arrow';
import type { ResidenceSummary } from '@/content/residence-summaries';
import { Link } from '@/i18n/navigation';

type Props = { residences: ResidenceSummary[]; caption: string };

// Data view: Name · Type · Size · Beds · Baths · →. The whole row is the link.
export function ResidenceTable({ residences, caption }: Props) {
  const t = useTranslations('residences');
  const tc = useTranslations('common');

  return (
    <table className="w-full border-collapse text-start">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-ink text-start">
          <th scope="col" className="eyebrow py-3 pe-4 text-start font-medium">
            {t('table.name')}
          </th>
          <th scope="col" className="eyebrow hidden py-3 pe-4 text-start font-medium md:table-cell">
            {t('table.type')}
          </th>
          <th scope="col" className="eyebrow py-3 pe-4 text-start font-medium">
            {t('table.size')}
          </th>
          <th scope="col" className="eyebrow hidden py-3 pe-4 text-start font-medium sm:table-cell">
            {t('table.beds')}
          </th>
          <th scope="col" className="eyebrow hidden py-3 pe-4 text-start font-medium sm:table-cell">
            {t('table.baths')}
          </th>
          <th scope="col" className="w-12 py-3">
            <span className="sr-only">{t('table.open')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {residences.map((r) => (
          <tr key={r.slug} className="group relative border-b border-line transition-colors duration-(--dur-fast) hover:bg-canvas-deep">
            <th scope="row" className="py-5 pe-4 text-start font-medium md:py-6">
              <Link
                href={`/residences/${r.slug}`}
                className="text-h4 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--focus)"
              >
                {r.name}
              </Link>
            </th>
            <td className="hidden py-5 pe-4 text-small text-ink-soft md:table-cell">{t(`types.${r.type}`)}</td>
            <td className="tabular py-5 pe-4 text-small">{tc('sqm', { value: r.size })}</td>
            <td className="tabular hidden py-5 pe-4 text-small sm:table-cell">{r.bedrooms}</td>
            <td className="tabular hidden py-5 pe-4 text-small sm:table-cell">{r.bathrooms}</td>
            <td className="py-5 text-end">
              <Arrow className="inline-block text-h4 transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
