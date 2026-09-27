'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Props = { className?: string; onNavigate?: () => void };

export function LanguageSwitcher({ className, onNavigate }: Props) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === 'en' ? 'ar' : 'en';

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      onClick={onNavigate}
      className={cn(
        'inline-flex min-h-tap items-center text-small font-medium underline decoration-transparent underline-offset-4',
        'transition-[text-decoration-color] duration-(--dur-fast) hover:decoration-current',
        className,
      )}
    >
      {t('language')}
      <span className="sr-only" lang={locale}> ({t('languageLabel')})</span>
    </Link>
  );
}
