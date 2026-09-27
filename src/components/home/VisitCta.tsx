import { getTranslations } from 'next-intl/server';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { RevealLines } from '@/components/motion/RevealLines';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonAnchor, ButtonLink } from '@/components/ui/ButtonLink';
import { contact } from '@/content/contact';
import { photo } from '@/content/images';

export async function VisitCta() {
  const t = await getTranslations('home.visit');
  const tAlt = await getTranslations('images');
  const tc = await getTranslations('common');

  return (
    <section className="pt-section">
      <div className="page-x grid-page items-end gap-y-8">
        <div className="col-span-4 md:col-span-6 lg:col-span-7">
          <p className="eyebrow flex items-center gap-3">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('eyebrow')}
          </p>
          <RevealLines text={t('title')} className="mt-8 text-display font-medium" />
        </div>
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9" delay={0.1}>
          <p className="max-w-prose text-lead text-ink-soft">{t('body')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">{t('primary')}</ButtonLink>
            <ButtonAnchor href={contact.whatsapp.href} target="_blank" variant="outline" newTabLabel={tc('opensNewTab')}>
              {t('whatsapp')}
            </ButtonAnchor>
          </div>
          <a href={contact.reservations[0]?.href} className="mt-6 inline-flex min-h-tap items-center gap-3 text-small">
            <span className="text-ink-muted">{t('call')}</span>
            <span className="tabular font-medium" dir="ltr">
              {contact.reservations[0]?.display}
            </span>
          </a>
        </Reveal>
      </div>
      <ParallaxImage
        photo={photo('site/aerial-compound-dusk', tAlt)}
        sizes="100vw"
        className="mt-section-sm aspect-4/3 w-full md:aspect-21/9"
        // Phones crop the sides: shift the frame so the Clubhouse sits in the centre.
        imgClassName="max-md:object-[54%_50%]"
      />
    </section>
  );
}
