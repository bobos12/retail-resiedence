import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { RevealLines } from '@/components/motion/RevealLines';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { contact, social } from '@/content/contact';
import { DIRECTIONS_URL } from '@/content/neighborhood';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { navItems } from './nav-items';

const linkClass =
  'inline-flex min-h-tap items-center underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-(--dur-fast) hover:decoration-current';

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tContact = await getTranslations('contact');

  return (
    <footer data-theme="dark" className="bg-night pb-10 pt-section-sm text-bone">
      <div className="page-x">
        <div className="grid-page items-end gap-y-10">
          <RevealLines text={t('statement')} as="p" className="col-span-4 text-display font-medium md:col-span-6 lg:col-span-8" />
          <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:justify-self-end">
            <ButtonLink href="/contact" variant="light">
              {t('cta')}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-section-sm grid-page gap-y-10 border-t border-night-line pt-10 text-small text-bone-soft">
          <div className="col-span-4 md:col-span-3 lg:col-span-3">
            <h2 className="eyebrow mb-4 text-bone">{t('visit')}</h2>
            <address className="not-italic leading-relaxed">
              <span dir="ltr">{contact.company}</span>
              <br />
              <span dir="ltr">{contact.address.street}</span>
              <br />
              <span dir="ltr">
                {contact.address.city} {contact.address.postalCode}
              </span>
            </address>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} mt-1 text-bone`}>
              {tContact('directions')}
            </a>
          </div>
          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <h2 className="eyebrow mb-4 text-bone">{t('call')}</h2>
            <ul>
              <li>
                <a href={contact.phone.href} className={`${linkClass} tabular text-bone`} dir="ltr">
                  {contact.phone.display}
                </a>
              </li>
              <li className="mt-3 text-micro uppercase tracking-wide rtl:normal-case">{t('reservations')}</li>
              {contact.reservations.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className={`${linkClass} tabular text-bone`} dir="ltr">
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-4 md:col-span-3 lg:col-span-2">
            <h2 className="eyebrow mb-4 text-bone">{t('write')}</h2>
            <ul>
              <li>
                <a href={`mailto:${contact.email}`} className={`${linkClass} text-bone`}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.salesEmail}`} className={`${linkClass} text-bone`}>
                  {contact.salesEmail}
                </a>
              </li>
              <li>
                <a href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-bone`}>
                  {tNav('whatsapp')}
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <h2 className="eyebrow mb-4 text-bone">{t('follow')}</h2>
            <ul>
              {social.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-bone`}>
                    {t(`social.${s.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <h2 className="eyebrow mb-4 text-bone">{t('language')}</h2>
            <LanguageSwitcher className="text-bone" />
            <ul className="mt-4">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className={linkClass}>
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-section-sm flex flex-col gap-6 border-t border-night-line pt-8 text-micro text-bone-soft md:flex-row md:items-center md:justify-between">
          <Link href="/" className="inline-flex text-bone">
            <Logo className="h-12 w-auto" />
          </Link>
          <p>{t('rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
