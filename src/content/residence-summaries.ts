import { getTranslations } from 'next-intl/server';
import { photo, type Photo } from './images';
import { residences, type ResidenceType } from './residences';

/** What cards and table rows need, with copy resolved on the server. */
export type ResidenceSummary = {
  slug: string;
  type: ResidenceType;
  size: number;
  bedrooms: number;
  bathrooms: number;
  name: string;
  summary: string;
  photo: Photo;
  hasTour: boolean;
};

export async function residenceSummaries(): Promise<ResidenceSummary[]> {
  const t = await getTranslations('residences.items');
  const tAlt = await getTranslations('images');
  return residences.map((r) => ({
    slug: r.slug,
    type: r.type,
    size: r.size,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    name: t(`${r.slug}.name`),
    summary: t(`${r.slug}.summary`),
    photo: photo(r.cover, tAlt),
    hasTour: Boolean(r.vrTour),
  }));
}
