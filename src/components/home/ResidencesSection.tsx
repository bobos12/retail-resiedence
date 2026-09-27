import { getLocale, getTranslations } from 'next-intl/server';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { photo, roomPhoto } from '@/content/images';
import { residences, residenceTypes, vrTourUrl } from '@/content/residences';
import { ResidenceExplorer, type ExplorerResidence } from './ResidenceExplorer';

export async function ResidencesSection() {
  const t = await getTranslations('home.residences');
  const tr = await getTranslations('residences');
  const td = await getTranslations('residences.detail');
  const tc = await getTranslations('common');
  const tAlt = await getTranslations('images');
  const tRooms = await getTranslations('rooms');
  const list = new Intl.ListFormat(await getLocale(), { type: 'unit', style: 'short' });

  const items: ExplorerResidence[] = residences.map((r) => ({
    slug: r.slug,
    code: r.code,
    type: r.type,
    typeLabel: tr(`types.${r.type}`),
    name: tr(`items.${r.slug}.name`),
    size: r.size,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    floors: r.floors,
    extras: list.format(r.extras.map((e) => tr(`extras.${e}`))),
    youtube: r.youtube,
    tour: r.vrTour ? vrTourUrl(r.vrTour) : undefined,
    cover: photo(r.cover, tAlt),
    gallery: r.gallery.map((id) => roomPhoto(id, tAlt, tRooms)),
    plan: photo(r.plan, tAlt),
  }));

  return (
    <section id="residences" className="scroll-mt-header pb-section">
      <SectionIntro eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} className="page-x mb-12" />
      <div className="page-x">
        <ResidenceExplorer
          residences={items}
          groups={residenceTypes.map((type) => ({ type, label: tr(`typesPlural.${type}`) }))}
          labels={{
            list: t('eyebrow'),
            sqm: tc('sqmUnit'),
            livingSpace: td('size'),
            bedrooms: td('bedrooms'),
            bathrooms: td('bathrooms'),
            floors: td('floors'),
            garage: td('garage'),
            garageValue: td('garageValue'),
            furnished: t('specs.furnished'),
            furnishedValue: t('specs.furnishedValue'),
            appliances: t('specs.appliances'),
            appliancesValue: t('specs.appliancesValue'),
            internet: t('specs.internet'),
            internetValue: t('specs.internetValue'),
            extras: t('specs.extras'),
            none: t('specs.none'),
            gallery: t('actions.gallery'),
            video: t('actions.video'),
            tour: t('actions.tour'),
            tourLoading: t('actions.tourLoading'),
            tourStart: td('tourCta'),
            tourBody: td('tourBody'),
            fullscreen: t('actions.fullscreen'),
            plan: t('actions.plan'),
            view: t('actions.view'),
            previous: tc('previous'),
            next: tc('next'),
            nextResidence: t('actions.nextResidence'),
            galleryTitle: td('gallery'),
            videoPlay: t('actions.play'),
            tourCta: td('tourCta'),
            tourHint: td('tourHint'),
            tourOpen: td('tourOpen'),
            newTab: tc('opensNewTab'),
          }}
        />
      </div>
    </section>
  );
}
