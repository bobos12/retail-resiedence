import { getTranslations } from 'next-intl/server';
import { navItems } from '@/components/layout/nav-items';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Picture } from '@/components/ui/Picture';
import { photo } from '@/content/images';
import { Link } from '@/i18n/navigation';

export async function NotFoundContent() {
  const t = await getTranslations('notFound');
  const tNav = await getTranslations('nav');
  const tAlt = await getTranslations('images');
  return (
    <section className="page-x pb-section pt-hero-top">
      <div className="grid-page items-end gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <p className="tabular text-display font-medium text-copper">{t('eyebrow')}</p>
          <h1 className="mt-6 text-h2 font-medium">{t('title')}</h1>
          <p className="mt-6 max-w-prose text-lead text-ink-soft">{t('body')}</p>
          <ButtonLink href="/" className="mt-8">
            {t('home')}
          </ButtonLink>
          <ul className="mt-12 border-t border-line">
            {navItems.map((item) => (
              <li key={item.key} className="border-b border-line">
                <Link href={item.href} className="flex min-h-tap items-center justify-between py-3 text-h4 font-medium hover:text-copper-deep">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Picture
          photo={photo('site/street-dusk', tAlt)}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="col-span-4 aspect-4/5 md:col-span-6 lg:col-span-5 lg:col-start-8"
        />
      </div>
    </section>
  );
}
